import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrintService } from './print.service';

@Component({ selector: 'app-test-print-doc', template: '<p data-testid="doc">{{ text() }}</p>' })
class TestPrintDoc {
  readonly text = input('');
}

const originalUserAgent = navigator.userAgent;

function setUserAgent(value: string): void {
  Object.defineProperty(navigator, 'userAgent', { value, configurable: true });
}

describe('PrintService', () => {
  let service: PrintService;
  let printSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintService);
    printSpy = vi.fn();
    window.print = printSpy as unknown as typeof window.print;
  });

  afterEach(() => {
    setUserAgent(originalUserAgent);
    document.querySelectorAll('[data-print-host], [data-print-style]').forEach((e) => e.remove());
  });

  it('mounts the rendered document on body, adds the print style and opens the print dialog', () => {
    service.print(TestPrintDoc, (ref) => ref.setInput('text', 'Hallo'));

    const host = document.querySelector('body > [data-print-host]') as HTMLElement;
    expect(host).not.toBeNull();
    expect(host.querySelector('[data-testid=doc]')?.textContent).toBe('Hallo');
    expect(host.style.visibility).toBe('hidden');
    expect(host.style.left).toBe('0px');
    expect(document.querySelector('head > [data-print-style]')?.textContent).toContain('A4 portrait');
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it('removes the document on afterprint (non-iOS)', () => {
    service.print(TestPrintDoc, () => undefined);

    window.dispatchEvent(new Event('afterprint'));

    expect(document.querySelector('[data-print-host]')).toBeNull();
    expect(document.querySelector('[data-print-style]')).toBeNull();
  });

  it('keeps the document on iOS after afterprint and removes it only on the next print', () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)');
    service.print(TestPrintDoc, (ref) => ref.setInput('text', 'erster'));

    window.dispatchEvent(new Event('afterprint'));
    expect(document.querySelectorAll('[data-print-host]').length).toBe(1);

    service.print(TestPrintDoc, (ref) => ref.setInput('text', 'zweiter'));
    const hosts = document.querySelectorAll('[data-print-host]');
    expect(hosts.length).toBe(1);
    expect(hosts[0].textContent).toContain('zweiter');
    expect(document.querySelectorAll('[data-print-style]').length).toBe(1);
  });

  it('cleans up when window.print throws', () => {
    printSpy.mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    service.print(TestPrintDoc, () => undefined);

    expect(document.querySelector('[data-print-host]')).toBeNull();
  });
});
