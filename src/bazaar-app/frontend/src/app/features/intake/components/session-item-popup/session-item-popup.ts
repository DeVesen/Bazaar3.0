import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AutocompleteCreate } from '../../../../shared/components/autocomplete-create/autocomplete-create';
import { InputGroup } from '../../../../shared/components/input-group/input-group';

/**
 * One in-memory session-list entry (an article not yet booked) as edited by this popup —
 * spec.md "Übersicht (rechts, 30%)" — "Klick auf Eintrag → kleines, feature-lokales Popup".
 * Deliberately NOT the same shape/component as `ArtikelFormValue`/`ArtikelDialog`
 * (features/articles) — spec.md explicitly calls out "kein Bezug zum Round-15-Artikel-Dialog —
 * unterschiedliche Zwecke, keine gemeinsame Komponente".
 */
export interface SessionItemFormValue {
  name: string;
  category: string;
  brand: string;
  price: number;
}

/**
 * Feature-local popup for editing one already-entered, not-yet-booked session-list item during
 * Artikelannahme (Round-17 Task 5). Pure in-memory form editing — NO HTTP calls of its own; the
 * parent owns loading `categoryOptions()`/`brandOptions()` and persisting a brand/category
 * created via `app-autocomplete-create` (mirrors `ArtikelDialog`'s API-less sibling split, same
 * `entryCreated` -> dedicated output pattern).
 */
@Component({
  selector: 'app-session-item-popup',
  imports: [FormsModule, DialogModule, InputTextModule, ButtonModule, AutocompleteCreate, InputGroup],
  templateUrl: './session-item-popup.html',
  styleUrl: './session-item-popup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionItemPopup {
  readonly visible = input.required<boolean>();
  readonly initialValue = input<SessionItemFormValue | null>(null);
  readonly categoryOptions = input.required<string[]>();
  readonly brandOptions = input.required<string[]>();

  readonly visibleChange = output<boolean>();
  readonly save = output<SessionItemFormValue>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();
  readonly categoryCreated = output<string>();
  readonly brandCreated = output<string>();

  /**
   * Same viewChild+effect seeding pattern as `ArtikelDialog` — `input-group`'s price variant has
   * no reactive `value` input (Round-16), only the imperative `applyExternalValue()`.
   */
  private readonly priceInputGroup = viewChild(InputGroup);

  readonly name = signal('');
  readonly category = signal('');
  readonly brand = signal('');
  readonly price = signal(0);

  readonly canSave = computed(
    () =>
      this.name().trim().length > 0 &&
      this.category().length > 0 &&
      this.brand().length > 0 &&
      this.price() > 0,
  );

  constructor() {
    effect(() => {
      if (!this.visible()) return;

      const initial = this.initialValue();
      this.name.set(initial?.name ?? '');
      this.category.set(initial?.category ?? '');
      this.brand.set(initial?.brand ?? '');
      this.price.set(initial?.price ?? 0);
    });

    // Separate from the seeding effect above — deliberately does NOT read `price()`, so typing
    // into `input-group` never re-triggers this and fights the user's own input (see
    // `ArtikelDialog`'s matching comment for the full rationale).
    effect(() => {
      if (!this.visible()) return;
      const inputGroup = this.priceInputGroup();
      if (!inputGroup) return;
      const initial = this.initialValue();
      inputGroup.applyExternalValue(String(initial?.price ?? 0));
    });
  }

  onPriceChange(value: string | number): void {
    this.price.set(typeof value === 'number' ? value : Number(value));
  }

  onSave(): void {
    if (!this.canSave()) return;
    this.save.emit({
      name: this.name().trim(),
      category: this.category(),
      brand: this.brand(),
      price: this.price(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }
}
