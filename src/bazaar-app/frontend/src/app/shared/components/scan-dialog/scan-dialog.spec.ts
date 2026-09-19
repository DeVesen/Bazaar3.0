import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScanCompleteEvent, ScanDialog } from './scan-dialog';
import { InputGroup } from '../input-group/input-group';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';

/**
 * `InputGroup` (a real dependency of `ScanDialog`) itself depends on `BarcodeScanner`, which
 * depends on `@zxing/browser` — mocked the same way `seller-search.spec.ts`/`input-group.spec.ts`
 * do so camera-mode tests never touch real device APIs (unavailable in jsdom).
 */
const decodeFromVideoDeviceMock = vi.fn();
vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(function (this: {
    decodeFromVideoDevice: typeof decodeFromVideoDeviceMock;
  }) {
    this.decodeFromVideoDevice = decodeFromVideoDeviceMock;
  }),
}));

interface PendingArticleFixture {
  id: string;
  number: number;
  name: string;
  status: string;
}

interface ByNumberFixture {
  id: string;
  number: number;
  name: string;
  sellerId: string;
  status: string;
}

/**
 * No `HttpClientTestingModule` convention exists yet for a component spec in this repo (checked —
 * only interceptor/page specs use it, none for a `shared/components` leaf), and the Task-3 brief
 * explicitly allows a direct fake/spy instead, "consistent with how this project generally avoids
 * real HTTP in component specs" — so `HttpClient` itself is replaced with a minimal fake `get()`.
 */
function httpClientMock(config: {
  pending?: PendingArticleFixture[];
  byNumber?: Record<number, ByNumberFixture | HttpErrorResponse>;
}) {
  const get = vi.fn((url: string) => {
    const byNumberMatch = url.match(/\/api\/articles\/by-number\/(\d+)$/);
    if (byNumberMatch) {
      const number = Number(byNumberMatch[1]);
      const response = config.byNumber?.[number];
      if (response instanceof HttpErrorResponse) {
        return throwError(() => response);
      }
      if (response === undefined) {
        return throwError(() => new HttpErrorResponse({ status: 404 }));
      }
      return of(response);
    }
    if (/\/api\/sellers\/.+\/articles$/.test(url)) {
      return of(config.pending ?? []);
    }
    throw new Error(`Unexpected GET ${url}`);
  });
  return { get } as unknown as HttpClient;
}

describe('ScanDialog', () => {
  beforeEach(() => {
    decodeFromVideoDeviceMock.mockReset();
    decodeFromVideoDeviceMock.mockResolvedValue({ stop: vi.fn() });

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function create(
    http: HttpClient,
    opts: { sellerId?: string; targetField?: 'releasedAt' | 'returnedAt'; visible?: boolean; pauseMs?: number } = {},
  ) {
    await TestBed.configureTestingModule({
      imports: [ScanDialog],
      providers: [{ provide: HttpClient, useValue: http }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ScanDialog);
    fixture.componentRef.setInput('title', 'Artikel freigeben');
    fixture.componentRef.setInput('sellerId', opts.sellerId ?? 'SEL1');
    fixture.componentRef.setInput('targetField', opts.targetField ?? 'releasedAt');
    fixture.componentRef.setInput('visible', opts.visible ?? true);
    if (opts.pauseMs !== undefined) fixture.componentRef.setInput('pauseMs', opts.pauseMs);
    fixture.detectChanges();
    return fixture;
  }

  function inputGroupOf(fixture: Awaited<ReturnType<typeof create>>): InputGroup {
    return fixture.debugElement.query(By.directive(InputGroup)).componentInstance as InputGroup;
  }

  function typeInto(fixture: Awaited<ReturnType<typeof create>>, text: string) {
    inputGroupOf(fixture).onTyped(text);
    fixture.detectChanges();
  }

  describe('AutoComplete-list filtering', () => {
    const pending: PendingArticleFixture[] = [
      { id: 'A1', number: 101, name: 'Jacke blau', status: 'registered' },
      { id: 'A2', number: 102, name: 'Hose grau', status: 'registered' },
      { id: 'A3', number: 999, name: 'Pullover rot', status: 'registered' },
    ];

    it('shows all pending articles for the current targetField when the field is empty', async () => {
      const fixture = await create(httpClientMock({ pending }));
      expect(fixture.componentInstance.pendingList()).toEqual(pending);
    });

    it('filters the pending list by numeric substring on the typed text', async () => {
      const fixture = await create(httpClientMock({ pending }));
      typeInto(fixture, '10');
      expect(fixture.componentInstance.pendingList()).toEqual([pending[0], pending[1]]);
    });

    it('shows "Artikel nicht bekannt" only when pending articles exist but none match the filter', async () => {
      const fixture = await create(httpClientMock({ pending }));

      expect(fixture.componentInstance.showUnknownMessage()).toBe(false);

      typeInto(fixture, '555');
      expect(fixture.componentInstance.showUnknownMessage()).toBe(true);
      expect(fixture.nativeElement.textContent).toContain('Artikel nicht bekannt');
    });

    it('shows the targetField-specific "all done" message once no pending articles remain', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));
      expect(fixture.componentInstance.showUnknownMessage()).toBe(false);
      expect(fixture.componentInstance.allDoneMessage()).toBe('Alle Artikel freigegeben.');
      expect(fixture.nativeElement.textContent).toContain('Alle Artikel freigegeben.');
    });

    it('uses the returnedAt "all done" wording when targetField is returnedAt', async () => {
      const fixture = await create(httpClientMock({ pending: [] }), { targetField: 'returnedAt' });
      expect(fixture.componentInstance.allDoneMessage()).toBe('Alle Artikel zurückgegeben.');
    });

    it('excludes an article from the pending list once it enters the session, without a second lookup', async () => {
      const article: ByNumberFixture = { id: 'A1', number: 101, name: 'Jacke blau', sellerId: 'SEL1', status: 'registered' };
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }));

      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      expect(fixture.componentInstance.pendingList().find((a) => a.id === 'A1')).toBeUndefined();
    });
  });

  describe('Sitzungssammlung ohne Duplikate', () => {
    const pending: PendingArticleFixture[] = [{ id: 'A1', number: 101, name: 'Jacke blau', status: 'registered' }];
    const article: ByNumberFixture = { id: 'A1', number: 101, name: 'Jacke blau', sellerId: 'SEL1', status: 'registered' };

    it('emits success + the full session snapshot on the first validated entry', async () => {
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }));
      const scanCompletes: ScanCompleteEvent[] = [];
      const sessionSnapshots: readonly (readonly string[])[] = [];
      fixture.componentInstance.scanComplete.subscribe((e) => scanCompletes.push(e));
      fixture.componentInstance.sessionArticleIds.subscribe((ids) => (sessionSnapshots as string[][]).push([...ids]));

      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      expect(scanCompletes).toEqual([{ articleId: 'A1', result: 'success' }]);
      // First emission is the open-triggered reset to `[]`, second is the real snapshot after A1.
      expect(sessionSnapshots.at(-1)).toEqual(['A1']);
    });

    it('yields "already-set" (not a second success) when the same article is re-entered, and does not re-emit sessionArticleIds', async () => {
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }));
      const scanCompletes: ScanCompleteEvent[] = [];
      const sessionEmissionCount = { value: 0 };
      fixture.componentInstance.scanComplete.subscribe((e) => scanCompletes.push(e));
      fixture.componentInstance.sessionArticleIds.subscribe(() => sessionEmissionCount.value++);

      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();
      const emissionsAfterFirst = sessionEmissionCount.value;

      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      expect(scanCompletes).toEqual([
        { articleId: 'A1', result: 'success' },
        { articleId: 'A1', result: 'already-set' },
      ]);
      // No additional sessionArticleIds emission for the duplicate — the session list itself did
      // not change.
      expect(sessionEmissionCount.value).toBe(emissionsAfterFirst);
    });

    it('clears the input field after a success', async () => {
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }));

      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();
      fixture.detectChanges();

      expect(inputGroupOf(fixture).rawValue()).toBe('');
    });
  });

  describe('Feedback colors per result (camera mode)', () => {
    function scannerOf(fixture: Awaited<ReturnType<typeof create>>): BarcodeScanner {
      return fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;
    }

    function enterCameraMode(fixture: Awaited<ReturnType<typeof create>>) {
      inputGroupOf(fixture).switchMode('camera');
      fixture.detectChanges();
    }

    it('shows success for a matching, not-yet-sessioned article', async () => {
      const pending: PendingArticleFixture[] = [{ id: 'A1', number: 101, name: 'Jacke', status: 'registered' }];
      const article: ByNumberFixture = { id: 'A1', number: 101, name: 'Jacke', sellerId: 'SEL1', status: 'registered' };
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }), { pauseMs: 0 });
      vi.useFakeTimers();

      enterCameraMode(fixture);
      scannerOf(fixture).codeDetected.emit('101');
      fixture.detectChanges();

      expect(fixture.componentInstance.scanFeedbackResult()).toBe('success');
    });

    it('shows unknown for a number that does not belong to this seller / does not match the targetField status', async () => {
      const other: ByNumberFixture = { id: 'A2', number: 202, name: 'Hose', sellerId: 'OTHER', status: 'registered' };
      const fixture = await create(httpClientMock({ pending: [], byNumber: { 202: other } }), { pauseMs: 0 });
      vi.useFakeTimers();

      enterCameraMode(fixture);
      scannerOf(fixture).codeDetected.emit('202');
      fixture.detectChanges();

      expect(fixture.componentInstance.scanFeedbackResult()).toBe('unknown');
    });

    it('shows unknown for a number that does not exist at all (404)', async () => {
      const fixture = await create(httpClientMock({ pending: [], byNumber: {} }), { pauseMs: 0 });
      vi.useFakeTimers();

      enterCameraMode(fixture);
      scannerOf(fixture).codeDetected.emit('303');
      fixture.detectChanges();

      expect(fixture.componentInstance.scanFeedbackResult()).toBe('unknown');
    });

    it('shows already-set for an article already captured in this session', async () => {
      const pending: PendingArticleFixture[] = [{ id: 'A1', number: 101, name: 'Jacke', status: 'registered' }];
      const article: ByNumberFixture = { id: 'A1', number: 101, name: 'Jacke', sellerId: 'SEL1', status: 'registered' };
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }), { pauseMs: 0 });
      vi.useFakeTimers();

      enterCameraMode(fixture);
      scannerOf(fixture).codeDetected.emit('101');
      fixture.detectChanges();
      vi.advanceTimersByTime(0);

      scannerOf(fixture).codeDetected.emit('101');
      fixture.detectChanges();

      expect(fixture.componentInstance.scanFeedbackResult()).toBe('already-set');
    });

    it('ignores a repeated codeDetected while scan-feedback is still showing (dauerscan lock)', async () => {
      const pending: PendingArticleFixture[] = [{ id: 'A1', number: 101, name: 'Jacke', status: 'registered' }];
      const article: ByNumberFixture = { id: 'A1', number: 101, name: 'Jacke', sellerId: 'SEL1', status: 'registered' };
      const http = httpClientMock({ pending, byNumber: { 101: article } });
      const fixture = await create(http, { pauseMs: 3000 });
      vi.useFakeTimers();

      enterCameraMode(fixture);
      const callsBefore = (http.get as ReturnType<typeof vi.fn>).mock.calls.length;
      scannerOf(fixture).codeDetected.emit('101');
      fixture.detectChanges();
      const callsAfterFirst = (http.get as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(callsAfterFirst).toBeGreaterThan(callsBefore);

      // Still locked — no second lookup.
      scannerOf(fixture).codeDetected.emit('101');
      fixture.detectChanges();
      expect((http.get as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterFirst);

      // Lock released after pauseMs.
      vi.advanceTimersByTime(3000);
      scannerOf(fixture).codeDetected.emit('101');
      fixture.detectChanges();
      expect((http.get as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(callsAfterFirst);
    });
  });
});
