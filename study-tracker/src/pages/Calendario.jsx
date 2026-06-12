import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog, Select } from "@/components/ui/Dialog";
import { listEvents, createEvent, updateEvent, deleteEvent } from "@/lib/api";

const typeStyles = {
  Teste: "bg-destructive/10 text-destructive border-destructive/20",
  Entrega: "bg-warning/15 text-warning border-warning/30",
  Projeto: "bg-primary/10 text-primary border-primary/20",
};
const empty = { name: "", subject: "", date: "", type: "Teste" };

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState(null);

  useEffect(() => { listEvents().then(setEvents); }, []);

  function startCreate() { setEditing(null); setForm(empty); setOpen(true); }
  function startEdit(e) { setEditing(e); setForm({ name: e.name, subject: e.subject, date: e.date, type: e.type }); setOpen(true); }
  async function save() {
    if (!form.name.trim()) { toast.error("Nome obrigatório"); return; }
    if (editing) {
      const u = await updateEvent(editing.id, form);
      setEvents((p) => p.map((x) => (x.id === editing.id ? u : x)));
      toast.success("Evento atualizado.");
    } else {
      const c = await createEvent(form);
      setEvents((p) => [c, ...p]);
      toast.success("Evento criado.");
    }
    setOpen(false);
  }
  async function confirmDelete() {
    await deleteEvent(del);
    setEvents((p) => p.filter((x) => x.id !== del));
    setDel(null);
    toast.success("Removido.");
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">Eventos e prazos académicos.</p>
        </div>
        <Button onClick={startCreate}><Plus className="h-4 w-4" /> Novo evento</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Todos os eventos</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {events.length === 0 && <p className="text-sm text-muted-foreground">Sem eventos.</p>}
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.name}</p>
                <p className="truncate text-xs text-muted-foreground">{e.subject} · {e.date}</p>
              </div>
              <Badge variant="outline" className={typeStyles[e.type]}>{e.type}</Badge>
              <Button size="icon" variant="ghost" onClick={() => startEdit(e)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDel(e.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar evento" : "Novo evento"}
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>}
      >
        <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Disciplina</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Data</Label><Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="25/Mai" /></div>
          <div className="space-y-2"><Label>Tipo</Label>
            <Select value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={[
              { value: "Teste", label: "Teste" }, { value: "Entrega", label: "Entrega" }, { value: "Projeto", label: "Projeto" },
            ]} />
          </div>
        </div>
      </Dialog>

      <Dialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Eliminar evento?"
        description="Esta ação não pode ser desfeita."
        footer={<>
          <Button variant="outline" onClick={() => setDel(null)}>Cancelar</Button>
          <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
        </>}
      />
    </>
  );
}
