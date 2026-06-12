import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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

  useEffect(() => { listSchedule().then(setItems); }, []);

  async function save() {
    if (!form.subject.trim()) { toast.error("Disciplina obrigatória"); return; }
    const c = await createSchedule(form);
    setItems((p) => [c, ...p]);
    setOpen(false);
    toast.success("Aula criada.");
  }
  async function remove(id) {
    await deleteSchedule(id);
    setItems((p) => p.filter((x) => x.id !== id));
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Horário</h1>
          <p className="text-muted-foreground">Grelha semanal de aulas.</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="h-4 w-4" /> Nova aula</Button>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <div className="grid min-w-[700px] grid-cols-[60px_repeat(5,1fr)] border-b">
            <div className="border-r p-2" />
            {days.map((d) => <div key={d} className="border-r p-2 text-center text-sm font-semibold last:border-r-0">{d}</div>)}
          </div>
          {hours.map((h) => (
            <div key={h} className="grid min-w-[700px] grid-cols-[60px_repeat(5,1fr)] border-b">
              <div className="border-r p-2 text-xs text-muted-foreground">{h}</div>
              {days.map((d) => {
                const slot = items.find((x) => x.day === d && x.start === h);
                return (
                  <div key={d + h} className="border-r p-1 last:border-r-0 min-h-[56px]">
                    {slot && (
                      <div className="group relative h-full rounded-md bg-primary/10 p-2 text-xs">
                        <p className="font-medium text-primary">{slot.subject}</p>
                        <p className="text-muted-foreground">{slot.start}–{slot.end}</p>
                        <p className="text-muted-foreground">{slot.room}</p>
                        <button onClick={() => remove(slot.id)} className="absolute right-1 top-1 hidden text-destructive group-hover:block">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nova aula"
        footer={<>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>}
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label>Dia</Label>
            <Select value={form.day} onChange={(v) => setForm({ ...form, day: v })} options={days.map((d) => ({ value: d, label: d }))} />
          </div>
          <div className="space-y-2"><Label>Início</Label>
            <Select value={form.start} onChange={(v) => setForm({ ...form, start: v })} options={hours.map((h) => ({ value: h, label: h }))} />
          </div>
          <div className="space-y-2"><Label>Fim</Label><Input value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div>
        </div>
        <div className="space-y-2"><Label>Disciplina</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="space-y-2"><Label>Sala</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
      </Dialog>
    </>
  );
}
