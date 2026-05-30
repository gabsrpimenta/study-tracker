namespace StudyTrackerApp.Models
{
    public class Materia
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty; // Ex: "Matemática", "História"
        public bool Ativa { get; set; } = true;

        // Relacionamento: Toda matéria pertence a um estudante
        public int EstudanteId { get; set; }
        public Estudante? Estudante { get; set; }

        // Uma matéria pode ter vários eventos no cronograma
        public List<Cronograma> Cronogramas { get; set; } = new();
    }
}