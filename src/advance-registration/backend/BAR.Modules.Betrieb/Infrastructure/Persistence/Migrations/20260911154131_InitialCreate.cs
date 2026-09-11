using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BAR.Modules.Betrieb.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "betrieb");

            migrationBuilder.CreateTable(
                name: "settings",
                schema: "betrieb",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    registration_deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    drop_off_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    drop_off_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    bazaar_from = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    bazaar_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    default_type_id = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: true),
                    info_text = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    start_number = table.Column<int>(type: "integer", nullable: false),
                    block_size = table.Column<int>(type: "integer", nullable: false),
                    default_block_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_settings", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "settings",
                schema: "betrieb");
        }
    }
}
