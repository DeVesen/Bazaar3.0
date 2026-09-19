import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CartItem } from '../../pages/checkout-page/checkout-page';

/**
 * Pure presentation component (docs/requirements/bazaar-app/components/cart.md) — renders
 * whatever `items()` the parent (`checkout.page.ts`, Task 3) gives it and emits intents
 * (`removeItem`/`clear`/`checkout`). No own state, no own API calls, no duplicate-in-cart
 * check (that lives in `checkout.page.ts`) and no focus-management (also the parent's job,
 * per cart.md §3/AC-3 — this component has no reference to the article-number field).
 */
@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, CardModule, ButtonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  readonly items = input.required<CartItem[]>();

  readonly removeItem = output<string>();
  readonly clear = output<void>();
  readonly checkout = output<void>();

  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.price, 0));

  onRemove(id: string): void {
    this.removeItem.emit(id);
  }

  onClear(): void {
    this.clear.emit();
  }

  onCheckout(): void {
    this.checkout.emit();
  }
}
