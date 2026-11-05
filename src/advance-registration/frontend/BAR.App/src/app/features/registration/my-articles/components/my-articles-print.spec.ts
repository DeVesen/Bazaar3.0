import { TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { describe, expect, it } from 'vitest';
import { MyArticlesPrint, MyArticlesPrintModel } from './my-articles-print';
import type { ArticleResponse } from '../articles-api.service';

const article = (number: number, price: number): ArticleResponse => ({
  id: `a${number}`, number, sellerId: 's', name: `Artikel ${number}`, brand: 'Nike', category: 'Jacken',
  price, size: null, color: null, description: null, createdAt: '', updatedAt: ''
});

function render(model: Partial<MyArticlesPrintModel> = {}) {
  TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', {
    myArticles: {
      title: 'Meine Artikel', columnNumber: 'Nr.', columnName: 'Bezeichnung', columnCategory: 'Kategorie',
      columnBrand: 'Marke', columnPrice: 'Preis', print: { filter: 'Filter', count: '{{count}} Artikel' }
    }
  });
  translate.use('de');
  const fixture = TestBed.createComponent(MyArticlesPrint);
  fixture.componentRef.setInput('model', {
    articles: [article(102, 12.5), article(101, 3)],
    owner: 'max@example.com',
    filterText: '',
    printedAt: new Date(2026, 10, 3, 14, 5),
    ...model
  });
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('MyArticlesPrint', () => {
  it('renders the same columns as the list, in the given order', () => {
    const el = render();

    expect([...el.querySelectorAll('th')].map((th) => th.textContent?.trim())).toEqual(['Nr.', 'Bezeichnung', 'Kategorie', 'Marke', 'Preis']);
    const rows = [...el.querySelectorAll('[data-testid=print-row]')];
    expect(rows.map((r) => r.querySelector('td')?.textContent?.trim())).toEqual(['102', '101']);
    expect(rows[0].textContent).toContain('Artikel 102');
    expect(rows[0].textContent).toContain('Jacken');
    expect(rows[0].textContent).toContain('Nike');
    expect(rows[0].textContent?.replace(/\s/g, ' ')).toContain('12,50 €');
  });

  it('shows owner, print date, article count and total', () => {
    const el = render();

    expect(el.querySelector('[data-testid=print-owner]')?.textContent).toBe('max@example.com');
    expect(el.textContent).toContain('03.11.2026, 14:05');
    expect(el.querySelector('[data-testid=print-count]')?.textContent?.trim()).toBe('2 Artikel');
    expect(el.querySelector('[data-testid=print-total]')?.textContent?.replace(/\s/g, ' ')).toBe('15,50 €');
  });

  it('shows the active filters only when there are any', () => {
    expect(render().querySelector('[data-testid=print-filter]')).toBeNull();
    TestBed.resetTestingModule();

    const el = render({ filterText: 'Marke: Nike' });
    expect(el.querySelector('[data-testid=print-filter]')?.textContent?.trim()).toBe('Filter: Marke: Nike');
  });
});
