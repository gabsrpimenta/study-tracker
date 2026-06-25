import { authFetch } from "./auth"; 

// ==========================================
// FUNÇÃO GENÉRICA DE PEDIDOS PROTEGIDOS
// ==========================================
async function fetchSecure(endpoint, method = "GET", body = null) {
  const options = { method };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await authFetch(endpoint, options); 
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

// ==========================================
// CADEIRAS (DISCIPLINAS)
// ==========================================
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
// OBJETIVOS (Agora ligado à Base de Dados!)
// ==========================================
export const listGoals   = () => fetchSecure("/goals");
export const createGoal  = (goal) => fetchSecure("/goals", "POST", goal);
export const updateGoal  = (id, goal) => fetchSecure(`/goals/${id}`, "PUT", goal);
export const deleteGoal  = (id) => fetchSecure(`/goals/${id}`, "DELETE");