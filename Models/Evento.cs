namespace StudyTrackerApp.Models;

public class Evento
{
    public int Id { get; set; }

    public string Titulo { get; set; } = "";

    public string Data { get; set; } = "";

    // Disciplina/assunto associado ao evento
    public string Subject { get; set; } = "";

    // Tipo: "Teste", "Entrega", "Projeto"
    public string Type { get; set; } = "Teste";

    public int EstudanteId { get; set; }
}
