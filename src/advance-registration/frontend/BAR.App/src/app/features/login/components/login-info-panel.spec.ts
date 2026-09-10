import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoginInfoPanel } from './login-info-panel';
import { PublicInfo } from '../../../core/public-info/public-info.service';

describe('LoginInfoPanel', () => {
  let fixture: ComponentFixture<LoginInfoPanel>;

  const emptyInfo: PublicInfo = {
    registrationDeadline: null,
    dropOffFrom: null,
    dropOffUntil: null,
    bazaarFrom: null,
    bazaarUntil: null,
    defaultConditions: null,
    infoText: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoginInfoPanel], providers: [provideTranslateService()] }).compileComponents();
    fixture = TestBed.createComponent(LoginInfoPanel);
  });

  function setInfo(info: PublicInfo): void {
    fixture.componentRef.setInput('info', info);
    fixture.detectChanges();
  }

  it('hides all three boxes and keeps the panel root rendered when everything is null', () => {
    setInfo(emptyInfo);

    expect(fixture.nativeElement.querySelector('app-countdown')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="conditions-box"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="markdown-box"]')).toBeNull();
    // Panel-Root selbst bleibt im DOM (AC-13) — der Host wird nicht entfernt,
    // auch wenn alle drei Boxen ausgeblendet sind.
    expect(fixture.nativeElement.isConnected).toBe(true);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the countdown box when at least one of the five dates is set', () => {
    setInfo({ ...emptyInfo, registrationDeadline: '2026-12-01T00:00:00Z' });

    expect(fixture.nativeElement.querySelector('app-countdown')).not.toBeNull();
  });

  it('hides the countdown box only when all five dates are null', () => {
    setInfo(emptyInfo);

    expect(fixture.nativeElement.querySelector('app-countdown')).toBeNull();
  });

  it('hides the conditions box when defaultConditions is null', () => {
    setInfo(emptyInfo);

    expect(fixture.nativeElement.querySelector('[data-testid="conditions-box"]')).toBeNull();
  });

  it('shows the conditions box when defaultConditions is set', () => {
    setInfo({ ...emptyInfo, defaultConditions: { commissionRate: 15, itemFee: 0.5 } });

    expect(fixture.nativeElement.querySelector('[data-testid="conditions-box"]')).not.toBeNull();
  });

  it('hides the markdown box when infoText is null', () => {
    setInfo(emptyInfo);

    expect(fixture.nativeElement.querySelector('[data-testid="markdown-box"]')).toBeNull();
  });

  it('hides the markdown box when infoText is an empty string', () => {
    setInfo({ ...emptyInfo, infoText: '' });

    expect(fixture.nativeElement.querySelector('[data-testid="markdown-box"]')).toBeNull();
  });

  it('hides the markdown box when infoText is whitespace-only', () => {
    setInfo({ ...emptyInfo, infoText: '   \n\t  ' });

    expect(fixture.nativeElement.querySelector('[data-testid="markdown-box"]')).toBeNull();
  });

  it('shows the markdown box when infoText has content', () => {
    setInfo({ ...emptyInfo, infoText: 'Willkommen beim Basar!' });

    expect(fixture.nativeElement.querySelector('[data-testid="markdown-box"]')).not.toBeNull();
  });

  it('shows all three boxes independently when all fields are set', () => {
    setInfo({
      registrationDeadline: '2026-12-01T00:00:00Z',
      dropOffFrom: '2026-12-05T00:00:00Z',
      dropOffUntil: '2026-12-06T00:00:00Z',
      bazaarFrom: '2026-12-10T00:00:00Z',
      bazaarUntil: '2026-12-11T00:00:00Z',
      defaultConditions: { commissionRate: 15, itemFee: 0.5 },
      infoText: 'Hinweistext'
    });

    expect(fixture.nativeElement.querySelector('app-countdown')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="conditions-box"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="markdown-box"]')).not.toBeNull();
  });
});
