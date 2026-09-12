import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { Modal } from './modal';

// Host components for the projection tests: Modal's own template must not be
// overridden to `<app-modal>` with `TestBed.overrideComponent(Modal, ...)`,
// since that (the selector is app-modal) would lead to recursive
// self-instantiation.
@Component({
  imports: [Modal],
  template: `<app-modal [visible]="true" header="Verkäufer anlegen"></app-modal>`
})
class HeaderHost {}

@Component({
  imports: [Modal],
  template: `
    <app-modal [visible]="true" header="x">
      <p modalBody>Formularinhalt</p>
      <button modalFooter type="button">Speichern</button>
    </app-modal>
  `
})
class ProjectionHost {}

describe('Modal', () => {
  it('renders the header text', () => {
    const fixture = TestBed.createComponent(HeaderHost);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Verkäufer anlegen');
  });

  it('projects body and footer content into their slots', () => {
    const fixture = TestBed.createComponent(ProjectionHost);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Formularinhalt');
    expect(fixture.nativeElement.textContent).toContain('Speichern');
  });

  it.each([
    ['sm', '420px'],
    ['standard', '700px'],
    ['lg', '940px']
  ] as const)('computes the max-width for size %s', (size, maxWidth) => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('header', 'x');
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();

    expect(fixture.componentInstance.style()['max-width']).toBe(maxWidth);
  });

  it('emits visibleChange when the dialog requests to close', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('header', 'x');
    fixture.detectChanges();

    let emitted: boolean | undefined;
    fixture.componentInstance.visibleChange.subscribe((v) => (emitted = v));
    fixture.componentInstance.onVisibleChange(false);

    expect(emitted).toBe(false);
  });
});
