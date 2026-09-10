import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { By } from '@angular/platform-browser';
import { CountdownEmbedPage } from './CountdownEmbedPage';
import { Countdown } from '../../../shared/countdown/countdown';

const FULL_INFO = {
  registrationDeadline: '2026-09-30T23:59:00+02:00',
  dropOffFrom: '2026-10-05T08:00:00+02:00',
  dropOffUntil: '2026-10-05T18:00:00+02:00',
  bazaarFrom: '2026-10-06T09:00:00+02:00',
  bazaarUntil: '2026-10-06T16:00:00+02:00',
  defaultConditions: null,
  infoText: null
};

function create() {
  const fixture: ComponentFixture<CountdownEmbedPage> = TestBed.createComponent(CountdownEmbedPage);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock };
}

describe('CountdownEmbedPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CountdownEmbedPage],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it('renders the countdown component in timeline variant once loaded', () => {
    const { fixture, httpMock } = create();
    httpMock.expectOne('/api/public/info').flush(FULL_INFO);
    fixture.detectChanges();

    const countdown = fixture.debugElement.query(By.directive(Countdown));
    expect(countdown).not.toBeNull();
    expect(countdown.componentInstance.variant()).toBe('timeline');
  });

  it('maps all five phases with their embed labels when every date is set', () => {
    const { fixture, httpMock } = create();
    httpMock.expectOne('/api/public/info').flush(FULL_INFO);
    fixture.detectChanges();

    const countdown = fixture.debugElement.query(By.directive(Countdown));
    const labels = countdown.componentInstance.phases().map((p: { label: string }) => p.label);
    expect(labels).toEqual(['Voranmeldung endet', 'Abgabe beginnt', 'Abgabe endet', 'Basar beginnt', 'Basar endet']);
  });

  it('skips a phase whose date is not maintained (null) — AC-7', () => {
    const { fixture, httpMock } = create();
    httpMock.expectOne('/api/public/info').flush({ ...FULL_INFO, registrationDeadline: null });
    fixture.detectChanges();

    const countdown = fixture.debugElement.query(By.directive(Countdown));
    const labels = countdown.componentInstance.phases().map((p: { label: string }) => p.label);
    expect(labels).toEqual(['Abgabe beginnt', 'Abgabe endet', 'Basar beginnt', 'Basar endet']);
  });

  it('renders no countdown when no date is maintained at all, without erroring', () => {
    const { fixture, httpMock } = create();
    httpMock.expectOne('/api/public/info').flush({
      registrationDeadline: null,
      dropOffFrom: null,
      dropOffUntil: null,
      bazaarFrom: null,
      bazaarUntil: null,
      defaultConditions: null,
      infoText: null
    });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(Countdown))).toBeNull();
  });
});
