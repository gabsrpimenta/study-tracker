import { useEffect, useState } from "react";
import { Plus, Trash2, Target, CheckCircle2, Trophy, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
// Importa aqui a tua API de objetivos:
// import { listGoals, createGoal, updateGoal, deleteGoal } from "@/lib/api";

export default function Objetivos() {
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  // Exemplo de carga inicial
  useEffect(() => {
    // listGoals().then(setGoals);
  }, []);

  async function save() {
    if (!form.title.trim()) {
      toast.error("O título do objetivo é obrigatório");
      return;
    }
    // const newGoal = await createGoal(form);
    // setGoals([...goals, newGoal]);
    setOpen(false);
    toast.success("Objetivo definido com sucesso!");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Objetivos</h1>
          <p className="text-sm text-muted-foreground mt-1">Define as tuas metas de longo prazo e mantém o foco.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-xl h-10 px-5 gap-2 font-medium">
          <Plus className="h-4 w-4" /> Novo Objetivo
        </Button>
      </div>

      {/* Grid de Objetivos */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed rounded-2xl bg-card/30 min-h-[350px]">
          <Target className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold">Nenhum objetivo definido</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">Define metas claras para o teu semestre e acompanha o teu progresso.</p>
          <Button onClick={() => setOpen(true)} className="mt-6 rounded-xl">Criar primeiro objetivo</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <Card key={g.id} className="rounded-2xl border shadow-sm hover:border-primary/20 transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <CardTitle className="mt-2">{g.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{g.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} title="Novo Objetivo">
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título</Label>
            <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Ex: Terminar o curso com média 18" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</Label>
            <Input value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Ex: Focar nas cadeiras de cálculo..." />
          </div>
          <Button className="w-full mt-4 rounded-xl" onClick={save}>Guardar Objetivo</Button>
        </div>
      </Dialog>
    </div>
  );
}