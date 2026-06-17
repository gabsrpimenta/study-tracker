import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarDays, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Dialog, Select } from "@/components/ui/Dialog";
// IMPORTAÇÃO BLINDADA: Importa como objeto para o Vite nunca dar erro de tela branca
import * as API from "@/lib/api";

const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];

const hours = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", 
  "20:00", "21:00", "22:00"
];

const endHours = [...hours, "23:00"];

const empty = { day: "Seg", start: "08:00", end: "09:00", subject: "", room: "" };

// Função de conversão ultra-segura contra formatos inesperados
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
};

// Cores dinâmicas automáticas para organização visual
const getSubjectColor = (subject) => {
  const colors = [
    { bg: "bg-blue-500/10 dark:bg-blue-500/5", border: "border-blue-500/20", text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500" },
    { bg: "bg-emerald-500/10 dark:bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
    { bg: "bg-purple-500/10 dark:bg-purple-500/5", border: "border-purple-500/20", text: "text-purple-600 dark:text-purple-400", bar: "bg-purple-500" },
    { bg: "bg-amber-500/10 dark:bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
    { bg: "bg-rose-500/10 dark:bg-rose-500/5", border: "border-rose-500/20", text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500" },
    { bg: "bg-indigo-500/10 dark:bg-indigo-500/5", border: "border-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400", bar: "bg-indigo-500" }
  ];
  if (!subject) return colors[0];
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Horario() {
  const [items, setItems] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => { 
    // Carrega os horários de forma segura
    if (API.listSchedule) {
      API.listSchedule().then((dados) => setItems(dados || [])); 
    }
    
    // Tenta carregar disciplinas se a função existir na API (C# MateriasController)
    if (API.listMaterias) {
      API.listMaterias().then((dados) => setMaterias(dados || []));
    } else if (API.getMaterias) {
      API.getMaterias().then((dados) => setMaterias(dados || []));
    }
  }, []);

  async function save() {
    const subjectValue = form.subject || form.Subject;
    if (!subjectValue || !subjectValue.trim()) { toast.error("Disciplina obrigatória"); return; }
    
    if (timeToMinutes(form.end) <= timeToMinutes(form.start)) {
      toast.error("A hora de término deve ser superior à hora de início.");
      return;
    }

    try {
      if (API.createSchedule) {
        const c = await API.createSchedule(form);
        setItems((p) => [{ id: c?.id || c?.Id || Date.now().toString(), ...form, ...c }, ...p]);
        setOpen(false);
        toast.success("Aula adicionada ao horário.");
      }
    } catch (error) {
      toast.error("Erro ao adicionar aula.");
    }
  }

  async function remove(id) {
    try {
      if (API.deleteSchedule) {
        await API.deleteSchedule(id);
        setItems((p) => p.filter((x) => (x.id || x.Id) !== id));
        toast.success("Aula removida.");
      }
    } catch (error) {
      toast.error("Erro ao remover aula.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Horário</h1>
          <p className="text-sm text-muted-foreground mt-1">Planeie e visualize a sua distribuição de aulas e blocos de estudo semanais.</p>
        </div>
        <Button 
          onClick={() => { 
            const primeiraMateria = materias[0]?.nome || materias[0]?.Nome || "";
            setForm({ ...empty, subject: primeiraMateria }); 
            setOpen(true); 
          }} 
          className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium self-start sm:self-auto"
        >
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
            {/* Cabeçalho de Dias */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b bg-muted/40 text-muted-foreground">
              <div className="p-3 text-xs font-bold uppercase tracking-wider text-center border-r border-border/60" />
              {days.map((d) => (
                <div key={d} className="p-3 text-center text-xs font-bold uppercase tracking-wider border-r border-border/60 last:border-r-0 text-foreground font-bold">
                  {d}
                </div>
              ))}
            </div>

            {/* Linhas de Horas */}
            {hours.map((h, hourIndex) => {
              const currentMin = timeToMinutes(h);

              return (
                <div key={h} className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border/40 last:border-b-0 hover:bg-muted/5 transition-colors">
                  <div className="p-3 text-center text-xs font-bold text-muted-foreground/80 border-r border-border/60 flex items-center justify-center bg-muted/10">
                    {h}
                  </div>
                  
                  {days.map((d) => {
                    // Mapeamento duplo (Suporta C# PascalCase e JS camelCase)
                    const slot = items.find((x) => {
                      if (!x) return false;
                      const dayProp = x.day || x.Day;
                      const startProp = x.start || x.Start;
                      const endProp = x.end || x.End;
                      if (dayProp !== d) return false;
                      return currentMin >= timeToMinutes(startProp) && currentMin < timeToMinutes(endProp);
                    });

                    if (!slot) {
                      return <div key={d + h} className="p-2 border-r border-border/40 last:border-r-0 min-h-[85px]" />;
                    }

                    const slotId = slot.id || slot.Id;
                    const slotSubject = slot.subject || slot.Subject || "Sem nome";
                    const slotStart = slot.start || slot.Start || "";
                    const slotEnd = slot.end || slot.End || "";
                    const slotRoom = slot.room || slot.Room || "";

                    const startMin = timeToMinutes(slotStart);
                    const endMin = timeToMinutes(slotEnd);

                    const previousHour = hourIndex > 0 ? hours[hourIndex - 1] : null;
                    const belongsToPreviousRow = previousHour && currentMin > startMin && timeToMinutes(previousHour) >= startMin;
                    const isFirstRow = !belongsToPreviousRow;

                    const nextHour = hourIndex < hours.length - 1 ? hours[hourIndex + 1] : null;
                    const belongsToNextRow = nextHour && timeToMinutes(nextHour) < endMin;
                    const isLastRow = !belongsToNextRow;

                    const colorStyle = getSubjectColor(slotSubject);

                    return (
                      <div key={d + h} className="p-2 border-r border-border/40 last:border-r-0 min-h-[85px] flex flex-col justify-stretch">
                        <div className={`
                          group relative flex-1 flex flex-col justify-between border-x pl-4 pr-2 transition-all
                          ${colorStyle.bg} ${colorStyle.border}
                          ${isFirstRow ? "rounded-t-xl border-t pt-2 pb-1" : "border-t-0 pt-0"}
                          ${isLastRow ? "rounded-b-xl border-b pb-2" : "border-b-0 pb-0"}
                          ${!isFirstRow && !isLastRow ? "py-0" : ""}
                        `}>
                          
                          {isFirstRow ? (
                            <>
                              <div className={`absolute left-0 ${colorStyle.bar} w-1 ${isLastRow ? "top-2 bottom-2 rounded-full" : "top-2 bottom-0 rounded-t-full"}`} />
                              
                              <div className="space-y-1">
                                <p className={`font-bold truncate mr-4 ${colorStyle.text}`}>{slotSubject}</p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                                  <Clock className="h-3 w-3 shrink-0 opacity-60" /> {slotStart} – {slotEnd}
                                </p>
                              </div>

                              {slotRoom && (
                                <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-1 font-medium truncate">
                                  <MapPin className="h-3 w-3 shrink-0 opacity-60" /> {slotRoom}
                                </p>
                              )}

                              <button 
                                onClick={() => remove(slotId)} 
                                className="absolute right-2 top-2 p-1 rounded-md bg-background/80 shadow-sm border text-destructive opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-destructive/10 z-10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <div className={`absolute left-0 ${colorStyle.bar} w-1 top-0 ${isLastRow ? "bottom-2 rounded-b-full" : "bottom-0"}`} />
                              <div className="text-[10px] text-muted-foreground/30 italic select-none pt-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                {slotSubject} (cont.)
                              </div>
                            </>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Formulário Inteligente */}
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
          {/* Grid de Tempo com Select Seguro no campo "Fim" */}
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
                onChange={(v) => {
                  const currentHourIndex = hours.indexOf(v);
                  const suggestedEnd = currentHourIndex !== -1 && currentHourIndex + 1 < endHours.length 
                    ? endHours[currentHourIndex + 1] 
                    : endHours[endHours.length - 1];
                  
                  setForm({ ...form, start: v, end: suggestedEnd });
                }} 
                options={hours.map((h) => ({ value: h, label: h }))} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fim</Label>
              <Select 
                value={form.end} 
                onChange={(v) => setForm({ ...form, end: v })} 
                options={endHours.map((h) => ({ value: h, label: h }))} 
              />
            </div>
          </div>

          {/* Automação Inteligente da Disciplina */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome da Disciplina / Evento</Label>
            {materias && materias.length > 0 ? (
              // Se existirem disciplinas vindas da BD, mostra o dropdown automático
              <Select 
                value={form.subject} 
                onChange={(v) => setForm({ ...form, subject: v })} 
                options={materias.map((m) => {
                  const nomeMateria = m.nome || m.Nome || "";
                  return { value: nomeMateria, label: nomeMateria };
                })} 
              />
            ) : (
              // Fallback Seguro: Se a função não existir na API ou não houver dados, deixa escrever à mão livre (Sem quebras)
              <Input 
                className="h-10 rounded-lg focus:ring-1 focus:ring-primary"
                placeholder="Ex: Python" 
                value={form.subject} 
                onChange={(e) => setForm({ ...form, subject: e.target.value })} 
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sala / Link Remoto</Label>
            <Input 
              className="h-10 rounded-lg focus:ring-1 focus:ring-primary"
              placeholder="Ex: Sala 1" 
              value={form.room} 
              onChange={(e) => setForm({ ...form, room: e.target.value })} 
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}