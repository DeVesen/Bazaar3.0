import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { ListboxModule } from 'primeng/listbox';
import { Input, InputAddon } from '../input/input';
import { FieldModeState, applyNumpadKey, fieldModeAddons } from '../input/field-mode';
import { Numpad } from '../numpad/numpad';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';
import { ScanFeedback } from '../scan-feedback/scan-feedback';
// Sanctioned `shared` -> `core` boundary crossing (Round-25 Task 5, review-fix decision):
// `pauseMs`'s default now reads the app-wide `SettingsService` instead of a hardcoded constant
// (see the `pauseMs` input's own doc comment below). Routing the default through a
// feature-injected value instead would require re-opening the `@Input` shape this task
// deliberately kept stable — every current caller (`release-dialog.ts`, `settlement-page.ts`)
// relies on the parameterless default, and this component has no feature of its own to inject
// `SettingsService` from. `SettingsService` is read-only here (a single signal getter), so this
// crossing carries no risk of `shared` picking up feature-specific behaviour.
// eslint-disable-next-line boundaries/dependencies
import { SettingsService } from '../../../core/settings/settings.service';

/**
 * Which timestamp this dialog session is meant to set (docs/components/scan-dialog/component.md
 * §2, spec.md "Persistenz-Override"). Only `'releasedAt'` is exercised this round (Task 4 only
 * ever passes it) — `'returnedAt'` is implemented generically but untested here.
 */
export type ScanDialogTargetField = 'releasedAt' | 'returnedAt';

/**
 * `scanComplete`'s payload (Task-3 brief "Result-mapping for `scanComplete`"). `articleId` is a
 * real `Article.id` for `'success'`/`'already-set'` and for the "wrong seller/status" `'unknown'`
 * sub-case (an article record exists, it just doesn't qualify) — it is the empty string `''` for
 * the "number does not exist at all" (`404`) `'unknown'` sub-case, since there is no real id to
 * report there. See `handleLookupError()`'s own comment for the reasoning; Task 4 must not rely on
 * `articleId` being non-empty when `result === 'unknown'`.
 */
export interface ScanCompleteEvent {
  articleId: string;
  result: 'success' | 'unknown' | 'already-set';
}

/**
 * Subset of `ArticleSummary` (docs/requirements/bazaar-app/api/sellers.md §6) read from
 * `GET /api/sellers/{id}/articles` — only the fields this component actually uses.
 */
interface PendingArticle {
  id: string;
  number: number;
  name: string;
  status: string;
}

/**
 * Subset of the full DTO (docs/requirements/bazaar-app/api/articles.md §2) read from
 * `GET /api/articles/by-number/{number}` — only the fields this component actually uses.
 */
interface ArticleByNumberResult {
  id: string;
  number: number;
  name: string;
  sellerId: string;
  status: string;
}

/**
 * `targetField` → which derived `status` counts as "still pending" (Task-3 brief "Pending-list
 * filter mapping"). spec.md's own wording ("releasedAt == null") assumes raw timestamps, but the
 * list endpoint only exposes the derived `status` — this is the judgment-call mapping onto that.
 */
function pendingStatusFor(targetField: ScanDialogTargetField): string {
  return targetField === 'releasedAt' ? 'registered' : 'selling';
}

/** Numeric substring/prefix match on `number.toString()` — mirrors `seller-search.ts`'s own
 * `filterSellers()` helper shape, adapted to this component's single numeric field. */
function filterPending(articles: PendingArticle[], query: string): PendingArticle[] {
  const q = query.trim();
  if (q.length === 0) return articles;
  return articles.filter((a) => a.number.toString().includes(q));
}

/**
 * Shared popup for setting an article timestamp (`releasedAt`/`returnedAt`) by typed number,
 * numpad, camera scan, or picking from the pending-articles list
 * (docs/components/scan-dialog/component.md), composing `app-input` (Modi über `field-mode.ts`) +
 * `app-numpad` + `app-barcode-scanner` + `app-scan-feedback` + `p-listbox`, mirroring
 * `seller-search.ts`/`.html`.
 *
 * Architectural ruling (Task-3 brief, binding, do not re-litigate): this project's
 * `boundaries/dependencies` ESLint rule allows `shared -> shared` only, never `shared -> feature`.
 * The two backend endpoints this component needs (`GET /api/sellers/{id}/articles`,
 * `GET /api/articles/by-number/{number}`) are normally reached through `ArticlesApi`/`SellersApi`
 * (both `features/*\/data/*`), which this component may NOT import. It injects `HttpClient`
 * directly instead and calls both endpoints itself, with its own minimal local interfaces
 * (`PendingArticle`/`ArticleByNumberResult`) for exactly the fields it reads — there is
 * deliberately no shared DTO import from a feature here.
 *
 * Persistenz-Override (Round-18 spec.md, already decided in Epic_Verkaeufer §6, not a new
 * decision here): every scan/typed entry is validated **read-only** against
 * `GET /api/articles/by-number/{number}` — this component never writes the timestamp itself. It
 * only tracks which `articleId`s were validated "in this session" (`sessionIds`, reset each time
 * the dialog opens) and reports them via `sessionComplete`/`sessionArticleIds`; the actual DB
 * write (`POST /api/release` or the `returnedAt` equivalent) is entirely the parent's job, "wie
 * der Warenkorb an der Kasse".
 */
@Component({
  selector: 'app-scan-dialog',
  imports: [DialogModule, ListboxModule, Input, Numpad, BarcodeScanner, ScanFeedback],
  templateUrl: './scan-dialog.html',
  styleUrl: './scan-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanDialog {
  private readonly http = inject(HttpClient);
  private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly settingsService = inject(SettingsService);

  readonly visible = input<boolean>(false);
  readonly title = input.required<string>();
  readonly sellerId = input.required<string>();
  readonly targetField = input.required<ScanDialogTargetField>();
  /**
   * Default now reads the app-wide `SettingsService` (Round-25) instead of a hardcoded
   * constant. A parent may still override it explicitly via the `[pauseMs]` binding (no
   * breaking change to this input's public shape). Forwarded to `app-scan-feedback`'s own
   * `pauseMs` in camera mode.
   */
  readonly pauseMs = input<number>(this.settingsService.scannerPauseMs());
  /** `'batch'` (default): Round-18 behaviour, unchanged — matches are collected in `sessionIds`
   * and reported via `sessionArticleIds`/`scanComplete`, the parent writes once at the end ("wie
   * der Warenkorb an der Kasse"). `'immediate'`: every successful match fires `articleConfirmed`
   * right away instead, and `sessionIds`/`sessionArticleIds` are never touched (Round-20). */
  readonly writeMode = input<'batch' | 'immediate'>('batch');

  readonly visibleChange = output<boolean>();
  readonly scanComplete = output<ScanCompleteEvent>();
  /** Emits the COMPLETE current session list on every change (not a delta) — see class doc
   * comment. Emits `string[]` (a plain array snapshot of the internally-held `Set<string>`, taken
   * via `Array.from()` at emit time), never the `Set` itself and never a partial delta. */
  readonly sessionArticleIds = output<readonly string[]>();
  /** Fires once per successful, genuinely-new match when writeMode() === 'immediate' — the
   * parent is responsible for calling the actual write endpoint (this component has no HTTP
   * write knowledge, only read-only validation lookups, per the class's existing architectural
   * doc comment). Never fires in 'batch' mode (see sessionArticleIds/scanComplete for that path). */
  readonly articleConfirmed = output<string>();

  readonly mode = new FieldModeState();
  readonly articleNumber = signal('');
  readonly inputAddons = computed<InputAddon[]>(() =>
    fieldModeAddons(['keyboard', 'camera', 'numpad'], this.mode.active()),
  );

  private readonly pendingArticles = signal<PendingArticle[]>([]);
  /** Internal session state — the component's own single source of truth for "already validated
   * in this dialog session". Never exposed directly; only ever read out through
   * `sessionArticleIds`'s array snapshots. Reset to empty whenever the dialog transitions to
   * `visible() === true` (a fresh open starts a fresh session, see the `constructor()` effect). */
  private readonly sessionIds = signal<ReadonlySet<string>>(new Set());

  /** Camera dauerscan lock (Task-3 brief): `barcode-scanner` has no internal debounce, so while
   * `scan-feedback`'s countdown is visually running, further `codeDetected` emissions for the same
   * still-pointed-at code are ignored. Set on every scan start, cleared via `setTimeout(pauseMs)` —
   * mirrors `scan-feedback.ts`'s own `startCountdown`/timeout pattern. */
  private readonly scanLocked = signal(false);

  readonly scanFeedbackResult = signal<'success' | 'already-set' | 'unknown' | null>(null);

  readonly isCameraActive = computed<boolean>(() => this.mode.active() === 'camera');

  /** The full "still pending" set for the current `targetField()`, minus anything already
   * validated in this session — BEFORE the typed-text filter. */
  private readonly basePendingList = computed<PendingArticle[]>(() => {
    const status = pendingStatusFor(this.targetField());
    const sessionIds = this.sessionIds();
    return this.pendingArticles().filter((a) => a.status === status && !sessionIds.has(a.id));
  });

  /** `basePendingList()` further filtered by the field's own `articleNumber` signal, updated on
   * every keystroke because `debounceMs` is 0 — same pattern as `seller-search.ts`'s
   * `searchText`/`filteredSellers`, so filtering reacts to every keystroke, not just the debounced
   * `valueChange`. */
  readonly pendingList = computed<PendingArticle[]>(() => filterPending(this.basePendingList(), this.articleNumber()));

  /** "Artikel nicht bekannt" text (doc Abschnitt 3 table): there ARE pending articles for this
   * seller/targetField, but the current typed text matches none of them. Distinct from "all done"
   * below, which is the case where `basePendingList()` itself is already empty. */
  readonly showUnknownMessage = computed<boolean>(
    () => this.basePendingList().length > 0 && this.pendingList().length === 0,
  );

  readonly allDoneMessage = computed<string>(() =>
    this.targetField() === 'releasedAt' ? 'Alle Artikel freigegeben.' : 'Alle Artikel zurückgegeben.',
  );

  constructor() {
    // Fresh session + fresh pending list every time the dialog opens (or the seller changes while
    // open) — the component doc/spec.md never says a re-opened dialog should remember a previous
    // session, and Epic_Verkaeufer §6's "wie der Warenkorb an der Kasse" framing is per-visit.
    effect(() => {
      if (this.visible() && this.sellerId()) {
        this.resetSession();
        this.loadPendingArticles();
      }
    });
  }

  onTyped(value: string): void {
    this.articleNumber.set(value);
  }

  onAddonClick(key: string): void {
    switch (key) {
      case 'camera':
      case 'numpad':
        this.mode.toggle(key);
        return;
      case 'clear':
        this.articleNumber.set('');
        return;
      case 'enter':
        this.onSubmit();
        return;
    }
  }

  onNumpadKey(init: KeyboardEventInit): void {
    this.articleNumber.set(applyNumpadKey(this.articleNumber(), init));
  }

  onNumpadClear(): void {
    this.articleNumber.set('');
  }

  /** Fires on Enter (keyboard) and on the numpad's own `⏎` — re-reads the field's current raw
   * value directly, same reasoning as `intake-article-entry.ts`'s `onArticleNumberSubmit()`. */
  onSubmit(): void {
    const raw = this.articleNumber();
    if (!raw.trim()) return;
    this.checkArticleNumber(raw, false);
  }

  /** `p-listbox` selection — per the brief, goes through the SAME validation path as typed
   * Enter/scan, never a direct "trust the cache and add". */
  onListboxSelect(event: { value: PendingArticle }): void {
    this.checkArticleNumber(event.value.number, false);
  }

  onScanDetected(value: string): void {
    if (this.scanLocked()) return;
    this.scanLocked.set(true);
    setTimeout(() => this.scanLocked.set(false), this.pauseMs());
    this.checkArticleNumber(value, true);
  }

  /** `p-dialog`'s own `(visibleChange)` fires on both the ✕ button and Escape — forwarded to this
   * component's own `visibleChange` output. Before forwarding a close, if the camera is still
   * active, switch the field mode back to keyboard first so `barcode-scanner`'s `active` input
   * goes `false` and its own `effect()` releases the MediaStream tracks (AC-5) — `p-dialog` hiding
   * does not itself touch the field mode. */
  onVisibleChange(value: boolean): void {
    if (!value && this.mode.active() === 'camera') {
      this.mode.switchTo('keyboard');
    }
    this.visibleChange.emit(value);
  }

  /** AC-1, best-effort only (documented limitation, same spirit as `input-group.ts`'s own
   * documented camera-permission-detection limitation): `input-group` exposes no public `focus()`
   * method and this component never modifies either component's own public API, so focus is
   * applied directly to the rendered native `<input>` via a host `querySelector`. An imperfect
   * result (e.g. the input not yet in the DOM, or a browser blocking programmatic focus) is not
   * treated as a task failure. */
  onShown(): void {
    queueMicrotask(() => {
      this.hostElement.nativeElement.querySelector<HTMLInputElement>('input')?.focus();
    });
  }

  /**
   * Single validation entry point for ALL four paths (typed+confirmed, numpad+confirmed,
   * camera-detected, listbox selection) — per spec.md "validiert jeden Scan/jede Eingabe
   * read-only", nothing ever trusts the cached pending list alone.
   */
  private checkArticleNumber(rawNumber: string | number, isCameraOrigin: boolean): void {
    const number = typeof rawNumber === 'number' ? rawNumber : Number.parseInt(rawNumber.trim(), 10);
    if (!Number.isFinite(number)) return;

    this.http.get<ArticleByNumberResult>(`/api/articles/by-number/${number}`).subscribe({
      next: (article) => this.handleArticleFound(article, isCameraOrigin),
      error: (error: unknown) => this.handleLookupError(error, isCameraOrigin),
    });
  }

  private handleArticleFound(article: ArticleByNumberResult, isCameraOrigin: boolean): void {
    const matchesSeller = article.sellerId === this.sellerId();
    const matchesStatus = article.status === pendingStatusFor(this.targetField());

    if (!matchesSeller || !matchesStatus) {
      // Result-mapping #2 (judgment call, plan.md's literal "sonst"): wrong seller, wrong status
      // and "number unknown" (handled in `handleLookupError()`) all collapse to the same
      // `'unknown'` result — plan.md never distinguishes them, and neither does this component.
      this.emitResult(article.id, 'unknown', isCameraOrigin);
      return;
    }

    if (this.writeMode() === 'immediate') {
      // Round-20 immediate path: no session collection at all (plan's "statt intern zu
      // sammeln") — instead drop the match straight out of the already-loaded pending list so
      // the AutoComplete reflects it without a reload, and let the parent do the actual write.
      this.pendingArticles.update((articles) => articles.filter((a) => a.id !== article.id));
      this.articleNumber.set('');
      this.articleConfirmed.emit(article.id);
      this.emitResult(article.id, 'success', isCameraOrigin);
      return;
    }

    if (this.sessionIds().has(article.id)) {
      // Result-mapping #3 (judgment call): plan.md's own text only names 'success'/'unknown', but
      // `scan-feedback`'s `result` input already supports `'already-set'` and the generic
      // component doc's AC-3 names exactly this label for "already captured" — reused here for
      // "already scanned/entered in THIS session" since it is the closest fit and costs nothing
      // (scan-feedback renders anything non-'success' as the same error variant anyway).
      this.emitResult(article.id, 'already-set', isCameraOrigin);
      return;
    }

    // Result-mapping #4: add to the session, emit the full snapshot, clear the field so the next
    // entry starts fresh (doc's "Feld leert sich").
    this.sessionIds.update((ids) => new Set(ids).add(article.id));
    this.sessionArticleIds.emit(Array.from(this.sessionIds()));
    this.articleNumber.set('');
    this.emitResult(article.id, 'success', isCameraOrigin);
  }

  private handleLookupError(error: unknown, isCameraOrigin: boolean): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      // Result-mapping #1: the number does not belong to ANY article — there is no real
      // `articleId` to report, so `''` is emitted instead of inventing one (see `ScanCompleteEvent`
      // doc comment above).
      this.emitResult('', 'unknown', isCameraOrigin);
      return;
    }

    // Result-mapping #5: any other HTTP failure (network/5xx) — mirrors
    // `intake-article-entry.ts`'s `handleArticleLookupError()` final branch: do NOT mutate the
    // session and do NOT emit `scanComplete` at all. Camera mode only gets a neutral/error visual
    // via `scan-feedback`'s `'unknown'` variant, exactly like that precedent.
    if (isCameraOrigin) {
      this.scanFeedbackResult.set('unknown');
    }
  }

  private emitResult(articleId: string, result: 'success' | 'unknown' | 'already-set', isCameraOrigin: boolean): void {
    this.scanComplete.emit({ articleId, result });
    if (isCameraOrigin) {
      this.scanFeedbackResult.set(result);
    }
  }

  private resetSession(): void {
    this.sessionIds.set(new Set());
    this.sessionArticleIds.emit([]);
  }

  private loadPendingArticles(): void {
    this.http
      .get<PendingArticle[]>(`/api/sellers/${this.sellerId()}/articles`)
      .subscribe((articles) => this.pendingArticles.set(articles));
  }
}
