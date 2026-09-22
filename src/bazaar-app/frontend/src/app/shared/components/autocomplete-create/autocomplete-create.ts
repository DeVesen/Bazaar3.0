import { ChangeDetectionStrategy, Component, computed, effect, signal, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';

/**
 * Cross-app shared component: AutoComplete field with an inline "create new entry" flow
 * (docs/components/autocomplete-create/component.md). Two modes, switched automatically from
 * the typed text:
 * - ▾-mode (default): field empty or the typed text matches an existing `options()` entry
 *   exactly — clicking the built-in PrimeNG dropdown button/an entry lets the user pick from
 *   `options()` (`valueChange`).
 * - +-mode (create): typed text matches no entry exactly — the dropdown button is replaced by
 *   a green `+` button; clicking it (or pressing Enter) opens the create modal, and confirming
 *   it emits `entryCreated` with the typed name.
 *
 * This component knows no API — the parent owns persisting a new entry and updating
 * `options()` afterward (component doc, Abschnitt 2). It never calls a backend itself.
 */
@Component({
  selector: 'app-autocomplete-create',
  imports: [
    FormsModule,
    AutoCompleteModule,
    ButtonModule,
    DialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
  ],
  templateUrl: './autocomplete-create.html',
  styleUrl: './autocomplete-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteCreate {
  readonly options = input.required<string[]>();
  readonly value = input<string | null>(null);
  readonly placeholder = input<string>('');
  readonly entityLabel = input.required<string>();
  readonly disabled = input<boolean>(false);
  /** Forwarded onto the internal `p-autocomplete`'s native input, so a parent `<label for="…">`
   * can associate with the field (a11y — `@angular-eslint/template/label-has-associated-control`). */
  readonly inputId = input<string | undefined>(undefined);

  readonly valueChange = output<string>();
  readonly entryCreated = output<string>();

  /** The field's current raw text — kept separate from `value()` so typing never mutates the
   * `value` input (an `input()` is read-only from inside the component); synced from `value()`
   * below whenever the parent sets/resets it from the outside. */
  readonly typedValue = signal('');
  readonly filteredOptions = signal<string[]>([]);

  readonly modalVisible = signal(false);
  readonly modalName = signal('');

  /**
   * +-mode (doc Abschnitt 3): the typed text is non-empty and matches NO existing option
   * exactly (case-insensitive — the doc doesn't spell out case-handling for this component
   * as explicitly as it does for seller-search, but a case-insensitive compare matches how
   * filtering already behaves elsewhere in this codebase and avoids surprising a user who
   * typed "jacken" when the option list holds "Jacken").
   */
  readonly isCreateMode = computed(() => {
    const text = this.typedValue().trim();
    if (!text) return false;
    return !this.options().some((option) => option.toLowerCase() === text.toLowerCase());
  });

  readonly modalTitle = computed(() => `Neue ${this.entityLabel()} anlegen`);

  constructor() {
    // Mirrors an externally set/reset `value()` into the field. Only reads `value()`, so
    // typing (which only touches `typedValue`) never re-triggers this effect.
    effect(() => {
      this.typedValue.set(this.value() ?? '');
    });
  }

  /**
   * `text` is `null` when PrimeNG's own clear (`showClear` icon, or `clear()` internally)
   * calls `updateModel(null)` — that reaches here via `(ngModelChange)`.
   *
   * Recomputes `filteredOptions` itself instead of relying on `onFilter`/`completeMethod`:
   * PrimeNG's `AutoComplete.search()` skips emitting `completeMethod` whenever the typed
   * text is blank (`source === 'input' && query.trim().length === 0` → early return), so
   * without this the dropdown would keep showing whatever was filtered before the field was
   * cleared instead of the full option list.
   */
  onInput(text: string | null): void {
    const value = text ?? '';
    this.typedValue.set(value);
    this.filteredOptions.set(this.computeFilteredOptions(value));
  }

  /**
   * AC-1: narrows the dropdown to options containing the typed text (case-insensitive
   * substring match). An empty query (initial focus, `completeOnFocus`/`minQueryLength=0`)
   * shows all options, per doc Abschnitt 3 "Dropdown-Öffnungsverhalten".
   */
  onFilter(event: AutoCompleteCompleteEvent): void {
    this.filteredOptions.set(this.computeFilteredOptions(event.query));
  }

  private computeFilteredOptions(query: string): string[] {
    const trimmed = query.trim().toLowerCase();
    const options = this.options();
    return trimmed ? options.filter((option) => option.toLowerCase().includes(trimmed)) : [...options];
  }

  /** AC-6: existing entry picked from the dropdown. */
  onSelectOption(event: AutoCompleteSelectEvent): void {
    const selected = String(event.value);
    this.typedValue.set(selected);
    this.valueChange.emit(selected);
  }

  onEnter(): void {
    if (this.isCreateMode()) {
      this.openCreateModal();
    }
  }

  /** AC-3: opens the create modal, pre-filled with the typed value. */
  openCreateModal(): void {
    if (!this.isCreateMode()) return;
    this.modalName.set(this.typedValue().trim());
    this.modalVisible.set(true);
  }

  onModalVisibleChange(visible: boolean): void {
    this.modalVisible.set(visible);
  }

  /** AC-4: confirms the new entry — emits `entryCreated`, closes the modal, fills the field. */
  onModalConfirm(): void {
    const name = this.modalName().trim();
    if (!name) return;

    this.entryCreated.emit(name);
    this.typedValue.set(name);
    this.modalVisible.set(false);
  }

  /** Cancel (button, backdrop, or Escape — all routed through `p-dialog`'s `visibleChange`):
   * closes the modal, field stays unchanged. */
  onModalCancel(): void {
    this.modalVisible.set(false);
  }
}
