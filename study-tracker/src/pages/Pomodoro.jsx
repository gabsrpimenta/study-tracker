import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { createSession, listSessions } from "@/lib/api";

export default function Pomodoro() {
  const [mode, setMode] = useState("focus");
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [subject, setSubject] = useState("Matemática");
  const [history, setHistory] = useState([]);
  const ref = useRef(null);

  useEffect(() => { listSessions().then(setHistory); }, []);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(ref.current);
          setRunning(false);
          if (mode === "focus") {
            createSession({ subject, minutes: focusMin, date: new Date().toISOString().slice(0, 10) }).then((c) => {
              setHistory((p) => [c, ...p]);
            });
            toast.success(`Sessão concluída: ${focusMin} min de ${subject}!`);
            setMode("break");
            return breakMin * 60;
          } else {
            toast("Pausa terminada.");
            setMode("focus");
            return focusMin * 60;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running, mode, focusMin, breakMin, subject]);

  function reset() {
    setRunning(false);
    setSeconds((mode === "focus" ? focusMin : breakMin) * 60);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const total = (mode === "focus" ? focusMin : breakMin) * 60;
  const pct = ((total - seconds) / total) * 100;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMin = history.filter((h) => h.date === todayKey).reduce((a, b) => a + b.minutes, 0);

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pomodoro</h1>
        <p className="text-muted-foreground">Foco em ciclos. Sessões guardadas automaticamente.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === "focus" ? <Brain className="h-5 w-5 text-primary" /> : <Coffee className="h-5 w-5 text-success" />}
              {mode === "focus" ? "Foco" : "Pausa"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-10">
            <div className="relative h-56 w-56">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={mode === "focus" ? "hsl(var(--primary))" : "hsl(var(--success))"}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - pct / 100)}
                  className="transition-all"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold tabular-nums">{mm}:{ss}</span>
                <span className="text-sm text-muted-foreground">{subject}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="lg" onClick={() => setRunning((r) => !r)}>
                {running ? <><Pause className="h-4 w-4" /> Pausar</> : <><Play className="h-4 w-4" /> Iniciar</>}
              </Button>
              <Button size="lg" variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /> Reiniciar</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Configurações</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2"><Label>Disciplina</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Foco (min)</Label><Input type="number" value={focusMin} onChange={(e) => { const v = Number(e.target.value); setFocusMin(v); if (mode === "focus") setSeconds(v * 60); }} /></div>
                <div className="space-y-2"><Label>Pausa (min)</Label><Input type="number" value={breakMin} onChange={(e) => { const v = Number(e.target.value); setBreakMin(v); if (mode === "break") setSeconds(v * 60); }} /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Hoje</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{(todayMin / 60).toFixed(1)}h</p>
              <p className="text-sm text-muted-foreground">{todayMin} min</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
