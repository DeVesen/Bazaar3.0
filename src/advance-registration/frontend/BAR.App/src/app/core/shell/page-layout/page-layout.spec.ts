import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PageLayout } from './page-layout';

describe('PageLayout', () => {
  it('renders the title from the route data', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { data: { title: 'Meine Artikel' } } } }]
    });
    const fixture = TestBed.createComponent(PageLayout);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.page-title').textContent.trim()).toBe('Meine Artikel');
  });

  it('renders an empty title when the route data has none', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { data: {} } } }]
    });
    const fixture = TestBed.createComponent(PageLayout);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.page-title').textContent.trim()).toBe('');
  });
});
