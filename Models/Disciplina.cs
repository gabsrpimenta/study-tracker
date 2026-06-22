public class Disciplina
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Professor { get; set; }
    public bool Ativa { get; set; } = true;
    public int Tarefas { get; set; } = 0;
    public int Progresso { get; set; } = 0;
    public int EstudanteId { get; set; }
}