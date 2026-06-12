import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Progress, Badge } from "@/components/ui/Primitives";
import { Dialog } from "@/components/ui/Dialog";
import { listSubjects, createSubject, updateSubject, deleteSubject } from "@/lib/api";

const empty = { name: "", teacher: "", progress: 0, tasks: 0 };

export default function Disciplinas() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState(null);

  useEffect(() => { listSubjects().then(setItems); }, []);

  function startCreate() { setEditing(null); setForm(empty); setOpen(true); }
  function startEdit(s) { setEditing(s); setForm({ name: s.name, teacher: s.teacher, progress: s.progress, tasks: s.tasks }); setOpen(true); }
  async function save() {
    if (!form.name.trim()) { toast.error("Nome obrigatório"); return; }
    if (editing) {
      const u = await updateSubject(editing.id, form);
      setItems((p) => p.map((x) => (x.id === editing.id ? u : x)));
    } else {
      const c = await createSubject(form);
      setItems((p) => [c, ...p]);
    }
    setOpen(false);
    toast.success("Guardado.");
  }
  async function confirmDelete() {
    await deleteSubject(del);
    setItems((p) => p.filter((x) => x.id !== del));
    setDel(null);
    toast.success("Removido.");
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Disciplinas</h1>
          <p className="text-muted-foreground">Disciplinas ativas do semestre.</p>
        </div>
        <Button onClick={startCreate}><Plus className="h-4 w-4" /> Nova disciplina</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((s) => (
          <Card key={s.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{s.teacher}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary">{s.tasks} tarefas</Badge>
                <Button size="icon" variant="ghost" onClick={() => startEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDel(s.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{s.progress}%</span>
              </div>
              <Progress value={s.progress} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={open} onClose={() => setOpen(false)}
        title={editing ? "Editar disciplina" : "Nova disciplina"}
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>}
      >
        <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Professor</Label><Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Progresso (%)</Label><Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>Nº tarefas</Label><Input type="number" min={0} value={form.tasks} onChange={(e) => setForm({ ...form, tasks: Number(e.target.value) })} /></div>
        </div>
      </Dialog>

      <Dialog
        open={!!del} onClose={() => setDel(null)}
        title="Eliminar disciplina?" description="Esta ação não pode ser desfeita."
        footer={<>
          <Button variant="outline" onClick={() => setDel(null)}>Cancelar</Button>
          <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
        </>}
      />
    </>
  );
}
