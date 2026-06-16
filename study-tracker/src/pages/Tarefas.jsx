import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, Calendar, CheckSquare, ListFilter } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog, Select } from "@/components/ui/Dialog";
import { listTasks, createTask, updateTask, deleteTask } from "@/lib/api";

const prio = {
  alta: "bg-destructive/10 text-destructive border-destructive/20 font-medium",
  media: "bg-warning/15 text-warning border-warning/30 font-medium",
  baixa: "bg-muted text-muted-foreground font-medium",
};

const empty = { title: "", subject: "", priority: "media", due: "" };

export default function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  useEffect(() => { 
    listTasks().then(setTasks); 
  }, []);

  async function toggle(t) {
    const u = await updateTask(t.id, { done: !t.done });
    setTasks((p) => p.map((x) => (x.id === t.id ? u : x)));
  }

  async function remove(id) {
    await deleteTask(id);
    setTasks((p) => p.filter((x) => x.id !== id));
    toast.success("Tarefa removida.");
  }

  function startCreate() { 
    setEditing(null); 
    setForm(empty); 
    setOpen(true); 
  }

  function startEdit(t) { 
    setEditing(t); 
    setForm({ title: t.title, subject: t.subject, priority: t.priority, due: t.due }); 
    setOpen(true); 
  }

  async function save() {
    if (!form.title.trim()) { toast.error("Título obrigatório"); return; }
    if (editing) {
      const u = await updateTask(editing.id, form);
      setTasks((p) => p.map((x) => (x.id === editing.id ? u : x)));
    } else {
      const c = await createTask({ ...form, done: false });
      setTasks((p) => [c, ...p]);
    }
    setOpen(false);
    toast.success("Guardado com sucesso.");
  }

  const visible = tasks.filter((t) => filter === "all" ? true : filter === "done" ? t.done : !t.done);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe as suas atividades académicas, entregas e prazos de estudo.</p>
        </div>
        {/* O botão superior só aparece se houver alguma tarefa criada */}
        {tasks.length > 0 && (
          <Button onClick={startCreate} className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium self-start sm:self-auto">
            <Plus className="h-4 w-4" /> Nova tarefa
          </Button>
        )}
      </div>

      {/* Toolbar / Filtros - Só aparecem se existirem tarefas no sistema */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 border-b pb-2">
          <ListFilter className="h-4 w-4 text-muted-foreground mr-1" />
          {[["all", "Todas"], ["open", "Pendentes"], ["done", "Concluídas"]].map(([k, lbl]) => (
            <Button 
              key={k} 
              size="sm" 
              variant={filter === k ? "default" : "outline"} 
              onClick={() => setFilter(k)}
              className="rounded-lg text-xs h-8 px-3 font-medium"
            >
              {lbl}
            </Button>
          ))}
        </div>
      )}

      {/* Condicional de Lista ou Estado Vazio Absoluto */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-2xl bg-card/30 min-h-[350px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 mb-4">
            <CheckSquare className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhuma tarefa encontrada</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            Não existem atividades registadas. Crie um novo compromisso para começar.
          </p>
          <Button onClick={startCreate} className="mt-6 rounded-xl h-10 px-5 gap-2">
            <Plus className="h-4 w-4" /> Criar uma tarefa
          </Button>
        </div>
      ) : (
        <Card className="rounded-2xl border shadow-sm overflow-hidden transition-all duration-200">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Lista de Atividades</CardTitle>
              <CardDescription>Visualização filtrada dos seus compromissos atuais.</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-2 border-t pt-4">
            {/* Se houver tarefas, mas o filtro atual (ex: Concluídas) estiver vazio */}
            {visible.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
                <p className="text-sm font-medium">Nenhuma tarefa corresponde ao filtro selecionado.</p>
              </div>
            )}

            {visible.map((t) => (
              <div 
                key={t.id} 
                className="flex items-center gap-3 rounded-xl border p-3 transition-all duration-150 hover:border-muted-foreground/20"
              >
                <button 
                  onClick={() => toggle(t)} 
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    t.done 
                      ? "border-success bg-success text-success-foreground" 
                      : "border-muted-foreground/40 hover:border-primary"
                  }`}
                >
                  {t.done && <Check className="h-3 w-3" />}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold text-foreground ${t.done ? "line-through text-muted-foreground/70 font-normal" : ""}`}>
                    {t.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span className="font-medium text-foreground/70">{t.subject}</span>
                    {t.due && (
                      <>
                        <span className="text-muted-foreground/50">·</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-muted-foreground" /> {t.due}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className={`text-[11px] px-2 py-0.5 rounded-md border ${prio[t.priority]}`}>
                    {t.priority}
                  </Badge>
                  
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={() => startEdit(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => remove(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dialog Formulário */}
      <Dialog
        open={open} onClose={() => setOpen(false)}
        title={editing ? "Editar Tarefa" : "Nova Tarefa"}
        footer={<>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-10 px-5" onClick={save}>Guardar Tarefa</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título da Tarefa</Label>
            <Input className="h-10 rounded-lg focus:ring-1 focus:ring-primary" placeholder="Ex: Resolver lista de exercícios 3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina / Contexto</Label>
            <Input className="h-10 rounded-lg focus:ring-1 focus:ring-primary" placeholder="Ex: Estruturas de Dados" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data de Limite (Prazo)</Label>
              <Input className="h-10 rounded-lg focus:ring-1 focus:ring-primary" placeholder="Ex: 24 de Junho" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nível de Prioridade</Label>
              <Select 
                value={form.priority} 
                onChange={(v) => setForm({ ...form, priority: v })} 
                options={[
                  { value: "baixa", label: "Baixa" }, 
                  { value: "media", label: "Média" }, 
                  { value: "alta", label: "Alta" },
                ]} 
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}