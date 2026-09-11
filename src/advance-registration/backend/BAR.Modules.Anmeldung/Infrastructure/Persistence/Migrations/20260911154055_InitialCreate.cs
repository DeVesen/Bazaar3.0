using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BAR.Modules.Anmeldung.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "anmeldung");

            migrationBuilder.CreateTable(
                name: "article",
                schema: "anmeldung",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    number = table.Column<int>(type: "integer", nullable: false),
                    seller_id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    brand = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    size = table.Column<string>(type: "text", nullable: true),
                    color = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_article", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "number_block",
                schema: "anmeldung",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    seller_id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    from_number = table.Column<int>(type: "integer", nullable: false),
                    to_number = table.Column<int>(type: "integer", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_number_block", x => x.id);
                    table.CheckConstraint("CK_number_block_range_valid", "\"to_number\" >= \"from_number\"");
                });

            migrationBuilder.CreateIndex(
                name: "IX_article_seller_id",
                schema: "anmeldung",
                table: "article",
                column: "seller_id");

            migrationBuilder.CreateIndex(
                name: "IX_number_block_seller_id",
                schema: "anmeldung",
                table: "number_block",
                column: "seller_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "article",
                schema: "anmeldung");

            migrationBuilder.DropTable(
                name: "number_block",
                schema: "anmeldung");
        }
    }
}
