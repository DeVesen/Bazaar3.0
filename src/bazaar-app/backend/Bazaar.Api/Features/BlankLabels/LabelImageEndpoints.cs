using Bazaar.Api.Filters;
using Bazaar.Application.BlankLabels;

namespace Bazaar.Api.Features.BlankLabels;

/// <summary>
/// Bilder-Bibliothek des Etiketten-Vordrucks. Alles nur für Admin, auch das Lesen. Ein Bild
/// wird nur als JSON mit Data-URL geliefert, nie als eigenes Dokument (SVG-Skripte).
/// </summary>
public static class LabelImageEndpoints
{
    public static IEndpointRouteBuilder MapLabelImageEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/label-images", async (GetLabelImagesHandler handler) =>
                Results.Ok((await handler.Handle()).Select(LabelImageSummaryDto.From)))
            .RequireAuthorization("admin");

        app.MapGet("/api/label-images/{id}", async (string id, GetLabelImageHandler handler) =>
                Results.Ok(LabelImageDto.From(await handler.Handle(id))))
            .RequireAuthorization("admin");

        app.MapPost("/api/label-images", async (UploadLabelImageCommand command, UploadLabelImageHandler handler) =>
        {
            var result = await handler.Handle(command);
            var dto = LabelImageSummaryDto.From(result.Image);
            return result.Created ? Results.Created($"/api/label-images/{dto.Id}", dto) : Results.Ok(dto);
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<UploadLabelImageCommand>>();

        app.MapDelete("/api/label-images/{id}", async (string id, DeleteLabelImageHandler handler) =>
        {
            await handler.Handle(id);
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        return app;
    }
}
