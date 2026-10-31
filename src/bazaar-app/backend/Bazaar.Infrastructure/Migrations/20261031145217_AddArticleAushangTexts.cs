using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bazaar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddArticleAushangTexts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ArticleAushang_Text1",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ArticleAushang_Text2",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ArticleAushang_Text3",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ArticleAushang_Text4",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArticleAushang_Text1",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "ArticleAushang_Text2",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "ArticleAushang_Text3",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "ArticleAushang_Text4",
                table: "Settings");
        }
    }
}
