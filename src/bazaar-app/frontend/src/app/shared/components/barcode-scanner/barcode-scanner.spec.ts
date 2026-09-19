import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BarcodeScanner } from './barcode-scanner';
// Shared `@zxing/browser` mock (see that file for why this must be centralized rather than
// each spec declaring its own `vi.mock('@zxing/browser', ...)`): Angular's vitest unit-test
// builder runs spec files in a non-isolated environment, so `barcode-scanner.ts` is evaluated
// only once per worker and binds to whichever spec's factory registers first.
import { decodeFromVideoDeviceMock } from './testing/zxing-browser.mock';

describe('BarcodeScanner', () => {
  beforeEach(async () => {
    decodeFromVideoDeviceMock.mockReset();

    await TestBed.configureTestingModule({
      imports: [BarcodeScanner],
    }).compileComponents();
  });

  function createFakeControls() {
    return { stop: vi.fn() };
  }

  /**
   * `setInput()` only schedules the constructor `effect()`; a single `whenStable()` can
   * resolve before that effect has actually flushed when the whole suite runs under load
   * (many parallel `TestBed` environments contending for the zoneless scheduler's
   * microtask/rAF queue) — observed as an intermittent 0-calls failure only at full-suite
   * scale, never in isolation. `detectChanges()` forces the pending effect to run
   * synchronously where possible; `vi.waitFor` below additionally re-polls the assertion for
   * cases where the flush still lands a tick later under heavy load, so the test doesn't
   * depend on winning that race within a single microtask.
   */
  async function setActive(fixture: ReturnType<typeof TestBed.createComponent<BarcodeScanner>>, active: boolean): Promise<void> {
    fixture.componentRef.setInput('active', active);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('starts the camera via decodeFromVideoDevice when active becomes true', async () => {
    const controls = createFakeControls();
    decodeFromVideoDeviceMock.mockResolvedValue(controls);

    const fixture = TestBed.createComponent(BarcodeScanner);
    await setActive(fixture, true);

    await vi.waitFor(() => expect(decodeFromVideoDeviceMock).toHaveBeenCalledTimes(1));
    const [deviceId, videoElement] = decodeFromVideoDeviceMock.mock.calls[0];
    expect(deviceId).toBeUndefined();
    expect(videoElement).toBeInstanceOf(HTMLVideoElement);
  });

  it('stops all tracks when active becomes false again', async () => {
    const controls = createFakeControls();
    decodeFromVideoDeviceMock.mockResolvedValue(controls);

    const fixture = TestBed.createComponent(BarcodeScanner);
    await setActive(fixture, true);
    await vi.waitFor(() => expect(decodeFromVideoDeviceMock).toHaveBeenCalledTimes(1));
    await setActive(fixture, false);

    await vi.waitFor(() => expect(controls.stop).toHaveBeenCalledTimes(1));
  });

  it('stops all tracks when the component is destroyed while active', async () => {
    const controls = createFakeControls();
    decodeFromVideoDeviceMock.mockResolvedValue(controls);

    const fixture = TestBed.createComponent(BarcodeScanner);
    await setActive(fixture, true);
    await vi.waitFor(() => expect(decodeFromVideoDeviceMock).toHaveBeenCalledTimes(1));

    fixture.destroy();

    await vi.waitFor(() => expect(controls.stop).toHaveBeenCalledTimes(1));
  });

  it('emits codeDetected with the raw decoded text when the decode callback reports a result', async () => {
    const controls = createFakeControls();
    decodeFromVideoDeviceMock.mockResolvedValue(controls);

    const fixture = TestBed.createComponent(BarcodeScanner);
    const detected: string[] = [];
    fixture.componentInstance.codeDetected.subscribe((value) => detected.push(value));

    await setActive(fixture, true);
    await vi.waitFor(() => expect(decodeFromVideoDeviceMock).toHaveBeenCalledTimes(1));

    const decodeCallback = decodeFromVideoDeviceMock.mock.calls[0][2];
    decodeCallback({ getText: () => 'ABC123' }, undefined, controls);
    decodeCallback({ getText: () => 'ABC123' }, undefined, controls);

    expect(detected).toEqual(['ABC123', 'ABC123']);
  });

  it('does not throw and does not emit codeDetected when camera access is denied', async () => {
    decodeFromVideoDeviceMock.mockRejectedValue(new Error('Permission denied'));

    const fixture = TestBed.createComponent(BarcodeScanner);
    const detected: string[] = [];
    fixture.componentInstance.codeDetected.subscribe((value) => detected.push(value));

    await expect(setActive(fixture, true)).resolves.not.toThrow();

    expect(detected).toEqual([]);
  });
});
