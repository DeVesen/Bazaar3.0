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

  it('renders h1 through h3 headings', () => {
    const html = renderMarkdownSubset('# Titel\n\n## Untertitel\n\n### Abschnitt');

    expect(html).toContain('<h1>Titel</h1>');
    expect(html).toContain('<h2>Untertitel</h2>');
    expect(html).toContain('<h3>Abschnitt</h3>');
  });

  it('renders headings deeper than h3 as plain text (3.2)', () => {
    const html = renderMarkdownSubset('#### Zu tief');

    expect(html).not.toContain('<h4>');
    expect(html).toContain('#### Zu tief');
  });

  it('renders a bullet list', () => {
    const html = renderMarkdownSubset('- Erster Punkt\n- Zweiter Punkt\n* Dritter Punkt');

    expect(html).toContain('<ul><li>Erster Punkt</li><li>Zweiter Punkt</li><li>Dritter Punkt</li></ul>');
  });

  it('renders a numbered list', () => {
    const html = renderMarkdownSubset('1. Eins\n2. Zwei');

    expect(html).toContain('<ol><li>Eins</li><li>Zwei</li></ol>');
  });

  it('renders a horizontal rule', () => {
    const html = renderMarkdownSubset('Vorher\n\n---\n\nNachher');

    expect(html).toContain('<hr>');
  });

  it('renders inline code', () => {
    const html = renderMarkdownSubset('Nutze `npm install` zum Start.');

    expect(html).toContain('<code>npm install</code>');
  });

  it('renders a fenced code block', () => {
    const html = renderMarkdownSubset('```\nconst x = 1;\nconsole.log(x);\n```');

    expect(html).toContain('<pre><code>const x = 1;\nconsole.log(x);</code></pre>');
  });

  it('does not further markdown-process code block or inline code content', () => {
    const inlineHtml = renderMarkdownSubset('`**not bold**`');
    expect(inlineHtml).toContain('<code>**not bold**</code>');
    expect(inlineHtml).not.toContain('<strong>');

    const blockHtml = renderMarkdownSubset('```\n**not bold**\n[not a link](http://example.com)\n```');
    expect(blockHtml).toContain('<pre><code>**not bold**\n[not a link](http://example.com)</code></pre>');
    expect(blockHtml).not.toContain('<strong>');
    expect(blockHtml).not.toContain('<a ');
  });

  it('renders a valid http link with target and rel attributes', () => {
    const html = renderMarkdownSubset('[Verein](https://example.org/verein)');

    expect(html).toContain(
      '<a href="https://example.org/verein" target="_blank" rel="noopener noreferrer">Verein</a>'
    );
  });

  it('renders a mailto link', () => {
    const html = renderMarkdownSubset('[Kontakt](mailto:info@example.org)');

    expect(html).toContain(
      '<a href="mailto:info@example.org" target="_blank" rel="noopener noreferrer">Kontakt</a>'
    );
  });

  it('renders a javascript: link as inert plain text (AC-4)', () => {
    const html = renderMarkdownSubset('[Klick mich](javascript:alert(1))');

    expect(html).not.toContain('<a ');
    expect(html).toContain('[Klick mich](javascript:alert(1))');
  });

  it('renders unsupported syntax (table, blockquote) as visible plain text', () => {
    const html = renderMarkdownSubset('| a | b |\n> Zitat');

    expect(html).toContain('| a | b |');
    expect(html).toContain('&gt; Zitat');
    expect(html).not.toContain('<table>');
    expect(html).not.toContain('<blockquote>');
  });
});
