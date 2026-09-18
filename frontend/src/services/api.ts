// API service layer - centralized fetch wrappers for all backend endpoints
const rawApiUrl = process.env.NEXT_API_URL || "";
const API_URL = rawApiUrl.replace(/\/$/, "");
import { logger } from "@/utils/logger";

function getHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function authHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    logger.warn(`API Error: ${res.status} ${res.statusText} on ${res.url}`);
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Something went wrong");
  }
  return res.json();
}

// Auth
export async function registerUser(username: string, password: string) {
  logger.info(`API Call: registerUser (${username})`);
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function loginUser(username: string, password: string) {
  logger.info(`API Call: loginUser (${username})`);
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function getMe(token: string) {
  logger.trace("API Call: getMe");
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: getHeaders(token),
  });
  return handleResponse(res);
}

// Items
export async function getItems(token: string, status?: string, category?: string) {
  const params = new URLSearchParams();
  if (status) params.append("status_filter", status);
  if (category) params.append("category", category);
  const qs = params.toString() ? `?${params.toString()}` : "";
  logger.trace(`API Call: getItems ${qs}`);
  const res = await fetch(`${API_URL}/api/items/${qs}`, {
    headers: getHeaders(token),
  });
  return handleResponse(res);
}

export async function uploadItem(token: string, file: File, category: string, color?: string, tags?: string[]) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  if (color) formData.append("color", color);
  if (tags) formData.append("tags", JSON.stringify(tags));

  logger.info(`API Call: uploadItem (category: ${category})`);
  const res = await fetch(`${API_URL}/api/items/upload`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  return handleResponse(res);
}

export async function updateItemStatus(token: string, itemId: string, status: string) {
  logger.info(`API Call: updateItemStatus (${itemId} -> ${status})`);
  const res = await fetch(`${API_URL}/api/items/${itemId}/status`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

export async function updateItem(token: string, itemId: string, data: Record<string, unknown>) {
  logger.info(`API Call: updateItem (${itemId})`);
  const res = await fetch(`${API_URL}/api/items/${itemId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteItem(token: string, itemId: string) {
  logger.info(`API Call: deleteItem (${itemId})`);
  const res = await fetch(`${API_URL}/api/items/${itemId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Delete failed" }));
    throw new Error(error.detail);
  }
}

// AI
export async function getRecommendation(token: string, occasion: string, weather?: string, preferences?: string) {
  logger.info(`API Call: getRecommendation (occasion: ${occasion})`);
  const res = await fetch(`${API_URL}/api/ai/recommend`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ occasion, weather, preferences }),
  });
  return handleResponse(res);
}

export async function evaluatePurchase(token: string, productUrl: string) {
  logger.info(`API Call: evaluatePurchase`);
  const res = await fetch(`${API_URL}/api/ai/evaluate-purchase`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ product_url: productUrl }),
  });
  return handleResponse(res);
}
