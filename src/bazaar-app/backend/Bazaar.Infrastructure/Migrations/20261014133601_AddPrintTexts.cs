using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bazaar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPrintTexts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AbgabeBeleg_Text1",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AbgabeBeleg_Text2",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AbgabeBeleg_Text3",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AbgabeBeleg_Text4",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AbgabeBeleg_Text5",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VerkaeuferUebersicht_Text1",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VerkaeuferUebersicht_Text2",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VerkaeuferUebersicht_Text3",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VerkaeuferUebersicht_Text4",
                table: "Settings",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VerkaeuferUebersicht_Text5",
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
                name: "AbgabeBeleg_Text1",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "AbgabeBeleg_Text2",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "AbgabeBeleg_Text3",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "AbgabeBeleg_Text4",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "AbgabeBeleg_Text5",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "VerkaeuferUebersicht_Text1",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "VerkaeuferUebersicht_Text2",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "VerkaeuferUebersicht_Text3",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "VerkaeuferUebersicht_Text4",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "VerkaeuferUebersicht_Text5",
                table: "Settings");
        }
    }
}
