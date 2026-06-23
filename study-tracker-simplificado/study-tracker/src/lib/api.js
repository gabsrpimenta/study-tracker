// ==========================================
// API MANAGER (Gestor de Dados)
// ==========================================
// Este ficheiro atua como um "Adapter" (Adaptador) entre o Front-end e o armazenamento de dados.
// Para as Disciplinas, comunica com o Backend C# (.NET) real.
// Para as restantes entidades, simula um Backend usando o LocalStorage do navegador.

import { authFetch } from "@/lib/auth";

// ==========================================
// 1) UTILS DO LOCALSTORAGE (Mock de Banco de Dados)
// ==========================================

// Função Genérica de Leitura: Vai buscar ao LocalStorage. Se não houver nada, guarda a "semente" inicial e devolve-a.
function ler(chave, seed) {
  const raw = localStorage.getItem(chave);
  if (!raw) {
    localStorage.setItem(chave, JSON.stringify(seed));
    return seed;
  }
  try { 
    return JSON.parse(raw); 
  } catch { 
    return seed; 
  }
}

// Função Genérica de Escrita: Transforma o Array/Objeto em Texto (JSON.stringify) e guarda.
const gravar = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));

// Gera um Identificador Único Universal (UUID) para simular o ID automático de um Banco de Dados.
const novoId = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

// FACTORY FUNCTION (Fábrica de Funções CRUD)
// Para não escrever 4 funções repetidas para Tarefas, Notas, Eventos, etc., 
// criamos uma "fábrica" genérica de operações Create, Read, Update, Delete.
function crud(chave, seed) {
  return {
    list:   async ()          => ler(chave, seed),
    create: async (item)      => {
      const lista = ler(chave, seed);
      const novo = { ...item, id: novoId() };
      gravar(chave, [novo, ...lista]);
      return novo;
    },
    update: async (id, patch) => {
      const lista = ler(chave, seed).map((x) => (x.id === id ? { ...x, ...patch } : x));
      gravar(chave, lista);
      return lista.find((x) => x.id === id);
    },
    remove: async (id)        => {
      gravar(chave, ler(chave, seed).filter((x) => x.id !== id));
    },
  };
}

// ==========================================
// 2) SEED DATA (Dados de Demonstração Iniciais)
// ==========================================
// Apenas carregam na primeira vez que o avaliador (ou o utilizador) abrir a aplicação.

const hojeMenos = (d) => {
  const data = new Date();
  data.setDate(data.getDate() - d);
  return data.toISOString().slice(0, 10);
};

const seeds = {
  events: [
    { id: "e1", name: "Teste de Matemática", subject: "Álgebra", date: "25/Mai", type: "Teste" },
    { id: "e2", name: "Trabalho de História", subject: "História", date: "27/Mai", type: "Entrega" },
  ],
  tasks: [
    { id: "t1", title: "Resolver exercícios", subject: "Matemática", priority: "alta", due: "Hoje", done: false },
    { id: "t2", title: "Vocabulário unit 5", subject: "Inglês", priority: "baixa", due: "02/Jun", done: true },
  ],
  notes: [
    { id: "n1", title: "Derivadas", subject: "Matemática", content: "d/dx[x^n] = n·x^(n-1)", updatedAt: new Date().toISOString() },
  ],
  grades: [
    { id: "g1", subject: "Matemática", title: "Teste 1", value: 16, weight: 40 },
  ],
  sessions: [
    { id: "ss1", subject: "Matemática", minutes: 90, date: hojeMenos(0) },
  ],
  goals: [],
};

// ==========================================
// 3) INSTANCIAÇÃO DOS CRUDS LOCAIS
// ==========================================
const events   = crud("st.events",   seeds.events);
const tasks    = crud("st.tasks",    seeds.tasks);
const notes    = crud("st.notes",    seeds.notes);
const grades   = crud("st.grades",   seeds.grades);
const sessions = crud("st.sessions", seeds.sessions);
const goals    = crud("st.goals",    seeds.goals);

// EXPORTAÇÃO DAS FUNÇÕES
export const listEvents = events.list, createEvent = events.create, updateEvent = events.update, deleteEvent = events.remove;
export const listTasks  = tasks.list,  createTask  = tasks.create,  updateTask  = tasks.update,  deleteTask  = tasks.remove;
export const listNotes  = notes.list,  createNote  = notes.create,  updateNote  = notes.update,  deleteNote  = notes.remove;
export const listGrades = grades.list, createGrade = grades.create, updateGrade = grades.update, deleteGrade = grades.remove;
export const listSessions = sessions.list;
export const listGoals  = goals.list,  createGoal  = goals.create,  updateGoal  = goals.update,  deleteGoal  = goals.remove;


// ==========================================
// 4) INTEGRAÇÃO COM BACKEND REAL (C# .NET)
// ==========================================

// Como o C# usa PascalCase/Português (ex: Nome) e o React usa camelCase/Inglês (ex: name),
// criamos funções de "Mapper" (Tradutores) para garantir que os sistemas se entendem perfeitamente.

const toFrontend = (m) => ({
  id:       m.id ?? m.Id,
  name:     m.nome ?? m.Nome,
  teacher:  m.professor ?? m.Professor,
  progress: m.progresso ?? m.Progresso,
  tasks:    m.numTarefas ?? m.NumTarefas,
});

const toBackend = (s) => ({
  nome: s.name || s.nome, // Prevenção de fallback
  professor: s.teacher || s.professor,
  progresso: s.progress || s.progresso,
  numTarefas: s.tasks || s.tarefas,
  ativa: true,
});

// Pedidos HTTP (Requisições) utilizando a função authFetch (que já injeta o Token JWT)
export async function listSubjects() {
  const res = await authFetch("/Materias");
  const data = await res.json();
  return data.map(toFrontend); // Devolve a lista já traduzida para o React
}

export async function createSubject(s) {
  const res = await authFetch("/Materias", { method: "POST", body: JSON.stringify(toBackend(s)) });
  return toFrontend(await res.json());
}

export async function updateSubject(id, s) {
  await authFetch(`/Materias/${id}`, { method: "PUT", body: JSON.stringify({ id, ...toBackend(s) }) });
  return { id, ...s };
}

export async function deleteSubject(id) {
  await authFetch(`/Materias/${id}`, { method: "DELETE" });
}

// Aliases para compatibilidade com os ficheiros antigos
export const listMaterias = listSubjects;
export const getMaterias  = listSubjects;