namespace StudyTrackerApp.Models
{
    public class Tarefa
    {
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty; // Ex: "Estudar álgebra"
        public DateTime Data { get; set; } = DateTime.Today;
        public bool Concluida { get; set; } = false;

        // Relacionamento: Toda tarefa pertence a um estudante
        public int EstudanteId { get; set; }
        public Estudante? Estudante { get; set; }
    }
}