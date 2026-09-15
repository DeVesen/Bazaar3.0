import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FluidModule } from 'primeng/fluid';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import type { SellerType, SellerTypePayload } from '../seller-type-api.service';

@Component({
  selector: 'app-seller-type-popup',
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, FluidModule, TranslatePipe],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" [header]="dialogTitle">
      <p-fluid>
      <div class="field">
        <label for="typ-name">{{ 'typPopup.name' | translate }}</label>
        <input id="typ-name" pInputText [(ngModel)]="nameModel" autofocus />
        @if (nameError()) {
          <small class="field-error">{{ nameError() }}</small>
        }
      </div>

      <div class="field">
        <label for="typ-commission">{{ 'typPopup.commissionRate' | translate }}</label>
        <p-inputnumber id="typ-commission" [(ngModel)]="commissionRateModel" mode="decimal" [minFractionDigits]="2" suffix="%" [min]="0" [max]="100" />
      </div>

      <div class="field">
        <label for="typ-fee">{{ 'typPopup.itemFee' | translate }}</label>
        <p-inputnumber id="typ-fee" [(ngModel)]="itemFeeModel" mode="currency" currency="EUR" locale="de-DE" [min]="0" />
      </div>
      </p-fluid>

      <div class="dialog-footer">
        <button pButton type="button" [text]="true" severity="secondary" (click)="cancel()">{{ 'common.cancel' | translate }}</button>
        <button pButton type="button" [disabled]="!canSubmit()" (click)="submit()">{{ 'common.save' | translate }}</button>
      </div>
    </p-dialog>
  `
})
export class SellerTypePopup {
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly visible = model<boolean>(false);
  readonly item = input<SellerType | null>(null);
  readonly saveFn = input.required<(payload: SellerTypePayload, id: string | undefined) => Observable<SellerType>>();
  readonly saved = output<SellerType>();

  readonly name = signal('');
  readonly commissionRate = signal(0);
  readonly itemFee = signal(0);
  readonly nameError = signal<string | null>(null);

  get dialogTitle(): string {
    return this.translate.instant(this.item() ? 'typPopup.editTitle' : 'typPopup.createTitle');
  }

  get nameModel() { return this.name(); }
  set nameModel(v: string) { this.name.set(v); this.nameError.set(null); }

  get commissionRateModel() { return this.commissionRate(); }
  set commissionRateModel(v: number) { this.commissionRate.set(v); }

  get itemFeeModel() { return this.itemFee(); }
  set itemFeeModel(v: number) { this.itemFee.set(v); }

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }

  readonly canSubmit = computed(() =>
    this.name().trim().length > 0 &&
    this.commissionRate() >= 0 && this.commissionRate() <= 100 &&
    this.itemFee() >= 0
  );

  constructor() {
    effect(() => {
      if (this.visible()) {
        const current = this.item();
        this.name.set(current?.name ?? '');
        this.commissionRate.set(current?.commissionRate ?? 0);
        this.itemFee.set(current?.itemFee ?? 0);
        this.nameError.set(null);
      }
    });
  }

  cancel(): void {
    this.visible.set(false);
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const payload: SellerTypePayload = { name: this.name().trim(), commissionRate: this.commissionRate(), itemFee: this.itemFee() };
    this.saveFn()(payload, this.item()?.id).subscribe({
      next: (result) => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('typPopup.saved') });
        this.saved.emit(result);
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.nameError.set(
          err.status === 409 ? (err.error?.detail ?? this.translate.instant('typPopup.nameTaken')) : this.translate.instant('typPopup.saveFailed')
        );
      }
    });
  }
}
