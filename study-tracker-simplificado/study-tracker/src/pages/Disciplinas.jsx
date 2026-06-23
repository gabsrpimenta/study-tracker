import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, BookOpen, Award, TrendingUp, CheckCircle2, AlertCircle, FileText, FolderOpen, Save, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Progress, Badge } from "@/components/ui/Primitives";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

// IMPORTAÇÃO BLINDADA: Busca todas as funções da API de uma só vez
import * as API from "@/lib/api";

export default function Disciplinas() {
  // ==========================================
  // 1. ESTADOS PRINCIPAIS E NAVEGAÇÃO (TABS)
  // ==========================================
  const [activeTab, setActiveTab] = useState("disciplinas"); // Pode ser: 'disciplinas', 'avaliacoes', ou 'notas'
  
  // Guardam as listas recebidas do backend C#
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [notes, setNotes] = useState([]);

  // Estados para controlar a Janela Modal de Criação/Edição
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  // Estados exclusivos para a aba de Apontamentos (Notas)
  const [activeNote, setActiveNote] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);

  // ==========================================
  // 2. EFEITOS (Buscando Dados)
  // ==========================================
  useEffect(() => {
    // Promise.all: Vai ao backend buscar Cadeiras, Notas e Apontamentos em simultâneo!
    Promise.all([
      API.listSubjects ? API.listSubjects() : Promise.resolve([]),
      API.listGrades ? API.listGrades() : Promise.resolve([]),
      API.listNotes ? API.listNotes() : Promise.resolve([])
    ]).then(([s, g, n]) => {
      setSubjects(s || []);
      setGrades(g || []);
      setNotes(n || []);
      if (n && n.length > 0) setActiveNote(n[0]);
    });
  }, []);

  // ==========================================
  // 3. CÁLCULOS DINÂMICOS (Usa useMemo para não recalcular à toa)
  // ==========================================
  
  // Calcula a média ponderada global e agrupa as notas por disciplina
  const bySubjectGrades = useMemo(() => {
    const map = new Map();
    grades.forEach((g) => {
      if (!g) return;
      const subjectProp = g.subject || g.Subject || "Sem disciplina";
      map.set(subjectProp, [...(map.get(subjectProp) ?? []), g]);
    });

    return Array.from(map.entries()).map(([subject, items]) => {
      const totalW = items.reduce((a, b) => a + (b.weight ?? b.Weight ?? 0), 0) || 1;
      const avg = items.reduce((a, b) => a + (b.value ?? b.Value ?? 0) * (b.weight ?? b.Weight ?? 0), 0) / totalW;
      return { subject, avg, totalW };
    });
  }, [grades]);

  const globalAverage = bySubjectGrades.length > 0 ? bySubjectGrades.reduce((acc, s) => acc + s.avg, 0) / bySubjectGrades.length : 0;
  const highestGrade = grades.length > 0 ? Math.max(...grades.map((g) => (g.value ?? g.Value ?? 0))) : 0;

  // ==========================================
  // 4. FUNÇÕES DO MODAL (CADEIRAS E AVALIAÇÕES)
  // ==========================================
  
  function handleOpenNew() {
    setEditingId(null);
    if (activeTab === "disciplinas") {
      setForm({ nome: "", professor: "", progresso: 0, tarefas: 0 });
    } else {
      setForm({ subject: subjects[0]?.nome || "", title: "", value: 0, weight: 0 });
    }
    setOpen(true);
  }

  function handleEdit(item) {
    setEditingId(item.id || item.Id);
    if (activeTab === "disciplinas") {
      setForm({ nome: item.nome || item.Nome || "", professor: item.professor || item.Professor || "", progresso: item.progresso ?? 0, tarefas: item.tarefas ?? 0 });
    } else {
      setForm({ subject: item.subject || item.Subject || "", title: item.title || item.Title || "", value: item.value ?? 0, weight: item.weight ?? 0 });
    }
    setOpen(true);
  }

  async function handleSave() {
    try {
      // SE ESTIVER NA ABA DISCIPLINAS
      if (activeTab === "disciplinas") {
        if (!form.nome.trim()) { toast.error("O nome é obrigatório"); return; }
        if (editingId) {
          const updated = await API.updateSubject(editingId, form);
          setSubjects((p) => p.map((x) => ((x.id || x.Id) === editingId ? { ...x, ...updated } : x)));
        } else {
          const created = await API.createSubject(form);
          setSubjects((p) => [{ ...form, ...created, id: created?.id || Date.now() }, ...p]);
        }
      } 
      // SE ESTIVER NA ABA AVALIAÇÕES
      else if (activeTab === "avaliacoes") {
        if (!form.title.trim()) { toast.error("O título é obrigatório"); return; }
        if (editingId) {
          const updated = await API.updateGrade(editingId, form);
          setGrades((p) => p.map((x) => ((x.id || x.Id) === editingId ? updated : x)));
        } else {
          const created = await API.createGrade(form);
          setGrades((p) => [created, ...p]);
        }
      }
      toast.success("Guardado com sucesso!");
      setOpen(false);
    } catch (err) {
      toast.error("Erro ao guardar dados.");
    }
  }

  async function handleRemove(id) {
    try {
      if (activeTab === "disciplinas") {
        await API.deleteSubject(id);
        setSubjects((p) => p.filter((x) => (x.id || x.Id) !== id));
      } else {
        await API.deleteGrade(id);
        setGrades((p) => p.filter((x) => (x.id || x.Id) !== id));
      }
      toast.success("Removido com sucesso.");
    } catch (err) {
      toast.error("Erro ao remover.");
    }
  }

  // ==========================================
  // 5. FUNÇÕES DE APONTAMENTOS (NOTAS)
  // ==========================================
  
  async function handleCreateNote() {
    try {
      const newNote = await API.createNote({ title: "Nova Nota", subject: "Geral", content: "", updatedAt: new Date().toISOString() });
      setNotes([newNote, ...notes]);
      setActiveNote(newNote);
      setIsEditingNote(true);
    } catch (e) { toast.error("Erro ao criar nota."); }
  }

  async function handleSaveNote() {
    try {
      const updated = await API.updateNote(activeNote.id || activeNote.Id, { ...activeNote, updatedAt: new Date().toISOString() });
      setNotes((p) => p.map((n) => ((n.id || n.Id) === (updated.id || updated.Id) ? updated : n)));
      setIsEditingNote(false);
      toast.success("Apontamento guardado.");
    } catch (e) { toast.error("Erro ao guardar nota."); }
  }

  async function handleRemoveNote(id) {
    try {
      await API.deleteNote(id);
      const next = notes.filter((n) => (n.id || n.Id) !== id);
      setNotes(next);
      setActiveNote(next[0] || null);
      setIsEditingNote(false);
      toast.success("Apontamento eliminado.");
    } catch (e) { toast.error("Erro ao eliminar nota."); }
  }

  // ==========================================
  // 6. RENDERIZAÇÃO DA INTERFACE (HTML/JSX)
  // ==========================================
  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Espaço Académico</h1>
          <p className="text-sm text-muted-foreground mt-1">Gira as tuas cadeiras, avaliações e apontamentos num único lugar.</p>
        </div>
        {/* O botão "Novo" só aparece se não estivermos na aba de notas, pois as notas têm o seu próprio botão */}
        {activeTab !== "notas" && (
          <Button onClick={handleOpenNew} className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium">
            <Plus className="h-4 w-4" /> Nova {activeTab === "disciplinas" ? "Disciplina" : "Avaliação"}
          </Button>
        )}
      </div>

      {/* SISTEMA DE ABAS (TABS) */}
      <div className="flex gap-2 border-b pb-2">
        <Button variant={activeTab === "disciplinas" ? "default" : "ghost"} onClick={() => setActiveTab("disciplinas")} className="rounded-t-lg rounded-b-none h-10">
          <BookOpen className="h-4 w-4 mr-2" /> Cadeiras
        </Button>
        <Button variant={activeTab === "avaliacoes" ? "default" : "ghost"} onClick={() => setActiveTab("avaliacoes")} className="rounded-t-lg rounded-b-none h-10">
          <Award className="h-4 w-4 mr-2" /> Avaliações
        </Button>
        <Button variant={activeTab === "notas" ? "default" : "ghost"} onClick={() => setActiveTab("notas")} className="rounded-t-lg rounded-b-none h-10">
          <FileText className="h-4 w-4 mr-2" /> Apontamentos
        </Button>
      </div>

      {/* ======================================= */}
      {/* ABA 1: DISCIPLINAS */}
      {/* ======================================= */}
      {activeTab === "disciplinas" && (
        <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-2">
          {subjects.length === 0 ? (
             <p className="text-sm text-muted-foreground py-8">Nenhuma disciplina registada.</p>
          ) : (
            subjects.map((s) => (
              <Card key={s.id || s.Id} className="rounded-2xl border shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <div>
                    <CardTitle className="text-base font-bold">{s.nome || s.Nome}</CardTitle>
                    <CardDescription className="mt-1">Prof: {s.professor || s.Professor}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleRemove(s.id || s.Id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Progresso</span>
                    <span className="font-bold">{s.progresso ?? 0}%</span>
                  </div>
                  <Progress value={s.progresso ?? 0} className="h-2" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ======================================= */}
      {/* ABA 2: AVALIAÇÕES */}
      {/* ======================================= */}
      {activeTab === "avaliacoes" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Métricas Globais */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="p-4 flex items-center gap-4 rounded-2xl shadow-sm">
              <div className="p-3 bg-primary/10 text-primary rounded-xl"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Média Geral</p>
                <p className="text-2xl font-black">{globalAverage.toFixed(2)}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 rounded-2xl shadow-sm">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><BookOpen className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Nº Avaliações</p>
                <p className="text-2xl font-black">{grades.length}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 rounded-2xl shadow-sm">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Award className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Maior Nota</p>
                <p className="text-2xl font-black text-emerald-500">{highestGrade.toFixed(1)}</p>
              </div>
            </Card>
          </div>

          {/* Lista de Avaliações */}
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="pt-6 space-y-2">
              {grades.map((g) => {
                const isApproved = (g.value ?? g.Value ?? 0) >= 9.5;
                return (
                  <div key={g.id || g.Id} className="flex items-center justify-between p-3.5 rounded-xl border hover:border-primary/30 transition-all group">
                    <div>
                      <p className="text-sm font-bold">{g.title || g.Title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{g.subject || g.Subject} • Peso: {g.weight ?? g.Weight}%</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-black px-2 py-0.5 rounded-md border ${isApproved ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-destructive bg-destructive/10 border-destructive/20"}`}>
                        {(g.value ?? g.Value ?? 0).toFixed(1)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleRemove(g.id || g.Id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================= */}
      {/* ABA 3: APONTAMENTOS (NOTAS) */}
      {/* ======================================= */}
      {activeTab === "notas" && (
        <div className="grid gap-6 lg:grid-cols-[250px_1fr] animate-in fade-in slide-in-from-bottom-2">
          
          {/* Barra lateral: Lista de Notas */}
          <Card className="h-fit rounded-2xl border shadow-sm">
            <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-bold">Documentos</CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCreateNote}><Plus className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
              {notes.length === 0 && <p className="text-xs text-center py-4 text-muted-foreground">Sem notas.</p>}
              {notes.map((n) => {
                const isActive = activeNote?.id === (n.id || n.Id);
                return (
                  <button key={n.id || n.Id} onClick={() => { setActiveNote(n); setIsEditingNote(false); }} className={cn("flex w-full flex-col text-left p-3 rounded-xl transition-all", isActive ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted/50 text-muted-foreground")}>
                    <span className="truncate text-sm w-full">{n.title || n.Title || "Sem título"}</span>
                    <span className="text-[10px] uppercase flex items-center gap-1 mt-1"><FolderOpen className="h-3 w-3" /> {n.subject || n.Subject}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Área Principal: Editor de Notas */}
          <Card className="rounded-2xl border shadow-sm min-h-[400px]">
            {activeNote ? (
              <div className="flex flex-col h-full">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-muted/5">
                  <div className="flex items-center gap-2">
                    {isEditingNote ? <Pencil className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-emerald-500" />}
                    <CardTitle className="text-sm font-bold">{isEditingNote ? "A Editar..." : "Modo Leitura"}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {isEditingNote ? (
                      <>
                        <Button variant="outline" size="sm" className="h-8" onClick={() => setIsEditingNote(false)}>Cancelar</Button>
                        <Button size="sm" className="h-8" onClick={handleSaveNote}><Save className="h-4 w-4 mr-1" /> Guardar</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="h-8" onClick={() => setIsEditingNote(true)}><Pencil className="h-3 w-3 mr-1" /> Editar</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveNote(activeNote.id || activeNote.Id)}><Trash2 className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditingNote ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input value={activeNote.title || activeNote.Title} onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })} placeholder="Título" />
                        <Input value={activeNote.subject || activeNote.Subject} onChange={(e) => setActiveNote({ ...activeNote, subject: e.target.value })} placeholder="Disciplina" />
                      </div>
                      <Textarea value={activeNote.content || activeNote.Content} onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })} className="min-h-[250px] resize-none" placeholder="Escreve os teus resumos aqui..." />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-black">{activeNote.title || activeNote.Title}</h2>
                      <p className="whitespace-pre-wrap text-muted-foreground">{activeNote.content || activeNote.Content || "Nota vazia."}</p>
                    </div>
                  )}
                </CardContent>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Selecione ou crie uma nota.</div>
            )}
          </Card>
        </div>
      )}

      {/* ======================================= */}
      {/* JANELA SUSPENSA (MODAL) PARA CADEIRAS E AVALIAÇÕES */}
      {/* ======================================= */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        title={editingId ? "Editar" : "Novo Registo"}
        footer={<>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-10 px-5" onClick={handleSave}>Guardar</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          {/* Renderização Condicional: Mostra campos diferentes dependendo da aba ativa */}
          
          {activeTab === "disciplinas" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Nome da Cadeira</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Sistemas Distribuídos" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Professor</Label>
                <Input value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })} placeholder="Ex: Dr. João" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Progresso (%)</Label>
                  <Input type="number" value={form.progresso} onChange={(e) => setForm({ ...form, progresso: Number(e.target.value) })} />
                </div>
              </div>
            </>
          )}

          {activeTab === "avaliacoes" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Disciplina</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex: Sistemas Distribuídos" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Título da Avaliação</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Projeto Final" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Nota (0-20)</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Peso (%)</Label>
                  <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} />
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
}