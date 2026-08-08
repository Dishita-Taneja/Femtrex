import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/config";
import { getApi } from "@/lib/api";

function database() {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

function getLocalCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function saveDocument<T extends Record<string, unknown>>(path: string, id: string, data: T) {
  const cacheKey = `femtrex_doc_${path}_${id}`;
  setLocalCache(cacheKey, { id, ...data });

  const db = database();
  if (!db) return { id, ...data, demo: true };

  try {
    await setDoc(doc(db, path, id), data, { merge: true });
  } catch (err) {
    console.warn(`Firestore setDoc offline fallback engaged for ${path}/${id}:`, err);
  }
  return { id, ...data };
}

export async function createDocument<T extends Record<string, unknown>>(path: string, data: T) {
  const id = crypto.randomUUID();
  const cacheKey = `femtrex_doc_${path}_${id}`;
  setLocalCache(cacheKey, { id, ...data });

  const db = database();
  if (!db) return { id, ...data, demo: true };

  try {
    const ref = await addDoc(collection(db, path), data);
    return { id: ref.id, ...data };
  } catch (err) {
    console.warn(`Firestore addDoc offline fallback engaged for ${path}:`, err);
    return { id, ...data };
  }
}

export async function readDocument(path: string, id: string) {
  const cacheKey = `femtrex_doc_${path}_${id}`;
  const localCached = getLocalCache<Record<string, unknown>>(cacheKey);

  const db = database();
  if (db) {
    try {
      const snapshot = await getDoc(doc(db, path, id));
      if (snapshot.exists()) {
        const docData = { id: snapshot.id, ...snapshot.data() };
        setLocalCache(cacheKey, docData);
        return docData;
      }
    } catch (err) {
      console.warn(`Firestore readDocument offline fallback engaged for ${path}/${id}:`, err);
    }
  }

  // Fallback 1: Return local storage cached document if available
  if (localCached) return localCached;

  // Fallback 2: Try fetching from FastAPI backend endpoint
  try {
    const backendData = await getApi<Record<string, unknown>>(`/${path}/${id}`);
    if (backendData) {
      setLocalCache(cacheKey, backendData);
      return backendData;
    }
  } catch {}

  return null;
}

export async function queryDocuments(
  path: string,
  field: string,
  value: string
): Promise<Record<string, unknown>[]> {
  const db = database();
  if (db) {
    try {
      const q = query(collection(db, path), where(field, "==", value));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn("queryDocuments offline fallback engaged:", e);
    }
  }

  // Local storage fallback scan
  if (typeof window !== "undefined") {
    try {
      const prefix = `femtrex_doc_${path}_`;
      const matches: Record<string, unknown>[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const item = getLocalCache<Record<string, unknown>>(key);
          if (item && item[field] === value) {
            matches.push(item);
          }
        }
      }
      return matches;
    } catch {}
  }

  return [];
}
