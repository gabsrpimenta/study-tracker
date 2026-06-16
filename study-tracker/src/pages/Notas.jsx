import { useEffect, useState } from "react";
import { Plus, Trash2, Search, FileText, Save, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { listNotes, createNote, updateNote, deleteNote } from "@/lib/api";

export default function Notas() {
  const [notes, setNotes] = useState([]);
  const [active, setActive] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => { 
    listNotes().then((d) => { 
      setNotes(d); 
      setActive(d[0] ?? null); 
    }); 
  }, []);

  async function add() {
    const c = await createNote({ 
      title: "Nova nota", 
      subject: "Geral", 
      content: "", 
      updatedAt: new Date().toISOString() 
    });
    setNotes((p) => [c, ...p]);
    setActive(c);
  }

  async function save() {
    if (!active) return;
    const u = await updateNote(active.id, { 
      title: active.title, 
      subject: active.subject, 
      content: active.content, 
      updatedAt: new Date().toISOString() 
    });
    setNotes((p) => p.map((n) => (n.id === u.id ? u : n)));
    toast.success("Nota guardada com sucesso.");
  }

  async function remove(id) {
    await deleteNote(id);
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    setActive(next[0] ?? null);
    toast.success("Nota eliminada.");
  }

  const filtered = notes.filter((n) => 
    [n.title, n.subject, n.content].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gira os teus resumos, apontamentos e documentação de estudo.</p>
        </div>
        {/* O botão superior só aparece se já existir alguma nota criada */}
        {notes.length > 0 && (
          <Button onClick={add} className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium self-start sm:self-auto">
            <Plus className="h-4 w-4" /> Nova nota
          </Button>
        )}
      </div>

      {/* Condicional de Espaço de Trabalho ou Estado Vazio Absoluto */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-2xl bg-card/30 min-h-[400px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80 mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhum apontamento registado</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            Crie resumos, atas de reuniões ou notas de estudo para organizar as suas informações centrais.
          </p>
          <Button onClick={add} className="mt-6 rounded-xl h-10 px-5 gap-2">
            <Plus className="h-4 w-4" /> Criar minha primeira nota
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          
          {/* Painel Esquerdo: Lista / Procura */}
          <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm h-fit rounded-2xl border">
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                  placeholder="Pesquisar nos teus apontamentos..." 
                  className="pl-9 h-10 rounded-lg focus:ring-1 focus:ring-primary" 
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 max-h-[500px] overflow-y-auto pb-4">
              {filtered.length === 0 && (
                <p className="text-sm text-center py-6 text-muted-foreground">Nenhuma nota encontrada.</p>
              )}
              {filtered.map((n) => {
                const isActive = active?.id === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setActive(n)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-xl p-3 text-left transition-all border border-transparent",
                      isActive 
                        ? "bg-primary/5 border-primary/20 text-foreground shadow-sm pl-4 relative before:absolute before:left-1 before:top-3 before:bottom-3 before:w-1 before:bg-primary before:rounded-full" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className={cn("truncate text-sm font-semibold w-full", isActive ? "text-primary" : "text-foreground")}>
                      {n.title || "Sem título"}
                    </span>
                    <div className="flex items-center justify-between w-full mt-0.5">
                      <span className="truncate text-xs font-medium text-muted-foreground/80 flex items-center gap-1">
                        <FolderOpen className="h-3 w-3 shrink-0" /> {n.subject || "Geral"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Painel Direito: Editor Expandido */}
          <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm rounded-2xl border">
            {active ? (
              <div className="flex flex-col h-full">
                {/* Barra de Ações do Editor */}
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b bg-card/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">Modo de Edição</CardTitle>
                      <CardDescription>As alterações precisam de ser guardadas para persistir.</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button onClick={save} size="sm" className="h-9 px-4 rounded-lg flex items-center gap-2 text-xs font-medium">
                      <Save className="h-3.5 w-3.5" /> Guardar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10" 
                      onClick={() => remove(active.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Corpo do Formulário / Editor */}
                <CardContent className="p-6 space-y-4 bg-card/10">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título do Apontamento</Label>
                      <Input 
                        value={active.title} 
                        onChange={(e) => setActive({ ...active, title: e.target.value })} 
                        placeholder="Ex: Resumo de Álgebra Linear"
                        className="h-10 rounded-lg font-medium focus:ring-1 focus:ring-primary bg-background" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina / Tópico</Label>
                      <Input 
                        value={active.subject} 
                        onChange={(e) => setActive({ ...active, subject: e.target.value })} 
                        placeholder="Ex: Matemática I" 
                        className="h-10 rounded-lg focus:ring-1 focus:ring-primary bg-background" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conteúdo da Nota</Label>
                    <Textarea 
                      value={active.content} 
                      onChange={(e) => setActive({ ...active, content: e.target.value })} 
                      className="min-h-[380px] resize-none rounded-xl p-4 focus:ring-1 focus:ring-primary bg-background text-sm leading-relaxed" 
                      placeholder="Começa a escrever aqui os teus pensamentos, tópicos de aula ou resumos..." 
                    />
                  </div>
                </CardContent>
              </div>
            ) : (
              /* Caso o utilizador limpe a pesquisa e filtre tudo a zero, mas ainda existam notas */
              <CardContent className="py-24 text-center flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium">Nenhum apontamento selecionado.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Escolha uma nota na barra lateral ou crie uma nova para começar a editar.</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}