import { TestBed } from '@angular/core/testing';
import { Table, type ColumnConfig } from './table';

interface Row {
  id: number;
  name: string;
  price: number;
  createdAt: string;
  status: string;
}

const COLUMNS: ColumnConfig[] = [
  { field: 'name', header: 'Name', type: 'text' },
  { field: 'price', header: 'Preis', type: 'currency' },
  { field: 'createdAt', header: 'Erstellt Am', type: 'date' },
  { field: 'status', header: 'Status', type: 'badge' },
];

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Artikel ${i + 1}`,
    price: 10 + i,
    createdAt: '2026-01-01',
    status: 'active',
  }));
}

describe('Table', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table],
    }).compileComponents();
  });

  function createFixture(rows: Row[] = makeRows(3)) {
    const fixture = TestBed.createComponent(Table<Row>);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('data', rows);
    return fixture;
  }

  describe('AC-1: single sort ascending', () => {
    it('sorts by the clicked column ascending and shows the ▲ icon', async () => {
      const fixture = createFixture();
      const spy = vi.fn();
      fixture.componentInstance.sortChange.subscribe(spy);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const nameHeader = compiled.querySelectorAll('th')[0];
      nameHeader.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await fixture.whenStable();

      expect(spy).toHaveBeenCalledWith([{ field: 'name', order: 'asc' }]);
      expect(compiled.textContent).toContain('▲');
    });
  });

  describe('AC-2: single sort reversal to descending', () => {
    it('reverses the same column to descending on a second click and shows ▼', async () => {
      const fixture = createFixture();
      const spy = vi.fn();
      fixture.componentInstance.sortChange.subscribe(spy);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const nameHeader = compiled.querySelectorAll('th')[0];
      nameHeader.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await fixture.whenStable();
      nameHeader.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await fixture.whenStable();

      expect(spy).toHaveBeenLastCalledWith([{ field: 'name', order: 'desc' }]);
      expect(compiled.textContent).toContain('▼');
    });
  });

  describe('AC-3: shift+click multi-sort with numbered badges', () => {
    it('activates multi-sort and shows numbered badges on the active columns', async () => {
      const fixture = createFixture();
      const spy = vi.fn();
      fixture.componentInstance.sortChange.subscribe(spy);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const headers = compiled.querySelectorAll('th');
      headers[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await fixture.whenStable();
      headers[1].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
      await fixture.whenStable();

      expect(spy).toHaveBeenLastCalledWith([
        { field: 'name', order: 'asc' },
        { field: 'price', order: 'asc' },
      ]);
      expect(compiled.textContent).toContain('①');
      expect(compiled.textContent).toContain('②');
    });
  });

  describe('AC-4: pagination above the 25-row threshold', () => {
    it('shows the paginator with page-size options and the German report template above 25 rows', async () => {
      const fixture = createFixture(makeRows(30));
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.p-paginator')).not.toBeNull();
      expect(compiled.textContent).toContain('Zeige');
      expect(compiled.textContent).toContain('von');
      expect(compiled.textContent).toContain('Einträgen');
    });

    it('hides the paginator at or below the 25-row threshold', async () => {
      const fixture = createFixture(makeRows(10));
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.p-paginator')).toBeNull();
    });
  });

  describe('AC-5: action button click emits actionClick', () => {
    it('emits { actionId, row } when an action button is clicked', async () => {
      const rows = makeRows(2);
      const fixture = createFixture(rows);
      fixture.componentRef.setInput('actionColumn', {
        buttons: [{ actionId: 'edit', icon: 'pi pi-pencil', tooltip: 'Bearbeiten' }],
      });
      const spy = vi.fn();
      fixture.componentInstance.actionClick.subscribe(spy);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const editButton = compiled.querySelector('.app-table__actions button') as HTMLElement;
      editButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await fixture.whenStable();

      expect(spy).toHaveBeenCalledWith({ actionId: 'edit', row: rows[0] });
    });
  });

  describe('AC-6: empty state without an active filter', () => {
    it('shows the default text centered when there are no rows and no filter', async () => {
      const fixture = createFixture([]);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const empty = compiled.querySelector('.app-table__empty');
      expect(empty?.textContent?.trim()).toBe('Keine Einträge gefunden.');
    });

    it('shows the overridden emptyText when set and no filter is active', async () => {
      const fixture = createFixture([]);
      fixture.componentRef.setInput('emptyText', 'Noch keine Marken.');
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const empty = compiled.querySelector('.app-table__empty');
      expect(empty?.textContent?.trim()).toBe('Noch keine Marken.');
    });
  });

  describe('AC-7: empty state with an active filter', () => {
    it('shows the filter-specific text when hasActiveFilter is true, ignoring emptyText', async () => {
      const fixture = createFixture([]);
      fixture.componentRef.setInput('emptyText', 'Noch keine Marken.');
      fixture.componentRef.setInput('hasActiveFilter', true);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const empty = compiled.querySelector('.app-table__empty');
      expect(empty?.textContent?.trim()).toBe('Keine Einträge für den gewählten Filter gefunden.');
    });

    it('shows the filter-specific text when the table own column filter is active', async () => {
      const fixture = createFixture([]);
      await fixture.whenStable();

      fixture.componentInstance.onFilterValueChange(COLUMNS[0], 'Nike');
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const empty = compiled.querySelector('.app-table__empty');
      expect(empty?.textContent?.trim()).toBe('Keine Einträge für den gewählten Filter gefunden.');
    });
  });

  describe('AC-8: striped rows', () => {
    it('enables PrimeNG stripedRows and configures the #FAFAFA striped background', async () => {
      const fixture = createFixture();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const table = compiled.querySelector('p-table') as HTMLElement;
      expect(table.classList.contains('p-datatable-striped')).toBe(true);
      expect(table.style.getPropertyValue('--p-datatable-row-striped-background').toUpperCase()).toBe(
        '#FAFAFA',
      );
    });
  });

  describe('AC-9: row hover highlight', () => {
    it('enables PrimeNG rowHover', async () => {
      const fixture = createFixture();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const table = compiled.querySelector('p-table') as HTMLElement;
      expect(table.classList.contains('p-datatable-hoverable')).toBe(true);
    });
  });

  describe('AC-10: loading skeleton', () => {
    it('renders 5 skeleton rows with a p-skeleton per data column while loading', async () => {
      const fixture = createFixture([]);
      fixture.componentRef.setInput('loading', true);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      const skeletonRows = compiled.querySelectorAll('tbody tr');
      expect(skeletonRows.length).toBe(5);
      skeletonRows.forEach((row) => {
        expect(row.querySelectorAll('p-skeleton').length).toBe(COLUMNS.length);
      });
    });
  });
});
