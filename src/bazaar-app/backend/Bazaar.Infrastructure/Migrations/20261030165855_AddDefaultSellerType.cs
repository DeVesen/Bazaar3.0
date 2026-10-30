using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bazaar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultSellerType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DefaultSellerTypeId",
                table: "Settings",
                type: "character varying(8)",
                maxLength: 8,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultSellerTypeId",
                table: "Settings");
        }
    }
}
