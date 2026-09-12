import { Component, computed, inject, signal } from '@angular/core';
import { Countdown } from '@shared/countdown/countdown';
import { CountdownPhase } from '@shared/countdown/select-active-phase';
import { PublicInfoService, PublicInfo } from '@core/public-info/public-info.service';

// Public, unauthenticated route /embed/countdown, outside the AppShell
// (Epic_Countdown_Widget section 1). Renders the 5 bazaar dates from
// `GET /api/public/info` as the countdown 'timeline' variant; an unmaintained
// date (null) is filtered out before being passed on (AC-6/AC-7).
@Component({
  selector: 'app-countdown-embed-page',
  imports: [Countdown],
  template: `
    @if (phases().length > 0) {
      <app-countdown variant="timeline" [phases]="phases()" />
    }
  `
})
export class CountdownEmbedPage {
  private readonly publicInfoService = inject(PublicInfoService);

  readonly info = signal<PublicInfo | null>(null);

  constructor() {
    this.publicInfoService.get().subscribe((value) => this.info.set(value));
  }

  readonly phases = computed<CountdownPhase[]>(() => {
    const i = this.info();
    if (!i) {
      return [];
    }

    const candidates: { label: string; targetDate: string | null }[] = [
      { label: 'Vorregistration endet', targetDate: i.registrationDeadline },
      { label: 'Abgabe beginnt', targetDate: i.dropOffFrom },
      { label: 'Abgabe endet', targetDate: i.dropOffUntil },
      { label: 'Basar beginnt', targetDate: i.bazaarFrom },
      { label: 'Basar endet', targetDate: i.bazaarUntil }
    ];

    return candidates
      .filter((c): c is { label: string; targetDate: string } => c.targetDate !== null)
      .map((c) => ({ label: c.label, targetDate: new Date(c.targetDate) }));
  });
}
