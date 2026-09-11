import { Component, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Countdown } from '@shared/countdown/countdown';
import { CountdownPhase } from '@shared/countdown/select-active-phase';
import { MarkdownText } from '@shared/markdown-text/markdown-text';
import { PublicInfo } from '@core/public-info/public-info.service';

// Orchestriert drei unabhaengige Anzeige-Boxen (Countdown/Konditionen/Markdown) ueber
// `GET /api/public/info` (docs/requirements/advance-registration/components/login-info-panel.md).
// Das Ausblenden-pro-Box entscheidet dieses Panel, nicht die Kind-Komponenten — der Panel-Root
// selbst bleibt immer sichtbar (dunkler Hintergrund, volle Flaeche), auch wenn alle drei Boxen
// leer sind (Epic_Login AC-13).
@Component({
  selector: 'app-login-info-panel',
  imports: [Countdown, MarkdownText, TranslatePipe],
  template: `
    @if (countdownPhases.length > 0) {
      <app-countdown [phases]="countdownPhases" />
    }
    @if (info().defaultConditions; as conditions) {
      <div data-testid="conditions-box" class="login-info-panel__box">
        <span>{{ conditions.commissionRate }} {{ 'login.commissionSuffix' | translate }}</span>
        <span>{{ formattedItemFee(conditions.itemFee) }} {{ 'login.itemFeeSuffix' | translate }}</span>
      </div>
    }
    @if (hasInfoText()) {
      <div data-testid="markdown-box" class="login-info-panel__box">
        <app-markdown-text [content]="info().infoText" />
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        background: #1b3a4b;
        padding: 60px 48px;
      }

      .login-info-panel__box {
        background: rgba(255, 255, 255, 0.07);
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 20px;
        color: white;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      app-countdown {
        display: block;
        margin-bottom: 20px;
      }
    `
  ]
})
export class LoginInfoPanel {
  private readonly translate = inject(TranslateService);

  readonly info = input.required<PublicInfo>();

  // Plain getter statt computed(): translate.instant() ist fuer computed()'s Dependency-Tracking
  // unsichtbar (siehe HomePage.dropOffPhases/adminPhases), daher wuerde ein computed() bei einem
  // Sprachwechsel nicht neu ausgewertet und die Phasen-Labels blieben eingefroren. Der Getter
  // laeuft bei jedem Change-Detection-Durchlauf neu, den die TranslatePipe-Nutzung im Template
  // ohnehin bei jedem Sprachwechsel ausloest.
  get countdownPhases(): CountdownPhase[] {
    const i = this.info();
    const candidates: { label: string; targetDate: string | null }[] = [
      { label: this.translate.instant('login.phaseRegistrationDeadline'), targetDate: i.registrationDeadline },
      { label: this.translate.instant('login.phaseDropOffFrom'), targetDate: i.dropOffFrom },
      { label: this.translate.instant('login.phaseDropOffUntil'), targetDate: i.dropOffUntil },
      { label: this.translate.instant('login.phaseBazaarFrom'), targetDate: i.bazaarFrom },
      { label: this.translate.instant('login.phaseBazaarUntil'), targetDate: i.bazaarUntil }
    ];

    return candidates
      .filter((c): c is { label: string; targetDate: string } => c.targetDate !== null)
      .map((c) => ({ label: c.label, targetDate: new Date(c.targetDate) }));
  }

  hasInfoText(): boolean {
    const text = this.info().infoText;
    return !!text && text.trim().length > 0;
  }

  formattedItemFee(itemFee: number): string {
    return `${itemFee.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  }
}
