import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Calendar, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Primitives";
import { Dialog, Select } from "@/components/ui/Dialog";
// IMPORTAÇÃO BLINDADA: Evita erros de compilação e tela branca
import * as API from "@/lib/api";

const typeStyles = {
  Teste: "bg-destructive/10 text-destructive border-destructive/20 font-medium",
  Entrega: "bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium",
  Projeto: "bg-primary/10 text-primary border-primary/20 font-medium",
};

const empty = { name: "", subject: "", date: "", type: "Teste" };
const monthsLabels = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [materias, setMaterias] = useState([]); // Armazena disciplinas da BD
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => { 
    // Carrega eventos com segurança
    if (API.listEvents) {
      API.listEvents().then((dados) => setEvents(dados || [])); 
    }

    // Carrega as disciplinas cadastradas para o Dropdown automático
    if (API.listMaterias) {
      API.listMaterias().then((dados) => setMaterias(dados || []));
    } else if (API.getMaterias) {
      API.getMaterias().then((dados) => setMaterias(dados || []));
    }
  }, []);

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
    
    // Auto-seleciona a primeira disciplina disponível para facilitar a vida ao utilizador
    const primeiraMateria = materias[0]?.nome || materias[0]?.Nome || "";
    
    setEditing(null);
    setForm({ ...empty, date: `${dayStr}/${monthStr}`, subject: primeiraMateria });
    setOpen(true);
  }

  async function save() {
    const nameVal = form.name || form.Name;
    if (!nameVal || !nameVal.trim()) { toast.error("Nome do evento obrigatório"); return; }
    
    try {
      if (editing) {
        if (API.updateEvent) {
          const u = await API.updateEvent(editing.id || editing.Id, form);
          setEvents((p) => p.map((x) => ((x.id || x.Id) === (editing.id || editing.Id) ? u : x)));
          toast.success("Evento atualizado.");
        }
      } else {
        if (API.createEvent) {
          const c = await API.createEvent(form);
          setEvents((p) => [c, ...p]);
          toast.success("Evento criado.");
        }
      }
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao guardar o evento.");
    }
  }

  async function remove(id) {
    try {
      if (API.deleteEvent) {
        await API.deleteEvent(id);
        setEvents((p) => p.filter((x) => (x.id || x.Id) !== id));
        toast.success("Evento removido.");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Erro ao remover evento.");
    }
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells = [...Array(new Date(year, month, 1).getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize os marcos importantes do seu semestre.</p>
        </div>
        <Button 
          onClick={() => { 
            const primeiraMateria = materias[0]?.nome || materias[0]?.Nome || "";
            setEditing(null);
            setForm({ ...empty, subject: primeiraMateria }); 
            setOpen(true); 
          }} 
          className="rounded-xl h-10 px-5 gap-2 font-medium"
        >
          <Plus className="h-4 w-4" /> Novo evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card do Calendário */}
        <Card className="lg:col-span-2 rounded-2xl border shadow-sm overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-lg font-bold">{monthsLabels[month]} {year}</CardTitle>
              <CardDescription>Clique em qualquer dia livre para agendar.</CardDescription>
            </div>
            <div className="flex border rounded-xl p-1 bg-background">
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setCurrentDate(new Date(year, month - 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setCurrentDate(new Date(year, month + 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 p-3 sm:p-6">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pb-3">
              {daysOfWeek.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((day, i) => {
                // Filtra os eventos que pertencem a este dia específico do mês atual
                const dayStr = String(day).padStart(2, "0");
                const monthStr = String(month + 1).padStart(2, "0");
                const targetDateStr = `${dayStr}/${monthStr}`;

                const dayEvents = events.filter(e => {
                  if (!e) return false;
                  const eDate = e.date || e.Date || "";
                  return eDate.startsWith(targetDateStr);
                });

                return (
                  <div 
                    key={i} 
                    onClick={() => day && handleDayClick(day)} 
                    className={`min-h-[95px] rounded-xl border p-2 flex flex-col justify-between transition-all group
                      ${day ? "cursor-pointer hover:bg-muted/40 bg-muted/5 border-border/60" : "opacity-0 pointer-events-none"}`}
                  >
                    {day && (
                      <>
                        <span className="text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">{day}</span>
                        {/* Renderização de mini badges das entregas/testes do dia */}
                        <div className="space-y-1 mt-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map((de, idx) => {
                            const deType = de.type || de.Type || "Teste";
                            const deName = de.name || de.Name || "";
                            return (
                              <div key={idx} className={`text-[9px] px-1.5 py-0.5 rounded-md border truncate font-medium ${typeStyles[deType] || typeStyles.Teste}`}>
                                {deName}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-[8px] text-muted-foreground text-center font-bold">
                              +{dayEvents.length - 2} mais
                            </div>
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

        {/* Card de Listagem Lateral */}
        <Card className="rounded-2xl border shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-bold">Próximos Eventos</CardTitle>
            <CardDescription>Marcos agendados ordenados.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 max-h-[500px] overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 mx-auto mb-3">
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Sem eventos agendados</p>
                <p className="text-xs text-muted-foreground mt-1">Selecione um dia no calendário para começar.</p>
              </div>
            ) : (
              events.map(e => {
                const eId = e.id || e.Id;
                const eName = e.name || e.Name || "Sem Nome";
                const eDate = e.date || e.Date || "";
                const eSubject = e.subject || e.Subject || "";
                const eType = e.type || e.Type || "Teste";

                return (
                  <div key={eId} className="flex items-center justify-between p-3.5 rounded-xl border bg-background/50 hover:border-primary/30 hover:bg-background transition-all group">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground truncate">{eName}</p>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full border ${typeStyles[eType] || typeStyles.Teste}`}>
                          {eType}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3 opacity-60" /> {eDate} {eSubject && `• ${eSubject}`}
                      </p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-lg opacity-80 group-hover:opacity-100 border border-transparent group-hover:border-border group-hover:bg-card" 
                      onClick={() => { setEditing(e); setForm(e); setOpen(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog do Formulário Otimizado */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        title={editing ? "Editar Evento" : "Novo Evento"} 
        footer={<>
          {editing && (
            <Button 
              variant="ghost" 
              className="text-destructive hover:bg-destructive/10 rounded-xl mr-auto h-10 px-4" 
              onClick={() => remove(editing.id || editing.Id)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </Button>
          )}
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-10 px-5" onClick={save}>Guardar Evento</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome do Evento</Label>
            <Input value={form.name || form.Name || ""} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Ex: Ficha de Avaliação 1" className="rounded-lg h-10 focus:ring-1 focus:ring-primary" />
          </div>
          
          {/* Campo de Disciplina Inteligente com Dropdown Automático */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disciplina</Label>
            {materias && materias.length > 0 ? (
              <Select 
                value={form.subject || form.Subject || ""} 
                onChange={(v) => setForm({...form, subject: v})} 
                options={materias.map((m) => {
                  const nomeM = m.nome || m.Nome || "";
                  return { value: nomeM, label: nomeM };
                })} 
              />
            ) : (
              <Input 
                value={form.subject || form.Subject || ""} 
                onChange={(e) => setForm({...form, subject: e.target.value})} 
                placeholder="Ex: Engenharia de Software" 
                className="rounded-lg h-10 focus:ring-1 focus:ring-primary" 
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data (DD/MM)</Label>
              <Input value={form.date || form.Date || ""} maxLength={5} onChange={(e) => handleDateChange(e.target.value)} placeholder="Ex: 24/06" className="rounded-lg h-10 text-center font-semibold focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria</Label>
              <Select 
                value={form.type || form.Type || "Teste"} 
                onChange={(v) => setForm({...form, type: v})} 
                options={[
                  { value: "Teste", label: "📝 Teste / Exame" }, 
                  { value: "Entrega", label: "📤 Entrega de Trabalho" }, 
                  { value: "Projeto", label: "💻 Projeto" }
                ]} 
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}