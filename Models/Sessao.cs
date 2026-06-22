namespace StudyTrackerApp.Models;

public class Sessao
{
    public int Id { get; set; }
    public string Subject { get; set; } = "";
    public int Minutes { get; set; }
    public string Date { get; set; } = "";
    public int EstudanteId { get; set; }
}