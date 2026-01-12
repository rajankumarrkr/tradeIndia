const API_BASE = import.meta.env.VITE_API_URL
export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}
