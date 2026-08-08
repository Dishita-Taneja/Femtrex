import { apiFetch, getApi, postApi, API_BASE_URL } from "@/lib/api";

export { apiFetch, getApi, postApi, API_BASE_URL };

export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  return postApi<T>(url, body);
}
