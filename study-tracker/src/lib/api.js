// Camada de "API" do Study Tracker em JavaScript puro.
// Persiste em localStorage. Para ligar a uma API real, basta substituir
// o corpo das funções abaixo por chamadas fetch.

const K = {
  subjects: "st.subjects",
  events: "st.events",
  tasks: "st.tasks",
  notes: "st.notes",
  grades: "st.grades",
  sessions: "st.sessions",
  schedule: "st.schedule",
  goals: "st.goals",
};

const seedSubjects = [
  { id: "s1", name: "Matemática", teacher: "Prof. Silva", progress: 75, tasks: 12 },
  { id: "s2", name: "Programação", teacher: "Prof. Costa", progress: 60, tasks: 8 },
  { id: "s3", name: "História", teacher: "Prof. Mendes", progress: 40, tasks: 5 },
  { id: "s4", name: "Inglês", teacher: "Prof. Lopes", progress: 85, tasks: 15 },
];

const seedEvents = [
  { id: "e1", name: "Teste de Matemática", subject: "Álgebra", date: "25/Mai", type: "Teste" },
  { id: "e2", name: "Trabalho de História", subject: "História", date: "27/Mai", type: "Entrega" },
  { id: "e3", name: "Projeto de Programação", subject: "Programação", date: "30/Mai", type: "Projeto" },
  { id: "e4", name: "Apresentação Oral", subject: "Inglês", date: "02/Jun", type: "Entrega" },
  { id: "e5", name: "Teste de Física", subject: "Física", date: "05/Jun", type: "Teste" },
];

const seedTasks = [
  { id: "t1", title: "Resolver exercícios cap. 4", subject: "Matemática", priority: "alta", due: "Hoje", done: false },
  { id: "t2", title: "Ler resumo de WW2", subject: "História", priority: "media", due: "Amanhã", done: false },
  { id: "t3", title: "Finalizar projeto Java", subject: "Programação", priority: "alta", due: "30/Mai", done: false },
  { id: "t4", title: "Vocabulário unit 5", subject: "Inglês", priority: "baixa", due: "02/Jun", done: true },
];

const seedNotes = [
  { id: "n1", title: "Derivadas — regras básicas", subject: "Matemática", content: "d/dx[x^n] = n·x^(n-1)\nd/dx[sin x] = cos x", updatedAt: new Date().toISOString() },
  { id: "n2", title: "Revolução Industrial", subject: "História", content: "Séc. XVIII, Inglaterra, máquina a vapor...", updatedAt: new Date().toISOString() },
];

const seedGrades = [
  { id: "g1", subject: "Matemática", title: "Teste 1", value: 16, weight: 40 },
  { id: "g2", subject: "Matemática", title: "Trabalho", value: 18, weight: 20 },
  { id: "g3", subject: "Programação", title: "Projeto 1", value: 17, weight: 50 },
  { id: "g4", subject: "Inglês", title: "Teste oral", value: 15, weight: 30 },
];

function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const seedSessions = [
  { id: "ss1", subject: "Matemática", minutes: 90, date: todayMinus(0) },
  { id: "ss2", subject: "Programação", minutes: 50, date: todayMinus(1) },
  { id: "ss3", subject: "Inglês", minutes: 25, date: todayMinus(1) },
  { id: "ss4", subject: "História", minutes: 75, date: todayMinus(2) },
  { id: "ss5", subject: "Matemática", minutes: 60, date: todayMinus(3) },
  { id: "ss6", subject: "Programação", minutes: 110, date: todayMinus(4) },
  { id: "ss7", subject: "Matemática", minutes: 45, date: todayMinus(5) },
  { id: "ss8", subject: "Inglês", minutes: 30, date: todayMinus(6) },
];

const seedSchedule = [
  { id: "h1", day: "Seg", start: "08:00", end: "09:30", subject: "Matemática", room: "Sala 12" },
  { id: "h2", day: "Seg", start: "10:00", end: "11:30", subject: "Programação", room: "Lab 3" },
  { id: "h3", day: "Ter", start: "09:00", end: "10:30", subject: "Inglês", room: "Sala 8" },
  { id: "h4", day: "Qua", start: "08:00", end: "09:30", subject: "História", room: "Sala 5" },
  { id: "h5", day: "Qui", start: "14:00", end: "15:30", subject: "Programação", room: "Lab 3" },
  { id: "h6", day: "Sex", start: "10:00", end: "11:30", subject: "Matemática", room: "Sala 12" },
];

const seedGoals = [
  { id: "go1", title: "Estudar 15h esta semana", target: 15, current: 8, unit: "horas" },
  { id: "go2", title: "Concluir 20 tarefas", target: 20, current: 12, unit: "tarefas" },
  { id: "go3", title: "Ler 3 capítulos de História", target: 3, current: 1, unit: "capítulos" },
];

function read(key, seed) {
  if (typeof window === "undefined") return seed;
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try { return JSON.parse(raw); } catch { return seed; }
}
function write(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function makeCrud(key, seed) {
  return {
    async list() { return read(key, seed); },
    async create(input) {
      const all = read(key, seed);
      const created = { ...input, id: uid() };
      write(key, [created, ...all]);
      return created;
    },
    async update(id, patch) {
      const all = read(key, seed);
      const next = all.map((x) => (x.id === id ? { ...x, ...patch } : x));
      write(key, next);
      return next.find((x) => x.id === id);
    },
    async remove(id) {
      const all = read(key, seed);
      write(key, all.filter((x) => x.id !== id));
    },
  };
}

const subjects = makeCrud(K.subjects, seedSubjects);
const events = makeCrud(K.events, seedEvents);
const tasks = makeCrud(K.tasks, seedTasks);
const notes = makeCrud(K.notes, seedNotes);
const grades = makeCrud(K.grades, seedGrades);
const sessions = makeCrud(K.sessions, seedSessions);
const schedule = makeCrud(K.schedule, seedSchedule);
const goals = makeCrud(K.goals, seedGoals);

export const listSubjects = subjects.list;
export const createSubject = subjects.create;
export const updateSubject = subjects.update;
export const deleteSubject = subjects.remove;
export const listEvents = events.list;
export const createEvent = events.create;
export const updateEvent = events.update;
export const deleteEvent = events.remove;
export const listTasks = tasks.list;
export const createTask = tasks.create;
export const updateTask = tasks.update;
export const deleteTask = tasks.remove;
export const listNotes = notes.list;
export const createNote = notes.create;
export const updateNote = notes.update;
export const deleteNote = notes.remove;
export const listGrades = grades.list;
export const createGrade = grades.create;
export const updateGrade = grades.update;
export const deleteGrade = grades.remove;
export const listSessions = sessions.list;
export const createSession = sessions.create;
export const listSchedule = schedule.list;
export const createSchedule = schedule.create;
export const updateSchedule = schedule.update;
export const deleteSchedule = schedule.remove;
export const listGoals = goals.list;
export const createGoal = goals.create;
export const updateGoal = goals.update;
export const deleteGoal = goals.remove;
