import { vi } from 'vitest';

/**
 * Single shared `@zxing/browser` mock for every spec that exercises `BarcodeScanner`, directly
 * or transitively through `InputGroup` (`input-group.spec.ts`, `seller-search.spec.ts`,
 * `scan-dialog.spec.ts`, `intake-page.spec.ts`, `settlement-page.spec.ts`,
 * `barcode-scanner.spec.ts` itself).
 *
 * Angular's vitest unit-test builder runs spec files in a NON-isolated environment by design
 * (see `@angular/build`'s `DynamicDOMTestComponentRenderer`, added specifically to cope with a
 * shared module registry across spec files in the same worker). `barcode-scanner.ts` — the
 * production module — is therefore evaluated and cached only ONCE per worker: its
 * `BrowserMultiFormatReader` import binds to whichever `vi.mock('@zxing/browser', ...)` factory
 * happened to be registered first (or to the REAL `@zxing/browser` module if nothing had
 * registered a mock yet at that point), and stays bound to it for the rest of that worker's tests.
 *
 * Each spec file used to declare its OWN separate `vi.mock('@zxing/browser', ...)` with its own
 * local `decodeFromVideoDeviceMock`. At small scale every file got its own worker/module graph
 * and nothing noticed; at full-suite scale several spec files land in the same worker, one
 * file's factory "wins" the shared cache, and every OTHER file's local mock reference becomes a
 * dead object nothing actually calls — observed as an intermittent (worker-packing-dependent)
 * "called 0 times" failure in `barcode-scanner.spec.ts` that never reproduced in isolation
 * (Round-20).
 *
 * Round-20's fix (centralizing the mock in this file, imported by every consuming spec) reduced
 * but did not eliminate the race: this file's own `vi.mock()` call only takes effect for a
 * worker once SOME spec file's import graph has actually reached it, and every consuming spec
 * (including this file's own `barcode-scanner.spec.ts`) still imports `BarcodeScanner`/the
 * component under test BEFORE it imports this mock module. Whichever spec file vitest happens to
 * evaluate first in a given worker can therefore still resolve `@zxing/browser` for REAL, before
 * this module's `vi.mock()` ever runs — worker packing shifts with the total number/size of spec
 * files, which is exactly what a later round (Round-25: new `settings-form` spec, new
 * `input-group` count-variant tests) changed, reintroducing the "called 0 times" failure in
 * `barcode-scanner.spec.ts` at full-suite scale (Round-25 review fix).
 *
 * Fix (Round-25 review fix): this module is also registered as a global Vitest `setupFiles` entry
 * (`angular.json` → `bazaar-app` project's `test` target `options.setupFiles`), which the
 * `@angular/build:unit-test` builder guarantees runs before every spec file's own imports. That
 * makes the mock registration unconditional — no more "whichever file's import runs first" race —
 * while every consuming spec's own `import { decodeFromVideoDeviceMock } from '...'` keeps working
 * unchanged (importing an already-evaluated module is idempotent and returns the same object).
 */
export const decodeFromVideoDeviceMock = vi.fn();

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(function (this: {
    decodeFromVideoDevice: typeof decodeFromVideoDeviceMock;
  }) {
    this.decodeFromVideoDevice = decodeFromVideoDeviceMock;
  }),
}));
