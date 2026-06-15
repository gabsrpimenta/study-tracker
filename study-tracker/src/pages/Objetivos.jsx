import { useEffect, useState } from "react";
import { Plus, Trash2, Target as TargetIcon, Minus, Trophy, CheckCircle2, Zap } from "lucide-react";
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

  // Cálculos dinâmicos para o painel de estatísticas superior
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.current >= g.target).length;
  const activeGoals = totalGoals - completedGoals;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Objetivos</h1>
          <p className="text-muted-foreground">Metas e progresso focado no teu sucesso.</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="h-4 w-4" /> Novo objetivo</Button>
      </div>

      {/* PAINEL DE METRICAS SUPERIOR (Deixa o visual muito mais profissional) */}
      {totalGoals > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mt-2">
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TargetIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Total de Metas</p>
              <p className="text-xl font-bold">{totalGoals}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Em Progresso</p>
              <p className="text-xl font-bold">{activeGoals}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Concluídos</p>
              <p className="text-xl font-bold text-emerald-500">{completedGoals}</p>
            </div>
          </div>
        </div>
      )}

      {/* GRADE DE OBJETIVOS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {/* ESTADO VAZIO: Quando não há nenhum objetivo registrado */}
        {goals.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center bg-card/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <TargetIcon className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="font-semibold text-lg">Nenhum objetivo definido</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
              Defina metas de estudo ou produtividade para acompanhar sua evolução passo a passo.
            </p>
            <Button size="sm" onClick={() => { setForm(empty); setOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Criar minha primeira meta
            </Button>
          </div>
        )}

        {goals.map((g) => {
          const pct = Math.min(100, (g.current / (g.target || 1)) * 100);
          const isCompleted = pct === 100;

          return (
            <Card 
              key={g.id} 
              className={`transition-all duration-300 relative overflow-hidden ${
                isCompleted 
                  ? "border-emerald-500/30 bg-gradient-to-b from-card to-emerald-500/[0.02] shadow-sm shadow-emerald-500/5" 
                  : "hover:shadow-md"
              }`}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                  }`}>
                    {isCompleted ? <Trophy className="h-5 w-5 animate-pulse" /> : <TargetIcon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-base truncate">{g.title}</CardTitle>
                      {isCompleted && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Concluído!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-medium">
                      {g.current} / {g.target} <span className="text-muted-foreground/60">{g.unit}</span>
                    </p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 shrink-0 ml-1" onClick={() => remove(g.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Progress value={pct} className={isCompleted ? "bg-emerald-500/20" : ""} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-7 w-7 rounded-md" 
                      onClick={() => bump(g, -1)}
                      disabled={g.current <= 0}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-7 w-7 rounded-md hover:border-primary hover:text-primary" 
                      onClick={() => bump(g, 1)}
                      disabled={isCompleted}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <span className={`text-xs font-bold ${isCompleted ? "text-emerald-500" : "text-foreground/80"}`}>
                    {pct.toFixed(0)}%
                  </span>
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
        <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Estudar Engenharia de Software" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label>Atual</Label><Input type="number" min={0} value={form.current} onChange={(e) => setForm({ ...form, current: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>Meta</Label><Input type="number" min={1} value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>Unidade</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="horas, caps..." /></div>
        </div>
      </Dialog>
    </>
  );
}