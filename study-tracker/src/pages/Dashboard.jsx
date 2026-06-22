import { useEffect, useState } from "react";
import {
  Sparkles,
  Flame,
  Clock,
  CheckSquare,
  BookOpen,
  Timer,
  Check,
  Award,
  Palette,
  Crown,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";

import { Badge } from "@/components/ui/Primitives";
import {
  listSessions,
  listTasks,
  updateTask,
  listSubjects,
  listEvents,
} from "@/lib/api";

import { getUser } from "@/lib/auth";
import { toast } from "sonner";

const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const prio = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-warning/15 text-warning border-warning/30",
  baixa: "bg-muted text-muted-foreground",
};

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [events, setEvents] = useState([]);

  const [streak, setStreak] = useState(0);
  const [award, setAward] = useState("Foco Inicial");

  const [userProfile, setUserProfile] = useState({ name: "Utilizador" });

  const user = getUser();

  useEffect(() => {
    Promise.all([
      listSessions(),
      listTasks(),
      listSubjects(),
      listEvents(),
    ]).then(([s, t, sj, e]) => {
      setSessions(s || []);
      setTasks(t || []);
      setSubjects(sj || []);
      setEvents(e || []);
    });

    // 🔥 STREAK (seguro)
    const hoje = new Date().toISOString().split("T")[0];
    const storageKey = `study_tracker_streak_${
      user?.id || user?.email || "guest"
    }`;

    let storedData = { lastDate: "", count: 0 };

    try {
      storedData =
        JSON.parse(localStorage.getItem(storageKey)) || storedData;
    } catch {}

    let sequenciaAtual = storedData.count || 0;

    if (!storedData.lastDate) {
      sequenciaAtual = 1;
    } else {
      const d1 = new Date(storedData.lastDate + "T00:00:00");
      const d2 = new Date(hoje + "T00:00:00");

      const diff = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));

      if (diff === 1) sequenciaAtual += 1;
      else if (diff > 1) sequenciaAtual = 1;
    }

    setStreak(sequenciaAtual);

    if (sequenciaAtual >= 30) setAward("Mestre do Foco");
    else if (sequenciaAtual >= 15) setAward("Inabalável");
    else if (sequenciaAtual >= 7) setAward("Consistente");
    else if (sequenciaAtual >= 3) setAward("Ritmo Certo");
    else setAward("Foco Inicial");

    localStorage.setItem(
      storageKey,
      JSON.stringify({ lastDate: hoje, count: sequenciaAtual })
    );

    // 👤 USER SAFE
    const savedSettings = JSON.parse(
      localStorage.getItem("user_settings") || "null"
    );

    setUserProfile({
      name:
        savedSettings?.name ||
        localStorage.getItem("userName") ||
        user?.nome ||
        "Utilizador",
    });
  }, [user?.id, user?.email, user?.nome]);

  async function toggleTask(t) {
    const updated = await updateTask(t.id, {
      done: !t.done,
    });

    setTasks((prev) =>
      prev.map((x) => (x.id === t.id ? updated : x))
    );
  }

  function alterarTema(nomeTema, diasNecessarios) {
    if (streak < diasNecessarios) {
      toast.error(
        `Precisas de ${diasNecessarios} dias de sequência para desbloquear.`
      );
      return;
    }

    document.documentElement.classList.remove(
      "theme-midnight",
      "theme-nordic",
      "theme-cyberpunk"
    );

    if (nomeTema !== "default") {
      document.documentElement.classList.add(`theme-${nomeTema}`);
    }

    localStorage.setItem("app_theme", nomeTema);

    toast.success(`Tema ${nomeTema} ativado ✨`);
  }

  const now = new Date();

  const weekly = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));

    const key = d.toISOString().slice(0, 10);

    const minutes = (sessions || [])
      .filter((s) => s.date === key)
      .reduce((a, b) => a + (b.minutes || 0), 0);

    return {
      label: days[d.getDay()],
      minutes,
    };
  });

  const maxBar = Math.max(60, ...weekly.map((d) => d.minutes));
  const total = weekly.reduce((a, b) => a + b.minutes, 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";

  const firstName = userProfile?.name?.split(" ")?.[0] || "Utilizador";

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/90 via-primary to-primary/70 p-6 text-primary-foreground">
        <div className="relative flex flex-col gap-6 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Sparkles size={14} /> Foco do dia
            </div>

            <h1 className="text-3xl font-bold">
              {greeting}, {firstName}!
            </h1>

            <p className="text-sm opacity-90 mt-2">
              {streak >= 7
                ? "Consistência forte esta semana!"
                : "Cada dia conta."}
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-xl">
            <Flame />
            <div className="text-xl font-bold">{streak} dias</div>
            <div className="text-xs">{award}</div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <Clock />
            <p>{events?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <BookOpen />
            <p>{subjects?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Timer />
            <p>{(total / 60).toFixed(1)}h</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <CheckSquare />
            <p>
              {tasks.filter((t) => t.done || t.concluida).length}/
              {tasks.length}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* TASKS */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {tasks.slice(0, 5).map((t) => {
            const done = t.done ?? t.concluida;

            return (
              <button
                key={t.id}
                onClick={() => toggleTask(t)}
                className="flex w-full justify-between p-3 border rounded"
              >
                <span>{t.title || t.descricao}</span>
                <span>{done ? "✔" : "○"}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}