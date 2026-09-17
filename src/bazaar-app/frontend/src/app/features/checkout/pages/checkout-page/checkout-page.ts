import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-checkout-page',
  template: `<p>Verkauf</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {}
