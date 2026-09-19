import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { StatisticsPage } from './statistics-page';
import { Statistics, StatisticsApi } from '../../data/statistics-api';
// eslint-disable-next-line boundaries/dependencies -- see statistics-page.ts's own justification
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';

function statistics(overrides: Partial<Statistics> = {}): Statistics {
  return {
    articles: { total: 812, accepted: 780, selling: 96, sold: 640, returned: 44, sellRate: 82.05 },
    values: { acceptedValue: 9860, returnedValue: 512, openValue: 1180 },
    finance: {
      grossIncome: 8168,
      grossIncomeManual: 40,
      commission: 1102.68,
      fees: 390,
      earningsTotal: 1492.68,
      payoutExpected: 6675.32,
      payoutSettled: 4210.15,
    },
    leaderboard: [
      {
        rank: 1,
        sellerId: 'a3f9c2d1',
        sellerName: 'Anna Meier',
        sellerType: 'Privat',
        accepted: 42,
        sold: 31,
        revenue: 380.5,
        payout: 332.94,
        settled: true,
      },
    ],
    ...overrides,
  };
}

function sellerType(overrides: Partial<SellerType> = {}): SellerType {
  return { id: 't1', name: 'Privat', commissionRate: 10, itemFee: 0.5, sellerCount: 3, ...overrides };
}

function statisticsApiStub(response: Statistics = statistics()) {
  return { getStatistics: vi.fn().mockReturnValue(of(response)) };
}

function sellerTypesApiStub(types: SellerType[] = [sellerType()]) {
  return { getAll: vi.fn().mockReturnValue(of(types)) };
}

function messageServiceStub() {
  return { add: vi.fn() };
}

async function setup(
  options: {
    statisticsApi?: ReturnType<typeof statisticsApiStub>;
    sellerTypesApi?: ReturnType<typeof sellerTypesApiStub>;
    messageService?: ReturnType<typeof messageServiceStub>;
  } = {},
) {
  const statisticsApi = options.statisticsApi ?? statisticsApiStub();
  const sellerTypesApi = options.sellerTypesApi ?? sellerTypesApiStub();
  const messageService = options.messageService ?? messageServiceStub();

  await TestBed.configureTestingModule({
    imports: [StatisticsPage],
    providers: [
      { provide: StatisticsApi, useValue: statisticsApi },
      { provide: SellerTypesApi, useValue: sellerTypesApi },
      { provide: MessageService, useValue: messageService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(StatisticsPage);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance, statisticsApi, sellerTypesApi, messageService };
}

describe('StatisticsPage', () => {
  it('loads statistics and seller types once on construction', async () => {
    const { statisticsApi, sellerTypesApi } = await setup();

    expect(statisticsApi.getStatistics).toHaveBeenCalledTimes(1);
    expect(statisticsApi.getStatistics).toHaveBeenCalledWith(null);
    expect(sellerTypesApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('renders KPI values from the stubbed response', async () => {
    const { component } = await setup();

    expect(component.statistics()?.articles.total).toBe(812);
    expect(component.statistics()?.finance.earningsTotal).toBe(1492.68);
  });

  it('sellRate === null renders "—" (passed through, not pre-formatted)', async () => {
    const statisticsApi = statisticsApiStub(
      statistics({ articles: { total: 0, accepted: 0, selling: 0, sold: 0, returned: 0, sellRate: null } }),
    );
    const { component } = await setup({ statisticsApi });

    expect(component.sellRateDisplay()).toBeNull();
  });

  it('sellRate non-null renders as a formatted percent string', async () => {
    const { component } = await setup();

    expect(component.sellRateDisplay()).toBe('82,05 %');
  });

  it('grossIncomeManual === 0 hides the sub-label', async () => {
    const statisticsApi = statisticsApiStub(statistics({ finance: { ...statistics().finance, grossIncomeManual: 0 } }));
    const { component } = await setup({ statisticsApi });

    expect(component.grossIncomeManualSubLabel()).toBe('');
  });

  it('grossIncomeManual > 0 shows the sub-label with the formatted amount', async () => {
    const { component } = await setup();

    expect(component.grossIncomeManualSubLabel()).toContain('davon manuell');
    expect(component.grossIncomeManualSubLabel()).toContain('40');
  });

  it('selecting a type filter triggers a second getStatistics call with that id', async () => {
    const { component, statisticsApi } = await setup();
    statisticsApi.getStatistics.mockClear();

    component.onTypeFilterChange('t1');

    expect(statisticsApi.getStatistics).toHaveBeenCalledTimes(1);
    expect(statisticsApi.getStatistics).toHaveBeenCalledWith('t1');
    expect(component.selectedTypeId()).toBe('t1');
  });

  it('computes meter group percentages relative to accepted, not total', async () => {
    const statisticsApi = statisticsApiStub(
      statistics({ articles: { total: 100, accepted: 80, selling: 20, sold: 50, returned: 10, sellRate: 62.5 } }),
    );
    const { component } = await setup({ statisticsApi });

    const items = component.meterItems();
    expect(items).toHaveLength(3);
    expect(items[0].value).toBeCloseTo(25, 1); // 20/80
    expect(items[1].value).toBeCloseTo(62.5, 1); // 50/80
    expect(items[2].value).toBeCloseTo(12.5, 1); // 10/80
  });

  it('meterItems is empty when accepted is 0 (guards against NaN)', async () => {
    const statisticsApi = statisticsApiStub(
      statistics({ articles: { total: 0, accepted: 0, selling: 0, sold: 0, returned: 0, sellRate: null } }),
    );
    const { component } = await setup({ statisticsApi });

    expect(component.meterItems()).toEqual([]);
  });

  it('shows an error toast when getStatistics fails', async () => {
    const statisticsApi = { getStatistics: vi.fn().mockReturnValue(throwError(() => new Error('boom'))) };
    const { messageService } = await setup({ statisticsApi });

    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });
});
