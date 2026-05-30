namespace StudyTrackerApp.Models
{
    public class Cronograma
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty; // Ex: "Teste de Matemática", "Trabalho de História"
        public string Subtitulo { get; set; } = string.Empty; // Ex: "Álgebra", "História Contemporânea"
        public DateTime Data { get; set; }

        // Tipo do evento: "Teste", "Entrega" ou "Projeto" (para mudar a cor na tela)
        public string Tipo { get; set; } = string.Empty;

        // Relacionamento: Todo evento do cronograma está ligado a uma matéria
        public int MateriaId { get; set; }
        public Materia? Materia { get; set; }
    }
}