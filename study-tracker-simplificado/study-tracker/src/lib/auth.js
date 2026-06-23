// ==========================================
// AUTHENTICATION MANAGER (Gestor de Autenticação)
// ==========================================
// Lida com o Login, Registo e a persistência da Sessão baseada em JWT (JSON Web Tokens).

const API_URL = "http://localhost:5059/api";

// --- GESTÃO DO TOKEN (Armazenamento Local Seguro) ---
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const logout = () => localStorage.removeItem("token");
// A dupla negação (!!) converte a string do token num verdadeiro/falso (booleano)
export const isLoggedIn = () => !!getToken(); 

// --- DESCODIFICAÇÃO DO JWT (JSON Web Token) ---
// O JWT é composto por Header.Payload.Signature. Esta função lê a parte do Payload (os dados do utilizador).
export function getUser() {
  const token = getToken();
  if (!token) return null;
  
  try {
    // atob() descodifica Base64. Separa pelo ponto '.' e lê a posição [1] (o Payload)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const idKey = Object.keys(payload).find((k) => k.toLowerCase().includes("nameidentifier")) || "nameid";
    return { nome: payload.nome, id: payload[idKey] };
  } catch {
    return null;
  }
}

// --- FUNÇÃO AUXILIAR PARA REQUESTS (POST) ---
// Reduz a repetição de código ao fazer Login e Registo.
async function postJson(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), // Transforma o objeto JavaScript numa String JSON
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro de comunicação com o servidor.");
  return data;
}

export async function login(email, senha) {
  const data = await postJson("/Auth/login", { email, senha });
  setToken(data.token); // Se a API validar a senha, guarda o "Passaporte" (Token) no navegador
  return data;
}

export async function register(nome, email, senha) {
  return postJson("/Auth/register", { nome, email, senha });
}

// --- INTERCETOR DE REQUISIÇÕES (Auth Fetch) ---
// Esta é uma função crucial de segurança. Sempre que o React quiser falar com a API C#, usa esta função.
// Ela adiciona o Token JWT ao 'Cabeçalho' (Header) do pedido automaticamente.
export async function authFetch(path, options = {}) {
  const token = getToken();
  
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Se existir token, injeta o protocolo 'Bearer'
      ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      ...(options.headers || {}),
    },
  });
  
  // Tratamento de Sessão Expirada: Se o C# rejeitar o token (Erro HTTP 401 Unauthorized)
  if (res.status === 401) {
    logout(); // Limpa o token estragado/expirado
    window.location.href = "/login"; // Expulsa o utilizador de volta para o login
    throw new Error("Sessão expirada. Inicie sessão novamente.");
  }
  
  return res;
}