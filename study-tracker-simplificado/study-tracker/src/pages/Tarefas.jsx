import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, Calendar, CheckSquare, ListFilter, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog, Select } from "@/components/ui/Dialog";
import * as API from "@/lib/api";

// Dicionário de cores para as prioridades das tarefas
const prioStyles = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-warning/15 text-warning border-warning/30",
  baixa: "bg-muted text-muted-foreground",
};

// Dicionário de cores para os tipos de eventos na agenda
const typeStyles = {
  Aula: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Teste: "bg-destructive/10 text-destructive border-destructive/20",
  Projeto: "bg-primary/10 text-primary border-primary/20",
};

export default function Tarefas() {
  // ==========================================
  // 1. ESTADOS (STATE)
  // ==========================================
  
  // Controla qual aba está ativa: 'tarefas' ou 'agenda'
  const [activeTab, setActiveTab] = useState("tarefas");
  
  // Guardam as listas que vêm da API
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Filtro das tarefas (Todas, Pendentes, Concluídas)
  const [filter, setFilter] = useState("all");
  
  // Estados que controlam a Janela Modal e o Formulário
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Guarda o ID se estivermos a editar
  
  // O formulário é dinâmico, serve tanto para Tarefas quanto para Eventos
  const [form, setForm] = useState({ title: "", subject: "", due: "", priority: "media", type: "Aula" });

  // ==========================================
  // 2. EFEITOS (Buscando dados na inicialização)
  // ==========================================
  useEffect(() => {
    // Busca simultaneamente as tarefas e os eventos (antigo calendário/horário)
    Promise.all([
      API.listTasks ? API.listTasks() : Promise.resolve([]),
      API.listEvents ? API.listEvents() : Promise.resolve([])
    ]).then(([t, e]) => {
      setTasks(t || []);
      setEvents(e || []);
    });
  }, []);

  // ==========================================
  // 3. FUNÇÕES DE FORMATAÇÃO E LÓGICA
  // ==========================================

  // Força o usuário a digitar a data no padrão DD/MM (Regex remove letras)
  function handleDateChange(value) {
    let rawValue = value.replace(/\D/g, "");
    if (rawValue.length > 4) rawValue = rawValue.slice(0, 4);
    let formattedValue = rawValue;
    if (rawValue.length > 2) formattedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2)}`;
    setForm({ ...form, due: formattedValue });
  }

  // Prepara o formulário vazio para criar um item novo
  function handleOpenNew() {
    setEditingId(null);
    setForm({ title: "", subject: "", due: "", priority: "media", type: "Aula" });
    setOpen(true);
  }

  // Prepara o formulário com os dados de um item que já existe (Edição)
  function handleEdit(item) {
    setEditingId(item.id || item.Id);
    // Adaptação caso o item seja tarefa ou evento
    setForm({
      title: item.title || item.name || "",
      subject: item.subject || "",
      due: item.due || item.date || "",
      priority: item.priority || "media",
      type: item.type || "Aula"
    });
    setOpen(true);
  }

  // ==========================================
  // 4. FUNÇÕES DE CRUD (Create, Read, Update, Delete)
  // ==========================================

  // Marca uma tarefa como feita ou não feita
  async function toggleTask(t) {
    if(!API.updateTask) return;
    const updated = await API.updateTask(t.id, { ...t, done: !t.done });
    setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
  }

  // Salva o formulário (Serve para Tarefas E Eventos, dependendo da aba ativa)
  async function handleSave() {
    if (!form.title.trim()) { toast.error("O título é obrigatório"); return; }
    
    // SE ESTIVERMOS NA ABA DE TAREFAS
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
    } 
    // SE ESTIVERMOS NA ABA DE AGENDA/EVENTOS
    else {
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

  // Deleta um item (Tarefa ou Evento)
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

  // Filtra as tarefas de acordo com os botões (Todas, Pendentes, Concluídas)
  const visibleTasks = tasks.filter((t) => filter === "all" ? true : filter === "done" ? t.done : !t.done);

  // ==========================================
  // 5. RENDERIZAÇÃO DA TELA (HTML/JSX)
  // ==========================================
  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO E BOTÃO DE NOVO ITEM */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Organização</h1>
          <p className="text-sm text-muted-foreground mt-1">Gira as suas tarefas e agenda num único lugar.</p>
        </div>
        <Button onClick={handleOpenNew} className="rounded-xl h-10 px-5 gap-2 font-medium">
          <Plus className="h-4 w-4" /> Novo {activeTab === "tarefas" ? "Afazer" : "Evento"}
        </Button>
      </div>

      {/* SISTEMA DE ABAS (TABS) */}
      <div className="flex gap-2 border-b pb-2">
        {/* Quando clica, muda o state 'activeTab' para mostrar a tela correspondente */}
        <Button variant={activeTab === "tarefas" ? "default" : "ghost"} onClick={() => setActiveTab("tarefas")} className="rounded-t-lg rounded-b-none h-10">
          <CheckSquare className="h-4 w-4 mr-2" /> Tarefas
        </Button>
        <Button variant={activeTab === "agenda" ? "default" : "ghost"} onClick={() => setActiveTab("agenda")} className="rounded-t-lg rounded-b-none h-10">
          <Calendar className="h-4 w-4 mr-2" /> Agenda de Aulas
        </Button>
      </div>

      {/* ======================================= */}
      {/* VISUALIZAÇÃO 1: ABA DE TAREFAS */}
      {/* ======================================= */}
      {activeTab === "tarefas" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Botões de Filtro */}
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground mr-1" />
            {[["all", "Todas"], ["open", "Pendentes"], ["done", "Concluídas"]].map(([k, lbl]) => (
              <Button key={k} size="sm" variant={filter === k ? "secondary" : "outline"} onClick={() => setFilter(k)} className="rounded-lg h-8 px-3 text-xs">
                {lbl}
              </Button>
            ))}
          </div>

          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="pt-6 space-y-2">
              {visibleTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma tarefa encontrada.</p>
              ) : (
                visibleTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border p-3 hover:border-primary/20 transition-all">
                    {/* Botão circular de Checked (Feito) */}
                    <button onClick={() => toggleTask(t)} className={`h-5 w-5 rounded-full border flex items-center justify-center ${t.done ? "bg-success border-success text-white" : "border-muted-foreground/40"}`}>
                      {t.done && <Check className="h-3 w-3" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.subject} • Prazo: {t.due || "Sem data"}</p>
                    </div>
                    
                    <Badge variant="outline" className={`text-[10px] uppercase ${prioStyles[t.priority]}`}>{t.priority}</Badge>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleRemove(t.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================= */}
      {/* VISUALIZAÇÃO 2: ABA DE AGENDA / EVENTOS */}
      {/* ======================================= */}
      {activeTab === "agenda" && (
        <Card className="rounded-2xl border shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <CardContent className="pt-6 space-y-3">
            {events.length === 0 ? (
               <p className="text-center text-muted-foreground py-8 text-sm">Nenhum evento agendado.</p>
            ) : (
              events.map((e) => (
                <div key={e.id || e.Id} className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/10 hover:border-primary/30 transition-all">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground truncate">{e.name || e.Name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${typeStyles[e.type || e.Type] || typeStyles.Aula}`}>
                        {e.type || e.Type || "Aula"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3 opacity-60" /> Data: {e.date || e.Date || "N/D"} • Disciplina: {e.subject || e.Subject}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleRemove(e.id || e.Id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* ======================================= */}
      {/* JANELA SUSPENSA (MODAL) DINÂMICA */}
      {/* ======================================= */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        title={editingId ? `Editar ${activeTab === "tarefas" ? "Tarefa" : "Evento"}` : `Novo(a) ${activeTab === "tarefas" ? "Tarefa" : "Evento"}`}
        footer={<>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-10 px-5" onClick={handleSave}>Guardar</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          
          {/* Campos comuns aos dois tipos (Título e Disciplina) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">{activeTab === "tarefas" ? "O que precisa ser feito?" : "Nome do Evento/Aula"}</Label>
            <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Ex: Estudar Matemática" className="rounded-lg h-10" />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Disciplina</Label>
            <Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="Ex: Cálculo I" className="rounded-lg h-10" />
          </div>
          
          {/* Data partilhada */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Data (DD/MM)</Label>
              <Input value={form.due} maxLength={5} onChange={(e) => handleDateChange(e.target.value)} placeholder="Ex: 24/06" className="rounded-lg h-10 text-center font-semibold" />
            </div>

            {/* Renderização Condicional: Mostra Prioridade nas tarefas e Tipo nos eventos */}
            {activeTab === "tarefas" ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Prioridade</Label>
                <Select value={form.priority} onChange={(v) => setForm({...form, priority: v})} options={[{value:"baixa", label:"Baixa"}, {value:"media", label:"Média"}, {value:"alta", label:"Alta"}]} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Tipo de Evento</Label>
                <Select value={form.type} onChange={(v) => setForm({...form, type: v})} options={[{value:"Aula", label:"📚 Aula"}, {value:"Teste", label:"📝 Teste / Exame"}, {value:"Projeto", label:"💻 Projeto"}]} />
              </div>
            )}
          </div>

        </div>
      </Dialog>

    </div>
  );
}