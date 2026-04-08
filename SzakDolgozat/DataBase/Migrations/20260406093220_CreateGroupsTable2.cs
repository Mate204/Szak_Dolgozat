using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataBase.Migrations
{
    /// <inheritdoc />
    public partial class CreateGroupsTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GroupAllowedTag_Groups_GroupId",
                table: "GroupAllowedTag");

            migrationBuilder.DropForeignKey(
                name: "FK_GroupAllowedTag_Tags_TagId",
                table: "GroupAllowedTag");

            migrationBuilder.DropForeignKey(
                name: "FK_GroupAllowedTag_Tags_TagsId",
                table: "GroupAllowedTag");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GroupAllowedTag",
                table: "GroupAllowedTag");

            migrationBuilder.RenameTable(
                name: "GroupAllowedTag",
                newName: "GroupAllowedTags");

            migrationBuilder.RenameIndex(
                name: "IX_GroupAllowedTag_TagsId",
                table: "GroupAllowedTags",
                newName: "IX_GroupAllowedTags_TagsId");

            migrationBuilder.RenameIndex(
                name: "IX_GroupAllowedTag_TagId",
                table: "GroupAllowedTags",
                newName: "IX_GroupAllowedTags_TagId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GroupAllowedTags",
                table: "GroupAllowedTags",
                columns: new[] { "GroupId", "TagId" });

            migrationBuilder.AddForeignKey(
                name: "FK_GroupAllowedTags_Groups_GroupId",
                table: "GroupAllowedTags",
                column: "GroupId",
                principalTable: "Groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GroupAllowedTags_Tags_TagId",
                table: "GroupAllowedTags",
                column: "TagId",
                principalTable: "Tags",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GroupAllowedTags_Tags_TagsId",
                table: "GroupAllowedTags",
                column: "TagsId",
                principalTable: "Tags",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GroupAllowedTags_Groups_GroupId",
                table: "GroupAllowedTags");

            migrationBuilder.DropForeignKey(
                name: "FK_GroupAllowedTags_Tags_TagId",
                table: "GroupAllowedTags");

            migrationBuilder.DropForeignKey(
                name: "FK_GroupAllowedTags_Tags_TagsId",
                table: "GroupAllowedTags");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GroupAllowedTags",
                table: "GroupAllowedTags");

            migrationBuilder.RenameTable(
                name: "GroupAllowedTags",
                newName: "GroupAllowedTag");

            migrationBuilder.RenameIndex(
                name: "IX_GroupAllowedTags_TagsId",
                table: "GroupAllowedTag",
                newName: "IX_GroupAllowedTag_TagsId");

            migrationBuilder.RenameIndex(
                name: "IX_GroupAllowedTags_TagId",
                table: "GroupAllowedTag",
                newName: "IX_GroupAllowedTag_TagId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GroupAllowedTag",
                table: "GroupAllowedTag",
                columns: new[] { "GroupId", "TagId" });

            migrationBuilder.AddForeignKey(
                name: "FK_GroupAllowedTag_Groups_GroupId",
                table: "GroupAllowedTag",
                column: "GroupId",
                principalTable: "Groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GroupAllowedTag_Tags_TagId",
                table: "GroupAllowedTag",
                column: "TagId",
                principalTable: "Tags",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GroupAllowedTag_Tags_TagsId",
                table: "GroupAllowedTag",
                column: "TagsId",
                principalTable: "Tags",
                principalColumn: "Id");
        }
    }
}
