import { useEffect, useState } from "react";
import { Plus, Trash2, Target as TargetIcon, Minus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Primitives";
import { Dialog } from "@/components/ui/Dialog";
import { listGoals, createGoal, updateGoal, deleteGoal } from "@/lib/api";

const empty = { title: "", target: 10, current: 0, unit: "horas" };

export default function Objetivos() {
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => { listGoals().then(setGoals); }, []);

  async function save() {
    if (!form.title.trim()) { toast.error("Título obrigatório"); return; }
    const c = await createGoal(form);
    setGoals((p) => [c, ...p]);
    setOpen(false);
  }
  async function bump(g, delta) {
    const next = Math.max(0, g.current + delta);
    const u = await updateGoal(g.id, { current: next });
    setGoals((p) => p.map((x) => (x.id === g.id ? u : x)));
  }
  async function remove(id) {
    await deleteGoal(id);
    setGoals((p) => p.filter((x) => x.id !== id));
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Objetivos</h1>
          <p className="text-muted-foreground">Metas e progresso.</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="h-4 w-4" /> Novo objetivo</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((g) => {
          const pct = Math.min(100, (g.current / (g.target || 1)) * 100);
          return (
            <Card key={g.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <TargetIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{g.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{g.current} / {g.target} {g.unit}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(g.id)}><Trash2 className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={pct} />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => bump(g, -1)}><Minus className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => bump(g, 1)}><Plus className="h-4 w-4" /></Button>
                  <span className="ml-auto text-sm font-medium">{pct.toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={open} onClose={() => setOpen(false)}
        title="Novo objetivo"
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>}
      >
        <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label>Atual</Label><Input type="number" min={0} value={form.current} onChange={(e) => setForm({ ...form, current: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>Meta</Label><Input type="number" min={1} value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>Unidade</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
        </div>
      </Dialog>
    </>
  );
}
