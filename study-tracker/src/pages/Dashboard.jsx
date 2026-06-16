import { useEffect, useState } from "react";
import { Sparkles, Flame, Clock, CheckSquare, BookOpen, Timer, Check, Award, Palette, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Progress, Badge } from "@/components/ui/Primitives";
import { listSessions, listTasks, updateTask, listSubjects, listEvents } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";

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
  
  const [streak, setStreak] = useState(0);
  const [award, setAward] = useState("Foco Inicial");
  const [userProfile, setUserProfile] = useState({ name: "Gabriella Pimenta" });
  
  const user = getUser();

  useEffect(() => {
    Promise.all([listSessions(), listTasks(), listSubjects(), listEvents()]).then(([s, t, sj, e]) => {
      setSessions(s); setTasks(t); setSubjects(sj); setEvents(e);
    });

    const hoje = new Date().toISOString().split("T")[0];
    const storageKey = `study_tracker_streak_${user?.id || user?.email || "guest"}`;
    const storedData = JSON.parse(localStorage.getItem(storageKey)) || { lastDate: "", count: 0 };
    
    let sequenciaAtual = storedData.count;

    if (!storedData.lastDate) {
      sequenciaAtual = 1; 
    } else {
      const d1 = new Date(storedData.lastDate + "T00:00:00");
      const d2 = new Date(hoje + "T00:00:00");
      const diferencaDias = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));

      if (diferencaDias === 1) {
        sequenciaAtual += 1; 
      } else if (diferencaDias > 1) {
        sequenciaAtual = 1;  
      }
    }

    // Configurado estritamente com a sequência dinâmica real
    setStreak(sequenciaAtual);
    
    if (sequenciaAtual >= 30) setAward("Mestre do Foco");
    else if (sequenciaAtual >= 15) setAward("Inabalável");
    else if (sequenciaAtual >= 7) setAward("Consistente");
    else if (sequenciaAtual >= 3) setAward("Ritmo Certo");
    else setAward("Foco Inicial");

    localStorage.setItem(storageKey, JSON.stringify({ lastDate: hoje, count: sequenciaAtual }));

    // Sincronizar dinamicamente o Perfil
    const savedSettings = JSON.parse(localStorage.getItem("user_settings"));
    if (savedSettings) {
      setUserProfile({
        name: savedSettings.name || user?.nome || "Gabriella Pimenta"
      });
    } else if (user?.nome) {
      setUserProfile((prev) => ({ ...prev, name: user.nome }));
    }
  }, [user?.id, user?.email, user?.nome]);

  async function toggleTask(t) {
    const u = await updateTask(t.id, { done: !t.done });
    setTasks((p) => p.map((x) => (x.id === t.id ? u : x)));
  }

  // Função de Interação com os Temas Premium
  function alterarTema(nomeTema, diasNecessarios) {
    if (streak < diasNecessarios) {
      toast.error(`Precisas de uma sequência de ${diasNecessarios} dias para desbloquear este visual!`);
      return;
    }
    
    document.documentElement.classList.remove("theme-midnight", "theme-nordic", "theme-cyberpunk");
    
    if (nomeTema !== "default") {
      document.documentElement.classList.add(`theme-${nomeTema}`);
    }
    
    localStorage.setItem("app_theme", nomeTema);
    toast.success(`Visual ${nomeTema.charAt(0).toUpperCase() + nomeTema.slice(1)} ativado com sucesso! ✨`);
  }

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
    <div className="space-y-6">
      {/* Hero Card */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/90 via-primary to-primary/70 p-6 text-primary-foreground shadow-lg md:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> Foco do dia
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {greeting}, {userProfile.name.split(" ")[0]}!
            </h1>
            <p className="max-w-xl text-sm text-primary-foreground/90 md:text-base font-medium leading-relaxed">
              {streak >= 20 ? (
                <span className="text-white drop-shadow-sm">⚡ Ninguém te consegue parar. Continua o legado!</span>
              ) : streak >= 7 ? (
                <span className="text-white/95">🚀 É um orgulho ver a tua consistência esta semana! Vamos a isto.</span>
              ) : (
                "Pequenos passos consistentes constroem grandes conquistas. Vamos lá."
              )}
            </p>
          </div>

          {/* Widget da Sequência */}
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur min-w-[170px] border border-white/10 transition-all hover:bg-white/15 self-start md:self-auto shrink-0">
            <div className="relative">
              <Flame className="h-8 w-8 text-warning fill-warning animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70 font-medium">Sequência</p>
              <p className="text-2xl font-bold tracking-tight">{streak} {streak === 1 ? "dia" : "dias"}</p>
              <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded-md">
                <Award className="h-2.5 w-2.5" /> {award}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Estatísticas Rápidas */}
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

      {/* Secção de Benefícios Premium - Apenas com Temas Visuais */}
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm text-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground border-r pr-3 h-5 mr-1">
          <Crown className="h-3.5 w-3.5 text-primary" /> Benefícios Premium
        </div>
        
        <button onClick={() => alterarTema("midnight", 7)} className="transition-transform active:scale-95 focus:outline-none">
          <Badge variant={streak >= 7 ? "default" : "secondary"} className={`gap-1 px-2.5 py-1 text-xs font-medium cursor-pointer ${streak >= 7 ? "hover:brightness-110" : "opacity-50"}`}>
            <Palette className="h-3 w-3" /> Midnight Gold {streak >= 7 ? "🔓" : "🔒 (7d)"}
          </Badge>
        </button>

        <button onClick={() => alterarTema("nordic", 15)} className="transition-transform active:scale-95 focus:outline-none">
          <Badge variant={streak >= 15 ? "default" : "secondary"} className={`gap-1 px-2.5 py-1 text-xs font-medium cursor-pointer ${streak >= 15 ? "hover:brightness-110" : "opacity-50"}`}>
            <Palette className="h-3 w-3" /> Nordic Mint {streak >= 15 ? "🔓" : "🔒 (15d)"}
          </Badge>
        </button>

        <button onClick={() => alterarTema("cyberpunk", 30)} className="transition-transform active:scale-95 focus:outline-none">
          <Badge variant={streak >= 30 ? "default" : "secondary"} className={`gap-1 px-2.5 py-1 text-xs font-medium cursor-pointer ${streak >= 30 ? "hover:brightness-110" : "opacity-50"}`}>
            <Palette className="h-3 w-3" /> Cyberpunk Stealth {streak >= 30 ? "🔓" : "🔒 (30d)"}
          </Badge>
        </button>
      </section>

      {/* Gráficos e Listagem de Tarefas */}
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
    </div>
  );
}