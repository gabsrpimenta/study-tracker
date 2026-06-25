// Das bibliotecas vêm as ferramentas brilhantes,
// Ícones, botões e funções elegantes.
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, Calendar, CheckSquare, ListTodo, CalendarX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog, Select } from "@/components/ui/Dialog";
import * as API from "@/lib/api";

// Cores e estilos para cada missão,
// Alta prioridade chama a atenção.
const prioStyles = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-warning/15 text-warning border-warning/30",
  baixa: "bg-muted text-muted-foreground",
};

const prioWeight = { alta: 3, media: 2, baixa: 1 };

// Para aulas, testes ou um novo projeto,
// Cada evento tem o seu tom correto.
const typeStyles = {
  Aula: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Teste: "bg-destructive/10 text-destructive border-destructive/20",
  Projeto: "bg-primary/10 text-primary border-primary/20",
};

// O tempo não para, a data passou?
// Esta função descobre se a tarefa atrasou.
function checkIsOverdue(dateStr) {
  if (!dateStr || dateStr.length !== 5) return false;
  const [day, month] = dateStr.split("/");
  const now = new Date();
  const taskDate = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day));
  now.setHours(0, 0, 0, 0); 
  return taskDate < now;
}

// No coração da nossa Organização,
// Onde tarefas e eventos ganham ação.
export default function Organizacao() {
  // Guardamos o estado, a memória a fluir,
  // O que carrega, o que edita, o que está por vir.
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tarefas");
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  
  // NOVO ESTADO: O nosso cesto para guardar as cadeiras criadas no Desempenho!
  const [subjects, setSubjects] = useState([]);
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [form, setForm] = useState({ title: "", subject: "", due: "", priority: "media", type: "Aula" });

  // Quando a tela desperta, num breve momento,
  // Buscamos Tarefas, Eventos e as DISCIPLINAS num só movimento.
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      API.listTasks ? API.listTasks() : Promise.resolve([]),
      API.listEvents ? API.listEvents() : Promise.resolve([]),
      API.listSubjects ? API.listSubjects() : Promise.resolve([]) // <-- Fomos buscar as cadeiras!
    ]).then(([t, e, s]) => {
      setTasks(t || []);
      setEvents(e || []);
      setSubjects(s || []); // Guardamos no cesto
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  // Lidamos com texto, com datas a formatar,
  // Para que o utilizador não se vá enganar.
  function handleDateChange(value) {
    let rawValue = value.replace(/\D/g, "");
    if (rawValue.length > 4) rawValue = rawValue.slice(0, 4);
    let formattedValue = rawValue;
    if (rawValue.length > 2) formattedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2)}`;
    setForm({ ...form, due: formattedValue });
  }

  function handleOpenNew() {
    setEditingId(null);
    // Se já tivermos cadeiras criadas, a primeira da lista é selecionada por padrão
    const defaultSubject = subjects.length > 0 ? subjects[0].nome : "";
    setForm({ title: "", subject: defaultSubject, due: "", priority: "media", type: "Aula" });
    setOpen(true);
  }

  function handleEdit(item) {
    setEditingId(item.id || item.Id);
    setForm({
      title: item.title || item.name || "",
      subject: item.subject || "",
      due: item.due || item.date || "",
      priority: item.priority || "media",
      type: item.type || "Aula"
    });
    setOpen(true);
  }

  // Criar, alterar, marcar como feito,
  // O CRUD funciona de modo perfeito.
  async function toggleTask(t) {
    if(!API.updateTask) return;
    const updated = await API.updateTask(t.id, { ...t, done: !t.done });
    setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("O título é obrigatório"); return; }
    
    if (activeTab === "tarefas") {
      const taskData = { title: form.title, subject: form.subject, due: form.due, priority: form.priority };
      if (editingId) {
        const updated = await API.updateTask(editingId, taskData);
        setTasks((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
        toast.success("Tarefa atualizada!");
      } else {
        const created = await API.createTask({ ...taskData, done: false });
        setTasks((prev) => [created, ...prev]);
        toast.success("Tarefa criada!");
      }
    } else {
      const eventData = { name: form.title, subject: form.subject, date: form.due, type: form.type };
      if (editingId) {
        const updated = await API.updateEvent(editingId, eventData);
        setEvents((prev) => prev.map((x) => ((x.id || x.Id) === editingId ? updated : x)));
        toast.success("Evento atualizado!");
      } else {
        const created = await API.createEvent(eventData);
        setEvents((prev) => [created, ...prev]);
        toast.success("Evento criado!");
      }
    }
    setOpen(false);
  }

  async function handleRemove(id) {
    if (activeTab === "tarefas") {
      await API.deleteTask(id);
      setTasks((prev) => prev.filter((x) => x.id !== id));
      toast.success("Tarefa removida.");
    } else {
      await API.deleteEvent(id);
      setEvents((prev) => prev.filter((x) => (x.id || x.Id) !== id));
      toast.success("Evento removido.");
    }
    setOpen(false);
  }

  // Ordenamos a lista com muito cuidado,
  // O que urge primeiro, o resto é guardado.
  const visibleTasks = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (prioWeight[b.priority] || 0) - (prioWeight[a.priority] || 0);
  });

  const totalTasks = tasks.length;
  const doneTasksCount = tasks.filter(t => t.done).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasksCount / totalTasks) * 100);

  // E por fim, desenhamos com cores e luz,
  // A interface que o nosso caminho conduz.
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 px-2 md:px-6">
      
      {/* CABEÇALHO */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-wider">Planeamento</p>
          <h1 className="text-4xl font-black text-foreground mt-1">Organização</h1>
        </div>
        <Button onClick={handleOpenNew} className="rounded-full h-11 px-6 shadow-sm hover:shadow-md transition-all font-bold gap-2">
          <Plus className="h-4 w-4" /> Novo {activeTab === "tarefas" ? "Afazer" : "Evento"}
        </Button>
      </header>

      {/* ABAS EM FORMATO PILL */}
      <div className="flex gap-2 p-1.5 bg-muted/40 rounded-2xl w-fit border border-border/50 shadow-sm">
        <Button 
          variant={activeTab === "tarefas" ? "default" : "ghost"} 
          onClick={() => setActiveTab("tarefas")} 
          className={`rounded-xl h-10 px-6 font-bold transition-all ${activeTab === "tarefas" ? "shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <CheckSquare className="h-4 w-4 mr-2" /> Tarefas
        </Button>
        <Button 
          variant={activeTab === "agenda" ? "default" : "ghost"} 
          onClick={() => setActiveTab("agenda")} 
          className={`rounded-xl h-10 px-6 font-bold transition-all ${activeTab === "agenda" ? "shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Calendar className="h-4 w-4 mr-2" /> Agenda de Aulas
        </Button>
      </div>

      {/* CONTEÚDO DAS TAREFAS */}
      {activeTab === "tarefas" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* BARRA DE PROGRESSO */}
          {totalTasks > 0 && (
            <Card className="rounded-[1.5rem] border-border/50 shadow-sm p-6">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Progresso das Tarefas</span>
                <span className="text-3xl font-black text-foreground">{progressPercent}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${progressPercent === 100 ? "bg-emerald-500" : "bg-primary"}`} 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </Card>
          )}

          {/* LISTA DE TAREFAS */}
          <Card className="rounded-[1.5rem] border-border/50 shadow-sm">
            <CardContent className="p-6 space-y-3">
              {visibleTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
                  <div className="bg-muted p-5 rounded-full mb-4">
                    <ListTodo className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <p className="text-base font-bold text-foreground">Nenhuma tarefa por aqui.</p>
                  <p className="text-sm text-muted-foreground mt-1">Usa o botão "Novo Afazer" para começares a organizar-te.</p>
                </div>
              ) : (
                visibleTasks.map((t) => {
                  const isAtrasada = !t.done && checkIsOverdue(t.due);

                  return (
                    <div 
                      key={t.id} 
                      className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                        isAtrasada ? "border-destructive/40 bg-destructive/5" : "bg-card hover:border-primary/30 hover:shadow-sm"
                      }`}
                    >
                      {/* Checkbox Circular */}
                      <button onClick={() => toggleTask(t)} className={`h-6 w-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors ${t.done ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : isAtrasada ? "border-destructive/50 hover:bg-destructive/20" : "border-muted-foreground/30 hover:border-primary"}`}>
                        {t.done && <Check className="h-4 w-4" />}
                      </button>
                      
                      {/* Conteúdo Textual */}
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex-1">
                          <p className={`text-base font-bold truncate transition-all ${t.done ? "line-through text-muted-foreground opacity-60" : isAtrasada ? "text-destructive" : "text-foreground"}`}>
                            {t.title}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground mt-0.5">
                            {t.subject} {t.due && `• Prazo: ${t.due}`}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 items-center">
                          {isAtrasada && (
                            <Badge variant="destructive" className="h-5 text-[10px] px-2 uppercase font-bold tracking-wider shadow-sm">
                              Atrasada
                            </Badge>
                          )}
                          {!t.done && (
                            <Badge variant="outline" className={`h-5 text-[10px] px-2 uppercase font-bold tracking-wider border-none ${prioStyles[t.priority]}`}>
                              {t.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Ações */}
                      <div className="flex gap-1 opacity-60 hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => handleEdit(t)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10" onClick={() => handleRemove(t.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONTEÚDO DA AGENDA */}
      {activeTab === "agenda" && (
        <Card className="rounded-[1.5rem] border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CardContent className="p-6 space-y-3">
            {events.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
                 <div className="bg-muted p-5 rounded-full mb-4">
                   <CalendarX className="h-8 w-8 text-muted-foreground/60" />
                 </div>
                 <p className="text-base font-bold text-foreground">A tua agenda está livre.</p>
                 <p className="text-sm text-muted-foreground mt-1">Adiciona aulas ou exames no botão superior.</p>
               </div>
            ) : (
              events.map((e) => (
                <div key={e.id || e.Id} className="flex items-center justify-between p-4 rounded-2xl border bg-card hover:shadow-sm hover:border-primary/30 transition-all">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-base font-bold text-foreground truncate">{e.name || e.Name}</p>
                      <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${typeStyles[e.type || e.Type] || typeStyles.Aula}`}>
                        {e.type || e.Type || "Aula"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 opacity-70" /> {e.date || e.Date || "N/D"} • {e.subject || e.Subject}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => handleEdit(e)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10" onClick={() => handleRemove(e.id || e.Id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL DINÂMICO UNIFICADO COM DROPDOWN DE DISCIPLINAS */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        title={editingId ? `Editar ${activeTab === "tarefas" ? "Tarefa" : "Evento"}` : `Novo(a) ${activeTab === "tarefas" ? "Tarefa" : "Evento"}`}
        footer={<>
          <Button variant="outline" className="rounded-xl h-11" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-11 px-6 font-bold shadow-sm" onClick={handleSave}>Guardar</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{activeTab === "tarefas" ? "O que precisa ser feito?" : "Nome do Evento / Aula"}</Label>
            <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Ex: Resolver ficha prática" className="rounded-xl h-11" />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina</Label>
            
            {/* A MÁGICA ACONTECE AQUI! O React escolhe mostrar a lista ou a caixa de texto */}
            {subjects.length === 0 ? (
              <Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="Escreve a cadeira..." className="rounded-xl h-11" />
            ) : (
              <Select 
                value={form.subject} 
                onChange={(v) => setForm({...form, subject: v})} 
                options={subjects.map(s => ({ value: s.nome, label: s.nome }))} 
              />
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data (DD/MM)</Label>
              <Input value={form.due} maxLength={5} onChange={(e) => handleDateChange(e.target.value)} placeholder="Ex: 28/10" className="rounded-xl h-11 text-center font-bold" />
            </div>

            {activeTab === "tarefas" ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prioridade</Label>
                <Select value={form.priority} onChange={(v) => setForm({...form, priority: v})} options={[{value:"baixa", label:"Baixa"}, {value:"media", label:"Média"}, {value:"alta", label:"Alta"}]} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo de Evento</Label>
                <Select value={form.type} onChange={(v) => setForm({...form, type: v})} options={[{value:"Aula", label:"📚 Aula"}, {value:"Teste", label:"📝 Teste / Exame"}, {value:"Projeto", label:"💻 Projeto"}]} />
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}