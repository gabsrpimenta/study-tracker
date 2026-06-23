import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, BookOpen, Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Progress, Badge } from "@/components/ui/Primitives";
import { Dialog } from "@/components/ui/Dialog";
import * as API from "@/lib/api";

export default function DesempenhoAcademico() {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("disciplinas"); 
  const [subjects, setSubjects] = useState([]); // Cadeiras
  const [grades, setGrades] = useState([]);     // Avaliações

  // Estados do Modal e Formulário
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  // --- CARREGAMENTO DE DADOS ---
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      API.listSubjects ? API.listSubjects() : Promise.resolve([]),
      API.listGrades ? API.listGrades() : Promise.resolve([])
    ]).then(([s, g]) => {
      setSubjects(s || []);
      setGrades(g || []);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  // --- FUNÇÕES DE AUXÍLIO E CRUD ---
  function handleOpenNew() {
    setEditingId(null);
    if (activeTab === "disciplinas") {
      setForm({ nome: "", professor: "", progresso: 0 });
    } else {
      setForm({ title: "", subject: "", value: "", weight: "" });
    }
    setOpen(true);
  }

  function handleEdit(item) {
    setEditingId(item.id || item.Id);
    if (activeTab === "disciplinas") {
      setForm({ nome: item.nome || "", professor: item.professor || "", progresso: item.progresso || 0 });
    } else {
      setForm({ title: item.title || "", subject: item.subject || "", value: item.value || "", weight: item.weight || "" });
    }
    setOpen(true);
  }

  async function handleSave() {
    try {
      if (activeTab === "disciplinas") {
        if (editingId) await API.updateSubject(editingId, form);
        else await API.createSubject(form);
        setSubjects(await API.listSubjects());
      } else {
        const gradeData = { ...form, value: Number(form.value), weight: Number(form.weight) };
        if (editingId) await API.updateGrade(editingId, gradeData);
        else await API.createGrade(gradeData);
        setGrades(await API.listGrades());
      }
      toast.success(editingId ? "Registo atualizado!" : "Registo criado!");
      setOpen(false);
    } catch { 
      toast.error("Erro ao guardar os dados."); 
    }
  }

  async function handleRemove(id) {
    try {
      if (activeTab === "disciplinas") { 
        await API.deleteSubject(id); 
        setSubjects(subjects.filter(s => (s.id || s.Id) !== id)); 
      } else { 
        await API.deleteGrade(id); 
        setGrades(grades.filter(g => (g.id || g.Id) !== id)); 
      }
      toast.success("Removido com sucesso.");
    } catch { 
      toast.error("Erro ao remover."); 
    }
  }

  // --- TELA DE CARREGAMENTO ANIMADO ---
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 px-2 md:px-6">
      
      {/* CABEÇALHO */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-wider">Académico</p>
          <h1 className="text-4xl font-black text-foreground mt-1">Desempenho</h1>
        </div>
        <Button onClick={handleOpenNew} className="rounded-full h-11 px-6 shadow-sm hover:shadow-md transition-all font-bold gap-2">
          <Plus className="h-4 w-4" /> Nova {activeTab === "disciplinas" ? "Cadeira" : "Avaliação"}
        </Button>
      </header>

      {/* SELETOR DE ABAS */}
      <div className="flex gap-2 p-1.5 bg-muted/40 rounded-2xl w-fit border border-border/50 shadow-sm">
        <Button 
          variant={activeTab === "disciplinas" ? "default" : "ghost"} 
          onClick={() => setActiveTab("disciplinas")} 
          className={`rounded-xl h-10 px-6 font-bold transition-all ${activeTab === "disciplinas" ? "shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <BookOpen className="h-4 w-4 mr-2" /> Cadeiras
        </Button>
        <Button 
          variant={activeTab === "avaliacoes" ? "default" : "ghost"} 
          onClick={() => setActiveTab("avaliacoes")} 
          className={`rounded-xl h-10 px-6 font-bold transition-all ${activeTab === "avaliacoes" ? "shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Award className="h-4 w-4 mr-2" /> Avaliações
        </Button>
      </div>

      {/* CONTEÚDO: CADEIRAS */}
      {activeTab === "disciplinas" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-6 sm:grid-cols-2">
            {subjects.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border rounded-[1.5rem] bg-card shadow-sm animate-in zoom-in-95 duration-300">
                <div className="bg-muted p-5 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <p className="text-base font-bold text-foreground">Nenhuma cadeira por aqui.</p>
                <p className="text-sm text-muted-foreground mt-1">Usa o botão "Nova Cadeira" para começares a organizar-te.</p>
              </div>
            ) : (
              subjects.map(s => (
                <Card key={s.id || s.Id} className="rounded-[1.5rem] p-6 border shadow-sm transition-all hover:border-primary/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg truncate">{s.nome}</h3>
                      <p className="text-sm text-muted-foreground truncate">Prof: {s.professor}</p>
                    </div>
                    <div className="flex gap-1 ml-2 opacity-60 hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleRemove(s.id || s.Id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                      <span>Progresso</span>
                      <span>{s.progresso}%</span>
                    </div>
                    <Progress value={Number(s.progresso)} className="h-2" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO: AVALIAÇÕES */}
      {activeTab === "avaliacoes" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* CARD PRINCIPAL DE LISTAGEM / SEM OS CARD DE METRICAS ANTERIORES */}
          <Card className="rounded-[1.5rem] border shadow-sm">
            <CardContent className="p-6 space-y-2">
              {grades.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
                   <div className="bg-muted p-5 rounded-full mb-4">
                     <Award className="h-8 w-8 text-muted-foreground/60" />
                   </div>
                   <p className="text-base font-bold text-foreground">Nenhuma avaliação por aqui.</p>
                   <p className="text-sm text-muted-foreground mt-1">Usa o botão "Nova Avaliação" para começares a registar as tuas notas.</p>
                 </div>
              ) : (
                grades.map(g => (
                  <div key={g.id || g.Id} className="flex items-center justify-between p-4 rounded-2xl border bg-card hover:bg-muted/30 hover:border-primary/30 transition-all group">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-base truncate">{g.title}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">{g.subject} • Peso: {g.weight}%</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className="text-lg font-black px-3 py-1 shadow-sm">{Number(g.value).toFixed(1)}</Badge>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEdit(g)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleRemove(g.id || g.Id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        title={editingId ? `Editar ${activeTab === "disciplinas" ? "Cadeira" : "Avaliação"}` : `Nova ${activeTab === "disciplinas" ? "Cadeira" : "Avaliação"}`}
        footer={<>
          <Button variant="outline" className="rounded-xl h-11" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-11 px-6 font-bold shadow-sm" onClick={handleSave}>Guardar</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          {activeTab === "disciplinas" ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome da Cadeira</Label>
                <Input value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} placeholder="Ex: Análise Matemática" className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professor Responsável</Label>
                <Input value={form.professor} onChange={(e) => setForm({...form, professor: e.target.value})} placeholder="Ex: Dr. João Silva" className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progresso do Semestre (%)</Label>
                <Input type="number" min="0" max="100" value={form.progresso} onChange={(e) => setForm({...form, progresso: e.target.value})} placeholder="Ex: 50" className="rounded-xl h-11" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título da Avaliação</Label>
                <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Ex: 1ª Frequência" className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina Associada</Label>
                <Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="Ex: Análise Matemática" className="rounded-xl h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nota Final</Label>
                  <Input type="number" step="0.1" value={form.value} onChange={(e) => setForm({...form, value: e.target.value})} placeholder="Ex: 16.5" className="rounded-xl h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peso da Nota (%)</Label>
                  <Input type="number" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} placeholder="Ex: 40" className="rounded-xl h-11" />
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
}