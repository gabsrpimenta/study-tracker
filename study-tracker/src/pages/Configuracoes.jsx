import { Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Primitives";
import { useTheme } from "@/context/ThemeContext";

export default function Configuracoes() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Personalize a sua experiência.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Aparência</CardTitle><CardDescription>Tema claro ou escuro.</CardDescription></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <div>
              <Label>Tema escuro</Label>
              <p className="text-sm text-muted-foreground">Reduz o brilho durante a noite.</p>
            </div>
          </div>
          <Switch checked={isDark} onChange={(v) => setTheme(v ? "dark" : "light")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label>Nome</Label><Input defaultValue="Gabriella" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" defaultValue="gabriella@studytracker.app" /></div>
          </div>
          <Button>Guardar alterações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notificações</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><Label>Email</Label><p className="text-sm text-muted-foreground">Resumo diário por email.</p></div>
            <Switch checked onChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Push</Label><p className="text-sm text-muted-foreground">Notificações no navegador.</p></div>
            <Switch checked={false} onChange={() => {}} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
