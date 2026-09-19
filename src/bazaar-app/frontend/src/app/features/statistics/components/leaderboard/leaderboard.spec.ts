import { TestBed } from '@angular/core/testing';
import { Leaderboard, LeaderboardRow } from './leaderboard';

function row(overrides: Partial<LeaderboardRow> = {}): LeaderboardRow {
  return {
    rank: 1,
    sellerId: 's1',
    sellerName: 'Anna Meier',
    sellerType: 'Privat',
    accepted: 42,
    sold: 31,
    revenue: 380.5,
    payout: 332.94,
    settled: true,
    ...overrides,
  };
}

describe('Leaderboard', () => {
  async function createFixture(rows: LeaderboardRow[], typeColumnVisible = true) {
    await TestBed.configureTestingModule({ imports: [Leaderboard] }).compileComponents();
    const fixture = TestBed.createComponent(Leaderboard);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('typeColumnVisible', typeColumnVisible);
    fixture.detectChanges();
    return fixture;
  }

  it('renders rows in the given (default backend) order without re-sorting', async () => {
    const rows = [
      row({ sellerId: 's1', rank: 1, sold: 31 }),
      row({ sellerId: 's2', rank: 2, sold: 20 }),
      row({ sellerId: 's3', rank: 3, sold: 5 }),
    ];
    const fixture = await createFixture(rows);

    expect(fixture.componentInstance.sortedRows().map((r) => r.sellerId)).toEqual(['s1', 's2', 's3']);
  });

  it('re-sorts the local copy when Table emits sortChange, without mutating the rows input', async () => {
    const rows = [
      row({ sellerId: 's1', sellerName: 'Zara', sold: 31 }),
      row({ sellerId: 's2', sellerName: 'Anna', sold: 20 }),
    ];
    const fixture = await createFixture(rows);

    fixture.componentInstance.onSortChange([{ field: 'sellerName', order: 'asc' }]);

    expect(fixture.componentInstance.sortedRows().map((r) => r.sellerId)).toEqual(['s2', 's1']);
    expect(fixture.componentInstance.rows().map((r) => r.sellerId)).toEqual(['s1', 's2']);
  });

  it('sorts numeric fields numerically', async () => {
    const rows = [
      row({ sellerId: 's1', accepted: 5 }),
      row({ sellerId: 's2', accepted: 42 }),
      row({ sellerId: 's3', accepted: 17 }),
    ];
    const fixture = await createFixture(rows);

    fixture.componentInstance.onSortChange([{ field: 'accepted', order: 'asc' }]);

    expect(fixture.componentInstance.sortedRows().map((r) => r.accepted)).toEqual([5, 17, 42]);
  });

  it('removes the Typ column entirely when typeColumnVisible is false', async () => {
    const fixture = await createFixture([row()], false);

    expect(fixture.componentInstance.columns().some((c) => c.field === 'sellerType')).toBe(false);
  });

  it('keeps the Typ column when typeColumnVisible is true', async () => {
    const fixture = await createFixture([row()], true);

    expect(fixture.componentInstance.columns().some((c) => c.field === 'sellerType')).toBe(true);
  });

  it('shows the settled checkmark only for settled rows on the payout column', async () => {
    const fixture = await createFixture([row({ settled: true }), row({ settled: false })]);

    const payoutColumn = fixture.componentInstance.columns().find((c) => c.field === 'payout');
    expect(payoutColumn?.secondaryBadge?.(row({ settled: true }))).toEqual({ text: '✓', severity: 'success' });
    expect(payoutColumn?.secondaryBadge?.(row({ settled: false }))).toBeNull();
  });
});
