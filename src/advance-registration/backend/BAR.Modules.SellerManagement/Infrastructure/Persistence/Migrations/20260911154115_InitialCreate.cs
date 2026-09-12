using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BAR.Modules.SellerManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "seller_management");

            migrationBuilder.CreateTable(
                name: "refresh_token",
                schema: "seller_management",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    seller_id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_token", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "seller",
                schema: "seller_management",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    first_name = table.Column<string>(type: "text", nullable: false),
                    last_name = table.Column<string>(type: "text", nullable: false),
                    address = table.Column<string>(type: "text", nullable: true),
                    postal_code = table.Column<string>(type: "text", nullable: false),
                    city = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    seller_type_id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    is_admin = table.Column<bool>(type: "boolean", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: true),
                    invite_token = table.Column<string>(type: "text", nullable: true),
                    invite_token_expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_seller", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_refresh_token_seller_id",
                schema: "seller_management",
                table: "refresh_token",
                column: "seller_id");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_token_token_hash",
                schema: "seller_management",
                table: "refresh_token",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_seller_email",
                schema: "seller_management",
                table: "seller",
                column: "email",
                unique: true);

            // Seed from R01 ("An admin account as a seed, so the admin role is
            // reachable at all") - unchanged by R09 (which only removed the
            // settings seed in BAR.Modules.Operations). seller_type_id references
            // the type 't0000001' seeded in MasterData.InitialCreate - no more DB
            // FK across the module boundary, so this is ensured purely by the seed
            // ordering documented in the app docs (R01-zugang.md), not by the database.
            migrationBuilder.Sql("""
                -- Passwort "Admin123!" mit BCrypt.Net-Next work factor 12 vorab gehasht
                -- (deterministisch pro Erzeugung, hier fix eingebettet, damit die Migration
                -- ohne Programmlauf reproduzierbar bleibt).
                INSERT INTO seller_management.seller (
                    id, first_name, last_name, address, postal_code, city, phone,
                    email, seller_type_id, is_admin, password_hash)
                VALUES (
                    'a0000001', 'Admin', 'Bazaar', NULL, '00000', 'Musterstadt', '00000 000000',
                    'admin@bazaar.local', 't0000001', TRUE,
                    '$2a$12$1eqwqVnhll7UwRcLAUH03.97hpi.j4480eCTDLuoPA9361IAYNpeu');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "refresh_token",
                schema: "seller_management");

            migrationBuilder.DropTable(
                name: "seller",
                schema: "seller_management");
        }
    }
}
