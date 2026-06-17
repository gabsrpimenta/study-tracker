import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Progress, Badge } from "@/components/ui/Primitives";
import { Dialog } from "@/components/ui/Dialog";
import { listSubjects, createSubject, updateSubject, deleteSubject } from "@/lib/api";

// 1. SINCRONIZADO COM O C#: Variáveis agora usam os nomes do backend (nome, professor, progresso, tarefas)
const empty = { nome: "", professor: "", progresso: 0, tarefas: 0 };

export default function Disciplinas() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState(null);

  useEffect(() => { 
    listSubjects().then(setItems); 
  }, []);

  function startCreate() { 
    setEditing(null); 
    setForm(empty); 
    setOpen(true); 
  }
  
  function startEdit(s) { 
    setEditing(s); 
    setForm({ 
      nome: s.nome || "", 
      professor: s.professor || "", 
      progresso: s.progresso || 0, 
      tarefas: s.tarefas || 0 
    }); 
    setOpen(true); 
  }

  async function save() {
    if (!form.nome.trim()) { toast.error("Nome obrigatório"); return; }
    
    try {
      if (editing) {
        const u = await updateSubject(editing.id, form);
        setItems((p) => p.map((x) => (x.id === editing.id ? { ...x, ...form, ...u } : x)));
      } else {
        const c = await createSubject(form);
        setItems((p) => [{ id: c?.id || Date.now().toString(), ...form, ...c }, ...p]);
      }
      setOpen(false);
      toast.success("Guardado com sucesso.");
    } catch (error) {
      toast.error("Erro ao guardar a disciplina.");
      console.error(error);
    }
  }

  async function confirmDelete() {
    try {
      await deleteSubject(del);
      setItems((p) => p.filter((x) => x.id !== del));
      setDel(null);
      toast.success("Disciplina removida.");
    } catch (error) {
      toast.error("Erro ao remover a disciplina.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Disciplinas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie as suas disciplinas ativas e acompanhe o progresso do semestre.</p>
        </div>
        {items.length > 0 && (
          <Button onClick={startCreate} className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium self-start sm:self-auto">
            <Plus className="h-4 w-4" /> Nova disciplina
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-2xl bg-card/30 min-h-[350px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhuma disciplina registada</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            Adicione as suas cadeiras do semestre para acompanhar tarefas, notas e faltas.
          </p>
          <Button onClick={startCreate} className="mt-6 rounded-xl h-10 px-5 gap-2">
            <Plus className="h-4 w-4" /> Lançar minha primeira disciplina
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((s) => (
            <Card key={s.id} className="rounded-2xl border shadow-sm overflow-hidden transition-all duration-200">
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-bold truncate">{s.nome}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs truncate mt-0.5">
                      <GraduationCap className="h-3 w-3 shrink-0" /> {s.professor || "Sem professor atribuído"}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={() => startEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setDel(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado do Trabalho</span>
                  <Badge variant={s.tarefas > 0 ? "secondary" : "outline"} className="text-xs px-2 py-0.5 rounded-md font-medium">
                    {s.tarefas || 0} {(s.tarefas === 1) ? "tarefa pendente" : "tarefas pendentes"}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      {(s.progresso || 0) >= 100 && <CheckCircle2 className="h-3 w-3 text-success" />} Progresso de Conclusão
                    </span>
                    <span className="font-semibold text-foreground text-xs">{s.progresso || 0}%</span>
                  </div>
                  <Progress value={s.progresso || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Formulário */}
      <Dialog
        open={open} onClose={() => setOpen(false)}
        title={editing ? "Editar Disciplina" : "Nova Disciplina"}
        footer={<>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-10 px-5" onClick={save}>Guardar Alterações</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome da Disciplina</Label>
            <Input className="h-10 rounded-lg focus:ring-1 focus:ring-primary" placeholder="Ex: Engenharia de Software" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professor / Regente</Label>
            <Input className="h-10 rounded-lg focus:ring-1 focus:ring-primary" placeholder="Ex: Dr. Artur Silva" value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progresso (%)</Label>
              <Input 
                type="number" 
                min={0} 
                max={100} 
                className="h-10 rounded-lg focus:ring-1 focus:ring-primary" 
                value={form.progresso === 0 && form.progresso.toString() === "" ? "" : form.progresso} 
                onChange={(e) => setForm({ ...form, progresso: Number(e.target.value) })} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nº de Tarefas</Label>
              <Input 
                type="number" 
                min={0} 
                className="h-10 rounded-lg focus:ring-1 focus:ring-primary" 
                value={form.tarefas === 0 && form.tarefas.toString() === "" ? "" : form.tarefas} 
                onChange={(e) => setForm({ ...form, tarefas: Number(e.target.value) })} 
              />
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={!!del} onClose={() => setDel(null)}
        title="Eliminar disciplina?" 
        description="Esta ação é permanente. Todos os registos associados a esta disciplina serão removidos do seu painel."
        footer={<>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setDel(null)}>Cancelar</Button>
          <Button variant="destructive" className="rounded-xl h-10 px-5" onClick={confirmDelete}>Confirmar e Eliminar</Button>
        </>}
      />
    </div>
  );
}