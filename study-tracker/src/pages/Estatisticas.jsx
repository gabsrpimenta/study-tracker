import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Primitives";
import { Clock, CheckCircle2, Award, BarChart3, BookOpen, Calendar, TrendingUp } from "lucide-react"; // Ícones adicionados
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

  const isApproved = avgGrade >= 10;

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Estatísticas</h1>
        <p className="text-muted-foreground">Análise detalhada do teu progresso e desempenho académico.</p>
      </div>

      {/* PAINEL DE MÉTRICAS SUPERIOR REESTRUTURADO */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mt-2">
        {/* CARD 1: TEMPO TOTAL */}
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Estudado</p>
            <p className="text-2xl font-black tracking-tight mt-0.5">
              {(totalMin / 60).toFixed(1)}<span className="text-sm font-medium text-muted-foreground ml-0.5">h</span>
            </p>
          </div>
        </div>

        {/* CARD 2: TAREFAS */}
        <div className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tarefas Concluídas</p>
              <p className="text-2xl font-black tracking-tight mt-0.5">
                {doneTasks}<span className="text-sm font-medium text-muted-foreground"> / {tasks.length}</span>
              </p>
            </div>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full shrink-0">
              {taskPct}%
            </span>
          </div>
          <Progress value={taskPct} className="mt-3 h-1.5 bg-blue-500/10" />
        </div>

        {/* CARD 3: MÉDIA GERAL */}
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
          <div className={`p-3 rounded-xl ${isApproved ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Média Geral</p>
            <p className={`text-2xl font-black tracking-tight mt-0.5 ${isApproved ? "text-emerald-500" : "text-destructive"}`}>
              {avgGrade.toFixed(1)}<span className="text-xs font-medium text-muted-foreground/70 ml-1">/ 20</span>
            </p>
          </div>
        </div>
      </div>

      {/* SECÇÃO DOS GRÁFICOS */}
      <div className="grid gap-6 lg:grid-cols-2 mt-2">
        {/* GRÁFICO 1: ÚLTIMOS 7 DIAS */}
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Últimos 7 dias</CardTitle>
              <CardDescription>Tempo dedicado diariamente em minutos</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex h-44 items-end gap-2.5 px-2 border-b pb-1">
              {weekly.map((d, i) => {
                const heightPct = (d.minutes / maxBar) * 100;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip dinâmico no hover */}
                    <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 bg-popover border text-popover-foreground px-1.5 py-0.5 rounded transition-opacity duration-150 shadow-sm pointer-events-none -mb-1">
                      {d.minutes}m
                    </span>
                    <div className="flex w-full items-end justify-center h-full max-h-[140px]">
                      <div 
                        className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all duration-300 hover:brightness-110 cursor-pointer" 
                        style={{ height: `${heightPct}%`, minHeight: d.minutes > 0 ? "6px" : "2px" }}
                        title={`${d.minutes} minutos`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors mt-1">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* GRÁFICO 2: TEMPO POR DISCIPLINA */}
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Tempo por disciplina</CardTitle>
              <CardDescription>Distribuição de horas focadas por matéria</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
            {bySubject.map(([name, min]) => {
              const widthPct = (min / maxSubject) * 100;
              return (
                <div key={name} className="group">
                  <div className="mb-1.5 flex justify-between text-sm font-medium">
                    <span className="text-foreground/90 font-semibold group-hover:text-primary transition-colors">{name}</span>
                    <span className="text-muted-foreground font-bold bg-muted/40 px-2 py-0.5 rounded text-xs">{(min / 60).toFixed(1)}h</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted/60 border">
                    <div 
                      className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500" 
                      style={{ width: `${widthPct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
            
            {/* ESTADO VAZIO CASO NÃO TENHA SESSÕES */}
            {bySubject.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/5 rounded-xl border border-dashed">
                <p className="text-sm text-muted-foreground font-medium">Nenhuma sessão de estudo gravada.</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Usa o Pomodoro ou Cronómetro para gerar dados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}