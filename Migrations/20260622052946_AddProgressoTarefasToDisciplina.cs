using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTrackerApp.Migrations
{
    /// <inheritdoc />
    public partial class AddProgressoTarefasToDisciplina : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Progresso",
                table: "Disciplinas",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Tarefas",
                table: "Disciplinas",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Progresso",
                table: "Disciplinas");

            migrationBuilder.DropColumn(
                name: "Tarefas",
                table: "Disciplinas");
        }
    }
}
