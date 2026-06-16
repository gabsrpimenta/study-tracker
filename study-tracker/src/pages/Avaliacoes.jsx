import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Award, BookOpen, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
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

  const totalEvaluations = grades.length;
  const highestGrade = grades.length > 0 ? Math.max(...grades.map((g) => g.value)) : 0;
  const globalAverage = bySubject.length > 0 ? bySubject.reduce((acc, s) => acc + s.avg, 0) / bySubject.length : 0;

  function startCreate() { setEditing(null); setForm(empty); setOpen(true); }
  function startEdit(g) { setEditing(g); setForm({ subject: g.subject, title: g.title, value: g.value, weight: g.weight }); setOpen(true); }
  
  async function save() {
    if (!form.subject.trim() || !form.title.trim()) { toast.error("Preencha todos os campos"); return; }
    if (editing) {
      const u = await updateGrade(editing.id, form);
      setGrades((p) => p.map((x) => (x.id === editing.id ? u : x)));
    } else {
      const c = await createGrade(form);
      setGrades((p) => [c, ...p]);
    }
    setOpen(false);
    toast.success("Nota guardada com sucesso.");
  }
  
  async function remove(id) {
    await deleteGrade(id);
    setGrades((p) => p.filter((x) => x.id !== id));
    toast.success("Nota eliminada.");
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Avaliações</h1>
          <p className="text-sm text-muted-foreground mt-1">Notas lançadas e controle de médias ponderadas.</p>
        </div>
        {/* O botão superior só aparece se houver avaliações */}
        {grades.length > 0 && (
          <Button onClick={startCreate} className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium self-start sm:self-auto">
            <Plus className="h-4 w-4" /> Nova nota
          </Button>
        )}
      </div>

      {/* Condicional de Conteúdo Geral ou Estado Vazio Absoluto */}
      {grades.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-2xl bg-card/30 min-h-[400px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 mb-4">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhuma avaliação registada</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            Insira as suas primeiras notas para calcular automaticamente as médias ponderadas de cada disciplina.
          </p>
          <Button onClick={startCreate} className="mt-6 rounded-xl h-10 px-5 gap-2">
            <Plus className="h-4 w-4" /> Lançar minha primeira nota
          </Button>
        </div>
      ) : (
        <>
          {/* PAINEL DE MÉTRICAS DE DESEMPENHO */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className={`p-2 rounded-xl bg-primary/10 ${globalAverage >= 10 ? "text-primary" : "text-destructive"}`}>
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Média Geral</p>
                <p className="text-xl font-black text-foreground mt-0.5">
                  {globalAverage.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">/20</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Avaliações Feitas</p>
                <p className="text-xl font-black text-foreground mt-0.5">{totalEvaluations}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Maior Nota</p>
                <p className="text-xl font-black text-emerald-500 mt-0.5">
                  {highestGrade.toFixed(1)} <span className="text-xs text-emerald-500/70 font-normal">/20</span>
                </p>
              </div>
            </div>
          </div>

          {/* VISÃO POR DISCIPLINA (CARDS) */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bySubject.map((s) => {
              const isApproved = s.avg >= 10;
              const progressPct = Math.min(100, (s.avg / 20) * 100);

              return (
                <Card key={s.subject} className={`overflow-hidden rounded-2xl border-l-4 transition-all duration-200 hover:shadow-md ${isApproved ? "border-l-emerald-500" : "border-l-destructive"}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-bold truncate">{s.subject}</CardTitle>
                      <Badge 
                        variant={isApproved ? "default" : "destructive"} 
                        className={`text-[10px] uppercase tracking-wider font-bold shrink-0 flex items-center gap-1 ${
                          isApproved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10" : ""
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {isApproved ? "Aprovado" : "Em risco"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-baseline gap-1.5 mt-1">
                      <span className={`text-2xl font-black tracking-tight ${isApproved ? "text-foreground" : "text-destructive"}`}>
                        {s.avg.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">/ 20 valores</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isApproved ? "bg-emerald-500" : "bg-destructive"}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-1">
                      <span>Peso total alocado:</span>
                      <span className={s.totalW > 100 ? "text-amber-500 font-bold" : "text-foreground font-semibold"}>{s.totalW}%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* HISTÓRICO DETALHADO DE TODAS AS NOTAS */}
          <Card className="rounded-2xl border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Histórico Detalhado</CardTitle>
              <CardDescription>Todas as avaliações individuais lançadas no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-1 border-t pt-4">
              {grades.map((g) => {
                const individualPass = g.value >= 10;
                return (
                  <div key={g.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-3.5 bg-card hover:bg-accent/20 transition-colors text-sm">
                    <div className="flex items-center gap-2.5 sm:w-44 shrink-0">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-bold text-foreground truncate">{g.subject}</span>
                    </div>
                    <div className="flex-1 text-muted-foreground font-medium truncate sm:pl-2">
                      {g.title}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t pt-2 sm:border-t-0 sm:pt-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Peso:</span>
                        <Badge variant="outline" className="font-semibold px-2 py-0.5 bg-muted/50 rounded-md">{g.weight}%</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-base font-black px-2 py-0.5 rounded-md ${
                          individualPass ? "text-emerald-500 bg-emerald-500/10" : "text-destructive bg-destructive/10"
                        }`}>
                          {g.value.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 ml-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => startEdit(g)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => remove(g.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      {/* DIÁLOGO MANTIDO ORIGINAL */}
      <Dialog
        open={open} onClose={() => setOpen(false)}
        title={editing ? "Editar nota" : "Nova nota"}
        footer={<>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-10 px-5" onClick={save}>Guardar</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex: Engenharia de Software" className="h-10 rounded-lg focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avaliação</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Teste Prático 1" className="h-10 rounded-lg focus:ring-1 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nota (0-20)</Label>
              <Input type="number" min={0} max={20} step="0.1" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="h-10 rounded-lg focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peso (%)</Label>
              <Input type="number" min={0} max={100} value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="h-10 rounded-lg focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}