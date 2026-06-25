// Importamos os hooks essenciais do React
import { useEffect, useState, useMemo } from "react";
// Importamos o pacote de confetes para a animação de meta batida
import confetti from "canvas-confetti";
// Importamos todos os ícones da biblioteca lucide-react (adicionamos o BookOpen para o estudo)
import { 
  Flame, Target, Plus, CheckCircle2, Loader2, Palette, Lock, Pencil, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, Rocket, BookOpen
} from "lucide-react";
// Importamos os componentes visuais da tua interface (UI)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Primitives";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Input";
// Importamos a biblioteca de notificações (avisos no ecrã)
import { toast } from "sonner"; 

// Importamos as funções que comunicam com o teu backend (Rider/C#)
import { listSessions, createSession, listTasks, listGrades, listEvents, listGoals, createGoal, deleteGoal } from "@/lib/api";
import { getUser } from "@/lib/auth";

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================
// Função para converter uma data no formato padrão YYYY-MM-DD
const obterDataLocal = (dataObj) => {
  const ano = dataObj.getFullYear();
  const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
  const dia = String(dataObj.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

// NOVA FUNÇÃO: À prova de falhas com datas complexas do backend e que devolve os eventos reais
const obterEventosDoDia = (eventos, dia, mes, ano) => {
  return eventos.filter(e => {
    const dataEvento = e.date || e.Date;
    if (!dataEvento) return false;

    // Limpa a string para ignorar as horas (ex: "2026-06-30T14:00:00" vira "2026-06-30")
    const apenasData = dataEvento.split('T')[0];

    // Verifica se a data usa barras (DD/MM) ou traços (YYYY-MM-DD)
    if (apenasData.includes("/")) {
      const partes = apenasData.split("/");
      return parseInt(partes[0]) === dia && parseInt(partes[1]) === mes;
    } else {
      const partes = apenasData.split("-");
      // Garante que compara exatamente ano, mês e dia
      return parseInt(partes[2]) === dia && parseInt(partes[1]) === mes && parseInt(partes[0]) === ano;
    }
  });
};

// Configuração dos temas e dos dias necessários para os desbloquear
const THEMES = [
  { id: "default", name: "Padrão", minDays: 0, badge: "NÍVEL BÁSICO" },
  { id: "theme-midnight", name: "Midnight Gold", minDays: 7, badge: "NÍVEL: MIDNIGHT GOLD" },
  { id: "theme-nordic", name: "Nordic Mint", minDays: 15, badge: "NÍVEL: NORDIC MINT" },
  { id: "theme-cyberpunk", name: "Cyberpunk", minDays: 30, badge: "NÍVEL: CYBERPUNK" },
];

// Arrays estáticos para alimentar o calendário e o gráfico
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Função que devolve uma mensagem de motivação dependendo da hora do dia
const obterSaudacao = () => {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) return "Bom dia! Pronta para bater a meta de hoje?";
  if (hora >= 12 && hora < 20) return "Boa tarde! Continua o excelente trabalho.";
  return "Boa noite! Um último esforço antes de descansar.";
};

// ==========================================
// SUB-COMPONENTES
// ==========================================

// Sub-componente do Gráfico Semanal
const WeeklyChart = ({ weeklyData, maxMins }) => (
  <Card className="hover:shadow-md transition-shadow duration-300 rounded-[1.5rem] border-border/50 shadow-sm flex flex-col h-full min-h-[400px]">
    <CardHeader className="p-8 pb-0">
      <CardTitle className="text-sm font-bold">Estudo da Semana</CardTitle>
    </CardHeader>
    <CardContent className="p-8 pt-4 flex-1 flex flex-col justify-end">
      <div className="flex w-full h-full items-end gap-4 mt-8">
        {weeklyData.map((dia, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-3 h-full justify-end group">
            <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {dia.minutes}m
            </span>
            <div 
              className="w-full rounded-t-lg bg-gradient-to-t from-primary/20 to-primary transition-all duration-300 hover:opacity-85 cursor-pointer mt-auto"
              style={{ height: `${(dia.minutes / maxMins) * 100}%`, minHeight: "6px" }}
            />
            <span className="text-xs font-medium text-muted-foreground">{dia.label}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Sub-componente do Cartão de Meta Diária (Agora tem o botão de Registar Estudo)
const DailyGoalCard = ({ minutosHoje, dailyGoal, progressoHoje, onEditClick, onAddStudyClick }) => (
  <Card className="rounded-[1.5rem] border-border/50 shadow-sm p-6 flex flex-col justify-center">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Meta Diária</h3>
      <Button variant="ghost" size="icon" aria-label="Editar Meta Diária" className="h-6 w-6 rounded-full hover:bg-primary/10 text-primary" onClick={onEditClick}>
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-black text-foreground animate-in slide-in-from-bottom-2 duration-500">{minutosHoje}</span>
        <span className="text-sm text-muted-foreground font-medium mb-1">/ {dailyGoal}m</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden mb-6">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${progressoHoje >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
          style={{ width: `${progressoHoje}%` }} 
        />
      </div>
      {/* Botão para abrir o modal de registo manual de estudo */}
      <Button className="w-full font-bold h-10 rounded-xl" onClick={onAddStudyClick}>
        <BookOpen className="h-4 w-4 mr-2" /> Registar Estudo
      </Button>
    </div>
  </Card>
);

// Sub-componente da Lista de Objetivos
const GoalsList = ({ goals, onRemoveGoal, onAddClick }) => (
  <Card className="rounded-[1.5rem] border-border/50 shadow-sm flex flex-col">
    <CardHeader className="flex flex-row justify-between items-center p-6 pb-2">
      <CardTitle className="text-sm font-bold flex items-center gap-2">
        <Target className="h-4 w-4 text-muted-foreground" /> Objetivos
      </CardTitle>
      <Button size="icon" variant="ghost" aria-label="Adicionar novo objetivo" className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary" onClick={onAddClick}>
        <Plus className="h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent className="p-6 pt-2 space-y-2 overflow-y-auto max-h-[180px]">
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center opacity-70">
          <Rocket className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-xs font-medium text-muted-foreground">O teu caminho começa aqui.</p>
          <p className="text-[10px] text-muted-foreground">Adiciona o teu primeiro objetivo!</p>
        </div>
      ) : (
        goals.map((goal) => {
          const currentId = goal.id || goal.Id;
          return (
            <div key={currentId} className="flex items-center justify-between p-3 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-snug truncate">{goal.title}</p>
              </div>
              <Button size="icon" variant="ghost" aria-label={`Remover objetivo`} className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" onClick={() => onRemoveGoal(currentId)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          );
        })
      )}
    </CardContent>
  </Card>
);

// ==========================================
// COMPONENTE PRINCIPAL (DASHBOARD)
// ==========================================
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ sessions: [], tasks: [], grades: [], goals: [], events: [] });
  
  const user = getUser();
  const streak = user?.streak || 0; 
  
  // Estados para Objetivos
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "" });

  // Estados para a Meta Diária
  const [dailyGoal, setDailyGoal] = useState(() => parseInt(localStorage.getItem("daily_goal")) || 60);
  const [isDailyGoalModalOpen, setIsDailyGoalModalOpen] = useState(false);
  const [dailyGoalInput, setDailyGoalInput] = useState(dailyGoal);

  // Estados para registar a Sessão de Estudo
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [studyForm, setStudyForm] = useState({ minutes: 45, subject: "Estudo Geral" });

  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem("user_theme") || "default");
  const [confettiDisparado, setConfettiDisparado] = useState(false);

  const hojeData = useMemo(() => new Date(), []);
  const hojeStr = useMemo(() => obterDataLocal(hojeData), [hojeData]);
  const [calendarDate, setCalendarDate] = useState(hojeData);

  const anoAtual = calendarDate.getFullYear();
  const mesAtual = calendarDate.getMonth();
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  const isMesAtual = anoAtual === hojeData.getFullYear() && mesAtual === hojeData.getMonth();

  useEffect(() => {
    Promise.all([
      listSessions ? listSessions() : Promise.resolve([]), 
      listTasks ? listTasks() : Promise.resolve([]), 
      listGrades ? listGrades() : Promise.resolve([]),
      listEvents ? listEvents() : Promise.resolve([]),
      listGoals ? listGoals() : Promise.resolve([])
    ]).then(([s, t, g, e, goalsData]) => {
      setData({ sessions: s || [], tasks: t || [], grades: g || [], goals: goalsData || [], events: e || [] }); 
      setIsLoading(false);
    }).catch(() => {
      toast.error("Erro ao carregar dados do servidor.");
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-midnight", "theme-nordic", "theme-cyberpunk");
    if (activeTheme !== "default") root.classList.add(activeTheme);
    localStorage.setItem("user_theme", activeTheme);
  }, [activeTheme]);

  // ==========================================
  // CÁLCULOS OTIMIZADOS (useMemo) - COM PROTEÇÃO ANTI-CRASH
  // ==========================================
  const { minutosHoje, progressoHoje } = useMemo(() => {
    if (!data.sessions.length) return { minutosHoje: 0, progressoHoje: 0 };
    // PROTEÇÃO: 's && s.date' garante que não crasha caso o backend mande uma sessão vazia
    const mins = data.sessions.filter((s) => s && s.date === hojeStr).reduce((acc, curr) => acc + curr.minutes, 0);
    const prog = Math.min((mins / dailyGoal) * 100, 100);
    return { minutosHoje: mins, progressoHoje: prog };
  }, [data.sessions, hojeStr, dailyGoal]);

  useEffect(() => {
    if (progressoHoje >= 100 && !confettiDisparado) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setConfettiDisparado(true);
      toast.success("Parabéns! Bateste a tua meta diária! 🎉");
    }
  }, [progressoHoje, confettiDisparado]);

  const { weekly, maxWeeklyMins } = useMemo(() => {
    const calcWeekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); 
      // PROTEÇÃO: 's && s.date' garante que não crasha caso o backend mande uma sessão vazia
      const mins = data.sessions.filter((s) => s && s.date === obterDataLocal(d)).reduce((a, b) => a + b.minutes, 0);
      return { label: DIAS_SEMANA_CURTOS[d.getDay()], minutes: mins };
    });
    return { weekly: calcWeekly, maxWeeklyMins: Math.max(60, ...calcWeekly.map((d) => d.minutes)) };
  }, [data.sessions]);

  const temaAtualInfo = useMemo(() => THEMES.find(t => t.id === activeTheme) || THEMES[0], [activeTheme]);
  const proximoTemaInfo = useMemo(() => THEMES.find(t => t.minDays > streak), [streak]);
  const diasParaProximoTema = proximoTemaInfo ? proximoTemaInfo.minDays - streak : 0;

  // ==========================================
  // FUNÇÕES DE ACÇÃO
  // ==========================================
  
  // FUNÇÃO: Guarda a sessão de estudo com proteção anti-crash!
  async function handleSaveSession() {
    const mins = parseInt(studyForm.minutes);
    if (isNaN(mins) || mins <= 0) { toast.error("Por favor, insere um número válido de minutos."); return; }
    if (!studyForm.subject.trim()) { toast.error("Diz-nos o que estudaste!"); return; }

    try {
      const novaSessao = await createSession({ minutes: mins, subject: studyForm.subject, date: hojeStr });
      
      // PROTEÇÃO: Se a API falhar e devolver null, paramos tudo aqui antes de crashar o gráfico!
      if (!novaSessao) {
        throw new Error("A API não devolveu a sessão.");
      }
      
      setData((prev) => ({ ...prev, sessions: [...prev.sessions, novaSessao] }));
      setIsStudyModalOpen(false);
      setStudyForm({ minutes: 45, subject: "Estudo Geral" });
      toast.success("Sessão de estudo registada com sucesso! 🔥");
    } catch { 
      toast.error("Erro ao guardar a sessão no servidor. Verifica se a API está a correr!"); 
    }
  }

  async function handleSaveGoal() {
    if (!goalForm.title.trim()) { toast.error("O título é obrigatório!"); return; }
    try {
      const novoObjetivo = await createGoal({ title: goalForm.title, done: false });
      
      // PROTEÇÃO: Prevenção contra erros caso a API retorne null ao salvar objetivo
      if (!novoObjetivo) throw new Error("A API não devolveu o objetivo.");

      setData((prev) => ({ ...prev, goals: [...prev.goals, novoObjetivo] }));
      setIsGoalModalOpen(false);
      setGoalForm({ title: "" });
      toast.success("Objetivo adicionado!");
    } catch { toast.error("Erro ao guardar o objetivo."); }
  }

  async function handleRemoveGoal(id) {
    try {
      await deleteGoal(id);
      setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => (g.id || g.Id) !== id) }));
      toast.success("Objetivo removido.");
    } catch { toast.error("Erro ao remover."); }
  }

  function handleSaveDailyGoal() {
    const val = parseInt(dailyGoalInput);
    if (isNaN(val) || val <= 0) return toast.error("Número inválido!");
    setDailyGoal(val); localStorage.setItem("daily_goal", val); 
    setIsDailyGoalModalOpen(false); toast.success("Meta atualizada!");
  }

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-10 px-2 md:px-6">
      
      {/* CABEÇALHO */}
      <section className="bg-primary text-primary-foreground rounded-[1.5rem] p-8 flex flex-col md:flex-row justify-between items-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col items-start gap-3 relative z-10">
          <div>
            <h1 className="text-3xl font-bold">Olá, {user?.nome?.split(" ")[0] || "Gabriella"}!</h1>
            <p className="text-sm font-medium opacity-80 mt-1">{obterSaudacao()}</p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Badge className="bg-black/20 border-none text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
              {temaAtualInfo.badge}
            </Badge>
            {proximoTemaInfo && (
              <span className="text-[10px] opacity-70 font-medium">
                Faltam {diasParaProximoTema} dias para {proximoTemaInfo.name}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white/20 px-6 py-3.5 rounded-2xl backdrop-blur-sm mt-4 md:mt-0 flex items-center gap-3 relative z-10 hover:bg-white/30 transition-colors">
          <Flame className={`h-7 w-7 ${progressoHoje >= 100 ? 'text-emerald-400 animate-bounce' : 'text-yellow-300 animate-pulse'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold opacity-80 leading-tight">Sequência atual</span>
            <span className="text-xl font-bold leading-tight">{streak} {streak === 1 ? "dia" : "dias"}</span>
          </div>
        </div>
      </section>

      {/* BARRA DE TEMAS */}
      <div className="flex flex-wrap items-center gap-2 text-sm bg-card border border-border/50 p-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 font-medium text-muted-foreground px-4">
          <Palette className="h-4 w-4" /> Temas
        </div>
        {THEMES.map((theme) => {
          const isUnlocked = streak >= theme.minDays; 
          return (
            <Button key={theme.id} variant={activeTheme === theme.id ? "default" : "ghost"} size="sm" disabled={!isUnlocked} onClick={() => setActiveTheme(theme.id)} className={`transition-all rounded-full h-8 px-4 ${!isUnlocked ? "opacity-50 hover:bg-transparent" : "hover:bg-muted"}`}>
              {!isUnlocked && <Lock className="h-3 w-3 mr-2" />}
              {theme.name} 
              {!isUnlocked && <span className="ml-1.5 opacity-70">({theme.minDays}d)</span>}
            </Button>
          );
        })}
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        <div className="lg:col-span-2 space-y-6 h-full">
          <WeeklyChart weeklyData={weekly} maxMins={maxWeeklyMins} />
        </div>

        <div className="space-y-6">
          <DailyGoalCard 
            minutosHoje={minutosHoje} 
            dailyGoal={dailyGoal} 
            progressoHoje={progressoHoje} 
            onEditClick={() => { setDailyGoalInput(dailyGoal); setIsDailyGoalModalOpen(true); }} 
            onAddStudyClick={() => setIsStudyModalOpen(true)}
          />

          {/* CALENDÁRIO COM HOVER TOOLTIP */}
          <Card className="rounded-[1.5rem] border-border/50 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Visão do Mês
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCalendarDate(new Date(anoAtual, mesAtual - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-[11px] font-bold w-[90px] text-center uppercase tracking-wider">{MESES[mesAtual]} {anoAtual}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCalendarDate(new Date(anoAtual, mesAtual + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-3 font-bold uppercase">{['D','S','T','Q','Q','S','S'].map((d, i) => <span key={i}>{d}</span>)}</div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: diasNoMes }).map((_, i) => {
                const dia = i + 1; const eHojeReal = isMesAtual && dia === hojeData.getDate();
                
                const eventosDoDia = obterEventosDoDia(data.events, dia, mesAtual + 1, anoAtual);
                const temEvento = eventosDoDia.length > 0;
                
                const tooltipTexto = temEvento 
                  ? eventosDoDia.map(e => e.title || e.nome || "Evento agendado").join(", ") 
                  : undefined;

                return (
                  <div 
                    key={dia} 
                    title={tooltipTexto}
                    className={`relative p-1 rounded-full text-xs flex justify-center items-center h-8 w-8 mx-auto 
                      ${eHojeReal ? 'bg-primary text-primary-foreground font-bold shadow-md' : 'hover:bg-muted transition-colors'} 
                      ${temEvento ? 'cursor-help' : 'cursor-default'}`}
                  >
                    {dia} {temEvento && <div className={`absolute bottom-1 w-1 h-1 rounded-full ${eHojeReal ? 'bg-white' : 'bg-primary'}`} />}
                  </div>
                );
              })}
            </div>
          </Card>

          <GoalsList goals={data.goals} onRemoveGoal={handleRemoveGoal} onAddClick={() => setIsGoalModalOpen(true)} />
        </div>
      </div>

      {/* MODAL: Registar Sessão de Estudo */}
      <Dialog open={isStudyModalOpen} onClose={() => setIsStudyModalOpen(false)} title="Registar Estudo">
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">O que estudaste?</Label>
            <Input 
              value={studyForm.subject} 
              onChange={(e) => setStudyForm({ ...studyForm, subject: e.target.value })} 
              placeholder="Ex: Ficha de Matemática" 
              className="h-11 rounded-xl" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Minutos de Estudo</Label>
            <Input 
              type="number" 
              min="1" 
              value={studyForm.minutes} 
              onChange={(e) => setStudyForm({ ...studyForm, minutes: e.target.value })} 
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveSession(); }} 
              className="h-11 rounded-xl" 
            />
          </div>
          <Button className="w-full mt-2 rounded-xl h-11 font-bold" onClick={handleSaveSession}>Guardar Sessão</Button>
        </div>
      </Dialog>

      {/* MODAL: Novo Objetivo */}
      <Dialog open={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Novo Objetivo">
        <div className="space-y-4 py-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground">Título do Objetivo</Label>
          <Input value={goalForm.title} onChange={(e) => setGoalForm({ title: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") handleSaveGoal(); }} className="h-11 rounded-xl" />
          <Button className="w-full rounded-xl h-11 font-bold" onClick={handleSaveGoal}>Guardar Objetivo</Button>
        </div>
      </Dialog>

      {/* MODAL: Ajustar Meta Diária */}
      <Dialog open={isDailyGoalModalOpen} onClose={() => setIsDailyGoalModalOpen(false)} title="Ajustar Meta Diária">
        <div className="space-y-4 py-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground">Minutos por dia</Label>
          <Input type="number" min="1" value={dailyGoalInput} onChange={(e) => setDailyGoalInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSaveDailyGoal(); }} className="h-11 rounded-xl" />
          <Button className="w-full rounded-xl h-11 font-bold" onClick={handleSaveDailyGoal}>Atualizar Meta</Button>
        </div>
      </Dialog>
    </div>
  );
}