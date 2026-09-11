using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BAR.Modules.Verkaeuferverwaltung.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "verkaeuferverwaltung");

            migrationBuilder.CreateTable(
                name: "refresh_token",
                schema: "verkaeuferverwaltung",
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
                schema: "verkaeuferverwaltung",
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
                schema: "verkaeuferverwaltung",
                table: "refresh_token",
                column: "seller_id");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_token_token_hash",
                schema: "verkaeuferverwaltung",
                table: "refresh_token",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_seller_email",
                schema: "verkaeuferverwaltung",
                table: "seller",
                column: "email",
                unique: true);

            // Seed aus R01 ("Ein Admin-Konto als Seed, damit die Admin-Rolle ueberhaupt
            // erreichbar ist") - unveraendert von R09 (das nur die Settings-Seed in
            // BAR.Modules.Betrieb entfernt hat). seller_type_id verweist auf den in
            // Stammdaten.InitialCreate geseedeten Typ 't0000001' - kein DB-FK mehr ueber
            // die Modulgrenze, daher rein durch die Seed-Reihenfolge in der App-Doku
            // (R01-zugang.md) sichergestellt, nicht durch die Datenbank.
            migrationBuilder.Sql("""
                -- Passwort "Admin123!" mit BCrypt.Net-Next work factor 12 vorab gehasht
                -- (deterministisch pro Erzeugung, hier fix eingebettet, damit die Migration
                -- ohne Programmlauf reproduzierbar bleibt).
                INSERT INTO verkaeuferverwaltung.seller (
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
                schema: "verkaeuferverwaltung");

            migrationBuilder.DropTable(
                name: "seller",
                schema: "verkaeuferverwaltung");
        }
    }
}
