function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Unterstuetztes Subset (markdown-text component.md 3.1): # / ## Ueberschriften,
// **fett**, *kursiv*, Absaetze durch Leerzeile getrennt. Alles andere bleibt
// als escapter Klartext stehen (3.2).
//
// XSS-Sicherheit: escapeHtml laeuft zuerst und ueber den GESAMTEN Rohtext.
// Alle nachfolgenden Regex-Ersetzungen (Ueberschrift/Fett/Kursiv/Zeilenumbruch)
// arbeiten nur noch auf bereits escaptem Text und fuegen ausschliesslich feste
// literale Tags (<h1>, <strong>, <em>, <br>, <p>) um die erfassten Gruppen ein —
// die erfassten Gruppen selbst enthalten kein rohes '<' oder '>' mehr, da diese
// Zeichen vor dem Split/Match bereits in '&lt;'/'&gt;' umgewandelt wurden. Es
// kann also kein aus der Eingabe stammendes Zeichen nachtraeglich als Tag-
// Begrenzer interpretiert werden.
export function renderMarkdownSubset(content: string): string {
  if (!content.trim()) {
    return '';
  }

  const escaped = escapeHtml(content);
  const paragraphs = escaped.split(/\n\n+/);

  const html = paragraphs
    .map((paragraph) => {
      const headingMatch = /^(#{1,2})\s+(.*)$/.exec(paragraph.trim());
      if (headingMatch) {
        const level = headingMatch[1].length;
        return `<h${level}>${headingMatch[2]}</h${level}>`;
      }

      const inline = paragraph
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

      return `<p>${inline}</p>`;
    })
    .join('');

  return html;
}
