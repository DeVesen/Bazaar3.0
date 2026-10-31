import {
  AushangArticle,
  AushangFreitexts,
  buildArticleAushangModel,
  flattenAushangGroups,
} from './article-aushang.model';

const noTexts: AushangFreitexts = { text1: '', text2: '', text3: '', text4: '' };
const printedAt = new Date(2026, 9, 31, 9, 30);

function article(overrides: Partial<AushangArticle> = {}): AushangArticle {
  return {
    name: 'Jacke',
    brand: 'Nike',
    category: 'Jacken',
    size: 'M',
    color: 'Rot',
    price: 10,
    ...overrides,
  };
}

function build(articles: AushangArticle[]) {
  return buildArticleAushangModel({ articles, freitexts: noTexts, printedAt });
}

describe('buildArticleAushangModel', () => {
  it('build_severalCategories_ordersGroupsAlphabetically', () => {
    // Arrange
    const articles = [
      article({ category: 'Schuhe' }),
      article({ category: 'Hosen' }),
      article({ category: 'Jacken' }),
    ];

    // Act
    const model = build(articles);

    // Assert
    expect(model.groups.map((group) => group.category)).toEqual(['Hosen', 'Jacken', 'Schuhe']);
  });

  it('build_germanUmlautCategory_sortsAmongItsBaseLetter', () => {
    // Arrange
    const articles = [article({ category: 'Brillen' }), article({ category: 'Ärmlinge' })];

    // Act
    const model = build(articles);

    // Assert
    expect(model.groups.map((group) => group.category)).toEqual(['Ärmlinge', 'Brillen']);
  });

  it('build_sameCategory_sortsByBrandThenSizeThenColorThenName', () => {
    // Arrange
    const articles = [
      article({ name: 'B', brand: 'Puma', size: '86', color: 'Blau' }),
      article({ name: 'D', brand: 'Nike', size: '104', color: 'Blau' }),
      article({ name: 'C', brand: 'Nike', size: '86', color: 'Rot' }),
      article({ name: 'A', brand: 'Nike', size: '86', color: 'Blau' }),
      article({ name: 'E', brand: 'Nike', size: '86', color: 'Blau' }),
    ];

    // Act
    const model = build(articles);

    // Assert
    expect(model.groups[0].articles.map((entry) => entry.name)).toEqual(['A', 'E', 'C', 'D', 'B']);
  });

  it('build_numericSizes_sortsNumericallyNotAlphabetically', () => {
    // Arrange
    const articles = [
      article({ size: '104' }),
      article({ size: '86' }),
      article({ size: '128' }),
      article({ size: '92' }),
    ];

    // Act
    const model = build(articles);

    // Assert
    expect(model.groups[0].articles.map((entry) => entry.size)).toEqual(['86', '92', '104', '128']);
  });

  it('build_missingSizeOrColor_sortsAfterFilledValues', () => {
    // Arrange
    const articles = [
      article({ name: 'ohne Größe', size: null }),
      article({ name: 'leere Größe', size: '  ' }),
      article({ name: 'mit Größe', size: '86' }),
      article({ name: 'ohne Farbe', size: '86', color: null }),
    ];

    // Act
    const model = build(articles);

    // Assert
    const names = model.groups[0].articles.map((entry) => entry.name);
    expect(names.slice(0, 2)).toEqual(['mit Größe', 'ohne Farbe']);
    expect(names.slice(2)).toEqual(['leere Größe', 'ohne Größe']);
  });

  it('build_sortKeysDifferInCase_treatsThemAsEqualAndFallsThroughToNextKey', () => {
    // Arrange
    const articles = [
      article({ name: 'Z', brand: 'nike' }),
      article({ name: 'A', brand: 'Nike' }),
    ];

    // Act
    const model = build(articles);

    // Assert
    expect(model.groups[0].articles.map((entry) => entry.name)).toEqual(['A', 'Z']);
  });

  it('build_groups_carryNoCountAndNoSummary', () => {
    // Arrange & Act
    const model = build([article(), article({ name: 'Zweite' })]);

    // Assert
    expect(Object.keys(model.groups[0]).sort()).toEqual(['articles', 'category']);
    expect(Object.keys(model).sort()).toEqual(['freitexts', 'groups', 'printedAt']);
  });

  it('build_noArticles_returnsNoGroups', () => {
    // Arrange & Act
    const model = build([]);

    // Assert
    expect(model.groups).toEqual([]);
    expect(flattenAushangGroups(model.groups)).toEqual([]);
  });

  it('build_always_doesNotMutateInputAndKeepsFreitextsAndDate', () => {
    // Arrange
    const articles = [article({ name: 'B', size: '104' }), article({ name: 'A', size: '86' })];
    const copy = structuredClone(articles);
    const freitexts: AushangFreitexts = { text1: 'a', text2: 'b', text3: 'c', text4: 'd' };

    // Act
    const model = buildArticleAushangModel({ articles, freitexts, printedAt });

    // Assert
    expect(articles).toEqual(copy);
    expect(model.freitexts).toBe(freitexts);
    expect(model.printedAt).toBe(printedAt);
  });
});

describe('flattenAushangGroups', () => {
  it('flatten_groups_emitsHeadingRowBeforeEachGroupsArticles', () => {
    // Arrange
    const model = build([
      article({ category: 'Hosen', name: 'H1' }),
      article({ category: 'Jacken', name: 'J1' }),
      article({ category: 'Jacken', name: 'J2' }),
    ]);

    // Act
    const rows = flattenAushangGroups(model.groups);

    // Assert
    expect(
      rows.map((row) => (row.kind === 'group' ? `# ${row.label}` : row.article.name)),
    ).toEqual(['# Hosen', 'H1', '# Jacken', 'J1', 'J2']);
  });
});
