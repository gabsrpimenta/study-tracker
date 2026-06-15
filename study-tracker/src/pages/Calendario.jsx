import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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

const monthsLabels = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const monthsShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState(null);

  // Estado para controlar o mês/ano visível na grade do calendário
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Funções auxiliares para gerar a grade do calendário dinâmico
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  function changeMonth(direction) {
    setCurrentDate(new Date(year, month + direction, 1));
  }

  function handleDayClick(day) {
    if (!day) return;
    const formattedDate = `${day}/${monthsShort[month]}`;
    setEditing(null);
    setForm({ ...empty, date: formattedDate });
    setOpen(true);
  }

  // Filtra os eventos correspondentes a cada dia da grade
  function getEventsForDay(day) {
    if (!day) return [];
    const monthLabelLower = monthsShort[month].toLowerCase();
    const zeroPaddedDay = String(day).padStart(2, "0");
    const zeroPaddedMonth = String(month + 1).padStart(2, "0");

    return events.filter((e) => {
      if (!e.date) return false;
      const dStr = e.date.toLowerCase();
      return (
        dStr === `${day}/${monthsShort[month]}`.toLowerCase() ||
        dStr === `${zeroPaddedDay}/${zeroPaddedMonth}` ||
        dStr.includes(`${year}-${zeroPaddedMonth}-${zeroPaddedDay}`) ||
        (dStr.includes(String(day)) && dStr.includes(monthLabelLower))
      );
    });
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-4">
        {/* LADO ESQUERDO: Calendário Dinâmico em Grade */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">
              {monthsLabels[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Dias da Semana */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground pb-2">
              {daysOfWeek.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            
            {/* Grade de Dias */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isToday = day && 
                  day === new Date().getDate() && 
                  month === new Date().getMonth() && 
                  year === new Date().getFullYear();

                return (
                  <div
                    key={idx}
                    onClick={() => day && handleDayClick(day)}
                    className={`min-h-[75px] rounded-md border p-1.5 flex flex-col justify-between transition-colors ${
                      day ? "cursor-pointer hover:bg-accent/40 bg-card" : "bg-muted/10 border-transparent pointer-events-none"
                    } ${isToday ? "border-primary bg-primary/5 ring-1 ring-primary" : ""}`}
                  >
                    {day && (
                      <>
                        <span className={`text-xs font-semibold ${isToday ? "text-primary" : "text-foreground/70"}`}>
                          {day}
                        </span>
                        {/* Indicadores Visuais de Eventos */}
                        <div className="flex flex-col gap-0.5 mt-1 max-h-[45px] overflow-y-auto">
                          {dayEvents.slice(0, 3).map((e) => (
                            <div 
                              key={e.id} 
                              title={`${e.name} (${e.type})`}
                              className={`text-[9px] px-1 py-0.5 rounded-sm truncate border font-medium ${
                                e.type === "Teste" ? "bg-destructive/10 text-destructive border-destructive/20" :
                                e.type === "Entrega" ? "bg-warning/15 text-warning border-warning/30" :
                                "bg-primary/10 text-primary border-primary/20"
                              }`}
                            >
                              {e.name}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-muted-foreground text-center font-bold">
                              +{dayEvents.length - 3} mais
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* LADO DIREITO: Lista de Eventos Original */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Todos os eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {events.length === 0 && <p className="text-sm text-muted-foreground">Sem eventos.</p>}
            {events.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3 bg-card">
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
      </div>

      {/* Diálogos Originais mantidos sem alterações */}
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