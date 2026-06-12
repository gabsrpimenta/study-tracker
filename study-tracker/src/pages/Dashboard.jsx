import { useEffect, useState } from "react";
import { Sparkles, Flame, Clock, CheckSquare, BookOpen, Timer, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Progress, Badge } from "@/components/ui/Primitives";
import { listSessions, listTasks, updateTask, listSubjects, listEvents } from "@/lib/api";

const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const prio = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-warning/15 text-warning border-warning/30",
  baixa: "bg-muted text-muted-foreground",
};
const typeStyles = {
  Teste: "bg-destructive/10 text-destructive border-destructive/20",
  Entrega: "bg-warning/15 text-warning border-warning/30",
  Projeto: "bg-primary/10 text-primary border-primary/20",
};

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    Promise.all([listSessions(), listTasks(), listSubjects(), listEvents()]).then(([s, t, sj, e]) => {
      setSessions(s); setTasks(t); setSubjects(sj); setEvents(e);
    });
  }, []);

  async function toggleTask(t) {
    const u = await updateTask(t.id, { done: !t.done });
    setTasks((p) => p.map((x) => (x.id === t.id ? u : x)));
  }

  // Weekly chart data
  const now = new Date();
  const weekly = Array.from({ length: 7 }, (_, idx) => {
    const i = 6 - idx;
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const minutes = sessions.filter((s) => s.date === key).reduce((a, b) => a + b.minutes, 0);
    return { label: days[d.getDay()], minutes };
  });
  const maxBar = Math.max(60, ...weekly.map((d) => d.minutes));
  const total = weekly.reduce((a, b) => a + b.minutes, 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/90 via-primary to-primary/70 p-6 text-primary-foreground shadow-lg md:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> Foco do dia
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{greeting}, Gabriella!</h1>
            <p className="mt-1 max-w-xl text-sm text-primary-foreground/80 md:text-base">
              Pequenos passos consistentes constroem grandes conquistas. Vamos lá.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
            <Flame className="h-8 w-8 text-warning" />
            <div>
              <p className="text-xs text-primary-foreground/70">Sequência</p>
              <p className="text-2xl font-bold">7 dias</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Próximos prazos", value: events.length, icon: Clock, tone: "bg-primary/10 text-primary" },
          { label: "Disciplinas", value: subjects.length, icon: BookOpen, tone: "bg-accent text-accent-foreground" },
          { label: "Horas estudadas", value: `${(total / 60).toFixed(1)}h`, icon: Timer, tone: "bg-warning/15 text-warning" },
          { label: "Tarefas concluídas", value: `${tasks.filter(t => t.done).length}/${tasks.length}`, icon: CheckSquare, tone: "bg-success/10 text-success" },
        ].map((s) => (
          <Card key={s.label} className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.tone}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estudo da semana</CardTitle>
            <CardDescription>Total: <span className="font-medium text-foreground">{(total / 60).toFixed(1)}h</span></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {weekly.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary"
                      style={{ height: `${(d.minutes / maxBar) * 100}%`, minHeight: d.minutes > 0 ? "4px" : 0 }}
                      title={`${d.minutes} min`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tarefas em foco</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tasks.slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTask(t)}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent/40"
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${t.done ? "border-success bg-success text-success-foreground" : "border-muted-foreground/40"}`}>
                  {t.done && <Check className="h-3 w-3" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.subject} · {t.due}</p>
                </div>
                <Badge variant="outline" className={prio[t.priority]}>{t.priority}</Badge>
              </button>
            ))}
            {tasks.length === 0 && <p className="text-sm text-muted-foreground">Sem tarefas.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Disciplinas</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {subjects.map((s) => (
              <div key={s.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="text-sm text-muted-foreground">{s.progress}%</span>
                </div>
                <Progress value={s.progress} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Próximos eventos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {events.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.subject} · {e.date}</p>
                </div>
                <Badge variant="outline" className={typeStyles[e.type]}>{e.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
