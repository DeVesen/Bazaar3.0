import { renderPrintMarkdown } from './print-document.markdown';

describe('renderPrintMarkdown', () => {
  it('renderPrintMarkdown_headingBoldItalicListAndTable_rendersAllFiveAsHtml', () => {
    // Arrange
    const source = [
      '# Titel',
      '',
      '**fett** und *kursiv*',
      '',
      '- Punkt eins',
      '- Punkt zwei',
      '',
      '| A | B |',
      '|---|---|',
      '| 1 | 2 |',
    ].join('\n');

    // Act
    const html = renderPrintMarkdown(source);

    // Assert
    expect(html).toContain('<h1>Titel</h1>');
    expect(html).toContain('<strong>fett</strong>');
    expect(html).toContain('<em>kursiv</em>');
    expect(html).toContain('<li>Punkt eins</li>');
    expect(html).toContain('<table>');
    expect(html).toContain('<td>1</td>');
  });

  it('renderPrintMarkdown_twoParagraphs_rendersTwoParagraphElements', () => {
    // Arrange & Act
    const html = renderPrintMarkdown('Erster Absatz\n\nZweiter Absatz');

    // Assert
    expect(html).toContain('<p>Erster Absatz</p>');
    expect(html).toContain('<p>Zweiter Absatz</p>');
  });

  it('renderPrintMarkdown_link_rendersTextWithoutAnchor', () => {
    // Arrange & Act
    const html = renderPrintMarkdown('Siehe [unsere Seite](https://example.org) hier');

    // Assert
    expect(html).not.toContain('<a');
    expect(html).not.toContain('href');
    expect(html).toContain('unsere Seite');
  });

  it('renderPrintMarkdown_image_rendersNoImageElement', () => {
    // Arrange & Act
    const html = renderPrintMarkdown('![Logo](https://example.org/logo.png)');

    // Assert
    expect(html).not.toContain('<img');
    expect(html).not.toContain('logo.png');
  });

  it('renderPrintMarkdown_inlineHtmlAndScript_escapesTheTags', () => {
    // Arrange & Act
    const html = renderPrintMarkdown('Text <b>fett</b> <script>alert(1)</script>');

    // Assert
    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;b&gt;');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renderPrintMarkdown_blockHtml_escapesTheTags', () => {
    // Arrange & Act
    const html = renderPrintMarkdown('<div onclick="x()">Block</div>');

    // Assert
    expect(html).not.toContain('<div');
    expect(html).toContain('&lt;div');
  });

  it('renderPrintMarkdown_emptyOrWhitespace_returnsEmptyString', () => {
    // Arrange & Act & Assert
    expect(renderPrintMarkdown('')).toBe('');
    expect(renderPrintMarkdown('  \n ')).toBe('');
  });
});
