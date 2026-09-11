import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ArtikelReadonlyModal } from './artikel-readonly-modal';
import type { AdminArticleResponse } from '../admin-articles-api.service';

const ARTICLE: AdminArticleResponse = {
  id: 'a1', number: 101, name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 12.5,
  size: 'M', color: 'Blau', description: 'Kaum getragen',
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  seller: { id: 's1', startNumber: 42, firstName: 'Max', lastName: 'Mustermann' }
};

function create(article: AdminArticleResponse | null = ARTICLE) {
  const fixture = TestBed.createComponent(ArtikelReadonlyModal);
  fixture.componentRef.setInput('article', article);
  fixture.componentRef.setInput('visible', true);
  fixture.detectChanges();
  return fixture;
}

describe('ArtikelReadonlyModal', () => {
  it('shows the seller name and number', () => {
    const fixture = create();
    const inputs = fixture.debugElement.queryAll(By.css('input[readonly]'));
    expect(inputs.length).toBeGreaterThan(0);
    const sellerInput = inputs[0].nativeElement;
    expect(sellerInput.value).toBe('Max Mustermann (#42)');
  });

  it('shows all article fields readonly', () => {
    const fixture = create();
    const inputs = fixture.debugElement.queryAll(By.css('input[readonly]'));
    expect(inputs.length).toBeGreaterThan(0);
    const descriptionInput = inputs.find(input => input.nativeElement.value === 'Kaum getragen');
    expect(descriptionInput).toBeDefined();
  });

  it('clicking Schließen sets visible to false', () => {
    const fixture = create();
    const component = fixture.componentInstance;

    fixture.debugElement.query(By.css('[data-testid="close-button"]')).nativeElement.click();

    expect(component.visible()).toBe(false);
  });

  it('renders nothing for the article fields when article is null', () => {
    const fixture = create(null);
    expect(fixture.nativeElement.textContent).not.toContain('Max Mustermann');
  });
});
