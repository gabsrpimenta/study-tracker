import { useEffect, useState } from "react";
import { Plus, Trash2, Target, Trophy, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { listGoals, createGoal, toggleGoal, deleteGoal } from "@/lib/api";

export default function Objetivos() {
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "" });

  useEffect(() => {
    listGoals()
      .then(setGoals)
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!form.title.trim()) {
      toast.error("O título do objetivo é obrigatório");
      return;
    }
    try {
      const newGoal = await createGoal(form);
      if (newGoal) {
        setGoals((prev) => [newGoal, ...prev]);
        toast.success("Objetivo definido com sucesso!");
      }
      setOpen(false);
      setForm({ title: "", description: "" });
    } catch {
      toast.error("Erro ao criar objetivo.");
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await toggleGoal(id);
      if (updated) {
        setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      }
    } catch {
      toast.error("Erro ao atualizar objetivo.");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success("Objetivo removido.");
    } catch {
      toast.error("Erro ao remover objetivo.");
    }
  }

  const done = goals.filter((g) => g.done).length;
  const total = goals.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Objetivos</h1>
          <p className="text-sm text-muted-foreground mt-1">Define as tuas metas de longo prazo e mantém o foco.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-xl h-10 px-5 gap-2 font-medium">
          <Plus className="h-4 w-4" /> Novo Objetivo
        </Button>
      </div>

      {/* Barra de progresso geral */}
      {total > 0 && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Progresso Geral</span>
            </div>
            <span className="text-sm font-black text-primary">{done}/{total} concluídos</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">A carregar objetivos...</div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed rounded-2xl bg-card/30 min-h-[350px]">
          <Target className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold">Nenhum objetivo definido</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Define metas claras para o teu semestre e acompanha o teu progresso.
          </p>
          <Button onClick={() => setOpen(true)} className="mt-6 rounded-xl">
            Criar primeiro objetivo
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <Card
              key={g.id}
              className={`rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                g.done ? "opacity-70 bg-muted/30" : "hover:border-primary/20"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <button
                    onClick={() => handleToggle(g.id)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                    title={g.done ? "Marcar como pendente" : "Marcar como concluído"}
                  >
                    {g.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => handleDelete(g.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle
                  className={`text-base mt-1 leading-snug ${g.done ? "line-through text-muted-foreground" : ""}`}
                >
                  {g.title}
                </CardTitle>
              </CardHeader>
              {g.description && (
                <CardContent className="pt-0">
                  <CardDescription className={g.done ? "line-through" : ""}>{g.description}</CardDescription>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => { setOpen(false); setForm({ title: "", description: "" }); }}
        title="Novo Objetivo"
        footer={
          <>
            <Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="rounded-xl h-10 px-5" onClick={save}>
              Guardar Objetivo
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Terminar o curso com média 18"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Focar nas cadeiras de cálculo..."
              className="h-10 rounded-lg"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
