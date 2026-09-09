import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BarBlueprint } from './bar-blueprint';

describe('BarBlueprint', () => {
  it('projects its content inside the blueprint container', () => {
    TestBed.overrideComponent(BarBlueprint, {
      set: { template: '<app-blueprint><p>Inhalt</p></app-blueprint>' }
    });
    const fixture = TestBed.createComponent(BarBlueprint);
    fixture.detectChanges();
    const projected = fixture.debugElement.query(By.css('p'));
    expect(projected.nativeElement.textContent).toBe('Inhalt');
  });

  it('renders exactly four corner-cross elements', () => {
    const fixture = TestBed.createComponent(BarBlueprint);
    fixture.detectChanges();
    const corners = fixture.debugElement.queryAll(By.css('.corner'));
    expect(corners.length).toBe(4);
  });
});
