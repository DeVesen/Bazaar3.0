using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bazaar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBlankLabels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LabelPrintDefaults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    LogoKind = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    LogoValue = table.Column<string>(type: "text", nullable: true),
                    SellerSymbolKind = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    SellerSymbolValue = table.Column<string>(type: "text", nullable: true),
                    CurrencySymbol = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabelPrintDefaults", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LabelSheetFormats",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Geometry_Columns = table.Column<int>(type: "integer", nullable: false),
                    Geometry_GapHorizontal = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    Geometry_GapVertical = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    Geometry_LabelHeight = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    Geometry_LabelWidth = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    Geometry_MarginBottom = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    Geometry_MarginLeft = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    Geometry_MarginRight = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    Geometry_MarginTop = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    Geometry_Rows = table.Column<int>(type: "integer", nullable: false),
                    Geometry_SheetHeight = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    Geometry_SheetWidth = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabelSheetFormats", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LabelSheetFormats_Name",
                table: "LabelSheetFormats",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LabelPrintDefaults");

            migrationBuilder.DropTable(
                name: "LabelSheetFormats");
        }
    }
}
