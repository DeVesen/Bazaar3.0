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
// Negative lookbehind (?<!!) prevents image syntax (![alt](url)) from being
// mistakenly recognized as a link - images are explicitly unsupported per
// component.md 3.2 and must remain visible plain text instead of being
// linked as <a>.
const LINK_RE = /(?<!!)\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const LINK_SCHEME_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

// Control character (U+0001) as the placeholder delimiter instead of a space:
// escapeHtml can't produce this character, and textarea input practically
// never contains it - this prevents the placeholder pattern from colliding
// with real user text.
const CODE_PLACEHOLDER_DELIM = '\u0001';
// eslint-disable-next-line no-control-regex
const CODE_PLACEHOLDER_RE = /\u0001(\d+)\u0001/g;

// Inline level (component.md 3.1): inline code, links (with scheme filter),
// bold, italic. Order matters for security:
// 1. Inline code spans are replaced by placeholders first, so their content
//    is NOT further processed by the link/bold/italic regexes (content stays
//    verbatim).
// 2. Links: only http/https/mailto become <a>, everything else stays
//    unchanged as plain text (3.2/AC-4). The URL is additionally
//    quote-escaped for the href attribute so it can't break out of it.
// 3. Bold before italic (** before *), as in the original renderer.
// 4. Code placeholders are replaced at the end with the finished
//    <code>...</code>.
//
// The text all of this runs on is already fully HTML-escaped at this point
// (see renderMarkdownSubset) - no step here reads or produces raw '<'/'>'
// from user input.
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
    // Unknown/missing scheme (in particular javascript:) -> leave unchanged
    // as plain text (3.2, AC-4). Text is already escaped.
    return match;
  });

  working = working
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  working = working.replace(CODE_PLACEHOLDER_RE, (_match, idx: string) => codeSpans[Number(idx)]);

  return working;
}

// Supported subset (markdown-text component.md 3.1, exhaustive list):
// paragraphs, line breaks, # through ### headings, **bold**, *italic*,
// bulleted/numbered lists, horizontal rule (---), inline code, code blocks,
// links with scheme filter (http/https/mailto). Everything else stays as
// escaped plain text (3.2) - nothing is swallowed, nothing is removed.
//
// XSS security: escapeHtml runs as the VERY FIRST step over the ENTIRE raw
// text, before any block or inline processing begins. From here on, the
// intermediate state no longer contains raw '<'/'>'. Every subsequent stage
// (block parsing here, inline parsing in renderInline) works exclusively on
// this already-escaped text and only wraps captured groups in fixed literal
// tags (<h1>-<h3>, <p>, <ul>/<ol>/<li>, <hr>, <pre>/<code>, <a>, <strong>,
// <em>, <br>). Code block and inline code content is NOT sent through
// renderInline again, so markdown-like characters inside them stay visible
// verbatim instead of being interpreted.
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
