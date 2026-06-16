import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Calendar, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog, Select } from "@/components/ui/Dialog";
import { listEvents, createEvent, updateEvent, deleteEvent } from "@/lib/api";

const typeStyles = {
  Teste: "bg-destructive/10 text-destructive border-destructive/20 font-medium",
  Entrega: "bg-warning/15 text-warning border-warning/30 font-medium",
  Projeto: "bg-primary/10 text-primary border-primary/20 font-medium",
};

const empty = { name: "", subject: "", date: "", type: "Teste" };
const monthsLabels = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => { listEvents().then(setEvents); }, []);

  function handleDateChange(value) {
    let rawValue = value.replace(/\D/g, "");
    if (rawValue.length > 4) rawValue = rawValue.slice(0, 4);
    let formattedValue = rawValue;
    if (rawValue.length > 2) formattedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2)}`;
    setForm({ ...form, date: formattedValue });
  }

  function handleDayClick(day) {
    const dayStr = String(day).padStart(2, "0");
    const monthStr = String(currentDate.getMonth() + 1).padStart(2, "0");
    setEditing(null);
    setForm({ ...empty, date: `${dayStr}/${monthStr}` });
    setOpen(true);
  }

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells = [...Array(new Date(year, month, 1).getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize os marcos importantes do seu semestre.</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }} className="rounded-xl h-10 px-5 gap-2">
          <Plus className="h-4 w-4" /> Novo evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <CardTitle className="text-base font-bold">{monthsLabels[month]} {year}</CardTitle>
            <div className="flex border rounded-xl p-1 bg-background">
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setCurrentDate(new Date(year, month - 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setCurrentDate(new Date(year, month + 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground pb-2">{daysOfWeek.map(d => <div key={d}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((day, i) => (
                <div key={i} onClick={() => day && handleDayClick(day)} className={`min-h-[80px] rounded-xl border p-2 ${day ? "cursor-pointer hover:bg-muted/30" : "opacity-0"}`}>
                  {day && <span className="text-xs font-bold">{day}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3 border-b"><CardTitle className="text-base">Próximos Eventos</CardTitle></CardHeader>
          <CardContent className="pt-4 space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 mx-auto mb-3">
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Sem eventos agendados</p>
                <p className="text-xs text-muted-foreground mt-1">Clique num dia para adicionar algo.</p>
              </div>
            ) : events.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary/20 transition-all">
                <div><p className="text-sm font-semibold">{e.name}</p><p className="text-xs text-muted-foreground">{e.date}</p></div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => {setEditing(e); setForm(e); setOpen(true)}}><Pencil className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar Evento" : "Novo Evento"} footer={
        <><Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button className="rounded-xl h-10 px-5" onClick={save}>Guardar Evento</Button></>
      }>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase">Nome</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="rounded-lg" /></div>
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase">Disciplina</Label><Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="rounded-lg" /></div>
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase">Data (DD/MM)</Label><Input value={form.date} maxLength={5} onChange={(e) => handleDateChange(e.target.value)} className="rounded-lg" /></div>
          <div className="space-y-1.5"><Label className="text-xs font-bold uppercase">Categoria</Label><Select value={form.type} onChange={(v) => setForm({...form, type: v})} options={[{value:"Teste", label:"Teste"}, {value:"Entrega", label:"Entrega"}, {value:"Projeto", label:"Projeto"}]} /></div>
        </div>
      </Dialog>
    </div>
  );
}