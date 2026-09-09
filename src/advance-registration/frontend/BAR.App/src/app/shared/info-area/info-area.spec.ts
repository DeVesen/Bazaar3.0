import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InfoArea } from './info-area';

describe('InfoArea', () => {
  let fixture: ComponentFixture<InfoArea>;

  beforeEach(async () => {
    vi.stubGlobal('AudioContext', class {
      createOscillator() {
        return {
          type: '',
          frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn()
        };
      }
      destination = {}
      currentTime = 0
    });

    await TestBed.configureTestingModule({ imports: [InfoArea] }).compileComponents();
    fixture = TestBed.createComponent(InfoArea);
  });

  it('renders the message with the type-specific icon', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.componentRef.setInput('message', 'Profil konnte nicht gespeichert werden');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('✗');
    expect(fixture.nativeElement.textContent).toContain('Profil konnte nicht gespeichert werden');
  });

  it('does not throw for type info (no tone)', () => {
    fixture.componentRef.setInput('type', 'info');
    fixture.componentRef.setInput('message', 'Hinweis');
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
