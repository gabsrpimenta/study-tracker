import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Award, BookOpen, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog } from "@/components/ui/Dialog";
// IMPORTAÇÃO BLINDADA: Evita quebras de compilação caso alguma rota falhe
import * as API from "@/lib/api";

const empty = { subject: "", title: "", value: 0, weight: 0 };

export default function Avaliacoes() {
  const [grades, setGrades] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  useEffect(() => { 
    if (API.listGrades) {
      API.listGrades().then((dados) => setGrades(dados || [])); 
    }
  }, []);

  // Cálculo de médias por disciplina com proteção de nulos e suporte a PascalCase
  const bySubject = useMemo(() => {
    const map = new Map();
    
    grades.forEach((g) => {
      if (!g) return;
      const subjectProp = g.subject || g.Subject || "Sem disciplina";
      map.set(subjectProp, [...(map.get(subjectProp) ?? []), g]);
    });

    return Array.from(map.entries()).map(([subject, items]) => {
      const totalW = items.reduce((a, b) => a + (b.weight ?? b.Weight ?? 0), 0) || 1;
      const avg = items.reduce((a, b) => a + (b.value ?? b.Value ?? 0) * (b.weight ?? b.Weight ?? 0), 0) / totalW;
      return { subject, items, avg, totalW };
    });
  }, [grades]);

  // Métricas globais protegidas com parênteses estritos contra erros de compilação
  const totalEvaluations = grades.length;
  const highestGrade = grades.length > 0 ? Math.max(...grades.map((g) => (g.value ?? g.Value ?? 0))) : 0;
  const globalAverage = bySubject.length > 0 ? bySubject.reduce((acc, s) => acc + s.avg, 0) / bySubject.length : 0;

  function startCreate() { setEditing(null); setForm(empty); setOpen(true); }
  
  function startEdit(g) { 
    setEditing(g); 
    setForm({ 
      subject: g.subject || g.Subject || "", 
      title: g.title || g.Title || "", 
      value: g.value ?? g.Value ?? 0, 
      weight: g.weight ?? g.Weight ?? 0 
    }); 
    setOpen(true); 
  }
  
  async function save() {
    const subjectVal = form.subject || form.Subject;
    const titleVal = form.title || form.Title;

    if (!subjectVal?.trim() || !titleVal?.trim()) { 
      toast.error("Preencha todos os campos obrigatórios"); 
      return; 
    }

    try {
      if (editing) {
        if (API.updateGrade) {
          const u = await API.updateGrade(editing.id || editing.Id, form);
          setGrades((p) => p.map((x) => ((x.id || x.Id) === (editing.id || editing.Id) ? u : x)));
          toast.success("Nota atualizada com sucesso.");
        }
      } else {
        if (API.createGrade) {
          const c = await API.createGrade(form);
          setGrades((p) => [c, ...p]);
          toast.success("Nota guardada com sucesso.");
        }
      }
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao guardar a nota.");
    }
  }
  
  async function remove(id) {
    try {
      if (API.deleteGrade) {
        await API.deleteGrade(id);
        setGrades((p) => p.filter((x) => (x.id || x.Id) !== id));
        toast.success("Nota eliminada.");
      }
    } catch (error) {
      toast.error("Erro ao eliminar a nota.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Avaliações</h1>
          <p className="text-sm text-muted-foreground mt-1">Notas lançadas e controle de médias ponderadas.</p>
        </div>
        {totalEvaluations > 0 && (
          <Button onClick={startCreate} className="rounded-xl h-10 px-5 gap-2 font-medium self-start sm:self-auto shadow-sm">
            <Plus className="h-4 w-4" /> Nova nota
          </Button>
        )}
      </div>

      {totalEvaluations === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-2xl bg-card/30 min-h-[400px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 mb-4">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhuma avaliação registada</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            Insira as suas primeiras notas para calcular automaticamente as médias ponderadas de cada disciplina.
          </p>
          <Button onClick={startCreate} className="mt-6 rounded-xl h-10 px-5 gap-2 font-medium">
            <Plus className="h-4 w-4" /> Lançar minha primeira nota
          </Button>
        </div>
      ) : (
        <>
          {/* PAINEL DE MÉTRICAS DE DESEMPENHO */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className={`p-2 rounded-xl ${globalAverage >= 9.5 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
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
              const isApproved = s.avg >= 9.5;
              const progressPct = Math.min(100, (s.avg / 20) * 100);

              return (
                <Card key={s.subject} className={`overflow-hidden rounded-2xl border bg-card border-l-4 transition-all duration-200 hover:shadow-md ${isApproved ? "border-l-emerald-500" : "border-l-destructive"}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-bold truncate text-foreground">{s.subject}</CardTitle>
                      <Badge 
                        className={`text-[10px] uppercase tracking-wider font-bold shrink-0 flex items-center gap-1 border ${
                          isApproved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
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
          <Card className="rounded-2xl border shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Histórico Detalhado</CardTitle>
              <CardDescription>Todas as avaliações individuais lançadas no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[420px] overflow-y-auto pr-1 border-t pt-4 bg-background/30">
              {grades.map((g) => {
                if (!g) return null;
                const gId = g.id || g.Id;
                const gSubject = g.subject || g.Subject || "Sem disciplina";
                const gTitle = g.title || g.Title || "Avaliação";
                const gValue = g.value ?? g.Value ?? 0;
                const gWeight = g.weight ?? g.Weight ?? 0;

                const individualPass = gValue >= 9.5;

                return (
                  <div key={gId} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border bg-card p-3.5 hover:border-primary/30 hover:bg-card transition-all text-sm group">
                    <div className="flex items-center gap-2.5 sm:w-48 shrink-0">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-bold text-foreground truncate">{gSubject}</span>
                    </div>
                    <div className="flex-1 text-muted-foreground font-medium truncate sm:pl-2">
                      {gTitle}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t pt-2 sm:border-t-0 sm:pt-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Peso:</span>
                        <Badge variant="outline" className="font-semibold px-2 py-0.5 bg-muted/50 rounded-md border-border/60">{gWeight}%</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-base font-black px-2 py-0.5 rounded-md border ${
                          individualPass ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-destructive bg-destructive/10 border-destructive/20"
                        }`}>
                          {gValue.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 ml-2 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-transparent hover:border-border hover:bg-background" onClick={() => startEdit(g)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => remove(gId)}>
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

      {/* DIÁLOGO MANTIDO COMPATÍVEL */}
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
            <Input value={form.subject || form.Subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex: Engenharia de Software" className="h-10 rounded-lg focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avaliação</Label>
            <Input value={form.title || form.Title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Teste Prático 1" className="h-10 rounded-lg focus:ring-1 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nota (0-20)</Label>
              <Input type="number" min={0} max={20} step="0.1" value={form.value ?? form.Value ?? 0} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="h-10 rounded-lg focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peso (%)</Label>
              <Input type="number" min={0} max={100} value={form.weight ?? form.Weight ?? 0} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="h-10 rounded-lg focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}