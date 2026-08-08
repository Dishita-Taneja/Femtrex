import { getAuth } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/config";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

/**
 * Retrieves the Firebase ID Token for the currently signed-in user,
 * or falls back to demo authentication header if no active Firebase session.
 */
export async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const app = getFirebaseApp();
    if (app) {
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        return { Authorization: `Bearer ${token}` };
      }
    }
  } catch (e) {
    console.warn("Could not fetch Firebase ID token, using default demo auth token:", e);
  }
  return { Authorization: "Bearer priya-demo" };
}

/**
 * Central API fetch utility wrapper with auto-auth, JSON headers, and error handling.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeader = await getAuthHeader();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Build candidate URLs: relative /api proxy route first (if in browser), then direct backend URL
  const candidateUrls: string[] = [];
  if (!endpoint.startsWith("http")) {
    if (typeof window !== "undefined") {
      const apiPrefixed = cleanEndpoint.startsWith("/api") ? cleanEndpoint : `/api${cleanEndpoint}`;
      candidateUrls.push(apiPrefixed);
    }
    candidateUrls.push(`${API_BASE_URL}${cleanEndpoint}`);
  } else {
    candidateUrls.push(endpoint);
  }

  let lastError: Error | null = null;

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(`API call failed [${response.status}]: ${errBody || response.statusText}`);
      }

      return await response.json() as T;
    } catch (err: any) {
      lastError = err;
      // If it's a network failure and we have another URL candidate to try, loop next
      if (err.name === "TypeError" || err.message === "Load failed" || err.message === "Failed to fetch") {
        continue;
      }
      throw err;
    }
  }

  const primaryUrl = candidateUrls[candidateUrls.length - 1];
  throw new Error(`Unable to connect to backend server at ${primaryUrl}. Please ensure FastAPI backend is running.`);
}

export function getApi<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET" });
}

export function postApi<T>(endpoint: string, body: unknown): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
