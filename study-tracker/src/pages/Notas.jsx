import { useEffect, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { listNotes, createNote, updateNote, deleteNote } from "@/lib/api";

export default function Notas() {
  const [notes, setNotes] = useState([]);
  const [active, setActive] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => { listNotes().then((d) => { setNotes(d); setActive(d[0] ?? null); }); }, []);

  async function add() {
    const c = await createNote({ title: "Nova nota", subject: "Geral", content: "", updatedAt: new Date().toISOString() });
    setNotes((p) => [c, ...p]);
    setActive(c);
  }
  async function save() {
    if (!active) return;
    const u = await updateNote(active.id, { title: active.title, subject: active.subject, content: active.content, updatedAt: new Date().toISOString() });
    setNotes((p) => p.map((n) => (n.id === u.id ? u : n)));
    toast.success("Guardada.");
  }
  async function remove(id) {
    await deleteNote(id);
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    setActive(next[0] ?? null);
  }

  const filtered = notes.filter((n) => [n.title, n.subject, n.content].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notas</h1>
          <p className="text-muted-foreground">Resumos e apontamentos.</p>
        </div>
        <Button onClick={add}><Plus className="h-4 w-4" /> Nova nota</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">Sem notas.</p>}
            {filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n)}
                className={cn("flex w-full flex-col items-start gap-0.5 rounded-md p-2 text-left hover:bg-accent", active?.id === n.id && "bg-accent")}
              >
                <span className="truncate text-sm font-medium">{n.title}</span>
                <span className="truncate text-xs text-muted-foreground">{n.subject}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          {active ? (
            <>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Input value={active.title} onChange={(e) => setActive({ ...active, title: e.target.value })} className="border-0 px-0 text-lg font-semibold shadow-none focus-visible:ring-0" />
                  <Input value={active.subject} onChange={(e) => setActive({ ...active, subject: e.target.value })} placeholder="Disciplina" className="border-0 px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0" />
                </div>
                <div className="flex gap-1">
                  <Button onClick={save}>Guardar</Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(active.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea value={active.content} onChange={(e) => setActive({ ...active, content: e.target.value })} className="min-h-[400px] resize-none" placeholder="Escreve aqui..." />
              </CardContent>
            </>
          ) : (
            <CardContent className="py-20 text-center text-sm text-muted-foreground">Selecione ou crie uma nota.</CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
