import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, Calendar, CheckSquare, ListFilter, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog, Select } from "@/components/ui/Dialog";
import * as API from "@/lib/api";

const prioStyles = {
  alta: "bg-destructive/10 text-destructive border-destructive/20 font-medium",
  media: "bg-warning/15 text-warning border-warning/30 font-medium",
  baixa: "bg-muted text-muted-foreground font-medium",
};

const emptyForm = { title: "", subject: "", priority: "media", due: "" };

export default function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { 
    API.listTasks().then(setTasks); 
  }, []);

  // Formatação automática para DD/MM
  function handleDateChange(value) {
    let rawValue = value.replace(/\D/g, "");
    if (rawValue.length > 4) rawValue = rawValue.slice(0, 4);
    
    let formattedValue = rawValue;
    if (rawValue.length > 2) {
      formattedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2)}`;
    }
    setForm({ ...form, due: formattedValue });
  }

  async function toggle(t) {
    const updated = await API.toggleTask(t.id);
    if (updated) setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: updated.done } : x)));
  }

  async function remove(id) {
    await API.deleteTask(id);
    setTasks((prev) => prev.filter((x) => x.id !== id));
    toast.success("Tarefa removida.");
    setOpen(false);
  }

  async function save() {
    if (!form.title.trim()) { toast.error("O título é obrigatório"); return; }
    
    if (editing) {
      const updated = await API.updateTask(editing.id, form);
      setTasks((prev) => prev.map((x) => (x.id === editing.id ? updated : x)));
      toast.success("Tarefa atualizada.");
    } else {
      const created = await API.createTask({ ...form, done: false });
      setTasks((prev) => [created, ...prev]);
      toast.success("Tarefa criada com sucesso.");
    }
    setOpen(false);
  }

  const visible = tasks.filter((t) => filter === "all" ? true : filter === "done" ? t.done : !t.done);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe as suas atividades académicas e prazos.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }} className="rounded-xl h-10 px-5 gap-2 font-medium">
          <Plus className="h-4 w-4" /> Nova tarefa
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed rounded-2xl bg-card/30 min-h-[350px]">
          <CheckSquare className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold">Nenhuma tarefa criada</h3>
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }} className="mt-4 rounded-xl">Criar primeira tarefa</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 border-b pb-2">
            <ListFilter className="h-4 w-4 text-muted-foreground mr-1" />
            {[["all", "Todas"], ["open", "Pendentes"], ["done", "Concluídas"]].map(([k, lbl]) => (
              <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} onClick={() => setFilter(k)} className="rounded-lg h-8 px-3 text-xs font-medium">
                {lbl}
              </Button>
            ))}
          </div>

          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="pt-6 space-y-2">
              {visible.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border p-3 hover:border-primary/20 transition-all">
                  <button onClick={() => toggle(t)} className={`h-5 w-5 rounded-full border flex items-center justify-center ${t.done ? "bg-success border-success text-white" : "border-muted-foreground/40"}`}>
                    {t.done && <Check className="h-3 w-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      {t.subject} {t.due && <span className="flex items-center gap-1">• <Calendar className="h-3 w-3" /> {t.due}</span>}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] uppercase ${prioStyles[t.priority]}`}>{t.priority}</Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(t); setForm(t); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        title={editing ? "Editar Tarefa" : "Nova Tarefa"}
        footer={<>
          {editing && (
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl mr-auto h-10 px-4" onClick={() => remove(editing.id)}>
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </Button>
          )}
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-10 px-5" onClick={save}>Guardar Tarefa</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título da Tarefa</Label>
            <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Ex: Resolver lista de exercícios 3" className="rounded-lg h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina / Contexto</Label>
            <Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="Ex: Estruturas de Dados" className="rounded-lg h-10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data de Limite (Prazo)</Label>
              <Input 
                value={form.due} 
                maxLength={5}
                onChange={(e) => handleDateChange(e.target.value)} 
                placeholder="Ex: 24/06" 
                className="rounded-lg h-10" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nível de Prioridade</Label>
              <Select value={form.priority} onChange={(v) => setForm({...form, priority: v})} options={[{value:"baixa", label:"Baixa"}, {value:"media", label:"Média"}, {value:"alta", label:"Alta"}]} />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}