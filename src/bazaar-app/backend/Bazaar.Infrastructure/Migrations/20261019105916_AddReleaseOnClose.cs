using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bazaar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReleaseOnClose : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ReleaseOnClose",
                table: "Settings",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReleaseOnClose",
                table: "Settings");
        }
    }
}
