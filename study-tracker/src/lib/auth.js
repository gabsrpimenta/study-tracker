const API_URL = "http://localhost:5059/api";

export const getToken = () => localStorage.getItem("token");

export const isLoggedIn = () => !!getToken();

export const getUser = () => ({
  nome: localStorage.getItem("userName") || "Estudante",
});

export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};

// LOGIN
export async function login(email, senha) {
  const res = await fetch(`${API_URL}/Auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      senha,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erro ao fazer login");
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("userName", data.nome);

  return data;
}

// CADASTRO
export async function register(nome, email, senha) {
  const res = await fetch(`${API_URL}/Auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome,
      email,
      senha,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erro ao criar conta");
  }

  return data;
}

// FETCH AUTENTICADO
export async function authFetch(url, options = {}) {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    logout();
  }

  return res;
}