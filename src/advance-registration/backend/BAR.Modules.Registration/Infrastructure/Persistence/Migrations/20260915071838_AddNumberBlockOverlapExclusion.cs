using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BAR.Modules.Registration.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNumberBlockOverlapExclusion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:btree_gist", ",,");

            // api/blocks.md section 6, step 4: last line of defense against a
            // race between two concurrent block allocations - the app-level
            // overlap check (ReserveBlocksCommandHandler) can't see a
            // not-yet-committed insert from another request.
            migrationBuilder.Sql(
                """
                ALTER TABLE registration.number_block
                ADD CONSTRAINT "CK_number_block_no_overlap"
                EXCLUDE USING gist (int4range(from_number, to_number + 1) WITH &&);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE registration.number_block
                DROP CONSTRAINT "CK_number_block_no_overlap";
                """);

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:btree_gist", ",,");
        }
    }
}
