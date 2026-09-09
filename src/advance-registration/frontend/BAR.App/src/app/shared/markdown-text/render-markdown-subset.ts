function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const ALLOWED_LINK_SCHEMES = new Set(['http', 'https', 'mailto']);

const HEADING_RE = /^(#{1,3})\s+(.*)$/;
const HR_RE = /^-{3,}$/;
const BULLET_RE = /^[-*]\s+(.*)$/;
const BULLET_START_RE = /^[-*]\s+/;
const NUMBERED_RE = /^\d+\.\s+(.*)$/;
const NUMBERED_START_RE = /^\d+\.\s+/;
const FENCE_RE = /^```/;
const CODE_SPAN_RE = /`([^`\n]+)`/g;
// Negatives Lookbehind (?<!!) verhindert, dass Bild-Syntax (![alt](url)) faelschlich als
// Link erkannt wird - Bilder sind laut component.md 3.2 explizit nicht unterstuetzt und
// muessen als sichtbarer Klartext stehen bleiben statt zu <a> verlinkt zu werden.
const LINK_RE = /(?<!!)\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const LINK_SCHEME_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

// Steuerzeichen (U+0001) als Platzhalter-Delimiter statt Leerzeichen: escapeHtml kann
// dieses Zeichen nicht erzeugen, Textarea-Eingabe enthaelt es praktisch nie - verhindert
// eine Kollision des Platzhalter-Patterns mit echtem Nutzertext.
const CODE_PLACEHOLDER_DELIM = '\u0001';
const CODE_PLACEHOLDER_RE = /\u0001(\d+)\u0001/g;

// Inline-Ebene (component.md 3.1): Inline-Code, Links (mit Schema-Filter), Fett, Kursiv.
// Reihenfolge ist sicherheitsrelevant:
// 1. Inline-Code-Spans werden zuerst durch Platzhalter ersetzt, damit ihr Inhalt NICHT
//    von Link-/Bold-/Italic-Regex weiterverarbeitet wird (Inhalt bleibt woertlich stehen).
// 2. Links: nur http/https/mailto werden zu <a>, alles andere bleibt unveraendert als
//    Klartext stehen (3.2/AC-4). Die URL wird zusaetzlich fuer das href-Attribut
//    Anfuehrungszeichen-escaped, damit sie nicht aus dem Attribut ausbrechen kann.
// 3. Bold vor Italic (** vor *), wie im urspruenglichen Renderer.
// 4. Code-Platzhalter werden am Ende durch das fertige <code>...</code> ersetzt.
//
// Der Text, auf dem all das laeuft, ist zu diesem Zeitpunkt bereits vollstaendig
// HTML-escaped (siehe renderMarkdownSubset) - kein Schritt hier liest oder erzeugt
// rohes '<'/'>' aus der Nutzereingabe.
function renderInline(text: string): string {
  const codeSpans: string[] = [];
  let working = text.replace(CODE_SPAN_RE, (_match, code: string) => {
    codeSpans.push(`<code>${code}</code>`);
    return `${CODE_PLACEHOLDER_DELIM}${codeSpans.length - 1}${CODE_PLACEHOLDER_DELIM}`;
  });

  working = working.replace(LINK_RE, (match: string, linkText: string, url: string) => {
    const schemeMatch = LINK_SCHEME_RE.exec(url);
    const scheme = schemeMatch ? schemeMatch[1].toLowerCase() : null;
    if (scheme && ALLOWED_LINK_SCHEMES.has(scheme)) {
      const safeHref = url.replace(/"/g, '&quot;');
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    }
    // Unbekanntes/fehlendes Schema (insbesondere javascript:) -> unveraendert als
    // Klartext stehen lassen (3.2, AC-4). Text ist bereits escaped.
    return match;
  });

  working = working
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  working = working.replace(CODE_PLACEHOLDER_RE, (_match, idx: string) => codeSpans[Number(idx)]);

  return working;
}

// Unterstuetztes Subset (markdown-text component.md 3.1, abschliessende Liste):
// Absaetze, Zeilenumbrueche, # bis ### Ueberschriften, **fett**, *kursiv*,
// Aufzaehlungs-/Nummerierte Listen, Trennlinie (---), Inline-Code, Code-Bloecke,
// Links mit Schema-Filter (http/https/mailto). Alles andere bleibt als escapter
// Klartext stehen (3.2) - kein Verschlucken, kein Entfernen.
//
// XSS-Sicherheit: escapeHtml laeuft als ALLERERSTER Schritt ueber den GESAMTEN
// Rohtext, bevor irgendeine Block- oder Inline-Verarbeitung beginnt. Ab hier
// enthaelt der Zwischenstand kein rohes '<'/'>' mehr. Jede nachfolgende Stufe
// (Block-Parsing hier, Inline-Parsing in renderInline) arbeitet ausschliesslich
// auf diesem bereits escapten Text und fuegt nur feste literale Tags
// (<h1>-<h3>, <p>, <ul>/<ol>/<li>, <hr>, <pre>/<code>, <a>, <strong>, <em>, <br>)
// um erfasste Gruppen ein. Code-Block- und Inline-Code-Inhalte werden NICHT erneut
// durch renderInline geschickt, sodass darin enthaltene Markdown-aehnliche Zeichen
// woertlich sichtbar bleiben statt interpretiert zu werden.
export function renderMarkdownSubset(content: string): string {
  if (!content.trim()) {
    return '';
  }

  const escaped = escapeHtml(content);
  const lines = escaped.split('\n');

  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    if (FENCE_RE.test(line.trim())) {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !FENCE_RE.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        i++; // schliessenden Fence-Marker ueberspringen
      }
      blocks.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
      continue;
    }

    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    if (HR_RE.test(line.trim())) {
      blocks.push('<hr>');
      i++;
      continue;
    }

    if (BULLET_START_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && BULLET_START_RE.test(lines[i])) {
        const itemMatch = BULLET_RE.exec(lines[i]);
        items.push(`<li>${renderInline(itemMatch![1])}</li>`);
        i++;
      }
      blocks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (NUMBERED_START_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && NUMBERED_START_RE.test(lines[i])) {
        const itemMatch = NUMBERED_RE.exec(lines[i]);
        items.push(`<li>${renderInline(itemMatch![1])}</li>`);
        i++;
      }
      blocks.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !FENCE_RE.test(lines[i].trim()) &&
      !HEADING_RE.test(lines[i]) &&
      !HR_RE.test(lines[i].trim()) &&
      !BULLET_START_RE.test(lines[i]) &&
      !NUMBERED_START_RE.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    blocks.push(`<p>${paragraphLines.map(renderInline).join('<br>')}</p>`);
  }

  return blocks.join('');
}
