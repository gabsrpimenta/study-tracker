import { useEffect, useState } from "react";
import { Flame, Target, Plus, CheckCircle2, Loader2, Palette, Lock, Pencil, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Primitives";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Input";
import { toast } from "sonner"; 

import { listSessions, listTasks, listGrades, listEvents, listGoals, createGoal, deleteGoal } from "@/lib/api";
import { getUser } from "@/lib/auth";

const obterDataLocal = (dataObj) => {
  const ano = dataObj.getFullYear();
  const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
  const dia = String(dataObj.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const THEMES = [
  { id: "default", name: "Padrão", minDays: 0, badge: "NÍVEL BÁSICO" },
  { id: "theme-midnight", name: "Midnight Gold", minDays: 7, badge: "NÍVEL: MIDNIGHT GOLD" },
  { id: "theme-nordic", name: "Nordic Mint", minDays: 15, badge: "NÍVEL: NORDIC MINT" },
  { id: "theme-cyberpunk", name: "Cyberpunk", minDays: 30, badge: "NÍVEL: CYBERPUNK" },
];

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function Dashboard() {
  // ==========================================
  // 1. ESTADOS (STATE)
  // ==========================================
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ sessions: [], tasks: [], grades: [], goals: [], events: [] });
  const [streak, setStreak] = useState(0);
  const user = getUser();
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "" });

  const [dailyGoal, setDailyGoal] = useState(() => parseInt(localStorage.getItem("daily_goal")) || 60);
  const [isDailyGoalModalOpen, setIsDailyGoalModalOpen] = useState(false);
  const [dailyGoalInput, setDailyGoalInput] = useState(dailyGoal);

  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem("user_theme") || "default");

  // ESTADOS DO CALENDÁRIO
  const hojeData = new Date();
  const hojeStr = obterDataLocal(hojeData);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const anoAtual = calendarDate.getFullYear();
  const mesAtual = calendarDate.getMonth();
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();

  const isMesAtual = anoAtual === hojeData.getFullYear() && mesAtual === hojeData.getMonth();

  // ==========================================
  // 2. EFEITOS (USEEFFECT)
  // ==========================================
  useEffect(() => {
    Promise.all([
      listSessions ? listSessions() : Promise.resolve([]), 
      listTasks ? listTasks() : Promise.resolve([]), 
      listGrades ? listGrades() : Promise.resolve([]),
      listEvents ? listEvents() : Promise.resolve([]),
      listGoals ? listGoals() : Promise.resolve([]) // Nova API sincronizada
    ]).then(([s, t, g, e, goalsData]) => {
      setData({ sessions: s || [], tasks: t || [], grades: g || [], goals: goalsData || [], events: e || [] }); 
      setIsLoading(false);
    }).catch(() => {
      toast.error("Erro ao carregar dados do servidor.");
      setIsLoading(false);
    });

    const ontemData = new Date();
    ontemData.setDate(ontemData.getDate() - 1);
    const ontem = obterDataLocal(ontemData);

    const storageKey = `streak_${user?.id || "guest"}`;
    const storedData = JSON.parse(localStorage.getItem(storageKey)) || { lastDate: "", count: 0 };
    
    let count = storedData.count;
    if (storedData.lastDate !== hojeStr) {
      if (storedData.lastDate === ontem) count += 1; 
      else if (storedData.lastDate === "") count = 1;
      else count = 1;
      localStorage.setItem(storageKey, JSON.stringify({ lastDate: hojeStr, count }));
    }
    setStreak(count);
  }, [user?.id, hojeStr]); 

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-midnight", "theme-nordic", "theme-cyberpunk");
    if (activeTheme !== "default") root.classList.add(activeTheme);
    localStorage.setItem("user_theme", activeTheme);
  }, [activeTheme]);

  // ==========================================
  // 3. FUNÇÕES DE AÇÃO (INTEGRADAS COM API)
  // ==========================================
  async function handleSaveGoal() {
    if (!goalForm.title.trim()) { toast.error("O título é obrigatório!"); return; }
    try {
      const novoObjetivo = await createGoal({ title: goalForm.title, done: false });
      setData((prev) => ({ ...prev, goals: [...prev.goals, novoObjetivo] }));
      setIsGoalModalOpen(false);
      setGoalForm({ title: "" });
      toast.success("Objetivo adicionado à BD!");
    } catch {
      toast.error("Erro ao guardar o objetivo.");
    }
  }

  async function handleRemoveGoal(id) {
    try {
      await deleteGoal(id);
      setData((prev) => ({
        ...prev,
        goals: prev.goals.filter((g) => (g.id || g.Id) !== id),
      }));
      toast.success("Objetivo removido.");
    } catch {
      toast.error("Erro ao remover o objetivo.");
    }
  }

  function handleSaveDailyGoal() {
    const val = parseInt(dailyGoalInput);
    if (isNaN(val) || val <= 0) { toast.error("Digita um número válido!"); return; }
    setDailyGoal(val); 
    localStorage.setItem("daily_goal", val); 
    setIsDailyGoalModalOpen(false); 
    toast.success("Meta atualizada!");
  }

  function prevMonth() { setCalendarDate(new Date(anoAtual, mesAtual - 1, 1)); }
  function nextMonth() { setCalendarDate(new Date(anoAtual, mesAtual + 1, 1)); }

  // ==========================================
  // 4. CÁLCULOS DINÂMICOS
  // ==========================================
  const minutosHoje = data.sessions.filter((s) => s.date === hojeStr).reduce((acc, curr) => acc + curr.minutes, 0);
  const progressoHoje = Math.min((minutosHoje / dailyGoal) * 100, 100);

  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); 
    const mins = data.sessions.filter((s) => s.date === obterDataLocal(d)).reduce((a, b) => a + b.minutes, 0);
    return { label: days[d.getDay()], minutes: mins };
  });
  const maxWeeklyMins = Math.max(60, ...weekly.map((d) => d.minutes));
  const temaAtualInfo = THEMES.find(t => t.id === activeTheme) || THEMES[0];

  // ==========================================
  // 5. RENDERIZAÇÃO DA INTERFACE
  // ==========================================
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-10 px-2 md:px-6">
      
      {/* 1. CABEÇALHO */}
      <section className="bg-primary text-primary-foreground rounded-[1.5rem] p-8 flex flex-col md:flex-row justify-between items-center shadow-sm">
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-3xl font-bold">Olá, {user?.nome?.split(" ")[0] || "Estudante"}!</h1>
          <Badge className="bg-black/20 hover:bg-black/30 border-none text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
            {temaAtualInfo.badge}
          </Badge>
        </div>
        <div className="bg-white/20 px-6 py-3.5 rounded-2xl backdrop-blur-sm mt-4 md:mt-0 flex items-center gap-3">
          <Flame className="text-yellow-300 h-7 w-7 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold opacity-80 leading-tight">Sequência atual</span>
            <span className="text-xl font-bold leading-tight">{streak} {streak === 1 ? "dia" : "dias"}</span>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE TEMAS */}
      <div className="flex flex-wrap items-center gap-2 text-sm bg-card border border-border/50 p-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 font-medium text-muted-foreground px-4">
          <Palette className="h-4 w-4" /> Temas
        </div>
        {THEMES.map((theme) => {
          const isUnlocked = streak >= theme.minDays; 
          return (
            <Button
              key={theme.id}
              variant={activeTheme === theme.id ? "default" : "ghost"}
              size="sm"
              disabled={!isUnlocked}
              onClick={() => setActiveTheme(theme.id)}
              className={`transition-all rounded-full h-8 px-4 ${!isUnlocked ? "opacity-50 hover:bg-transparent" : "hover:bg-muted"}`}
            >
              {!isUnlocked && <Lock className="h-3 w-3 mr-2" />}
              {theme.name} 
              {!isUnlocked && <span className="ml-1.5 opacity-70">({theme.minDays}d)</span>}
            </Button>
          );
        })}
      </div>

      {/* 3. LAYOUT PRINCIPAL */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        {/* COLUNA ESQUERDA: GRÁFICO SEMANAL */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="hover:shadow-md transition-shadow duration-300 rounded-[1.5rem] border-border/50 shadow-sm">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-sm font-bold">Estudo da Semana</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div className="flex h-[320px] items-end gap-4">
                {weekly.map((dia, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-3 h-full justify-end group">
                    <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {dia.minutes}m
                    </span>
                    <div 
                      className="w-full rounded-t-lg bg-primary transition-all duration-300 hover:opacity-85 cursor-pointer"
                      style={{ height: `${(dia.minutes / maxWeeklyMins) * 100}%`, minHeight: "4px" }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">{dia.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6">
          
          {/* META DIÁRIA */}
          <Card className="rounded-[1.5rem] border-border/50 shadow-sm p-6 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Meta Diária</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10 text-primary" onClick={() => { setDailyGoalInput(dailyGoal); setIsDailyGoalModalOpen(true); }}>
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-foreground">{minutosHoje}</span>
                <span className="text-sm text-muted-foreground font-medium mb-1">/ {dailyGoal}m</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressoHoje}%` }} />
              </div>
            </div>
          </Card>

          {/* CALENDÁRIO */}
          <Card className="rounded-[1.5rem] border-border/50 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Visão do Mês
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-[11px] font-bold w-[90px] text-center uppercase tracking-wider">
                  {MESES[mesAtual]} {anoAtual}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-3 font-bold uppercase">
              {['D','S','T','Q','Q','S','S'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={`empty-${i}`} />)}
              
              {Array.from({ length: diasNoMes }).map((_, i) => {
                const dia = i + 1;
                const eHojeReal = isMesAtual && dia === hojeData.getDate();
                
                const temEvento = data.events.some(e => {
                  const dataEvento = e.date || e.Date;
                  if (!dataEvento) return false;
                  if (dataEvento.includes("/")) {
                    const [d, m] = dataEvento.split("/");
                    return parseInt(d) === dia && parseInt(m) === mesAtual + 1;
                  } else {
                    const [y, m, d] = dataEvento.split("-");
                    return parseInt(d) === dia && parseInt(m) === mesAtual + 1 && parseInt(y) === anoAtual;
                  }
                });

                return (
                  <div key={dia} className={`relative p-1 rounded-full text-xs flex justify-center items-center h-8 w-8 mx-auto ${eHojeReal ? 'bg-primary text-primary-foreground font-bold shadow-md' : 'hover:bg-muted transition-colors cursor-default'}`}>
                    {dia}
                    {temEvento && <div className={`absolute bottom-1 w-1 h-1 rounded-full ${eHojeReal ? 'bg-white' : 'bg-primary'}`} />}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* OBJETIVOS CRUDS SINCRONIZADOS */}
          <Card className="rounded-[1.5rem] border-border/50 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row justify-between items-center p-6 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" /> Objetivos
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary" onClick={() => setIsGoalModalOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-2 overflow-y-auto max-h-[180px]">
              {data.goals.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center italic">Sem objetivos definidos.</p>
              ) : (
                data.goals.map((goal) => {
                  const currentId = goal.id || goal.Id;
                  return (
                    <div key={currentId} className="flex items-center justify-between p-3 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors group">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium leading-snug truncate">{goal.title}</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" 
                        onClick={() => handleRemoveGoal(currentId)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* MODAL: NOVO OBJETIVO */}
      <Dialog open={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Novo Objetivo">
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título do Objetivo</Label>
            <Input value={goalForm.title} onChange={(e) => setGoalForm({ title: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") handleSaveGoal(); }} placeholder="Ex: Tirar 20 a Matemática!" className="h-11 rounded-xl" />
          </div>
          <Button className="w-full mt-4 rounded-xl h-11 font-bold" onClick={handleSaveGoal}>Guardar Objetivo</Button>
        </div>
      </Dialog>

      {/* MODAL: META DIÁRIA */}
      <Dialog open={isDailyGoalModalOpen} onClose={() => setIsDailyGoalModalOpen(false)} title="Ajustar Meta Diária">
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Minutos por dia</Label>
            <Input type="number" min="1" value={dailyGoalInput} onChange={(e) => setDailyGoalInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSaveDailyGoal(); }} className="h-11 rounded-xl" />
          </div>
          <Button className="w-full mt-4 rounded-xl h-11 font-bold" onClick={handleSaveDailyGoal}>Atualizar Meta</Button>
        </div>
      </Dialog>

    </div>
  );
}