// src/lib/apiClient.ts
//
// Single source of truth for the backend base URL + fetch behavior.
// Set NEXT_PUBLIC_API_URL in .env.local (dev) and in your hosting
// provider's environment variables (production) - see .env.local
// in the project root for the local default.
const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213";

// Strip any trailing slash so callers can safely do `${API_BASE_URL}/api/...`
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseBody(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Backend sometimes returns a plain string (e.g. "User not found")
    return text;
  }
}

// Every lib/*api.ts function should go through this instead of calling
// fetch() directly - it guarantees a consistent base URL, consistent
// Content-Type header, and consistent error handling (throws ApiError
// with the backend's actual message on any non-2xx response).
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    // fetch() itself threw - network down, backend unreachable, invalid URL, CORS, etc.
    throw new ApiError(
      `Could not reach the server at ${API_BASE_URL}. Is the backend running?`,
      0
    );
  }

  const data = await parseBody(response);

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}