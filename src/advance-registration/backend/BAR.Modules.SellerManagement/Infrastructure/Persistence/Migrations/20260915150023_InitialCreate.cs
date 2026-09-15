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
