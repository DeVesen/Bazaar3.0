import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Page } from './page';

@Component({
  selector: 'app-page-host',
  imports: [Page],
  template: `
    <app-page title="Marken" [fill]="fill()">
      <span pageActions class="test-action">Aktion</span>
      <p class="test-content">Inhalt</p>
    </app-page>
  `,
})
class PageHost {
  readonly fill = signal(false);
}

describe('Page', () => {
  async function create() {
    await TestBed.configureTestingModule({ imports: [PageHost] }).compileComponents();
    const fixture = TestBed.createComponent(PageHost);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('renders the title as h1 inside the page header', async () => {
    const el: HTMLElement = (await create()).nativeElement;
    const title = el.querySelector('.page__header h1.page__title');
    expect(title?.textContent?.trim()).toBe('Marken');
  });

  it('projects [pageActions] into the header actions and everything else into the content', async () => {
    const el: HTMLElement = (await create()).nativeElement;
    expect(el.querySelector('.page__actions .test-action')).not.toBeNull();
    expect(el.querySelector('.page__content .test-content')).not.toBeNull();
    expect(el.querySelector('.page__content .test-action')).toBeNull();
  });

  it('toggles the page--fill host class with the fill input', async () => {
    const fixture = await create();
    const host = fixture.nativeElement.querySelector('app-page') as HTMLElement;
    expect(host.classList).not.toContain('page--fill');

    fixture.componentInstance.fill.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.classList).toContain('page--fill');
  });
});
