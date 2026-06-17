import { useEffect, useState } from "react";
import { Plus, Trash2, Search, FileText, Save, FolderOpen, Pencil, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import * as API from "@/lib/api";

export default function Notas() {
  const [notes, setNotes] = useState([]);
  const [active, setActive] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [q, setQ] = useState("");

  const normalize = (n) => ({
    id: n?.id ?? n?.Id,
    title: n?.title ?? n?.Title ?? "Sem título",
    subject: n?.subject ?? n?.Subject ?? "Geral",
    content: n?.content ?? n?.Content ?? "",
    updatedAt: n?.updatedAt ?? n?.UpdatedAt
  });

  useEffect(() => { 
    if (API.listNotes) {
      API.listNotes().then((d) => { 
        const normalizedList = (d || []).map(normalize);
        setNotes(normalizedList); 
        if (normalizedList.length > 0) {
          setActive(normalizedList[0]);
          setIsEditing(false);
        }
      }); 
    }
  }, []);

  async function add() {
    try {
      if (!API.createNote) return;
      // Alterado: campos vazios para que o usuário preencha do zero
      const raw = await API.createNote({ 
        title: "", 
        subject: "", 
        content: "", 
        updatedAt: new Date().toISOString() 
      });
      const created = normalize(raw);
      setNotes((p) => [created, ...p]);
      setActive(created);
      setIsEditing(true);
    } catch {
      toast.error("Erro ao criar nova nota.");
    }
  }

  async function save() {
    if (!active) return;
    try {
      if (!API.updateNote) return;
      const raw = await API.updateNote(active.id, { ...active, updatedAt: new Date().toISOString() });
      const updated = normalize(raw);
      setNotes((p) => p.map((n) => (n.id === updated.id ? updated : n)));
      setIsEditing(false);
      toast.success("Nota guardada com sucesso.");
    } catch {
      toast.error("Erro ao salvar alterações.");
    }
  }

  async function remove(id) {
    try {
      if (!API.deleteNote) return;
      await API.deleteNote(id);
      const next = notes.filter((n) => n.id !== id);
      setNotes(next);
      setActive(next[0] ?? null);
      setIsEditing(false);
      toast.success("Nota eliminada.");
    } catch {
      toast.error("Erro ao eliminar a nota.");
    }
  }

  const filtered = notes.filter((n) => 
    [n.title, n.subject, n.content].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gere os teus resumos, apontamentos e documentação de estudo.</p>
        </div>
        {notes.length > 0 && (
          <Button onClick={add} className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium shadow-sm">
            <Plus className="h-4 w-4" /> Nova nota
          </Button>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-2xl bg-card/30 min-h-[400px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhum apontamento registado</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">Crie resumos, atas de reuniões ou notas de estudo para organizar as suas informações centrais.</p>
          <Button onClick={add} className="mt-6 rounded-xl h-10 px-5 gap-2 font-medium">
            <Plus className="h-4 w-4" /> Criar minha primeira nota
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="overflow-hidden h-fit rounded-2xl border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar nos teus apontamentos..." className="pl-9 h-10 rounded-lg bg-background" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 max-h-[520px] overflow-y-auto pb-4">
              {filtered.length === 0 && <p className="text-sm text-center py-6 text-muted-foreground">Nenhuma nota encontrada.</p>}
              {filtered.map((n) => {
                const isActive = active?.id === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => { setActive(n); setIsEditing(false); }}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-xl p-3 text-left transition-all border border-transparent",
                      isActive ? "bg-primary/5 border-primary/20 text-foreground shadow-sm pl-4 relative before:absolute before:left-1 before:top-3 before:bottom-3 before:w-1 before:bg-primary before:rounded-full" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className={cn("truncate text-sm font-semibold w-full", isActive ? "text-primary" : "text-foreground")}>{n.title}</span>
                    <span className="truncate text-xs font-medium text-muted-foreground/80 flex items-center gap-1"><FolderOpen className="h-3 w-3 shrink-0" /> {n.subject}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {active ? (
              <div className="flex flex-col h-full">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", isEditing ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600")}>
                      {isEditing ? <Pencil className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">{isEditing ? "Modo de Edição" : "Modo de Leitura"}</CardTitle>
                      <CardDescription>{isEditing ? "As alterações precisam de ser guardadas." : "Visualização limpa do teu documento."}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium" onClick={() => setIsEditing(false)}><X className="h-3.5 w-3.5" /> Cancelar</Button>
                        <Button onClick={save} size="sm" className="h-9 px-4 rounded-lg flex items-center gap-1.5 text-xs font-medium shadow-sm"><Save className="h-3.5 w-3.5" /> Guardar Nota</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg flex items-center gap-1.5 text-xs font-medium text-foreground hover:bg-muted" onClick={() => setIsEditing(true)}><Pencil className="h-3.5 w-3.5 text-muted-foreground" /> Editar Nota</Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20" onClick={() => remove(active.id)}><Trash2 className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 bg-background/20">
                  {isEditing ? (
                    <div className="space-y-4 animate-in fade-in-50 duration-150">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título do Apontamento</Label>
                          <Input value={active.title} onChange={(e) => setActive({ ...active, title: e.target.value })} placeholder="Ex: Resumo de Álgebra Linear" className="h-10 rounded-lg font-medium bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina / Tópico</Label>
                          <Input value={active.subject} onChange={(e) => setActive({ ...active, subject: e.target.value })} placeholder="Ex: Matemática I" className="h-10 rounded-lg bg-background" />
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conteúdo da Nota</Label>
                        <Textarea value={active.content} onChange={(e) => setActive({ ...active, content: e.target.value })} className="min-h-[360px] resize-none rounded-xl p-4 bg-background text-sm leading-relaxed" placeholder="Começa a escrever aqui os teus resumos ou apontamentos..." />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in-50 duration-150">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider"><FolderOpen className="h-3 w-3" /> {active.subject}</span>
                        <h2 className="text-2xl font-black tracking-tight text-foreground mt-2">{active.title}</h2>
                      </div>
                      <div className="border-t pt-4">
                        {active.content ? (
                          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-normal">{active.content}</p>
                        ) : (
                          <p className="text-sm italic text-muted-foreground/60">Esta nota não tem conteúdo. Clique em "Editar Nota" acima para escrever.</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            ) : (
              <CardContent className="py-24 text-center flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium">Nenhum apontamento selecionado.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Escolha uma nota na barra lateral ou crie uma nova para começar.</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}