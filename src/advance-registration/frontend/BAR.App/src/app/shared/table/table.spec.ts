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

  it('renders a p-tag with the badge callback label/severity for a badge column', () => {
    const badgeColumns: ColumnConfig<Row>[] = [
      ...COLUMNS,
      {
        field: 'name',
        header: 'Status',
        type: 'badge',
        badge: (row: Row) => ({ label: row.name === 'A' ? 'Aktiv' : 'Inaktiv', severity: 'success' })
      }
    ];
    const fixture = TestBed.createComponent(AppTable<Row>);
    fixture.componentRef.setInput('columns', badgeColumns);
    fixture.componentRef.setInput('data', [{ number: 1, name: 'A' }]);
    fixture.componentRef.setInput('totalRecords', 1);
    fixture.detectChanges();

    const tag = fixture.debugElement.query(By.css('p-tag'));
    expect(tag).toBeTruthy();
    expect(tag.nativeElement.textContent).toContain('Aktiv');
    expect(tag.attributes['ng-reflect-severity'] ?? tag.componentInstance?.severity).toBeTruthy();
  });

  it('renders a toolbar with title and add button when canAdd and title are set, and emits rowAdd on click', () => {
    const fixture = create([]);
    fixture.componentRef.setInput('title', 'Meine Artikel');
    fixture.componentRef.setInput('canAdd', true);
    fixture.detectChanges();

    const heading = fixture.debugElement.query(By.css('h2'));
    expect(heading.nativeElement.textContent).toContain('Meine Artikel');

    const addButton = fixture.debugElement.query(By.css('[data-testid="add-button"]'));
    expect(addButton).toBeTruthy();

    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.rowAdd.subscribe(() => emitted.push(true));
    addButton.nativeElement.click();

    expect(emitted.length).toBe(1);
  });

  it('renders no toolbar when canAdd is false and title is empty (default)', () => {
    const fixture = create([]);
    const addButton = fixture.debugElement.query(By.css('[data-testid="add-button"]'));
    const heading = fixture.debugElement.query(By.css('h2'));
    expect(addButton).toBeFalsy();
    expect(heading).toBeFalsy();
  });

  it('binds [lazy]="false" to the underlying p-table when lazy input is false', () => {
    const fixture = create([]);
    fixture.componentRef.setInput('lazy', false);
    fixture.detectChanges();

    const pTable = fixture.debugElement.query(By.css('p-table'));
    const lazyValue = pTable.componentInstance.lazy;
    expect(typeof lazyValue === 'function' ? lazyValue() : lazyValue).toBe(false);
  });

  it('defaults [lazy]="true" on the underlying p-table when lazy input is not set', () => {
    const fixture = create([]);
    const pTable = fixture.debugElement.query(By.css('p-table'));
    const lazyValue = pTable.componentInstance.lazy;
    expect(typeof lazyValue === 'function' ? lazyValue() : lazyValue).toBe(true);
  });

  it('sortFieldFor() returns sortField when set, otherwise falls back to field', () => {
    const fixture = create([]);
    const component = fixture.componentInstance;

    expect(component.sortFieldFor({ field: 'sellerLabel', header: 'Verkäufer', type: 'text', sortField: 'seller' })).toBe('seller');
    expect(component.sortFieldFor({ field: 'name', header: 'Bezeichnung', type: 'text' })).toBe('name');
  });
});
