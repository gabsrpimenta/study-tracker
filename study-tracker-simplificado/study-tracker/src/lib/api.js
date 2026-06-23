import { authFetch } from "./auth"; // Confirma que o caminho do import está correto

// ==========================================
// FUNÇÃO GENÉRICA DE PEDIDOS PROTEGIDOS
// ==========================================
async function fetchSecure(endpoint, method = "GET", body = null) {
  const options = { method };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await authFetch(endpoint, options); // Usa a tua função do auth.js!
    if (response.status === 204 || method === "DELETE") return true;
    return await response.json();
  } catch (error) {
    console.error(`Erro na API (${method} ${endpoint}):`, error);
    return method === "GET" ? [] : null;
  }
}

// ==========================================
// ENDPOINTS DA APLICAÇÃO
// ==========================================

export const listTasks  = () => fetchSecure("/tasks");
export const createTask = (task) => fetchSecure("/tasks", "POST", task);
export const updateTask = (id, task) => fetchSecure(`/tasks/${id}`, "PUT", task);
export const deleteTask = (id) => fetchSecure(`/tasks/${id}`, "DELETE");

export const listEvents  = () => fetchSecure("/events");
export const createEvent = (ev) => fetchSecure("/events", "POST", ev);
export const updateEvent = (id, ev) => fetchSecure(`/events/${id}`, "PUT", ev);
export const deleteEvent = (id) => fetchSecure(`/events/${id}`, "DELETE");

export const listGrades  = () => fetchSecure("/grades");
export const createGrade = (grade) => fetchSecure("/grades", "POST", grade);
export const updateGrade = (id, grade) => fetchSecure(`/grades/${id}`, "PUT", grade);
export const deleteGrade = (id) => fetchSecure(`/grades/${id}`, "DELETE");

export const listSessions  = () => fetchSecure("/sessions");
export const createSession = (session) => fetchSecure("/sessions", "POST", session);

// CADEIRAS (DISCIPLINAS)
const toFrontendSubject = (m) => ({
  id: m.id || m.Id,
  nome: m.nome || m.Nome,
  professor: m.professor || m.Professor,
  progresso: m.progresso || m.Progresso,
});

export async function listSubjects() {
  const data = await fetchSecure("/subjects");
  return (data || []).map(toFrontendSubject);
}
export async function createSubject(s) {
  const data = await fetchSecure("/subjects", "POST", s);
  return toFrontendSubject(data);
}
export async function updateSubject(id, s) {
  const data = await fetchSecure(`/subjects/${id}`, "PUT", s);
  return toFrontendSubject(data);
}
export async function deleteSubject(id) {
  return await fetchSecure(`/subjects/${id}`, "DELETE");
}

export const listMaterias = listSubjects;
export const getMaterias  = listSubjects;

// ==========================================
// OBJETIVOS (Usando LocalStorage temporariamente)
// ==========================================
function lerLocal(chave) {
  const raw = localStorage.getItem(chave);
  return raw ? JSON.parse(raw) : [];
}
const gravarLocal = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));
const novoId = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const goalsChave = "st.goals";

export const listGoals = async () => lerLocal(goalsChave);
export const createGoal = async (item) => {
  const lista = lerLocal(goalsChave);
  const novo = { ...item, id: novoId() };
  gravarLocal(goalsChave, [novo, ...lista]);
  return novo;
};
export const updateGoal = async (id, patch) => {
  const lista = lerLocal(goalsChave).map((x) => (x.id === id ? { ...x, ...patch } : x));
  gravarLocal(goalsChave, lista);
  return lista.find((x) => x.id === id);
};
export const deleteGoal = async (id) => {
  gravarLocal(goalsChave, lerLocal(goalsChave).filter((x) => x.id !== id));
};