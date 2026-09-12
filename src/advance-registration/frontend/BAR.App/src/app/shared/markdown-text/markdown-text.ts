import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { renderMarkdownSubset } from './render-markdown-subset';

// Leaf component (component.md section 3): only reads `content`, injects no
// service other than the sanitizer, decides nothing about the surrounding
// box. renderMarkdownSubset fully escapes the input before any markdown
// conversion — bypassSecurityTrustHtml is safe here because the HTML already
// consists of escaped text plus fixed literal tags.
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
