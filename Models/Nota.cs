namespace StudyTrackerApp.Models;

// Avaliação numérica — serve a página "Avaliações"
public class Nota
{
    public int Id { get; set; }

    public string Subject { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public double Value { get; set; }

    public double Weight { get; set; }

    public int EstudanteId { get; set; }
}
