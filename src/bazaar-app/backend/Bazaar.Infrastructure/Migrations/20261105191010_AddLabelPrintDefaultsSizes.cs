using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bazaar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLabelPrintDefaultsSizes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CurrencyHeight",
                table: "LabelPrintDefaults",
                type: "numeric(5,1)",
                precision: 5,
                scale: 1,
                nullable: false,
                defaultValue: 12m);

            migrationBuilder.AddColumn<decimal>(
                name: "NumberHeight",
                table: "LabelPrintDefaults",
                type: "numeric(5,1)",
                precision: 5,
                scale: 1,
                nullable: false,
                defaultValue: 10.5m);

            migrationBuilder.AddColumn<decimal>(
                name: "QrCodeSize",
                table: "LabelPrintDefaults",
                type: "numeric(5,1)",
                precision: 5,
                scale: 1,
                nullable: false,
                defaultValue: 21.5m);

            migrationBuilder.AddColumn<decimal>(
                name: "SellerSymbolSize",
                table: "LabelPrintDefaults",
                type: "numeric(5,1)",
                precision: 5,
                scale: 1,
                nullable: false,
                defaultValue: 5m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrencyHeight",
                table: "LabelPrintDefaults");

            migrationBuilder.DropColumn(
                name: "NumberHeight",
                table: "LabelPrintDefaults");

            migrationBuilder.DropColumn(
                name: "QrCodeSize",
                table: "LabelPrintDefaults");

            migrationBuilder.DropColumn(
                name: "SellerSymbolSize",
                table: "LabelPrintDefaults");
        }
    }
}
