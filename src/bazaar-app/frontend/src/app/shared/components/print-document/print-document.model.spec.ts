import {
  PrintArticle,
  PrintFreitexts,
  PrintSeller,
  PrintTile,
  buildAbgabeBelegModel,
  buildVerkaeuferUebersichtModel,
  flattenGroups,
  groupArticles,
} from './print-document.model';

const seller: PrintSeller = {
  id: 'a3f9c2d1',
  firstName: 'Anna',
  lastName: 'Meier',
  address: 'Musterstraße 5',
  postalCode: '76133',
  city: 'Karlsruhe',
};
const noTexts: PrintFreitexts = { text1: '', text2: '', text3: '', text4: '', text5: '' };
const printedAt = new Date(2026, 9, 14, 9, 30);

function article(number: number, status: string, price = 10): PrintArticle {
  return {
    number,
    name: `Artikel ${number}`,
    category: 'Jacken',
    brand: 'Nike',
    size: 'M',
    color: 'Rot',
    price,
    status,
  };
}

/** Währungsformat nutzt ein geschütztes Leerzeichen vor „€"; Tests vergleichen mit normalem. */
function plain(text: string): string {
  return text.replaceAll(String.fromCharCode(160), ' ');
}

function tile(tiles: PrintTile[], title: string): PrintTile | undefined {
  return tiles.find((candidate) => plain(candidate.title) === title);
}

describe('groupArticles', () => {
  it('groupArticles_allStatuses_ordersGroupsAsSpecified', () => {
    // Arrange
    const articles = [
      article(1, 'returned'),
      article(2, 'sold'),
      article(3, 'selling'),
      article(4, 'registered'),
    ];

    // Act
    const groups = groupArticles(articles);

    // Assert
    expect(groups.map((group) => group.label)).toEqual([
      'Registriert',
      'Im Verkauf',
      'Verkauft',
      'Zurückgegeben',
    ]);
  });

  it('groupArticles_unsortedNumbersInOneGroup_sortsAscending', () => {
    // Arrange
    const articles = [article(12, 'selling'), article(5, 'selling'), article(9, 'selling')];

    // Act
    const groups = groupArticles(articles);

    // Assert
    expect(groups[0].articles.map((entry) => entry.number)).toEqual([5, 9, 12]);
  });

  it('groupArticles_groupWithoutArticles_isOmitted', () => {
    // Arrange
    const articles = [article(1, 'sold')];

    // Act
    const groups = groupArticles(articles);

    // Assert
    expect(groups.map((group) => group.status)).toEqual(['sold']);
  });
});

describe('flattenGroups', () => {
  it('flattenGroups_twoGroups_putsEachGroupRowBeforeItsArticles', () => {
    // Arrange
    const groups = groupArticles([article(1, 'selling'), article(2, 'sold')]);

    // Act
    const rows = flattenGroups(groups);

    // Assert
    expect(rows.map((row) => (row.kind === 'group' ? `G:${row.label}:${row.count}` : `A:${row.article.number}`))).toEqual([
      'G:Im Verkauf:1',
      'A:1',
      'G:Verkauft:1',
      'A:2',
    ]);
  });
});

describe('buildAbgabeBelegModel', () => {
  function build(articles: PrintArticle[], feePerItem = 0.5, commissionRate = 20) {
    return buildAbgabeBelegModel({ seller, articles, freitexts: noTexts, feePerItem, commissionRate, printedAt });
  }

  it('buildAbgabeBelegModel_always_putsSellerIdAndCountInRowA', () => {
    // Arrange & Act
    const model = build([article(1, 'selling'), article(2, 'selling')]);

    // Assert
    expect(model.tilesA.map((entry) => entry.title)).toEqual(['Verkäufer-ID', 'Anzahl Artikel']);
    expect(tile(model.tilesA, 'Verkäufer-ID')?.value).toBe('a3f9c2d1');
    expect(tile(model.tilesA, 'Anzahl Artikel')?.value).toBe('2');
  });

  it('buildAbgabeBelegModel_fourArticlesAndFeeFiftyCent_showsCalculatedFeeTile', () => {
    // Arrange
    const articles = [1, 2, 3, 4].map((number) => article(number, 'selling'));

    // Act
    const model = build(articles, 0.5);

    // Assert
    const fee = model.tilesB[0];
    expect(plain(fee.title)).toBe('Gebühr 0,50 € / Artikel');
    expect(plain(fee.value)).toBe('2,00 €');
  });

  it('buildAbgabeBelegModel_commissionRateTwentyPercent_showsRateInProvisionTile', () => {
    // Arrange & Act
    const model = build([article(1, 'selling')], 0.5, 20);

    // Assert
    expect(model.tilesB[1]).toEqual({ title: 'Provision', value: '20 %' });
  });

  it('buildAbgabeBelegModel_noArticles_showsZeroCountAndZeroFee', () => {
    // Arrange & Act
    const model = build([]);

    // Assert
    expect(tile(model.tilesA, 'Anzahl Artikel')?.value).toBe('0');
    expect(plain(model.tilesB[0].value)).toBe('0,00 €');
    expect(model.groups).toEqual([]);
  });

  it('buildAbgabeBelegModel_registeredArticles_keepsRegistriertGroup', () => {
    // Arrange & Act
    const model = build([article(1, 'registered'), article(2, 'registered'), article(3, 'registered')]);

    // Assert
    expect(model.groups.map((group) => `${group.label}:${group.articles.length}`)).toEqual(['Registriert:3']);
  });
});

describe('buildVerkaeuferUebersichtModel', () => {
  function build(articles: PrintArticle[]) {
    return buildVerkaeuferUebersichtModel({
      seller,
      articles,
      freitexts: noTexts,
      feePerItem: 0.5,
      settlement: { revenue: 200, commission: 40, payout: 160, commissionRate: 20 },
      printedAt,
    });
  }

  it('buildVerkaeuferUebersichtModel_sellingAndSoldGroupsUnsorted_keepsGroupOrderAndSortsWithinGroups', () => {
    // Arrange
    const articles = [article(12, 'selling'), article(3, 'selling'), article(7, 'sold'), article(1, 'sold')];

    // Act
    const model = build(articles);

    // Assert
    expect(model.groups.map((group) => [group.status, group.articles.map((entry) => entry.number)])).toEqual([
      ['selling', [3, 12]],
      ['sold', [1, 7]],
    ]);
  });

  it('buildVerkaeuferUebersichtModel_always_hasTheFiveTilesOfRowAAndThreeOfRowB', () => {
    // Arrange & Act
    const model = build([article(1, 'selling')]);

    // Assert
    expect(model.tilesA.map((entry) => entry.title)).toEqual([
      'Verkäufer-ID',
      'Anzahl Artikel',
      'Anzahl offener Artikel',
      'Anzahl verkaufter Artikel',
      'Einnahmen',
    ]);
    expect(model.tilesB.map((entry) => plain(entry.title))).toEqual([
      'Gebühr 0,50 € / Artikel',
      'Provision 20 %',
      'Verdienst',
    ]);
  });

  it('buildVerkaeuferUebersichtModel_revenue200AndRate20_showsRevenueCommissionAndEarnings', () => {
    // Arrange & Act
    const model = build([article(1, 'sold')]);

    // Assert
    expect(plain(tile(model.tilesA, 'Einnahmen')?.value ?? '')).toBe('200,00 €');
    expect(plain(tile(model.tilesB, 'Provision 20 %')?.value ?? '')).toBe('40,00 €');
    expect(plain(tile(model.tilesB, 'Verdienst')?.value ?? '')).toBe('160,00 €');
  });

  it('buildVerkaeuferUebersichtModel_selling3Sold2Registered2_countsAndOmitsRegistered', () => {
    // Arrange
    const articles = [
      article(1, 'selling'),
      article(2, 'selling'),
      article(3, 'selling'),
      article(4, 'sold'),
      article(5, 'sold'),
      article(6, 'registered'),
      article(7, 'registered'),
    ];

    // Act
    const model = build(articles);

    // Assert
    expect(tile(model.tilesA, 'Anzahl offener Artikel')?.value).toBe('3');
    expect(tile(model.tilesA, 'Anzahl verkaufter Artikel')?.value).toBe('2');
    expect(tile(model.tilesA, 'Anzahl Artikel')?.value).toBe('5');
    expect(model.groups.map((group) => group.label)).toEqual(['Im Verkauf', 'Verkauft']);
  });
});
