import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ArticlesPage } from './ArticlesPage';
import { AdminArticlesApiService, AdminArticleResponse } from '../admin-articles-api.service';
import { MasterDataApiService } from '@features/registration/master-data-api.service';

const ARTICLE: AdminArticleResponse = {
  id: 'a1', number: 101, name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 12.5,
  size: null, color: null, description: null,
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  seller: { id: 's1', startNumber: 42, firstName: 'Max', lastName: 'Mustermann' }
};

function create() {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), MessageService] });
  const articlesApi = TestBed.inject(AdminArticlesApiService);
  const masterDataApi = TestBed.inject(MasterDataApiService);
  vi.spyOn(articlesApi, 'list').mockReturnValue(of({ items: [ARTICLE], totalCount: 1, page: 1, pageSize: 25 }));
  vi.spyOn(masterDataApi, 'getAll').mockReturnValue(of([]));
  const fixture = TestBed.createComponent(ArticlesPage);
  fixture.detectChanges();
  return { fixture, articlesApi, masterDataApi };
}

describe('ArticlesPage', () => {
  it('loads articles, brands and categories on init and builds the seller label', () => {
    const { fixture, articlesApi, masterDataApi } = create();

    expect(articlesApi.list).toHaveBeenCalled();
    expect(masterDataApi.getAll).toHaveBeenCalledWith('brands');
    expect(masterDataApi.getAll).toHaveBeenCalledWith('categories');
    expect(fixture.componentInstance.articles()).toEqual([{ ...ARTICLE, sellerLabel: 'Max Mustermann (#42)' }]);
  });

  it('onFilterSearch() reloads with the given filters including sellerId and resets to page 1', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.list).mockClear();

    fixture.componentInstance.onFilterSearch({ brand: 'Nike', category: undefined, search: 'jack', sellerId: 's1' });

    expect(articlesApi.list).toHaveBeenCalledWith({ page: 1, pageSize: 25, sort: undefined, brand: 'Nike', category: undefined, search: 'jack', sellerId: 's1' });
  });

  it('onTableSort() reloads with a sort string built from the sort metas', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.list).mockClear();

    fixture.componentInstance.onTableSort([{ field: 'seller', order: 'desc' }]);

    expect(articlesApi.list).toHaveBeenCalledWith(expect.objectContaining({ sort: 'seller:desc' }));
  });

  it('onTablePage() reloads with the page derived from first/rows', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.list).mockClear();

    fixture.componentInstance.onTablePage({ first: 25, rows: 25 });

    expect(articlesApi.list).toHaveBeenCalledWith(expect.objectContaining({ page: 2, pageSize: 25 }));
  });

  it('onTableAction("view") opens the readonly modal with the clicked row', () => {
    const { fixture } = create();
    const row = { ...ARTICLE, sellerLabel: 'Max Mustermann (#42)' };

    fixture.componentInstance.onTableAction({ actionId: 'view', row });

    expect(fixture.componentInstance.modalArticle()).toBe(row);
    expect(fixture.componentInstance.modalVisible()).toBe(true);
  });

  it('loadArticles() error path resets loading and shows an error toast', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.list).mockReturnValue(throwError(() => ({ status: 500 })));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.loadArticles();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });
});
