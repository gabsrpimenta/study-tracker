// Página de Cadastro: cria uma nova conta de utilizador.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { register } from "@/lib/auth";

export default function Cadastro() {
  // ==========================================
  // 1. ESTADOS (STATE)
  // Guarda os dados que o utilizador digita e controla a animação de carregamento
  // ==========================================
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook do React Router para mudar de página via código

  // ==========================================
  // 2. FUNÇÃO DE SUBMISSÃO DO FORMULÁRIO
  // ==========================================
  async function handleSubmit(e) {
    e.preventDefault(); // Impede que a página faça refresh (comportamento padrão do HTML)
    setLoading(true);   // Desativa o botão e mostra o spinner
    
    try {
      // Chama a função de registo da nossa API/Auth
      await register(nome, email, senha);
      toast.success("Conta criada! Agora podes entrar.");
      navigate("/login"); // Se tudo correr bem, atira o utilizador para o Login
    } catch (err) {
      toast.error(err.message); // Se der erro (ex: email já existe), mostra uma notificação vermelha
    } finally {
      setLoading(false); // Independentemente de dar erro ou sucesso, reativa o botão
    }
  }

  // ==========================================
  // 3. INTERFACE (ESTÁTICA NO MODO CLARO)
  // ==========================================
  return (
    // 'bg-white' garante que o fundo é sempre branco, ignorando o dark mode
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-white overflow-hidden">
      
      {/* INJEÇÃO DE ANIMAÇÃO NATIVA */}
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

      {/* PADRÃO DE FUNDO GEOMÉTRICO (Fixado para cinza muito claro) */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      {/* CARD PRINCIPAL (bg-white e border-slate-200 travam as cores no modo claro) */}
      <div className="relative z-10 w-full max-w-md space-y-8 p-10 bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 group opacity-0 st-animate-card">
        
        {/* BRANDING */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-700 group-hover:rotate-[15deg] opacity-0 st-animate-icon">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 opacity-0 st-animate-title">
            Criar Conta
          </h1>
          <p className="text-sm text-slate-500 opacity-0 st-animate-title">
            Junta-te ao Study Tracker e organiza os teus estudos.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-5 opacity-0 st-animate-form">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Nome Completo</Label>
            {/* onChange liga o teclado do utilizador à variável de Estado (nome) */}
            <Input 
              type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="O teu nome"
              className="h-11 bg-white border-slate-300 text-slate-900 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Endereço de Email</Label>
            <Input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nome@exemplo.com"
              className="h-11 bg-white border-slate-300 text-slate-900 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Palavra-passe</Label>
            <div className="relative">
              <Input
                type={showSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} required placeholder="••••••••"
                className="h-11 pr-10 bg-white border-slate-300 text-slate-900 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-slate-400"
              />
              <button
                type="button" onClick={() => setShowSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 shadow-sm mt-3 gap-2 transition-all duration-200 active:scale-[0.98] bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                A criar...
              </span>
            ) : "Criar Conta"}
          </Button>

          <div className="text-center pt-3 border-t border-slate-100 mt-5">
            <p className="text-sm text-slate-500">
              Já tens conta? <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline transition-all">Entra aqui</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}