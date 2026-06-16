import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarDays, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Dialog, Select } from "@/components/ui/Dialog";
import { listSchedule, createSchedule, deleteSchedule } from "@/lib/api";

const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const empty = { day: "Seg", start: "08:00", end: "09:30", subject: "", room: "" };

export default function Horario() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => { 
    listSchedule().then(setItems); 
  }, []);

  async function save() {
    if (!form.subject.trim()) { toast.error("Disciplina obrigatória"); return; }
    const c = await createSchedule(form);
    setItems((p) => [c, ...p]);
    setOpen(false);
    toast.success("Aula adicionada ao horário.");
  }

  async function remove(id) {
    await deleteSchedule(id);
    setItems((p) => p.filter((x) => x.id !== id));
    toast.success("Aula removida.");
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Horário</h1>
          <p className="text-sm text-muted-foreground mt-1">Planeie e visualize a sua distribuição de aulas e blocos de estudo semanais.</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }} className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Nova aula
        </Button>
      </div>

      {/* Tabela/Grelha de Horários */}
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Calendário Semanal</CardTitle>
            <CardDescription>Distribuição horária de Segunda a Sexta-feira.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto p-0 bg-card/20">
          <div className="min-w-[800px]">
            {/* Dias da Semana (Cabeçalho) */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b bg-muted/40 text-muted-foreground">
              <div className="p-3 text-xs font-bold uppercase tracking-wider text-center border-r border-border/60" />
              {days.map((d) => (
                <div key={d} className="p-3 text-center text-xs font-bold uppercase tracking-wider border-r border-border/60 last:border-r-0">
                  {d}
                </div>
              ))}
            </div>

            {/* Linhas de Horas */}
            {hours.map((h) => (
              <div key={h} className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border/40 last:border-b-0 hover:bg-muted/10 transition-colors">
                {/* Indicador de Hora Lateral */}
                <div className="p-3 text-center text-xs font-semibold text-muted-foreground/80 border-r border-border/60 flex items-center justify-center bg-muted/10">
                  {h}
                </div>
                
                {/* Células dos Dias */}
                {days.map((d) => {
                  const slot = items.find((x) => x.day === d && x.start === h);
                  return (
                    <div key={d + h} className="p-2 border-r border-border/40 last:border-r-0 min-h-[80px] flex flex-col justify-stretch">
                      {slot ? (
                        <div className="group relative flex-1 flex flex-col justify-between rounded-xl bg-primary/5 border border-primary/10 pl-3 pr-2 py-2 text-xs transition-all hover:bg-primary/10 hover:border-primary/20 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-primary before:rounded-full">
                          
                          {/* Conteúdo da Aula */}
                          <div className="space-y-1">
                            <p className="font-bold text-foreground truncate">{slot.subject}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                              <Clock className="h-3 w-3 shrink-0" /> {slot.start} – {slot.end}
                            </p>
                          </div>

                          {slot.room && (
                            <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-1 font-medium truncate">
                              <MapPin className="h-3 w-3 shrink-0 text-primary/60" /> {slot.room}
                            </p>
                          )}

                          {/* Ação de Eliminar Discreta */}
                          <button 
                            onClick={() => remove(slot.id)} 
                            className="absolute right-2 top-2 p-1 rounded-md bg-background/80 shadow-sm border text-destructive opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Formulário de Criação */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nova Aula / Bloco Horário"
        footer={<>
          <Button variant="outline" className="rounded-xl h-10" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="rounded-xl h-10 px-5" onClick={save}>Adicionar Bloco</Button>
        </>}
      >
        <div className="space-y-4 py-2">
          {/* Configuração de Tempo Inline */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dia</Label>
              <Select 
                value={form.day} 
                onChange={(v) => setForm({ ...form, day: v })} 
                options={days.map((d) => ({ value: d, label: d }))} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Início</Label>
              <Select 
                value={form.start} 
                onChange={(v) => setForm({ ...form, start: v })} 
                options={hours.map((h) => ({ value: h, label: h }))} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fim</Label>
              <Input 
                className="h-10 rounded-lg focus:ring-1 focus:ring-primary"
                placeholder="Ex: 09:30" 
                value={form.end} 
                onChange={(e) => setForm({ ...form, end: e.target.value })} 
              />
            </div>
          </div>

          {/* Dados Descritivos */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome da Disciplina / Evento</Label>
            <Input 
              className="h-10 rounded-lg focus:ring-1 focus:ring-primary"
              placeholder="Ex: Inteligência Artificial" 
              value={form.subject} 
              onChange={(e) => setForm({ ...form, subject: e.target.value })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sala / Link Remoto</Label>
            <Input 
              className="h-10 rounded-lg focus:ring-1 focus:ring-primary"
              placeholder="Ex: Laboratório 3 (Bloco B)" 
              value={form.room} 
              onChange={(e) => setForm({ ...form, room: e.target.value })} 
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}