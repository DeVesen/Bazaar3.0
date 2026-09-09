import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MyArticlesPage } from './MyArticlesPage';
import { ArticlesApiService } from '../articles-api.service';
import { MasterDataApiService } from '../master-data-api.service';

function create() {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const articlesApi = TestBed.inject(ArticlesApiService);
  const masterDataApi = TestBed.inject(MasterDataApiService);
  vi.spyOn(articlesApi, 'getMine').mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 25 }));
  vi.spyOn(articlesApi, 'getNextNumber').mockReturnValue(of({ number: 104 }));
  vi.spyOn(masterDataApi, 'getAll').mockReturnValue(of([]));
  const fixture = TestBed.createComponent(MyArticlesPage);
  fixture.detectChanges();
  return { fixture, articlesApi, masterDataApi };
}

describe('MyArticlesPage', () => {
  it('loads articles, brands and categories on init', () => {
    const { fixture, articlesApi, masterDataApi } = create();

    expect(articlesApi.getMine).toHaveBeenCalled();
    expect(masterDataApi.getAll).toHaveBeenCalledWith('brands');
    expect(masterDataApi.getAll).toHaveBeenCalledWith('categories');
    expect(fixture.componentInstance.articles()).toEqual([]);
  });

  it('shows the empty-state text when there are no articles', () => {
    const { fixture } = create();

    expect(fixture.componentInstance.isEmpty()).toBe(true);
  });

  it('openCreateDialog() fetches next-number then opens the dialog in create mode', () => {
    const { fixture, articlesApi } = create();

    fixture.componentInstance.openCreateDialog();

    expect(articlesApi.getNextNumber).toHaveBeenCalled();
    expect(fixture.componentInstance.dialogMode()).toBe('create');
    expect(fixture.componentInstance.dialogNextNumber()).toBe(104);
    expect(fixture.componentInstance.dialogVisible()).toBe(true);
  });

  it('openEditDialog() opens the dialog in edit mode with the given article', () => {
    const { fixture } = create();
    const article = { id: 'a1', number: 101 } as never;

    fixture.componentInstance.openEditDialog(article);

    expect(fixture.componentInstance.dialogMode()).toBe('edit');
    expect(fixture.componentInstance.dialogArticle()).toBe(article);
    expect(fixture.componentInstance.dialogVisible()).toBe(true);
  });

  it('onSaved() reloads the article list', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockClear();

    fixture.componentInstance.onSaved();

    expect(articlesApi.getMine).toHaveBeenCalledTimes(1);
  });
});
