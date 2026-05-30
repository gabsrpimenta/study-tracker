using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyTrackerApp.Migrations
{
    /// <inheritdoc />
    public partial class AddLoginEstudante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SenhaHash",
                table: "Estudantes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SenhaHash",
                table: "Estudantes");
        }
    }
}
