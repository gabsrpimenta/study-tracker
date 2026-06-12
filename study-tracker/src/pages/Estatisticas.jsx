import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Primitives";
import { listSessions, listTasks, listGrades } from "@/lib/api";

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Estatisticas() {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    Promise.all([listSessions(), listTasks(), listGrades()]).then(([s, t, g]) => {
      setSessions(s); setTasks(t); setGrades(g);
    });
  }, []);

  const weekly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, idx) => {
      const i = 6 - idx;
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const minutes = sessions.filter((s) => s.date === key).reduce((a, b) => a + b.minutes, 0);
      return { label: dayNames[d.getDay()], minutes };
    });
  }, [sessions]);

  const bySubject = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => map.set(s.subject, (map.get(s.subject) ?? 0) + s.minutes));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [sessions]);

  const totalMin = sessions.reduce((a, b) => a + b.minutes, 0);
  const doneTasks = tasks.filter((t) => t.done).length;
  const taskPct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const avgGrade = grades.length > 0
    ? grades.reduce((a, b) => a + b.value * b.weight, 0) / (grades.reduce((a, b) => a + b.weight, 0) || 1)
    : 0;

  const maxBar = Math.max(60, ...weekly.map((d) => d.minutes));
  const maxSubject = Math.max(...bySubject.map(([, m]) => m), 1);

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Estatísticas</h1>
        <p className="text-muted-foreground">Desempenho geral.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total estudado</p><p className="text-3xl font-bold">{(totalMin / 60).toFixed(1)}h</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Tarefas concluídas</p><p className="text-3xl font-bold">{doneTasks}/{tasks.length}</p><Progress value={taskPct} className="mt-2" /></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Média geral</p><p className="text-3xl font-bold">{avgGrade.toFixed(1)}</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Últimos 7 dias</CardTitle><CardDescription>Minutos por dia</CardDescription></CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {weekly.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary" style={{ height: `${(d.minutes / maxBar) * 100}%`, minHeight: d.minutes > 0 ? "4px" : 0 }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tempo por disciplina</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {bySubject.map(([name, min]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-sm"><span>{name}</span><span className="text-muted-foreground">{(min / 60).toFixed(1)}h</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${(min / maxSubject) * 100}%` }} />
                </div>
              </div>
            ))}
            {bySubject.length === 0 && <p className="text-sm text-muted-foreground">Sem sessões.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
