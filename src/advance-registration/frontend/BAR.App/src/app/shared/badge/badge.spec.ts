import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders the label text', () => {
    const fixture = TestBed.createComponent(Badge);
    fixture.componentRef.setInput('type', 'success');
    fixture.componentRef.setInput('label', 'Verkauft');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('Verkauft');
  });

  it.each([
    ['success', 'rgb(213, 245, 227)', 'rgb(26, 92, 56)'],
    ['danger', 'rgb(250, 219, 216)', 'rgb(123, 36, 28)'],
    ['warn', 'rgb(254, 249, 231)', 'rgb(126, 81, 9)'],
    ['info', 'rgb(214, 234, 248)', 'rgb(26, 82, 118)'],
    ['sec', 'rgb(234, 236, 238)', 'rgb(86, 101, 115)'],
    ['original', 'rgb(213, 245, 227)', 'rgb(26, 92, 56)'],
    ['neu', 'rgb(253, 235, 208)', 'rgb(120, 66, 18)']
  ] as const)('applies the %s palette', (type, background, color) => {
    const fixture = TestBed.createComponent(Badge);
    fixture.componentRef.setInput('type', type);
    fixture.componentRef.setInput('label', 'x');
    fixture.detectChanges();

    const span: HTMLElement = fixture.nativeElement.querySelector('.app-badge');
    expect(span.style.background).toContain(background);
    expect(span.style.color).toContain(color);
  });
});
