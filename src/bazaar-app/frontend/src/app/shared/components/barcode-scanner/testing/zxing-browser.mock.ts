import { vi, type Mock } from 'vitest';
import { BrowserMultiFormatReader } from '@zxing/browser';

/**
 * Single shared `@zxing/browser` mock for every spec that exercises `BarcodeScanner`, directly
 * or transitively through `InputGroup` (`input-group.spec.ts`, `seller-search.spec.ts`,
 * `scan-dialog.spec.ts`, `intake-page.spec.ts`, `settlement-page.spec.ts`, `checkout-page.spec.ts`,
 * `barcode-scanner.spec.ts` itself).
 *
 * Registered globally via Vitest `setupFiles` (`angular.json` → `bazaar-app` project's `test`
 * target `options.setupFiles`), which `@angular/build:unit-test` guarantees runs before every
 * spec file's own imports — this file's `vi.mock('@zxing/browser', ...)` call therefore always
 * wins the module registry, regardless of which spec file vitest evaluates first (Round-20/
 * Round-25 history: two earlier fixes chased what looked like a cross-spec-file worker-sharing
 * race — centralizing the mock here, then adding it to `setupFiles` plus `splitting: false` —
 * and both were real but incomplete; see below for the actual remaining bug).
 *
 * IMPORTANT — do NOT export a `vi.fn()` from this file for specs to import directly. A spec
 * importing `{ someMock } from './zxing-browser.mock'` and this file's own `setupFiles`
 * evaluation are NOT guaranteed to resolve to the SAME module instance: `@angular/build:unit-test`
 * compiles `setupFiles` as a separate build entry from each spec's own bundle, so a project-local
 * source file reachable from both graphs can be instantiated TWICE, once per graph — each with
 * its own independent `vi.fn()`. Diagnosed by tagging each instantiation with a random id: the
 * `vi.mock('@zxing/browser', ...)` factory ran once, bound to instance A's mock fn, while a
 * consuming spec's `import { decodeFromVideoDeviceMock } from '...'` resolved to instance B —
 * configuring instance B via `.mockResolvedValue(...)` had zero effect on the fn `BarcodeScanner`
 * actually called, producing a synchronous `undefined` return and a
 * "Cannot read properties of undefined (reading 'then')" failure. This reproduced 100% of the
 * time for a spec file running scoped/alone (no other spec's import graph to coincidentally warm
 * the same instance) and only intermittently at full-suite scale — the exact symptom pattern
 * Round-20/25 saw, but the real cause was dual module instantiation, not import-order or
 * worker-packing. Neither `isolate: true` nor `splitting: false` fix this, since it is not about
 * sharing (or not sharing) a module registry across spec files or workers — it is about
 * `setupFiles` and spec bundles being two separate compiled entries for the same source file.
 *
 * The fix: never hand out the mock fn as this file's own export. Instead stash it as a static
 * property on the mocked `BrowserMultiFormatReader` constructor itself, and let consumers reach
 * it through `@zxing/browser` — an EXTERNAL package specifier, resolved exactly once by Vite
 * regardless of how many times this local file gets instantiated. Whichever `vi.mock()` call wins
 * the registry, querying it back through `@zxing/browser` always returns that same winning
 * instance, so `getDecodeFromVideoDeviceMock()` is safe to call from any spec, at any time.
 */
vi.mock('@zxing/browser', () => {
  const decodeFromVideoDeviceMock = vi.fn();
  const BrowserMultiFormatReaderMock = vi.fn().mockImplementation(function (this: {
    decodeFromVideoDevice: typeof decodeFromVideoDeviceMock;
  }) {
    this.decodeFromVideoDevice = decodeFromVideoDeviceMock;
  }) as unknown as Mock & { decodeFromVideoDeviceMock: Mock };
  BrowserMultiFormatReaderMock.decodeFromVideoDeviceMock = decodeFromVideoDeviceMock;

  return { BrowserMultiFormatReader: BrowserMultiFormatReaderMock };
});

export function getDecodeFromVideoDeviceMock(): Mock {
  return (vi.mocked(BrowserMultiFormatReader) as unknown as { decodeFromVideoDeviceMock: Mock })
    .decodeFromVideoDeviceMock;
}
