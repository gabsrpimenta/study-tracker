import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { register } from "@/lib/auth";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(nome, email, senha);
      toast.success("Conta criada! Agora podes entrar.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-slate-50/50 dark:bg-background overflow-hidden">
      
      {/* INJEÇÃO DE ANIMAÇÃO NATIVA (Garante que funciona e não quebra o ecrã) */}
      <style>{`
        @keyframes stFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stFadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .st-animate-card { animation: stFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .st-animate-icon { animation: stFadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; }
        .st-animate-title { animation: stFadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards; }
        .st-animate-form { animation: stFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards; }
      `}</style>

      {/* PADRÃO DE FUNDO GEOMÉTRICO SUTIL */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02]" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      {/* CARD PRINCIPAL COM ANIMAÇÃO DE ENTRADA SUAVE COMPATÍVEL */}
      <div className="relative z-10 w-full max-w-md space-y-8 p-10 bg-card rounded-3xl border border-border shadow-2xl transition-all duration-300 group opacity-0 st-animate-card">
        
        {/* BRANDING (Logótipo e Título) */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-700 group-hover:rotate-[15deg] opacity-0 st-animate-icon">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground opacity-0 st-animate-title">
            Criar Conta
          </h1>
          <p className="text-sm text-muted-foreground opacity-0 st-animate-title">
            Junta-te ao Study Tracker e organiza os teus estudos.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form 
          onSubmit={handleSubmit} 
          className="space-y-5 opacity-0 st-animate-form"
        >
          {/* CAMPO: NOME */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground/90">
              Nome Completo
            </Label>
            <Input 
              type="text" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              required 
              placeholder="O teu nome"
              className="h-11 bg-background border-muted transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>

          {/* CAMPO: EMAIL */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground/90">
              Endereço de Email
            </Label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="nome@exemplo.com"
              className="h-11 bg-background border-muted transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>

          {/* CAMPO: SENHA */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground/90">
              Palavra-passe
            </Label>
            <div className="relative">
              <Input
                type={showSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="••••••••"
                className="h-11 pr-10 bg-background border-muted transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* BOTÃO DE SUBMISSÃO COM FEEDBACK PRESTRESCENTE */}
          <Button 
            type="submit" 
            className="w-full h-11 shadow-sm mt-3 gap-2 transition-all duration-200 active:scale-[0.98] bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                A criar...
              </span>
            ) : (
              "Criar Conta"
            )}
          </Button>

          {/* LINK DE LOGIN CLEAN */}
          <div className="text-center pt-3 border-t border-border mt-5">
            <p className="text-sm text-muted-foreground">
              Já tens conta?{" "}
              <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline transition-all">
                Entra aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}