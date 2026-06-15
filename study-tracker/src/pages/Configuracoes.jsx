import { useState, useEffect } from "react";
import { Palette, User, Bell, Lock, Globe, Save, Check, Image, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge, Switch } from "@/components/ui/Primitives";
import { getUser } from "@/lib/auth";

const avataresDisponiveis = [
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Gaby&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Gabriella&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Sofia&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Matilde&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Beatriz&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Ana&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Ines&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Lara&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Clara&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Carolina&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Tiago&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Joao&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Pedro&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Lucas&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Martim&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Afonso&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Tomas&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Goncalo&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Rodrigo&backgroundColor=f1f5f9",
  "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=Miguel&backgroundColor=f1f5f9",
];

export default function Configuracoes() {
  const user = getUser();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [form, setForm] = useState({
    themeDark: true,
    name: "Gabriella Pimenta",
    email: "seu.email@exemplo.com",
    avatarUrl: "",         
    customUrlInput: "",    
    emailAlerts: true,
    pushNotifications: false,
    focusMode: true,
    timezone: "Europe/London"
  });

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("user_settings"));
    if (savedSettings) {
      const urlGuardada = savedSettings.avatarUrl || "";
      const ehExterna = urlGuardada && !urlGuardada.includes("api.dicebear.com");

      setForm({
        ...savedSettings,
        avatarUrl: urlGuardada,
        customUrlInput: ehExterna ? urlGuardada : ""
      });
    } else {
      setForm((prev) => ({
        ...prev,
        name: user?.nome || "Gabriella Pimenta",
        email: user?.email || "seu.email@exemplo.com"
      }));
    }
  }, [user]);

  // Função para gerar as iniciais baseadas estritamente no nome atual do formulário
  const obterIniciais = (nome) => {
    if (!nome) return "?";
    const partes = nome.trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0].substring(0, 2).toUpperCase();
  };

  const mostrarNotificacao = (msg, tipo = "success") => {
    setToast({ show: true, message: msg, type: tipo });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const selecionarAvatarGaleria = (urlAvatar) => {
    setForm((prev) => ({
      ...prev,
      avatarUrl: urlAvatar,
      customUrlInput: "" 
    }));
  };

  const alterarUrlExterna = (urlDigitada) => {
    setForm((prev) => ({
      ...prev,
      customUrlInput: urlDigitada,
      avatarUrl: urlDigitada 
    }));
  };

  const removerImagem = () => {
    setForm((prev) => ({
      ...prev,
      avatarUrl: "",
      customUrlInput: ""
    }));
  };

  async function handleSave() {
    setLoading(true);
    try {
      localStorage.setItem("user_settings", JSON.stringify(form));
      mostrarNotificacao("Configurações guardadas com sucesso!");
    } catch (error) {
      mostrarNotificacao("Erro ao guardar as configurações.", "error");
    } finally {
      setLoading(false);
    }
  }

  const iniciaisDinamicas = obterIniciais(form.name);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative">
      
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-md transition-all animate-in fade-in slide-in-from-top-3 ${toast.type === "success" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalize a sua experiência e o seu ambiente de estudo.</p>
      </div>

      {/* APARÊNCIA */}
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Aparência</CardTitle>
            <CardDescription>Escolha o tema visual da sua interface.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between p-1">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground">Tema escuro</label>
              <p className="text-xs text-muted-foreground">Reduz o brilho do ecrã durante a noite.</p>
            </div>
            <Switch checked={form.themeDark} onCheckedChange={(v) => setForm({ ...form, themeDark: v })} />
          </div>
        </CardContent>
      </Card>

      {/* PERFIL */}
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Perfil</CardTitle>
            <CardDescription>Gerencie as suas informações de identificação.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 border-t pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome</label>
              <input 
                type="text" value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
              <input 
                type="email" value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IMAGEM DE PERFIL DINÂMICA */}
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Image className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Imagem de Perfil</CardTitle>
            <CardDescription>Altere livremente entre as 20 ilustrações Notion ou use a sua própria foto.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 border-t pt-5">
          
          {/* Visualização Atual Baseada nas Iniciais do Nome do Input */}
          <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-dashed">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border-2 border-primary font-bold text-lg overflow-hidden select-none">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Visualização" className="h-full w-full object-cover" />
              ) : (
                <span className="text-primary">{iniciaisDinamicas}</span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">Avatar Ativo no Momento</p>
              {form.avatarUrl && (
                <button
                  type="button"
                  onClick={removerImagem}
                  className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline font-medium"
                >
                  <Trash2 className="h-3 w-3" /> Remover imagem e usar "{iniciaisDinamicas}"
                </button>
              )}
            </div>
          </div>

          {/* Galeria Dinâmica */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Galeria de Ilustrações (20 opções)</label>
            <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto p-2 border rounded-xl bg-background shadow-inner">
              {avataresDisponiveis.map((url, idx) => {
                const isSelected = form.avatarUrl === url;
                return (
                  <button
                    key={idx} type="button"
                    onClick={() => selecionarAvatarGaleria(url)}
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-105 ${isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border hover:border-muted-foreground"}`}
                  >
                    <img src={url} alt={`Avatar ${idx + 1}`} className="h-full w-full object-cover rounded-full" />
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-white shadow">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input de Texto */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ou cola o link (URL) da tua imagem pessoal</label>
            <input 
              type="url" 
              value={form.customUrlInput} 
              onChange={(e) => alterarUrlExterna(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder="https://exemplo.com/minha-foto.jpg"
            />
            <p className="text-[11px] text-muted-foreground">Podes apagar o texto ou clicar num avatar acima a qualquer altura para mudar instantaneamente.</p>
          </div>
        </CardContent>
      </Card>

      {/* NOTIFICAÇÕES */}
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Notificações</CardTitle>
            <CardDescription>Escolha como deseja ser alertado.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between p-1">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground">Alertas por Email</label>
              <p className="text-xs text-muted-foreground">Resumo diário de produtividade na caixa de entrada.</p>
            </div>
            <Switch checked={form.emailAlerts} onCheckedChange={(v) => setForm({ ...form, emailAlerts: v })} />
          </div>
          <div className="flex items-center justify-between p-1 border-t pt-4">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground">Notificações Push</label>
              <p className="text-xs text-muted-foreground">Alertas diretos no navegador sobre Pomodoros.</p>
            </div>
            <Switch checked={form.pushNotifications} onCheckedChange={(v) => setForm({ ...form, pushNotifications: v })} />
          </div>
        </CardContent>
      </Card>

      {/* SEGURANÇA */}
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Segurança</CardTitle>
            <CardDescription>Privacidade e definições regionais.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between p-1">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground">Modo de foco automático</label>
              <p className="text-xs text-muted-foreground">Bloqueia distrações ao iniciar cronómetros.</p>
            </div>
            <Switch checked={form.focusMode} onCheckedChange={(v) => setForm({ ...form, focusMode: v })} />
          </div>
          
          <div className="space-y-1.5 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
              <Globe className="h-5 w-5 text-muted-foreground" />
              Fuso Horário
            </div>
            <select 
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:ring-1 focus:ring-primary appearance-none"
            >
              <option value="Europe/London">Lisboa / Londres (GMT+0)</option>
              <option value="Europe/Madrid">Madrid / Paris (GMT+1)</option>
              <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* BOTÃO SALVAR */}
      <div className="flex justify-end mt-2 pb-8">
        <button
          type="button" onClick={handleSave} disabled={loading}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground h-11 px-6 rounded-xl font-medium shadow transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {loading ? "A guardar..." : "Guardar Alterações"}
        </button>
      </div>
    </div>
  );
}