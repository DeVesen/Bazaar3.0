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
    ['success', '#d5f5e3', '#1a5c38'],
    ['danger', '#fadbd8', '#7b241c'],
    ['warn', '#fef9e7', '#7e5109'],
    ['info', '#d6eaf8', '#1a5276'],
    ['sec', '#eaecee', '#566573'],
    ['original', '#d5f5e3', '#1a5c38'],
    ['neu', '#fdebd0', '#784212']
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
