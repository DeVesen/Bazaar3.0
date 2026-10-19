import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScanCompleteEvent, ScanDialog } from './scan-dialog';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';
import { Numpad } from '../numpad/numpad';
// eslint-disable-next-line boundaries/dependencies -- see scan-dialog.ts's own justification
import { SettingsService } from '../../../core/settings/settings.service';
// `BarcodeScanner` (a real dependency of `ScanDialog`) itself depends on `@zxing/browser` — this
// imports the ONE shared `@zxing/browser` mock (see that file's own comment for why it must be
// centralized) so camera-mode tests never touch real device APIs (unavailable in jsdom).
import { getDecodeFromVideoDeviceMock } from '../barcode-scanner/testing/zxing-browser.mock';

const decodeFromVideoDeviceMock = getDecodeFromVideoDeviceMock();

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
    opts: {
      sellerId?: string;
      targetField?: 'releasedAt' | 'returnedAt';
      visible?: boolean;
      pauseMs?: number;
      writeMode?: 'batch' | 'immediate';
    } = {},
  ) {
    await TestBed.configureTestingModule({
      imports: [ScanDialog],
      providers: [
        { provide: HttpClient, useValue: http },
        { provide: SettingsService, useValue: { scannerPauseMs: () => 3000 } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ScanDialog);
    fixture.componentRef.setInput('title', 'Artikel freigeben');
    fixture.componentRef.setInput('sellerId', opts.sellerId ?? 'SEL1');
    fixture.componentRef.setInput('targetField', opts.targetField ?? 'releasedAt');
    fixture.componentRef.setInput('visible', opts.visible ?? true);
    if (opts.pauseMs !== undefined) fixture.componentRef.setInput('pauseMs', opts.pauseMs);
    if (opts.writeMode !== undefined) fixture.componentRef.setInput('writeMode', opts.writeMode);
    fixture.detectChanges();
    return fixture;
  }

  function typeInto(fixture: Awaited<ReturnType<typeof create>>, text: string) {
    fixture.componentInstance.onTyped(text);
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

  describe('Auswahlliste in Server-Reihenfolge', () => {
    function pendingOf(numbers: number[], status: string): PendingArticleFixture[] {
      return numbers.map((number) => ({ id: `A${number}`, number, name: `Artikel ${number}`, status }));
    }

    function numbersOf(fixture: Awaited<ReturnType<typeof create>>): number[] {
      return fixture.componentInstance.pendingList().map((article) => article.number);
    }

    it('pendingList_releaseServerDeliversAscending_keepsOrder', async () => {
      // Arrange
      const http = httpClientMock({ pending: pendingOf([3, 12, 101], 'registered') });

      // Act
      const fixture = await create(http, { targetField: 'releasedAt' });

      // Assert
      expect(numbersOf(fixture)).toEqual([3, 12, 101]);
    });

    it('pendingList_returnServerDeliversAscending_keepsOrder', async () => {
      // Arrange
      const http = httpClientMock({ pending: pendingOf([3, 12, 101], 'selling') });

      // Act
      const fixture = await create(http, { targetField: 'returnedAt', writeMode: 'immediate' });

      // Assert
      expect(numbersOf(fixture)).toEqual([3, 12, 101]);
    });

    it('pendingList_numbersWithDifferentDigitCounts_keepsServerOrderOneTwoTen', async () => {
      // Arrange
      const http = httpClientMock({ pending: pendingOf([1, 2, 10], 'registered') });

      // Act
      const fixture = await create(http, { targetField: 'releasedAt' });

      // Assert
      expect(numbersOf(fixture)).toEqual([1, 2, 10]);
    });

    it('pendingList_typedDigitThree_keepsRemainingHitsAscending', async () => {
      // Arrange
      const http = httpClientMock({ pending: pendingOf([3, 13, 31, 45], 'registered') });
      const fixture = await create(http, { targetField: 'releasedAt' });

      // Act
      typeInto(fixture, '3');

      // Assert
      expect(numbersOf(fixture)).toEqual([3, 13, 31]);
    });

    it('pendingList_articleTwelveConfirmedOnReturn_dropsItAndKeepsOrderOfTheRest', async () => {
      // Arrange
      const pending = pendingOf([3, 12, 101], 'selling');
      const articleTwelve: ByNumberFixture = {
        id: 'A12',
        number: 12,
        name: 'Artikel 12',
        sellerId: 'SEL1',
        status: 'selling',
      };
      const http = httpClientMock({ pending, byNumber: { 12: articleTwelve } });
      const fixture = await create(http, { targetField: 'returnedAt', writeMode: 'immediate' });
      typeInto(fixture, '12');

      // Act
      fixture.componentInstance.onSubmit();

      // Assert
      expect(numbersOf(fixture)).toEqual([3, 101]);
    });

    it('template_sellerWithoutPendingArticles_showsAllDoneTextInsteadOfListbox', async () => {
      // Arrange
      const http = httpClientMock({ pending: [] });

      // Act
      const fixture = await create(http, { targetField: 'releasedAt' });

      // Assert
      expect(fixture.nativeElement.querySelector('p-listbox')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Alle Artikel freigegeben.');
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

      expect(fixture.componentInstance.articleNumber()).toBe('');
    });
  });

  describe('Feedback colors per result (camera mode)', () => {
    function scannerOf(fixture: Awaited<ReturnType<typeof create>>): BarcodeScanner {
      return fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;
    }

    function enterCameraMode(fixture: Awaited<ReturnType<typeof create>>) {
      fixture.componentInstance.onAddonClick('camera');
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

      expect(fixture.componentInstance.resultEvent()?.kind).toBe('success');
    });

    it('shows unknown for a number that does not belong to this seller / does not match the targetField status', async () => {
      const other: ByNumberFixture = { id: 'A2', number: 202, name: 'Hose', sellerId: 'OTHER', status: 'registered' };
      const fixture = await create(httpClientMock({ pending: [], byNumber: { 202: other } }), { pauseMs: 0 });
      vi.useFakeTimers();

      enterCameraMode(fixture);
      scannerOf(fixture).codeDetected.emit('202');
      fixture.detectChanges();

      expect(fixture.componentInstance.resultEvent()?.kind).toBe('failed');
    });

    it('shows unknown for a number that does not exist at all (404)', async () => {
      const fixture = await create(httpClientMock({ pending: [], byNumber: {} }), { pauseMs: 0 });
      vi.useFakeTimers();

      enterCameraMode(fixture);
      scannerOf(fixture).codeDetected.emit('303');
      fixture.detectChanges();

      expect(fixture.componentInstance.resultEvent()?.kind).toBe('failed');
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

      expect(fixture.componentInstance.resultEvent()?.kind).toBe('already');
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

  describe('Ergebnis-Einblendung (all dialogs, all input paths)', () => {
    type Fixture = Awaited<ReturnType<typeof create>>;
    type Path = 'keyboard' | 'numpad' | 'listbox' | 'camera';
    const ALL_PATHS: Path[] = ['keyboard', 'numpad', 'listbox', 'camera'];

    function byNumber(status: string, sellerId = 'SEL1'): ByNumberFixture {
      return { id: 'A1', number: 101, name: 'Jacke', sellerId, status };
    }

    function pendingFor(status: string): PendingArticleFixture[] {
      return [{ id: 'A1', number: 101, name: 'Jacke', status }];
    }

    function releaseDialog(article: ByNumberFixture | HttpErrorResponse | undefined) {
      const byNumberMap: Record<number, ByNumberFixture | HttpErrorResponse> = article === undefined ? {} : { 101: article };
      return create(httpClientMock({ pending: pendingFor('registered'), byNumber: byNumberMap }), { pauseMs: 0 });
    }

    function returnDialog(article: ByNumberFixture | HttpErrorResponse | undefined) {
      const byNumberMap: Record<number, ByNumberFixture | HttpErrorResponse> = article === undefined ? {} : { 101: article };
      return create(httpClientMock({ pending: pendingFor('selling'), byNumber: byNumberMap }), {
        pauseMs: 0,
        targetField: 'returnedAt',
        writeMode: 'immediate',
      });
    }

    function confirmNumber(fixture: Fixture, number = '101') {
      typeInto(fixture, number);
      fixture.componentInstance.onSubmit();
      fixture.detectChanges();
    }

    function confirmVia(fixture: Fixture, path: Path) {
      const dialog = fixture.componentInstance;
      if (path === 'keyboard') {
        confirmNumber(fixture);
      } else if (path === 'numpad') {
        dialog.onAddonClick('numpad');
        fixture.detectChanges();
        typeInto(fixture, '101');
        fixture.debugElement.query(By.directive(Numpad)).componentInstance.submitted.emit();
      } else if (path === 'listbox') {
        dialog.onListboxSelect({ value: { id: 'A1', number: 101, name: 'Jacke', status: 'registered' } });
      } else {
        dialog.onAddonClick('camera');
        fixture.detectChanges();
        fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance.codeDetected.emit('101');
      }
      fixture.detectChanges();
    }

    function kindOf(fixture: Fixture) {
      return fixture.componentInstance.resultEvent()?.kind;
    }

    it('onSubmit_ReleaseDialogUnreleasedArticleOfSeller_ShowsSuccess', async () => {
      // Arrange
      const fixture = await releaseDialog(byNumber('registered'));
      vi.useFakeTimers();

      // Act
      confirmNumber(fixture);

      // Assert
      expect(kindOf(fixture)).toBe('success');
    });

    it.each(['selling', 'sold', 'returned'])(
      'onSubmit_ReleaseDialogArticleAlreadyReleasedAs%s_ShowsAlready',
      async (status) => {
        // Arrange
        const fixture = await releaseDialog(byNumber(status));
        vi.useFakeTimers();

        // Act
        confirmNumber(fixture);

        // Assert
        expect(kindOf(fixture)).toBe('already');
      },
    );

    it('onSubmit_ReleaseDialogArticleAlreadyCapturedInSession_ShowsAlready', async () => {
      // Arrange
      const fixture = await releaseDialog(byNumber('registered'));
      vi.useFakeTimers();
      confirmNumber(fixture);

      // Act
      confirmNumber(fixture);

      // Assert
      expect(kindOf(fixture)).toBe('already');
    });

    it.each([
      ['unknown number', undefined],
      ['article of another seller', byNumber('registered', 'OTHER')],
    ])('onSubmit_ReleaseDialog%s_ShowsFailed', async (_label, article) => {
      // Arrange
      const fixture = await releaseDialog(article);
      vi.useFakeTimers();

      // Act
      confirmNumber(fixture);

      // Assert
      expect(kindOf(fixture)).toBe('failed');
    });

    it('onSubmit_ReturnDialogReleasedUnsoldArticleOfSeller_ShowsSuccessAndConfirmsArticle', async () => {
      // Arrange
      const fixture = await returnDialog(byNumber('selling'));
      vi.useFakeTimers();
      const confirmed: string[] = [];
      fixture.componentInstance.articleConfirmed.subscribe((id) => confirmed.push(id));

      // Act
      confirmNumber(fixture);

      // Assert
      expect(kindOf(fixture)).toBe('success');
      expect(confirmed).toEqual(['A1']);
    });

    it('onSubmit_ReturnDialogArticleAlreadyReturned_ShowsAlready', async () => {
      // Arrange
      const fixture = await returnDialog(byNumber('returned'));
      vi.useFakeTimers();

      // Act
      confirmNumber(fixture);

      // Assert
      expect(kindOf(fixture)).toBe('already');
    });

    it.each([
      ['unknown number', undefined],
      ['article of another seller', byNumber('selling', 'OTHER')],
      ['article not yet released', byNumber('registered')],
      ['article already sold', byNumber('sold')],
    ])('onSubmit_ReturnDialog%s_ShowsFailed', async (_label, article) => {
      // Arrange
      const fixture = await returnDialog(article);
      vi.useFakeTimers();

      // Act
      confirmNumber(fixture);

      // Assert
      expect(kindOf(fixture)).toBe('failed');
    });

    it.each([
      ['release', releaseDialog],
      ['return', returnDialog],
    ])('onSubmit_%sDialogServerNotReachable_ShowsFailedWithoutScanComplete', async (_label, openDialog) => {
      // Arrange
      const fixture = await openDialog(new HttpErrorResponse({ status: 500 }));
      vi.useFakeTimers();
      const completed: ScanCompleteEvent[] = [];
      fixture.componentInstance.scanComplete.subscribe((event) => completed.push(event));

      // Act
      confirmNumber(fixture);

      // Assert
      expect(kindOf(fixture)).toBe('failed');
      expect(completed).toEqual([]);
    });

    it.each(ALL_PATHS)('confirm_ReleaseDialogVia%s_ShowsSuccess', async (path) => {
      // Arrange
      const fixture = await releaseDialog(byNumber('registered'));
      vi.useFakeTimers();

      // Act
      confirmVia(fixture, path);

      // Assert
      expect(kindOf(fixture)).toBe('success');
    });

    it.each(ALL_PATHS)('confirm_ReturnDialogVia%s_ShowsSuccess', async (path) => {
      // Arrange
      const fixture = await returnDialog(byNumber('selling'));
      vi.useFakeTimers();

      // Act
      confirmVia(fixture, path);

      // Assert
      expect(kindOf(fixture)).toBe('success');
    });

    it('onSubmit_UnknownNumberTypedInKeyboardMode_KeepsUnknownTextAndShowsFailed', async () => {
      // Arrange
      const fixture = await create(httpClientMock({ pending: pendingFor('registered'), byNumber: {} }), { pauseMs: 0 });
      vi.useFakeTimers();

      // Act
      confirmNumber(fixture, '555');

      // Assert
      const message = fixture.debugElement.query(By.css('.scan-dialog__message'))?.nativeElement as HTMLElement | undefined;
      expect(message?.textContent?.trim()).toBe('Artikel nicht bekannt');
      expect(kindOf(fixture)).toBe('failed');
    });

    it('onScanDetected_CameraMode_RendersOverlayInsteadOfRingCountdown', async () => {
      // Arrange
      const fixture = await releaseDialog(byNumber('registered'));
      vi.useFakeTimers();

      // Act
      confirmVia(fixture, 'camera');

      // Assert
      expect(fixture.debugElement.query(By.css('app-scan-feedback'))).toBeNull();
      expect(fixture.debugElement.query(By.css('app-result-overlay .result-overlay__icon'))).not.toBeNull();
    });

    it('template_DialogContent_HostsOverlayInsidePositionedContentWrapper', async () => {
      // Arrange & Act
      const fixture = await releaseDialog(undefined);

      // Assert
      expect(fixture.debugElement.query(By.css('.scan-dialog__content app-result-overlay'))).not.toBeNull();
    });

    it('typing_WhileOverlayIsShown_StillAcceptsInput', async () => {
      // Arrange
      const fixture = await releaseDialog(undefined);
      vi.useFakeTimers();
      confirmNumber(fixture);

      // Act
      typeInto(fixture, '77');

      // Assert
      expect(fixture.componentInstance.articleNumber()).toBe('77');
    });
  });

  describe('writeMode', () => {
    const pending: PendingArticleFixture[] = [{ id: 'A1', number: 101, name: 'Jacke blau', status: 'registered' }];
    const article: ByNumberFixture = { id: 'A1', number: 101, name: 'Jacke blau', sellerId: 'SEL1', status: 'registered' };

    it('never fires articleConfirmed when writeMode is left at its default (batch)', async () => {
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }));
      const confirmed: string[] = [];
      fixture.componentInstance.articleConfirmed.subscribe((id) => confirmed.push(id));

      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      expect(confirmed).toEqual([]);
    });

    it('emits articleConfirmed once and updates the pending list without a second lookup, in immediate mode', async () => {
      const sellingPending: PendingArticleFixture[] = [
        { id: 'A1', number: 101, name: 'Jacke blau', status: 'selling' },
      ];
      const sellingArticle: ByNumberFixture = {
        id: 'A1',
        number: 101,
        name: 'Jacke blau',
        sellerId: 'SEL1',
        status: 'selling',
      };
      const http = httpClientMock({ pending: sellingPending, byNumber: { 101: sellingArticle } });
      const fixture = await create(http, { targetField: 'returnedAt', writeMode: 'immediate' });

      const confirmed: string[] = [];
      const sessionSnapshots: readonly (readonly string[])[] = [];
      fixture.componentInstance.articleConfirmed.subscribe((id) => confirmed.push(id));
      fixture.componentInstance.sessionArticleIds.subscribe((ids) => (sessionSnapshots as string[][]).push([...ids]));

      const callsBeforeSubmit = (http.get as ReturnType<typeof vi.fn>).mock.calls.filter((c) =>
        /\/api\/sellers\/.+\/articles$/.test(c[0] as string),
      ).length;

      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      expect(confirmed).toEqual(['A1']);
      // Only the initial open-triggered reset to `[]` — never a non-empty snapshot in immediate mode.
      expect(sessionSnapshots.every((snapshot) => snapshot.length === 0)).toBe(true);
      expect(fixture.componentInstance.pendingList().find((a) => a.id === 'A1')).toBeUndefined();

      const callsAfterSubmit = (http.get as ReturnType<typeof vi.fn>).mock.calls.filter((c) =>
        /\/api\/sellers\/.+\/articles$/.test(c[0] as string),
      ).length;
      expect(callsAfterSubmit).toBe(callsBeforeSubmit);
    });

    it('behaves exactly like batch (default) when writeMode is explicitly set to "batch"', async () => {
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }), { writeMode: 'batch' });
      const scanCompletes: ScanCompleteEvent[] = [];
      const sessionSnapshots: readonly (readonly string[])[] = [];
      fixture.componentInstance.scanComplete.subscribe((e) => scanCompletes.push(e));
      fixture.componentInstance.sessionArticleIds.subscribe((ids) => (sessionSnapshots as string[][]).push([...ids]));

      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      expect(scanCompletes).toEqual([{ articleId: 'A1', result: 'success' }]);
      expect(sessionSnapshots.at(-1)).toEqual(['A1']);
    });

    it('immediate mode releasedAt: a confirmed article leaves the pending list without a reload', async () => {
      // Arrange
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }), {
        writeMode: 'immediate',
      });
      typeInto(fixture, '101');

      // Act
      fixture.componentInstance.onSubmit();

      // Assert
      expect(fixture.componentInstance.pendingList().find((a) => a.id === 'A1')).toBeUndefined();
    });

    it('reportWriteFailed_afterConfirmedArticle_showsFailedResult', async () => {
      // Arrange
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }), {
        writeMode: 'immediate',
      });
      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      // Act
      fixture.componentInstance.reportWriteFailed();

      // Assert
      expect(fixture.componentInstance.resultEvent()?.kind).toBe('failed');
    });

    it('reportWriteFailed_afterConfirmedArticle_reloadsThePendingList', async () => {
      // Arrange
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }), {
        writeMode: 'immediate',
      });
      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      // Act
      fixture.componentInstance.reportWriteFailed();

      // Assert
      expect(fixture.componentInstance.pendingList().find((a) => a.id === 'A1')).toBeDefined();
    });
  });

  describe('field and layout (Layout-Vereinheitlichung Teil 2)', () => {
    it('renders app-input with the label "Artikelnummer" in the frame and no search icon', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-input p-iftalabel label')?.textContent).toContain('Artikelnummer');
      expect(el.querySelector('.pi-search')).toBeNull();
      expect(el.querySelector('app-input-group')).toBeNull();
    });

    it('offers camera, numpad, clear and enter addons like Verkauf', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));
      expect(fixture.componentInstance.inputAddons().map((a) => a.key)).toEqual(['camera', 'numpad', 'clear', 'enter']);
    });

    it('opens the numpad below the field and submits the typed number from its enter key', async () => {
      const article = { id: 'A1', number: 101, name: 'Jacke', sellerId: 'SEL1', status: 'registered' };
      const http = httpClientMock({ pending: [{ id: 'A1', number: 101, name: 'Jacke', status: 'registered' }], byNumber: { 101: article } });
      const fixture = await create(http);
      const confirmed: string[] = [];
      fixture.componentInstance.sessionArticleIds.subscribe((ids) => confirmed.push(...ids));

      fixture.componentInstance.onAddonClick('numpad');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-numpad')).not.toBeNull();

      fixture.componentInstance.onNumpadKey({ key: '1' });
      fixture.componentInstance.onNumpadKey({ key: '0' });
      fixture.componentInstance.onNumpadKey({ key: '1' });
      fixture.componentInstance.onSubmit();

      expect(confirmed).toContain('A1');
    });

    it('clears the field from the clear addon', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));
      typeInto(fixture, '12');

      fixture.componentInstance.onAddonClick('clear');

      expect(fixture.componentInstance.articleNumber()).toBe('');
    });

    it('uses the responsive dialog width class', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));
      expect(fixture.nativeElement.querySelector('p-dialog[styleClass="scan-dialog dialog-responsive"]')).not.toBeNull();
    });
  });

  describe('resetSession on reopen (I2)', () => {
    it('clears the typed field value and switches back to keyboard mode when the dialog reopens', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));

      typeInto(fixture, '12');
      fixture.componentInstance.onAddonClick('numpad');
      fixture.detectChanges();
      expect(fixture.componentInstance.articleNumber()).toBe('12');
      expect(fixture.componentInstance.mode.active()).toBe('numpad');

      fixture.componentRef.setInput('visible', false);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.articleNumber()).toBe('');
      expect(fixture.componentInstance.mode.active()).toBe('keyboard');
    });

    it('reopen_AfterResultWasShown_ShowsNoStaleResultIcon', async () => {
      // Arrange
      const fixture = await create(httpClientMock({ pending: [], byNumber: {} }), { pauseMs: 0 });
      typeInto(fixture, '999');
      fixture.componentInstance.onSubmit();
      fixture.detectChanges();
      fixture.componentRef.setInput('visible', false);
      fixture.detectChanges();
      await fixture.whenStable();

      // Act
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(fixture.debugElement.query(By.css('.result-overlay__icon'))).toBeNull();
    });
  });
});
