import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog } from "@/components/ui/Dialog";
import { listGrades, createGrade, updateGrade, deleteGrade } from "@/lib/api";

const empty = { subject: "", title: "", value: 0, weight: 0 };

export default function Avaliacoes() {
  const [grades, setGrades] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  useEffect(() => { listGrades().then(setGrades); }, []);

  const bySubject = useMemo(() => {
    const map = new Map();
    grades.forEach((g) => { map.set(g.subject, [...(map.get(g.subject) ?? []), g]); });
    return Array.from(map.entries()).map(([subject, items]) => {
      const totalW = items.reduce((a, b) => a + b.weight, 0) || 1;
      const avg = items.reduce((a, b) => a + b.value * b.weight, 0) / totalW;
      return { subject, items, avg, totalW };
    });
  }, [grades]);

  function startCreate() { setEditing(null); setForm(empty); setOpen(true); }
  function startEdit(g) { setEditing(g); setForm({ subject: g.subject, title: g.title, value: g.value, weight: g.weight }); setOpen(true); }
  async function save() {
    if (!form.subject.trim() || !form.title.trim()) { toast.error("Preencha os campos"); return; }
    if (editing) {
      const u = await updateGrade(editing.id, form);
      setGrades((p) => p.map((x) => (x.id === editing.id ? u : x)));
    } else {
      const c = await createGrade(form);
      setGrades((p) => [c, ...p]);
    }
    setOpen(false);
    toast.success("Guardado.");
  }
  async function remove(id) {
    await deleteGrade(id);
    setGrades((p) => p.filter((x) => x.id !== id));
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Avaliações</h1>
          <p className="text-muted-foreground">Notas e média ponderada.</p>
        </div>
        <Button onClick={startCreate}><Plus className="h-4 w-4" /> Nova nota</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bySubject.map((s) => (
          <Card key={s.subject}>
            <CardHeader>
              <CardTitle>{s.subject}</CardTitle>
              <CardDescription>Média: <span className="font-semibold text-foreground">{s.avg.toFixed(1)}</span> · peso {s.totalW}%</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={s.avg >= 10 ? "default" : "destructive"}>{s.avg >= 10 ? "Aprovado" : "Em risco"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Todas as notas</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {grades.map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
              <span className="w-32 font-medium">{g.subject}</span>
              <span className="flex-1">{g.title}</span>
              <span className="font-semibold">{g.value}</span>
              <span className="text-muted-foreground">{g.weight}%</span>
              <Button size="icon" variant="ghost" onClick={() => startEdit(g)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(g.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={open} onClose={() => setOpen(false)}
        title={editing ? "Editar nota" : "Nova nota"}
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>}
      >
        <div className="space-y-2"><Label>Disciplina</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="space-y-2"><Label>Avaliação</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Teste 1" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Nota (0-20)</Label><Input type="number" min={0} max={20} step="0.1" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>Peso (%)</Label><Input type="number" min={0} max={100} value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} /></div>
        </div>
      </Dialog>
    </>
  );
}
