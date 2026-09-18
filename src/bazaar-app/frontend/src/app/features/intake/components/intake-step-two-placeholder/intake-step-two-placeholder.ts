import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Round-16 Task 8 placeholder for Wizard Schritt 2 (Epic_Artikelannahme Abschnitt 2).
 *
 * This component's ENTIRE content gets replaced in a later round (article intake form,
 * `POST /api/intake`, etc.) — it exists only so `intake-wizard` has something real to switch
 * to once a seller id is resolved (search hit or just created in Step 1), and so a manual
 * smoke test can confirm the id actually flows from Step 1 (or the search's exact-match path)
 * into Step 2. No `POST /api/intake` call, no article form — do not extend this file, replace
 * it wholesale when Schritt 2 is actually built.
 */
@Component({
  selector: 'app-intake-step-two-placeholder',
  templateUrl: './intake-step-two-placeholder.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntakeStepTwoPlaceholder {
  readonly sellerId = input.required<string>();
}
