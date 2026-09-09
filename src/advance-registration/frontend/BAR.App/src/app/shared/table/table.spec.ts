import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppTable, ColumnConfig } from './table';

const COLUMNS: ColumnConfig[] = [
  { field: 'number', header: 'Nr.', type: 'number' },
  { field: 'name', header: 'Bezeichnung', type: 'text' }
];

interface Row { number: number; name: string }

function create(data: Row[] = [], overrides: Partial<{ loading: boolean; totalRecords: number; hasActiveFilter: boolean }> = {}) {
  const fixture = TestBed.createComponent(AppTable<Row>);
  fixture.componentRef.setInput('columns', COLUMNS);
  fixture.componentRef.setInput('data', data);
  fixture.componentRef.setInput('loading', overrides.loading ?? false);
  fixture.componentRef.setInput('totalRecords', overrides.totalRecords ?? data.length);
  fixture.componentRef.setInput('hasActiveFilter', overrides.hasActiveFilter ?? false);
  fixture.detectChanges();
  return fixture;
}

describe('AppTable', () => {
  it('shows the generic empty text when there is no data and no active filter', () => {
    const fixture = create([]);
    expect(fixture.nativeElement.textContent).toContain('Keine Einträge gefunden.');
  });

  it('shows the filtered empty text when there is no data and a filter is active', () => {
    const fixture = create([], { hasActiveFilter: true });
    expect(fixture.nativeElement.textContent).toContain('Keine Einträge für den gewählten Filter gefunden.');
  });

  it('renders one row per data item', () => {
    const fixture = create([{ number: 1, name: 'A' }, { number: 2, name: 'B' }]);
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
  });

  it('onSort() emits sortChange translated from PrimeNG sort order', () => {
    const fixture = create([{ number: 1, name: 'A' }]);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.sortChange.subscribe((v: unknown) => emitted.push(v));

    component.onSort({ field: 'name', order: 1 });

    expect(emitted).toEqual([[{ field: 'name', order: 'asc' }]]);
  });

  it('onPage() emits pageChange with first and rows', () => {
    const fixture = create([{ number: 1, name: 'A' }]);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.pageChange.subscribe((v: unknown) => emitted.push(v));

    component.onPage({ first: 25, rows: 25 });

    expect(emitted).toEqual([{ first: 25, rows: 25 }]);
  });

  it('actionClick emits actionId and row on action button click', () => {
    const fixture = create([{ number: 1, name: 'A' }]);
    fixture.componentRef.setInput('actionColumn', { actions: [{ actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: 'Bearbeiten' }] });
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.actionClick.subscribe((v: unknown) => emitted.push(v));

    fixture.debugElement.query(By.css('[data-action-id="edit"]')).nativeElement.click();

    expect(emitted).toEqual([{ actionId: 'edit', row: { number: 1, name: 'A' } }]);
  });

  it('formats a currency column as EUR with 2 decimals, right-aligned', () => {
    const priceColumns = [...COLUMNS, { field: 'price', header: 'Preis', type: 'currency' as const }];
    const fixture = TestBed.createComponent(AppTable<Row & { price: number }>);
    fixture.componentRef.setInput('columns', priceColumns);
    fixture.componentRef.setInput('data', [{ number: 1, name: 'A', price: 5 }]);
    fixture.componentRef.setInput('totalRecords', 1);
    fixture.detectChanges();

    const cells = fixture.debugElement.queryAll(By.css('tbody tr td.number'));
    const priceCell = cells[cells.length - 1];
    expect(priceCell.nativeElement.textContent).toContain('5,00');
    expect(priceCell.nativeElement.textContent).toMatch(/€|EUR/);
  });

  it('shows skeleton rows while loading', () => {
    const fixture = create([], { loading: true });
    const skeletons = fixture.debugElement.queryAll(By.css('p-skeleton'));
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
