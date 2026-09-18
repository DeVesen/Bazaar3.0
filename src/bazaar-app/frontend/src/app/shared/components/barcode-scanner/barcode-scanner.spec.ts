import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BarcodeScanner } from './barcode-scanner';
import { BrowserMultiFormatReader } from '@zxing/browser';

/**
 * Mocks `@zxing/browser`'s `BrowserMultiFormatReader` rather than the underlying
 * `navigator.mediaDevices.getUserMedia` + full zxing decode pipeline: `decodeFromVideoDevice`
 * is the one public entry point the component actually calls, and stubbing at that boundary
 * gives a reliable, non-flaky test without reimplementing jsdom video/canvas plumbing that
 * zxing itself would need to run a real decode loop.
 */
const decodeFromVideoDeviceMock = vi.fn();

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(function (this: { decodeFromVideoDevice: typeof decodeFromVideoDeviceMock }) {
    this.decodeFromVideoDevice = decodeFromVideoDeviceMock;
  }),
}));

describe('BarcodeScanner', () => {
  beforeEach(async () => {
    decodeFromVideoDeviceMock.mockReset();
    (BrowserMultiFormatReader as unknown as ReturnType<typeof vi.fn>).mockClear();

    await TestBed.configureTestingModule({
      imports: [BarcodeScanner],
    }).compileComponents();
  });

  function createFakeControls() {
    return { stop: vi.fn() };
  }

  it('starts the camera via decodeFromVideoDevice when active becomes true', async () => {
    const controls = createFakeControls();
    decodeFromVideoDeviceMock.mockResolvedValue(controls);

    const fixture = TestBed.createComponent(BarcodeScanner);
    fixture.componentRef.setInput('active', true);
    await fixture.whenStable();

    expect(decodeFromVideoDeviceMock).toHaveBeenCalledTimes(1);
    const [deviceId, videoElement] = decodeFromVideoDeviceMock.mock.calls[0];
    expect(deviceId).toBeUndefined();
    expect(videoElement).toBeInstanceOf(HTMLVideoElement);
  });

  it('stops all tracks when active becomes false again', async () => {
    const controls = createFakeControls();
    decodeFromVideoDeviceMock.mockResolvedValue(controls);

    const fixture = TestBed.createComponent(BarcodeScanner);
    fixture.componentRef.setInput('active', true);
    await fixture.whenStable();

    fixture.componentRef.setInput('active', false);
    await fixture.whenStable();

    expect(controls.stop).toHaveBeenCalledTimes(1);
  });

  it('stops all tracks when the component is destroyed while active', async () => {
    const controls = createFakeControls();
    decodeFromVideoDeviceMock.mockResolvedValue(controls);

    const fixture = TestBed.createComponent(BarcodeScanner);
    fixture.componentRef.setInput('active', true);
    await fixture.whenStable();

    fixture.destroy();

    expect(controls.stop).toHaveBeenCalledTimes(1);
  });

  it('emits codeDetected with the raw decoded text when the decode callback reports a result', async () => {
    const controls = createFakeControls();
    decodeFromVideoDeviceMock.mockResolvedValue(controls);

    const fixture = TestBed.createComponent(BarcodeScanner);
    const detected: string[] = [];
    fixture.componentInstance.codeDetected.subscribe((value) => detected.push(value));

    fixture.componentRef.setInput('active', true);
    await fixture.whenStable();

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

    fixture.componentRef.setInput('active', true);
    await expect(fixture.whenStable()).resolves.not.toThrow();

    expect(detected).toEqual([]);
  });
});
