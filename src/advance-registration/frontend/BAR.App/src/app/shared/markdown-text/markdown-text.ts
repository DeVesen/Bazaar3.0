import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { renderMarkdownSubset } from './render-markdown-subset';

// Leaf-Komponente (component.md Abschnitt 3): liest nur `content`, injiziert
// keinen Service ausser dem Sanitizer, entscheidet nichts ueber die umgebende
// Box. renderMarkdownSubset escaped die Eingabe vollstaendig vor jeder
// Markdown-Umsetzung — bypassSecurityTrustHtml ist hier sicher, weil das HTML
// bereits aus escaptem Text plus festen literalen Tags besteht.
@Component({
  selector: 'app-markdown-text',
  template: `<div [innerHTML]="html()"></div>`
})
export class MarkdownText {
  readonly content = input<string | null>(null);
  private readonly sanitizer = inject(DomSanitizer);

  readonly html = computed(() => {
    const rendered = renderMarkdownSubset(this.content() ?? '');
    return this.sanitizer.bypassSecurityTrustHtml(rendered);
  });
}
