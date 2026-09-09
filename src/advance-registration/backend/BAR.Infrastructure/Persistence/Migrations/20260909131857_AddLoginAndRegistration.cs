using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BAR.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLoginAndRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS btree_gist;");

            migrationBuilder.CreateTable(
                name: "number_block",
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

            migrationBuilder.CreateTable(
                name: "refresh_token",
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

            migrationBuilder.CreateTable(
                name: "seller_type",
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

            migrationBuilder.CreateTable(
                name: "settings",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    registration_deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    drop_off_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    drop_off_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    bazaar_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    bazaar_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    default_type_id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    info_text = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    start_number = table.Column<int>(type: "integer", nullable: false),
                    block_size = table.Column<int>(type: "integer", nullable: false),
                    default_block_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_settings", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_number_block_seller_id",
                table: "number_block",
                column: "seller_id");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_token_seller_id",
                table: "refresh_token",
                column: "seller_id");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_token_token_hash",
                table: "refresh_token",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_seller_email",
                table: "seller",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_seller_type_name",
                table: "seller_type",
                column: "name",
                unique: true);

            migrationBuilder.Sql("""
                ALTER TABLE number_block
                ADD CONSTRAINT "CK_number_block_no_overlap"
                EXCLUDE USING gist (int4range(from_number, to_number + 1) WITH &&);
                """);

            migrationBuilder.Sql("""
                INSERT INTO seller_type (id, name, commission_rate, item_fee)
                VALUES ('t0000001', 'Standard', 15.0, 0.50);

                INSERT INTO settings (
                    id, registration_deadline, drop_off_from, drop_off_until,
                    bazaar_from, bazaar_until, default_type_id, info_text,
                    start_number, block_size, default_block_count)
                VALUES (
                    'settings',
                    NOW() + INTERVAL '28 days',
                    NOW() + INTERVAL '35 days',
                    NOW() + INTERVAL '35 days' + INTERVAL '10 hours',
                    NOW() + INTERVAL '36 days',
                    NOW() + INTERVAL '36 days' + INTERVAL '7 hours',
                    't0000001',
                    'Willkommen! Bitte bringt eure Artikel im angegebenen Abgabezeitraum vorbereitet mit.',
                    1, 10, 1);

                -- Passwort "Admin123!" mit BCrypt.Net-Next work factor 12 vorab gehasht
                -- (deterministisch pro Erzeugung, hier fix eingebettet, damit die Migration
                -- ohne Programmlauf reproduzierbar bleibt - siehe Task 11 fuer den
                -- Runtime-Pfad ueber IPasswordHasher).
                INSERT INTO seller (
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
                name: "number_block");

            migrationBuilder.DropTable(
                name: "refresh_token");

            migrationBuilder.DropTable(
                name: "seller");

            migrationBuilder.DropTable(
                name: "seller_type");

            migrationBuilder.DropTable(
                name: "settings");
        }
    }
}
