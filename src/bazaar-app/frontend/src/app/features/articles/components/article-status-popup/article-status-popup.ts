import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';

/**
 * The four status timestamps this popup shows (component.md §2). `settledAt` is
 * intentionally NOT part of this shape — it belongs to the article's SELLER, not the
 * article, and is fed in separately via the `settledAt` input (display-only, see below).
 */
export interface ArticleStatusValue {
  createdAt: string;
  releasedAt: string | null;
  soldAt: string | null;
  returnedAt: string | null;
}

/** Full replace payload emitted after any confirmed set/clear action — mirrors
 * `UpdateArticleTimestampsRequest` (Task 4/5) minus `createdAt`, which is immutable. */
export interface ArticleTimestampsChange {
  releasedAt: string | null;
  soldAt: string | null;
  returnedAt: string | null;
}

/**
 * Admin-only timestamp-correction popup for Round-15 "Artikel-Übersicht & Korrektur" (Task 8).
 * Repair tool for the four article status timestamps — see
 * `docs/requirements/bazaar-app/components/article-status-popup.md` for the full spec
 * (ASCII mockup, cascade example, acceptance criteria).
 *
 * Each row's icon click commits immediately (after any required confirmation) via
 * `timestampsChange` — there is no separate "Speichern" step, matching the ASCII mockup's
 * footer ("Schließen" only).
 *
 * This component does not perform its own admin/role check — per the brief, AC-1's
 * "Admin-only" requirement is about the status badge being unclickable for Kassenpersonal
 * in the PARENT page, not about this already-open popup hiding icons for a hypothetical
 * non-admin viewer.
 */
@Component({
  selector: 'app-article-status-popup',
  imports: [DatePipe, RouterLink, DialogModule, ConfirmDialogModule, ButtonModule],
  templateUrl: './article-status-popup.html',
  styleUrl: './article-status-popup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleStatusPopup {
  private readonly confirmationService = inject(ConfirmationService);

  readonly visible = input.required<boolean>();
  readonly articleNumber = input.required<number>();
  readonly value = input.required<ArticleStatusValue>();
  /** The article's seller's settlement timestamp — display-only, never written here. */
  readonly settledAt = input<string | null>(null);
  /** True when the seller is settled — drives the "alle Icons deaktiviert" lock (component.md §4). */
  readonly settlementLocked = input<boolean>(false);
  readonly saving = input<boolean>(false);

  readonly visibleChange = output<boolean>();
  /** Emits the full replace payload once a set/clear action is confirmed. */
  readonly timestampsChange = output<ArticleTimestampsChange>();

  readonly dialogTitle = computed(() => `Artikel ${this.articleNumber()} — Status`);

  /** `releasedAt`'s set/delete icon has no mutual-exclusion rule — only the settlement lock
   * and an in-flight save disable it. */
  readonly releasedActionDisabled = computed(() => this.settlementLocked() || this.saving());

  /** Deleting `soldAt` is never blocked by mutual exclusion (only setting is). */
  readonly soldDeleteDisabled = computed(() => this.settlementLocked() || this.saving());
  /** AC-4: `returnedAt` set -> `soldAt`'s Setzen-icon disabled (a sold article can't also be
   * returned). */
  readonly soldSetDisabled = computed(
    () => this.settlementLocked() || this.saving() || this.value().returnedAt != null,
  );

  readonly returnedDeleteDisabled = computed(() => this.settlementLocked() || this.saving());
  /** AC-4, mirrored: `soldAt` set -> `returnedAt`'s Setzen-icon disabled. */
  readonly returnedSetDisabled = computed(
    () => this.settlementLocked() || this.saving() || this.value().soldAt != null,
  );

  onClose(): void {
    this.visibleChange.emit(false);
  }

  onSetReleased(): void {
    const v = this.value();
    this.emitChange({ releasedAt: new Date().toISOString(), soldAt: v.soldAt, returnedAt: v.returnedAt });
  }

  /**
   * component.md §3 (cascade): deleting `releasedAt` also nulls `soldAt`/`returnedAt`.
   * Brief resolution ("mit Wert", overriding the doc's own illustrative ASCII example which
   * shows both downstream fields listed even when one is "—"): the confirmation only lists
   * — and only fires at all — for downstream fields that currently HOLD a value. If neither
   * `soldAt` nor `returnedAt` is set, there is nothing to cascade and this is a plain
   * single-field change with no confirmation (AC-3's own conditional: the confirmation only
   * applies "WHEN ... dessen Kaskade weitere Zeitstempel entfernt").
   */
  onDeleteReleased(): void {
    const v = this.value();
    const cascaded: string[] = [];
    if (v.soldAt != null) cascaded.push(`Verkauft am ${this.formatDate(v.soldAt)}`);
    if (v.returnedAt != null) cascaded.push(`Rückgegeben am ${this.formatDate(v.returnedAt)}`);

    if (cascaded.length === 0) {
      this.emitChange({ releasedAt: null, soldAt: v.soldAt, returnedAt: v.returnedAt });
      return;
    }

    this.confirmationService.confirm({
      key: 'cascadeDelete',
      header: 'Freigabe entfernen?',
      message: `Damit werden ebenfalls entfernt:\n${cascaded.map((c) => `• ${c}`).join('\n')}`,
      accept: () => {
        this.emitChange({ releasedAt: null, soldAt: null, returnedAt: null });
      },
    });
  }

  /** AC-6: setting `soldAt` from null through this popup warns first — the article ends up
   * marked `soldManually` server-side (`UpdateArticleTimestampsHandler`, Task 4), not this
   * component's concern beyond showing the warning. */
  onSetSold(): void {
    const v = this.value();
    this.confirmationService.confirm({
      key: 'manualSale',
      header: 'Verkauft Am setzen',
      message: 'Dieser Verkauf entsteht ohne Kassenvorgang und fehlt in der Kassenabstimmung.',
      accept: () => {
        this.emitChange({
          releasedAt: v.releasedAt,
          soldAt: new Date().toISOString(),
          returnedAt: v.returnedAt,
        });
      },
    });
  }

  /** Deleting `soldAt` directly has no further cascade (component.md §3). */
  onDeleteSold(): void {
    const v = this.value();
    this.emitChange({ releasedAt: v.releasedAt, soldAt: null, returnedAt: v.returnedAt });
  }

  onSetReturned(): void {
    const v = this.value();
    this.emitChange({ releasedAt: v.releasedAt, soldAt: v.soldAt, returnedAt: new Date().toISOString() });
  }

  /** Deleting `returnedAt` directly has no further cascade (component.md §3). */
  onDeleteReturned(): void {
    const v = this.value();
    this.emitChange({ releasedAt: v.releasedAt, soldAt: v.soldAt, returnedAt: null });
  }

  private emitChange(payload: ArticleTimestampsChange): void {
    this.timestampsChange.emit(payload);
  }

  /**
   * Matches `sellers-page.ts`'s private `formatDate` helper convention, but deliberately
   * omits an explicit `'de-DE'` locale argument: the format string (`dd.MM.yyyy HH:mm`) is
   * digits-only and locale-independent, and instantiating `DatePipe` with a locale id that
   * has no registered locale data (this project registers none — checked `main.ts`/
   * `app.config.ts`) throws `NG0701`. The default `LOCALE_ID` (`en-US`, built into Angular)
   * needs no registration and produces the identical output for this pattern.
   */
  private formatDate(value: string): string {
    return new DatePipe('en-US').transform(value, 'dd.MM.yyyy HH:mm') ?? value;
  }
}
