import { Marked } from 'marked';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Freitexte erlauben Überschriften, Fett, Kursiv, Absätze, Listen und Tabellen — keine Links,
 * Bilder oder HTML. Rohes HTML wird als Text maskiert, ein Link wird zu seinem Text, ein Bild zu
 * seinem Alt-Text. Das Ergebnis geht zusätzlich durch Angulars Sanitizer (`[innerHTML]`).
 */
const markdown = new Marked({
  gfm: true,
  async: false,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ tokens }) {
      return this.parser.parseInline(tokens);
    },
    image({ text }) {
      return escapeHtml(text);
    },
  },
});

export function renderPrintMarkdown(source: string): string {
  if (!source.trim()) {
    return '';
  }
  return markdown.parse(source, { async: false });
}
