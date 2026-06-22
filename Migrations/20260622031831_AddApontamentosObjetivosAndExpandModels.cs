using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTrackerApp.Migrations
{
    /// <inheritdoc />
    public partial class AddApontamentosObjetivosAndExpandModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Adicionar colunas a Eventos
            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "Eventos",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Eventos",
                type: "TEXT",
                nullable: false,
                defaultValue: "Teste");

            // Adicionar colunas a Notas
            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "Notas",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Notas",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            // Criar tabela Apontamentos
            migrationBuilder.CreateTable(
                name: "Apontamentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Subject = table.Column<string>(type: "TEXT", nullable: false, defaultValue: ""),
                    Content = table.Column<string>(type: "TEXT", nullable: false, defaultValue: ""),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EstudanteId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Apontamentos", x => x.Id);
                });

            // Criar tabela Objetivos
            migrationBuilder.CreateTable(
                name: "Objetivos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false, defaultValue: ""),
                    Done = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EstudanteId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Objetivos", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Apontamentos");
            migrationBuilder.DropTable(name: "Objetivos");

            migrationBuilder.DropColumn(name: "Subject", table: "Eventos");
            migrationBuilder.DropColumn(name: "Type", table: "Eventos");
            migrationBuilder.DropColumn(name: "Subject", table: "Notas");
            migrationBuilder.DropColumn(name: "Title", table: "Notas");
        }
    }
}
