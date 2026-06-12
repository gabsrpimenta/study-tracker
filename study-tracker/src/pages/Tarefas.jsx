import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog, Select } from "@/components/ui/Dialog";
import { listTasks, createTask, updateTask, deleteTask } from "@/lib/api";

const prio = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-warning/15 text-warning border-warning/30",
  baixa: "bg-muted text-muted-foreground",
};
const empty = { title: "", subject: "", priority: "media", due: "" };

export default function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  useEffect(() => { listTasks().then(setTasks); }, []);

  async function toggle(t) {
    const u = await updateTask(t.id, { done: !t.done });
    setTasks((p) => p.map((x) => (x.id === t.id ? u : x)));
  }
  async function remove(id) {
    await deleteTask(id);
    setTasks((p) => p.filter((x) => x.id !== id));
    toast.success("Removida.");
  }
  function startCreate() { setEditing(null); setForm(empty); setOpen(true); }
  function startEdit(t) { setEditing(t); setForm({ title: t.title, subject: t.subject, priority: t.priority, due: t.due }); setOpen(true); }
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
    toast.success("Guardado.");
  }

  const visible = tasks.filter((t) => filter === "all" ? true : filter === "done" ? t.done : !t.done);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">Lista de tarefas e prazos.</p>
        </div>
        <Button onClick={startCreate}><Plus className="h-4 w-4" /> Nova tarefa</Button>
      </div>

      <div className="flex gap-2">
        {[["all", "Todas"], ["open", "Pendentes"], ["done", "Concluídas"]].map(([k, lbl]) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} onClick={() => setFilter(k)}>{lbl}</Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Lista</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {visible.length === 0 && <p className="text-sm text-muted-foreground">Sem tarefas.</p>}
          {visible.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
              <button onClick={() => toggle(t)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${t.done ? "border-success bg-success text-success-foreground" : "border-muted-foreground/40"}`}>
                {t.done && <Check className="h-3 w-3" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">{t.subject} · {t.due}</p>
              </div>
              <Badge variant="outline" className={prio[t.priority]}>{t.priority}</Badge>
              <Button size="icon" variant="ghost" onClick={() => startEdit(t)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={open} onClose={() => setOpen(false)}
        title={editing ? "Editar tarefa" : "Nova tarefa"}
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>}
      >
        <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="space-y-2"><Label>Disciplina</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Prazo</Label><Input value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} placeholder="Hoje" /></div>
          <div className="space-y-2"><Label>Prioridade</Label>
            <Select value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={[
              { value: "baixa", label: "Baixa" }, { value: "media", label: "Média" }, { value: "alta", label: "Alta" },
            ]} />
          </div>
        </div>
      </Dialog>
    </>
  );
}
