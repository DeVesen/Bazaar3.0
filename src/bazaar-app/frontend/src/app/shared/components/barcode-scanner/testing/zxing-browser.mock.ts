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
 * happened to be registered first, and stays bound to it for the rest of that worker's tests.
 *
 * Each spec file used to declare its OWN separate `vi.mock('@zxing/browser', ...)` with its own
 * local `decodeFromVideoDeviceMock`. At small scale every file got its own worker/module graph
 * and nothing noticed; at full-suite scale several spec files land in the same worker, one
 * file's factory "wins" the shared cache, and every OTHER file's local mock reference becomes a
 * dead object nothing actually calls — observed as an intermittent (worker-packing-dependent)
 * "called 0 times" failure in `barcode-scanner.spec.ts` that never reproduced in isolation.
 *
 * Fix: register the mock exactly once, here, and have every consuming spec import (and
 * reset/reconfigure) THIS single control object instead of declaring its own factory. Whichever
 * spec file's import of this module runs first still wins the registration race — but now every
 * file ends up wired to the very same object, so there is nothing left to diverge.
 */
export const decodeFromVideoDeviceMock = vi.fn();

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(function (this: {
    decodeFromVideoDevice: typeof decodeFromVideoDeviceMock;
  }) {
    this.decodeFromVideoDevice = decodeFromVideoDeviceMock;
  }),
}));
