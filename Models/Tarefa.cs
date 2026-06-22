namespace StudyTrackerApp.Models
{
    public class Tarefa
    {
        public int Id { get; set; }

        public string Titulo { get; set; } = string.Empty;

        public DateTime Data { get; set; }

        public bool Concluida { get; set; }

        public string Subject { get; set; } = string.Empty;

        public string Priority { get; set; } = "media";

        public string Due { get; set; } = string.Empty;

        public int EstudanteId { get; set; }

        public int? DisciplinaId { get; set; }
        public Disciplina? Disciplina { get; set; }
    }
}
