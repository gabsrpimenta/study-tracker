using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTrackerApp.Migrations
{
    /// <inheritdoc />
    public partial class AddCamposMateria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Pomodoros",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DuracaoMinutos = table.Column<int>(type: "INTEGER", nullable: false),
                    DataConclusao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MateriaId = table.Column<int>(type: "INTEGER", nullable: false),
                    EstudanteId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pomodoros", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pomodoros_Estudantes_EstudanteId",
                        column: x => x.EstudanteId,
                        principalTable: "Estudantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Pomodoros_Materias_MateriaId",
                        column: x => x.MateriaId,
                        principalTable: "Materias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pomodoros_EstudanteId",
                table: "Pomodoros",
                column: "EstudanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Pomodoros_MateriaId",
                table: "Pomodoros",
                column: "MateriaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Pomodoros");
        }
    }
}
