import { describe, it, expect } from 'vitest';
import { renderMarkdownSubset } from './render-markdown-subset';

describe('renderMarkdownSubset', () => {
  it('renders headings, bold, italic and paragraphs', () => {
    const html = renderMarkdownSubset('## Hinweise\n\nBitte **pünktlich** sein, *danke*.');

    expect(html).toContain('<h2>Hinweise</h2>');
    expect(html).toContain('<strong>pünktlich</strong>');
    expect(html).toContain('<em>danke</em>');
  });

  it('escapes raw HTML in the input before conversion', () => {
    const html = renderMarkdownSubset('<script>alert(1)</script>');

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('returns empty string for empty content', () => {
    expect(renderMarkdownSubset('')).toBe('');
  });
});
