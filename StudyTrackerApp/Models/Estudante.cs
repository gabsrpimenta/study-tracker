namespace StudyTrackerApp.Models
{
    public class Estudante
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Um estudante pode ter várias matérias e tarefas
        public List<Materia> Materias { get; set; } = new();
        public List<Tarefa> Tarefas { get; set; } = new();
    }
}