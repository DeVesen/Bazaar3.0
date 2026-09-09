import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { BlockListe } from './block-liste';

describe('BlockListe', () => {
  let fixture: ComponentFixture<BlockListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BlockListe] }).compileComponents();
    fixture = TestBed.createComponent(BlockListe);
  });

  it('shows the empty state text when there are no blocks', () => {
    fixture.componentRef.setInput('blocks', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Noch keine Nummernblöcke zugewiesen');
  });

  it('renders one item per block with range and counter', () => {
    fixture.componentRef.setInput('blocks', [
      { id: 'b1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3 }
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('101');
    expect(fixture.nativeElement.textContent).toContain('110');
    expect(fixture.nativeElement.textContent).toContain('10 Nummern · 3 vergeben');
  });
});
