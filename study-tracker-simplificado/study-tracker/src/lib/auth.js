// ==========================================
// AUTHENTICATION MANAGER (Gestor de Autenticação)
// ==========================================
// Lida com o Login, Registo e a persistência da Sessão baseada em JWT.

const API_URL = "http://localhost:5089/api";

// --- GESTÃO DO TOKEN (Armazenamento Local Seguro) ---
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const logout = () => localStorage.removeItem("token");
export const isLoggedIn = () => !!getToken(); 

// --- DESCODIFICAÇÃO DO JWT (JSON Web Token) ---
export function getUser() {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const idKey = Object.keys(payload).find((k) => k.toLowerCase().includes("nameidentifier")) || "nameid";
    
    // CORREÇÃO: O Streak agora é lido diretamente do Token!
    return { 
      nome: payload.nome, 
      id: payload[idKey],
      streak: payload.streak || 0 
    };
  } catch {
    return null;
  }
}

// --- FUNÇÃO AUXILIAR PARA REQUESTS (POST) ---
async function postJson(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro de comunicação com o servidor.");
  return data;
}

export async function login(email, senha) {
  const data = await postJson("/Auth/login", { email, senha });
  setToken(data.token); 
  return data;
}

export async function register(nome, email, senha) {
  return postJson("/Auth/register", { nome, email, senha });
}

// --- INTERCETOR DE REQUISIÇÕES (Auth Fetch) ---
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
    throw new Error("Sessão expirada. Inicie sessão novamente.");
  }
  
  return res;
}