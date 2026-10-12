/**
 * Shared `ResizeObserver` stub for specs, registered globally via Vitest `setupFiles`
 * (`angular.json` → `bazaar-app` project's `test` target `options.setupFiles`).
 *
 * jsdom has no `ResizeObserver`; PrimeNG components that observe their own size
 * (`p-tabs`' `TabList`, `p-scrollarea`'s `ScrollArea`) would throw on construction.
 * All methods are no-ops: tests that need overflow behaviour call `ScrollArea.refresh()` directly.
 */
class ResizeObserverStub {
  observe(): void {
    // no-op: only needed so PrimeNG components don't throw in jsdom.
  }
  unobserve(): void {
    // no-op, see observe().
  }
  disconnect(): void {
    // no-op, see observe().
  }
}

(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;
