using Bazaar.Api.Filters;
using Bazaar.Application.BlankLabels;

namespace Bazaar.Api.Features.BlankLabels;

/// <summary>
/// Etiketten-Vordruck: Bogenformate und die Werte des letzten Drucks. Alles nur für Admin,
/// auch das Lesen — die Seite gibt es für Kassenpersonal nicht.
/// </summary>
public static class BlankLabelEndpoints
{
    public static IEndpointRouteBuilder MapBlankLabelEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/label-sheet-formats", async (GetLabelSheetFormatsHandler handler) =>
                Results.Ok((await handler.Handle()).Select(LabelSheetFormatDto.From)))
            .RequireAuthorization("admin");

        app.MapPost("/api/label-sheet-formats", async (SaveLabelSheetFormatCommand command, SaveLabelSheetFormatHandler handler) =>
                Results.Ok(LabelSheetFormatDto.From(await handler.Handle(command))))
            .RequireAuthorization("admin")
            .AddEndpointFilter<ValidationFilter<SaveLabelSheetFormatCommand>>();

        app.MapDelete("/api/label-sheet-formats/{id}", async (string id, DeleteLabelSheetFormatHandler handler) =>
        {
            await handler.Handle(id);
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        app.MapGet("/api/label-print-defaults", async (GetLabelPrintDefaultsHandler handler) =>
                Results.Ok(LabelPrintDefaultsDto.From(await handler.Handle())))
            .RequireAuthorization("admin");

        app.MapPut("/api/label-print-defaults", async (UpdateLabelPrintDefaultsCommand command, UpdateLabelPrintDefaultsHandler handler) =>
        {
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<UpdateLabelPrintDefaultsCommand>>();

        return app;
    }
}
