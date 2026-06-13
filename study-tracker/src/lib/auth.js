const API_URL = "http://localhost:5059/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return !!getToken();
}

export function getUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const idKey = Object.keys(payload).find((k) => k.toLowerCase().includes("nameidentifier")) || "nameid";
    return { nome: payload.nome, id: payload[idKey] };
  } catch {
    return null;
  }
}

export async function login(email, senha) {
  const res = await fetch(`${API_URL}/Auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro ao entrar.");
  setToken(data.token);
  return data;
}

export async function register(nome, email, senha) {
  const res = await fetch(`${API_URL}/Auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro ao registar.");
  return data;
}

// Helper para chamadas autenticadas (usado no api.js)
export async function authFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    logout();
    window.location.href = "/login";
    throw new Error("Sessão expirada.");
  }
  return res;
}