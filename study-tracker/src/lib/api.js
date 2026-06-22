import { authFetch } from "@/lib/auth";

// ─── Mappers: Tarefas ────────────────────────────────────────────────────────

function toTaskFrontend(t) {
  return {
    id: t.id ?? t.Id,
    title: t.titulo ?? t.Titulo ?? t.title ?? "",
    date: t.data ?? t.Data,
    done: t.concluida ?? t.Concluida ?? false,
    subject: t.subject ?? t.Subject ?? "",
    priority: t.priority ?? t.Priority ?? "media",
    due: t.due ?? t.Due ?? "",
    subjectId: t.disciplinaId ?? t.DisciplinaId,
  };
}

function toTaskBackend(t) {
  return {
    titulo: t.title ?? t.titulo ?? "",
    data: t.date ?? new Date().toISOString(),
    concluida: t.done ?? false,
    subject: t.subject ?? "",
    priority: t.priority ?? "media",
    due: t.due ?? "",
    disciplinaId: t.subjectId ?? null,
  };
}

// ─── Mappers: Disciplinas ────────────────────────────────────────────────────

function toSubjectFrontend(s) {
  return {
    id: s.id ?? s.Id,
    name: s.nome ?? s.Nome,
    nome: s.nome ?? s.Nome,
    teacher: s.professor ?? s.Professor,
    professor: s.professor ?? s.Professor,
    active: s.ativa ?? s.Ativa,
    tarefas: s.tarefas ?? s.Tarefas ?? 0,
    progresso: s.progresso ?? s.Progresso ?? 0,
  };
}

function toSubjectBackend(s) {
  return {
    nome: s.nome ?? s.name ?? "",
    professor: s.professor ?? s.teacher ?? "",
    ativa: s.ativa ?? s.active ?? true,
    tarefas: s.tarefas ?? s.Tarefas ?? 0,
    progresso: s.progresso ?? s.Progresso ?? 0,
  };
}

// ─── Mappers: Eventos ────────────────────────────────────────────────────────

function toEventFrontend(e) {
  return {
    id: e.id ?? e.Id,
    name: e.titulo ?? e.Titulo ?? e.name ?? e.Name ?? "",
    date: e.data ?? e.Data ?? e.date ?? e.Date ?? "",
    subject: e.subject ?? e.Subject ?? "",
    type: e.type ?? e.Type ?? "Teste",
  };
}

function toEventBackend(e) {
  return {
    titulo: e.name ?? e.titulo ?? "",
    data: e.date ?? e.data ?? "",
    subject: e.subject ?? e.Subject ?? "",
    type: e.type ?? e.Type ?? "Teste",
  };
}

// ─── Mappers: Apontamentos (página Notas - editor de texto) ─────────────────

function toNoteFrontend(n) {
  return {
    id: n.id ?? n.Id,
    title: n.title ?? n.Title ?? "Sem título",
    subject: n.subject ?? n.Subject ?? "Geral",
    content: n.content ?? n.Content ?? "",
    updatedAt: n.updatedAt ?? n.UpdatedAt,
  };
}

function toNoteBackend(n) {
  return {
    title: n.title ?? "",
    subject: n.subject ?? "",
    content: n.content ?? "",
    updatedAt: n.updatedAt ?? new Date().toISOString(),
  };
}

// ─── Mappers: Notas numéricas (página Avaliações) ───────────────────────────

function toGradeFrontend(g) {
  return {
    id: g.id ?? g.Id,
    subject: g.subject ?? g.Subject ?? "",
    title: g.title ?? g.Title ?? "",
    value: g.value ?? g.Value ?? 0,
    weight: g.weight ?? g.Weight ?? 0,
  };
}

function toGradeBackend(g) {
  return {
    subject: g.subject ?? "",
    title: g.title ?? "",
    value: Number(g.value ?? 0),
    weight: Number(g.weight ?? 0),
  };
}

// ─── Mappers: Sessões ────────────────────────────────────────────────────────

function toSessionFrontend(s) {
  return {
    id: s.id ?? s.Id,
    subject: s.subject ?? s.Subject ?? "",
    minutes: s.minutes ?? s.Minutes ?? 0,
    date: s.date ?? s.Date ?? "",
  };
}

function toSessionBackend(s) {
  return {
    subject: s.subject ?? "",
    minutes: Number(s.minutes ?? 0),
    date: s.date ?? new Date().toISOString().slice(0, 10),
  };
}

// ─── Mappers: Horário (Cronogramas) ─────────────────────────────────────────

function toScheduleFrontend(c) {
  return {
    id: c.id ?? c.Id,
    day: c.day ?? c.Day ?? c.titulo ?? c.Titulo ?? "",
    start: c.start ?? c.Start ?? "",
    end: c.end ?? c.End ?? "",
    subject: c.subject ?? c.Subject ?? c.subtitulo ?? c.Subtitulo ?? "",
    room: c.room ?? c.Room ?? "",
    disciplinaId: c.disciplinaId ?? c.DisciplinaId,
  };
}

function toScheduleBackend(c, disciplinaId) {
  return {
    titulo: c.day ?? "",
    subtitulo: c.subject ?? "",
    data: new Date().toISOString(),
    tipo: `${c.start ?? ""}|${c.end ?? ""}|${c.room ?? ""}`,
    disciplinaId: disciplinaId ?? c.disciplinaId ?? 0,
  };
}

// ─── Mappers: Objetivos ──────────────────────────────────────────────────────

function toGoalFrontend(g) {
  return {
    id: g.id ?? g.Id,
    title: g.title ?? g.Title ?? "",
    description: g.description ?? g.Description ?? "",
    done: g.done ?? g.Done ?? false,
    createdAt: g.createdAt ?? g.CreatedAt,
  };
}

function toGoalBackend(g) {
  return {
    title: g.title ?? "",
    description: g.description ?? "",
    done: g.done ?? false,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API: Disciplinas
// ═══════════════════════════════════════════════════════════════════════════════

export async function listSubjects() {
  const res = await authFetch("/Disciplinas");
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(toSubjectFrontend);
}

// Alias usado em Calendário e Horário
export const listMaterias = listSubjects;

export async function createSubject(subject) {
  const res = await authFetch("/Disciplinas", {
    method: "POST",
    body: JSON.stringify(toSubjectBackend(subject)),
  });
  if (!res.ok) return null;
  return toSubjectFrontend(await res.json());
}

export async function updateSubject(id, subject) {
  const res = await authFetch(`/Disciplinas/${id}`, {
    method: "PUT",
    body: JSON.stringify(toSubjectBackend(subject)),
  });
  if (!res.ok) return null;
  return toSubjectFrontend(await res.json());
}

export async function deleteSubject(id) {
  await authFetch(`/Disciplinas/${id}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API: Tarefas
// ═══════════════════════════════════════════════════════════════════════════════

export async function listTasks() {
  const res = await authFetch("/Tarefas");
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(toTaskFrontend);
}

export async function createTask(task) {
  const res = await authFetch("/Tarefas", {
    method: "POST",
    body: JSON.stringify(toTaskBackend(task)),
  });
  if (!res.ok) return null;
  return toTaskFrontend(await res.json());
}

export async function updateTask(id, patch) {
  const res = await authFetch(`/Tarefas/${id}`, {
    method: "PUT",
    body: JSON.stringify(toTaskBackend(patch)),
  });
  if (!res.ok) return null;
  return toTaskFrontend(await res.json());
}

export async function toggleTask(id) {
  const res = await authFetch(`/Tarefas/${id}`, { method: "PATCH" });
  if (!res.ok) return null;
  return toTaskFrontend(await res.json());
}

export async function deleteTask(id) {
  await authFetch(`/Tarefas/${id}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API: Eventos (Calendário)
// ═══════════════════════════════════════════════════════════════════════════════

export async function listEvents() {
  const res = await authFetch("/Eventos");
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(toEventFrontend);
}

export async function createEvent(event) {
  const res = await authFetch("/Eventos", {
    method: "POST",
    body: JSON.stringify(toEventBackend(event)),
  });
  if (!res.ok) return null;
  return toEventFrontend(await res.json());
}

export async function updateEvent(id, event) {
  const res = await authFetch(`/Eventos/${id}`, {
    method: "PUT",
    body: JSON.stringify(toEventBackend(event)),
  });
  if (!res.ok) return null;
  return toEventFrontend(await res.json());
}

export async function deleteEvent(id) {
  await authFetch(`/Eventos/${id}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API: Apontamentos (página Notas — editor de texto)
// ═══════════════════════════════════════════════════════════════════════════════

export async function listNotes() {
  const res = await authFetch("/Apontamentos");
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(toNoteFrontend);
}

export async function createNote(note) {
  const res = await authFetch("/Apontamentos", {
    method: "POST",
    body: JSON.stringify(toNoteBackend(note)),
  });
  if (!res.ok) return null;
  return toNoteFrontend(await res.json());
}

export async function updateNote(id, note) {
  const res = await authFetch(`/Apontamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(toNoteBackend(note)),
  });
  if (!res.ok) return null;
  return toNoteFrontend(await res.json());
}

export async function deleteNote(id) {
  await authFetch(`/Apontamentos/${id}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API: Notas numéricas (página Avaliações)
// ═══════════════════════════════════════════════════════════════════════════════

export async function listGrades() {
  try {
    const res = await authFetch("/Notas");
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(toGradeFrontend);
  } catch {
    return [];
  }
}

export async function createGrade(grade) {
  const res = await authFetch("/Notas", {
    method: "POST",
    body: JSON.stringify(toGradeBackend(grade)),
  });
  if (!res.ok) return null;
  return toGradeFrontend(await res.json());
}

export async function updateGrade(id, grade) {
  const res = await authFetch(`/Notas/${id}`, {
    method: "PUT",
    body: JSON.stringify(toGradeBackend(grade)),
  });
  if (!res.ok) return null;
  return toGradeFrontend(await res.json());
}

export async function deleteGrade(id) {
  await authFetch(`/Notas/${id}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API: Sessões de estudo (Estatísticas)
// ═══════════════════════════════════════════════════════════════════════════════

export async function listSessions() {
  const res = await authFetch("/Sessoes");
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(toSessionFrontend);
}

export async function createSession(session) {
  const res = await authFetch("/Sessoes", {
    method: "POST",
    body: JSON.stringify(toSessionBackend(session)),
  });
  if (!res.ok) return null;
  return toSessionFrontend(await res.json());
}

// ═══════════════════════════════════════════════════════════════════════════════
// API: Horário (Cronogramas)
//
// NOTA: O modelo Cronograma no backend foi desenhado para eventos com
// DisciplinaId obrigatório. O frontend usa campos genéricos (day, start, end,
// subject, room). O mapeamento usa Titulo=day, Subtitulo=subject, Tipo para
// guardar start|end|room. Para simplificar, o listSchedule reconstrói esses
// campos a partir dos dados guardados.
// ═══════════════════════════════════════════════════════════════════════════════

function parseCronograma(c) {
  // Tipo guarda "HH:MM|HH:MM|Sala" — extrai os campos
  const tipo = c.tipo ?? c.Tipo ?? "";
  const parts = tipo.split("|");
  return {
    id: c.id ?? c.Id,
    day: c.titulo ?? c.Titulo ?? "",
    subject: c.subtitulo ?? c.Subtitulo ?? "",
    start: parts[0] ?? "",
    end: parts[1] ?? "",
    room: parts[2] ?? "",
    disciplinaId: c.disciplinaId ?? c.DisciplinaId,
  };
}

export async function listSchedule() {
  const res = await authFetch("/Cronogramas");
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(parseCronograma);
}

export async function createSchedule(item) {
  // Precisa de uma disciplinaId válida — usa a primeira disponível
  const subjects = await listSubjects();
  const disciplinaId = subjects[0]?.id ?? 0;

  if (!disciplinaId) {
    throw new Error("Cria pelo menos uma disciplina antes de adicionar aulas ao horário.");
  }

  const body = {
    titulo: item.day ?? "",
    subtitulo: item.subject ?? "",
    data: new Date().toISOString(),
    tipo: `${item.start ?? ""}|${item.end ?? ""}|${item.room ?? ""}`,
    disciplinaId,
  };

  const res = await authFetch("/Cronogramas", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return parseCronograma(await res.json());
}

export async function deleteSchedule(id) {
  await authFetch(`/Cronogramas/${id}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API: Objetivos
// ═══════════════════════════════════════════════════════════════════════════════

export async function listGoals() {
  const res = await authFetch("/Objetivos");
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(toGoalFrontend);
}

export async function createGoal(goal) {
  const res = await authFetch("/Objetivos", {
    method: "POST",
    body: JSON.stringify(toGoalBackend(goal)),
  });
  if (!res.ok) return null;
  return toGoalFrontend(await res.json());
}

export async function toggleGoal(id) {
  const res = await authFetch(`/Objetivos/${id}/toggle`, { method: "PATCH" });
  if (!res.ok) return null;
  return toGoalFrontend(await res.json());
}

export async function deleteGoal(id) {
  await authFetch(`/Objetivos/${id}`, { method: "DELETE" });
}
