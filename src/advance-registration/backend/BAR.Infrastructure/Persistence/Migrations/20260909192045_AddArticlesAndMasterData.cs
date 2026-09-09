using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BAR.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddArticlesAndMasterData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "article",
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
                name: "brand",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    original = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_brand", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "category",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    original = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_category", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_article_seller_id",
                table: "article",
                column: "seller_id");

            migrationBuilder.Sql(@"CREATE UNIQUE INDEX ux_brand_name_ci ON brand (lower(trim(name)));");
            migrationBuilder.Sql(@"CREATE UNIQUE INDEX ux_category_name_ci ON category (lower(trim(name)));");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ux_brand_name_ci;");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ux_category_name_ci;");

            migrationBuilder.DropTable(
                name: "article");

            migrationBuilder.DropTable(
                name: "brand");

            migrationBuilder.DropTable(
                name: "category");
        }
    }
}
