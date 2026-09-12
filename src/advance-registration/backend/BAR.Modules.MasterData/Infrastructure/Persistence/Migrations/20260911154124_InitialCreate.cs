using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BAR.Modules.MasterData.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "master_data");

            migrationBuilder.CreateTable(
                name: "brand",
                schema: "master_data",
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
                schema: "master_data",
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

            migrationBuilder.CreateTable(
                name: "outbox_message",
                schema: "master_data",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    payload_json = table.Column<string>(type: "text", nullable: false),
                    occurred_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    processed_at_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_outbox_message", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "seller_type",
                schema: "master_data",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    commission_rate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    item_fee = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_seller_type", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_seller_type_name",
                schema: "master_data",
                table: "seller_type",
                column: "name",
                unique: true);

            // Seed from R01 ("An admin account as a seed, so the admin role is
            // reachable at all") - unchanged by R09 (which only removed the
            // settings seed, see SellerManagement.InitialCreate). Without this
            // type, the admin seller seeded there would be a dangling
            // seller_type_id reference - no more DB FK across the module
            // boundary, but a domain-level broken record nonetheless.
            migrationBuilder.Sql("""
                INSERT INTO master_data.seller_type (id, name, commission_rate, item_fee)
                VALUES ('t0000001', 'Standard', 15.0, 0.50);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "brand",
                schema: "master_data");

            migrationBuilder.DropTable(
                name: "category",
                schema: "master_data");

            migrationBuilder.DropTable(
                name: "outbox_message",
                schema: "master_data");

            migrationBuilder.DropTable(
                name: "seller_type",
                schema: "master_data");
        }
    }
}
