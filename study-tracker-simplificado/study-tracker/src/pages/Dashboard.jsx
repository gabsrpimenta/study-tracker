import { useEffect, useState } from "react";
import { Flame, Clock, CheckSquare, Award, Target, Plus, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Importações necessárias para a janela (Modal) funcionar
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Input";
import { toast } from "sonner"; // Biblioteca para mostrar notificações bonitas na tela

import { listSessions, listTasks, listGrades } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function Dashboard() {
  // ==========================================
  // 1. ESTADOS (STATE)
  // O coração do React: Variáveis que, quando alteradas, fazem a tela se atualizar sozinha!
  // ==========================================
  
  // Guarda os dados que vêm da API
  const [data, setData] = useState({ sessions: [], tasks: [], grades: [], goals: [] });
  
  // Guarda a sequência de dias seguidos de estudo (Streak)
  const [streak, setStreak] = useState(0);
  
  // Pega as informações do usuário logado
  const user = getUser();

  // Controla se a janelinha de "Novo Objetivo" está visível (true) ou oculta (false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  
  // Guarda o texto que o estudante digita dentro do input da janelinha
  const [goalForm, setGoalForm] = useState({ title: "" });

  // ==========================================
  // 2. EFEITOS (USEEFFECT)
  // Código que roda automaticamente quando a página é carregada pela primeira vez.
  // ==========================================
  useEffect(() => {
    // Promise.all: Uma técnica para buscar vários dados na API ao mesmo tempo (em paralelo). 
    // Isso deixa o carregamento da página muito mais rápido.
    Promise.all([listSessions(), listTasks(), listGrades()]).then(([s, t, g]) => {
      setData({ sessions: s, tasks: t, grades: g, goals: [] }); 
    });

    // CORREÇÃO DE FUSO HORÁRIO: Função interna para gerar strings "YYYY-MM-DD" baseadas no relógio local do aluno
    const obterDataLocal = (dataObj) => {
      const ano = dataObj.getFullYear();
      const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
      const dia = String(dataObj.getDate()).padStart(2, "0");
      return `${ano}-${mes}-${dia}`;
    };

    // O LOCAL CORRETO DA SEQUÊNCIA É AQUI:
    // Lógica CORRIGIDA da "Sequência de Dias" (Streak) e Ativação dos Prêmios da Gamificação
    const hoje = obterDataLocal(new Date()); // Evita o erro de virar o dia antes da hora com toISOString()
    
    // Nova verificação: Pega a data de ontem para saber se a sequência foi quebrada
    const ontemData = new Date();
    ontemData.setDate(ontemData.getDate() - 1);
    const ontem = obterDataLocal(ontemData);

    const storageKey = `streak_${user?.id || "guest"}`;
    const storedData = JSON.parse(localStorage.getItem(storageKey)) || { lastDate: "", count: 0 };
    
    let count = storedData.count;

    // Se o usuário ainda não tiver acessado o sistema hoje, fazemos as checagens reais:
    if (storedData.lastDate !== hoje) {
      if (storedData.lastDate === ontem) {
        // Se ele acessou ontem e está acessando hoje, a sequência continua!
        count += 1; 
      } else if (storedData.lastDate === "") {
        // Se for a primeiríssima vez dele no sistema, começa em 1
        count = 1;
      } else {
        // Se ele ficou dias sem entrar (a última data não é ontem), a sequência quebrou e reseta para 1!
        count = 1;
      }
      // Guarda a nova sequência updated no navegador (Local Storage)
      localStorage.setItem(storageKey, JSON.stringify({ lastDate: hoje, count }));
    }
    setStreak(count);

    // MÁGICA DOS PRÊMIOS: Aplica as classes CSS dos prêmios baseando-se nos dias conquistados (count)
    // Primeiro limpamos os temas antigos para não acumular classes no corpo do site
    document.body.classList.remove("theme-midnight", "theme-nordic", "theme-cyberpunk");
    
    // Ativa o prêmio correspondente aos dias seguidos
    if (count >= 30) {
      document.body.classList.add("theme-cyberpunk"); // Prêmio Máximo: Cyberpunk (30 dias)
    } else if (count >= 15) {
      document.body.classList.add("theme-nordic");    // Prêmio Intermediário: Nordic Mint (15 dias)
    } else if (count >= 7) {
      document.body.classList.add("theme-midnight");  // Primeiro Prêmio: Midnight Gold (7 dias)
    }

    // RETORNO DE LIMPEZA (CLEANUP): Remove o tema do body caso o usuário saia dessa página (SaaS Boas Práticas)
    return () => {
      document.body.classList.remove("theme-midnight", "theme-nordic", "theme-cyberpunk");
    };

  }, [user?.id]); // O array indica que o useEffect roda quando o id do usuário é carregado

  // ==========================================
  // 3. FUNÇÕES DE AÇÃO
  // ==========================================
  
  // Função disparada quando o usuário clica no botão "Guardar Objetivo"
  function handleSaveGoal() {
    // Validação de dados: O .trim() remove os espaços em branco. 
    // Se o campo estiver vazio, mostramos um erro e paramos a função com o 'return'.
    if (!goalForm.title.trim()) {
      toast.error("O título do objetivo é obrigatório!");
      return; 
    }

    const newGoal = { title: goalForm.title };

    // Atualiza a lista na tela: 
    // Mantém tudo que já existia (...data) e adiciona o novo objetivo no final do array (...data.goals, newGoal)
    setData({ ...data, goals: [...data.goals, newGoal] });

    // Fecha a janelinha e limpa o campo de texto para a próxima vez
    setIsGoalModalOpen(false);
    setGoalForm({ title: "" });
    toast.success("Objetivo criado com sucesso!");
  }

  // ==========================================
  // 4. CÁLCULOS DINÂMICOS
  // Estes valores são recalculados automaticamente sempre que os 'dados' (state) mudam.
  // ==========================================
  
  // .reduce(): Percorre todas as sessões somando os minutos. Depois dividimos por 60 para obter o total em horas.
  const totalHours = (data.sessions.reduce((acc, curr) => acc + curr.minutes, 0) / 60).toFixed(1);
  
  // .filter(): Cria uma lista contendo apenas as tarefas concluídas (done: true) e depois conta o tamanho (.length).
  const doneTasks = data.tasks.filter((t) => t.done).length;
  
  // Calcula a média ponderada das notas. Se o aluno não tiver notas, a média é 0.
  const avgGrade = data.grades.length > 0
    ? data.grades.reduce((acc, g) => acc + g.value * g.weight, 0) / data.grades.reduce((acc, g) => acc + g.weight, 0)
    : 0;

  // Lógica de cálculo do Gráfico Semanal (Gera os dados dos últimos 7 dias)
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const now = new Date();
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); 
    d.setDate(now.getDate() - (6 - i)); // Volta 'x' dias no tempo
    
    // CORREÇÃO DE FUSO HORÁRIO NO GRÁFICO: Evita desalinhamento dos minutos estudados à noite
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    const dateStr = `${ano}-${mes}-${dia}`;

    // Soma os minutos estudados num dia específico para formar a coluna do gráfico
    const mins = data.sessions.filter((s) => s.date === dateStr).reduce((a, b) => a + b.minutes, 0);
    return { label: days[d.getDay()], minutes: mins };
  });

  // Pega o dia em que o aluno mais estudou para ser o limite máximo (100%) da altura do gráfico
  const maxWeeklyMins = Math.max(60, ...weekly.map((d) => d.minutes));

  // ==========================================
  // 5. RENDERIZAÇÃO DA INTERFACE (HTML/JSX)
  // ==========================================
  // ANIMAÇÃO DE ENTRADA: Adicionada a classe 'animate-in fade-in slide-in-from-bottom-4 duration-500' para a página surgir suavemente
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SEÇÃO 1: CABEÇALHO (MENSAGEM DE BOAS VINDAS E FOGO) */}
      {/* ANIMAÇÃO NO STREAK: Adicionado 'transition-transform hover:scale-105 duration-300' para o bloco de dias crescer levemente ao passar o mouse */}
      <section className="flex flex-col md:flex-row justify-between items-center rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 p-6 text-white shadow-lg">
        <div>
          {/* Pega apenas o primeiro nome do estudante utilizando o .split() */}
          <h1 className="text-3xl font-bold">Olá, {user?.nome?.split(" ")[0] || "Estudante"}!</h1>
          <p className="opacity-90">Pequenos passos consistentes constroem grandes conquistas.</p>
        </div>
        
        {/* Widget do Streak (Sequência) */}
        <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl mt-4 md:mt-0 transition-transform hover:scale-105 duration-300 cursor-default">
          <Flame className="text-yellow-400 animate-pulse" />
          <div>
            <p className="text-sm opacity-80">Sequência atual</p>
            <p className="text-xl font-bold">{streak} {streak === 1 ? "dia" : "dias"}</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: CARDS DE RESUMO RÁPIDO */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Utilizamos o .map() para desenhar os Cards dinamicamente sem precisar repetir o mesmo HTML 4 vezes (Princípio DRY - Don't Repeat Yourself) */}
        {/* ANIMAÇÃO NOS CARDS: Adicionado 'group', 'transition-all duration-300 hover:-translate-y-1 hover:shadow-md' para o card subir levemente */}
        {/* ANIMAÇÃO NOS ÍCONES: Adicionado 'transition-transform duration-300 group-hover:scale-110' para o ícone crescer quando passamos o mouse no card */}
        {[
          { title: "Tempo Total", value: `${totalHours}h`, icon: Clock, color: "text-blue-500 bg-blue-100" },
          { title: "Média Geral", value: avgGrade.toFixed(1), icon: Award, color: "text-green-500 bg-green-100" },
          { title: "Tarefas Feitas", value: `${doneTasks}/${data.tasks.length}`, icon: CheckSquare, color: "text-purple-500 bg-purple-100" },
          { title: "Objetivos Ativos", value: data.goals.length, icon: Target, color: "text-orange-500 bg-orange-100" },
        ].map((card, index) => (
          <Card key={index} className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* SEÇÃO 3: GRÁFICO E LISTA DE OBJETIVOS */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Gráfico Semanal (lg:col-span-2 faz ele ocupar 2/3 do espaço da tela) */}
        {/* ANIMAÇÃO NO GRÁFICO: Adicionado 'hover:shadow-md transition-shadow duration-300' no Card */}
        {/* ANIMAÇÃO NAS BARRAS: Adicionado 'hover:opacity-85 duration-200 cursor-pointer' para as barras reagirem ao toque */}
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-300">
          <CardHeader><CardTitle>Estudo da semana</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {/* .map() desenha uma barra vertical para cada dia da semana */}
              {weekly.map((dia, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  {/* A altura de cada barra é definida utilizando Regra de Três simples diretamente no CSS inline */}
                  <div 
                    className="w-full rounded-t-md bg-primary transition-all duration-200 hover:opacity-85 cursor-pointer"
                    style={{ height: `${(dia.minutes / maxWeeklyMins) * 100}%`, minHeight: "4px" }}
                    title={`${dia.minutes} min`}
                  />
                  <span className="text-xs text-muted-foreground">{dia.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Widget de Objetivos (Este widget enxuto substitui a página antiga inteira!) */}
        {/* ANIMAÇÃO NOS OBJETIVOS: Adicionado 'transition-all duration-200 hover:bg-muted/50 hover:translate-x-1' para o item mover suavemente para o lado ao passar o mouse */}
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle>Meus Objetivos</CardTitle>
            {/* O onClick altera o state 'isGoalModalOpen' para true, forçando o Modal a aparecer na tela */}
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => setIsGoalModalOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Renderização Condicional (Ternário): Se não houver objetivos, mostramos uma mensagem. Se houver, listamos eles. */}
            {data.goals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum objetivo. Clique no + para adicionar.</p>
            ) : (
              data.goals.map((goal, i) => (
                <div key={i} className="flex items-center gap-2 p-2 border rounded-lg transition-all duration-200 hover:bg-muted/50 hover:border-primary/30 hover:translate-x-1 cursor-default">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-medium">{goal.title}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 4: O MODAL (Janela Suspensa) */}
      {/* O componente Dialog só é renderizado de fato na tela quando a variável 'isGoalModalOpen' for igual a true */}
      <Dialog open={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Novo Objetivo">
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título do Objetivo</Label>
            {/* O evento onChange atualiza a variável em tempo real conforme o usuário digita no teclado */}
            <Input 
              value={goalForm.title} 
              onChange={(e) => setGoalForm({ title: e.target.value })} 
              placeholder="Ex: Tirar um 10 no projeto final!" 
            />
          </div>
          {/* Ao clicar no botão, rodamos a função que checa os dados e salva na lista */}
          <Button className="w-full mt-4 rounded-xl transition-opacity hover:opacity-90" onClick={handleSaveGoal}>
            Guardar Objetivo
          </Button>
        </div>
      </Dialog>

    </div>
  );
}