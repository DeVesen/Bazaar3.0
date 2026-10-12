// Baut aus llms.txt + llms-full.txt die Referenzdateien des Skills `primeng`.
// Aufruf: node build-references.js <ausgabe-ordner>
// button.md ist identisch mit dem Button-Abschnitt in llms-full.txt und wird nicht gelesen.
const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const OUT = path.resolve(process.argv[2] || path.join(SRC, 'out'));
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8').replace(/\r/g, '');

const SPLIT_LIMIT = 10000; // Beispiele größer als das: eine Datei je Abschnitt
const DROP_GUIDES = new Set(['LLMs.txt - PrimeNG', 'MCP Server - PrimeNG', 'Plugin - PrimeNG']);
const DROP_GUIDE_SECTIONS = new Set(['Introduction', 'Wcag', 'Videos', 'Nextsteps', 'License', 'Examples']);
const FORMS = /^(reactiveforms|signal-forms|templatedrivenforms)-doc$/;

// ---------- llms.txt: Titel -> [{slug, desc}] ----------
const index = {};
let area = '';
for (const l of read('llms.txt').split('\n')) {
  if (l.startsWith('## ')) { area = l.slice(3).trim(); continue; }
  const m = l.match(/^- \[(.+?)\]\(https:\/\/primeng\.dev\/(.+?)\):\s*(.*)$/);
  if (!m) continue;
  (index[m[1]] ||= []).push({ slug: m[2].replace(/\//g, '-').replace(/^guides-/, ''), desc: m[3], area });
}
const take = title => (index[title] || []).shift();

// ---------- llms-full.txt in Abschnitte ----------
const lines = read('llms-full.txt').split('\n');
let fence = false, mode = '', cur = null;
const docs = [];
for (const l of lines) {
  if (l.startsWith('```')) fence = !fence;
  if (!fence && l.startsWith('# ')) {
    const t = l.slice(2).trim();
    if (t === 'Guide Pages') { mode = 'guide'; continue; }
    if (t === 'Components') { mode = 'component'; continue; }
    if (t === 'PrimeNG Documentation') continue;
    cur = { title: t, mode, body: [] };
    docs.push(cur);
    continue;
  }
  if (cur) cur.body.push(l);
}

function sections(body) {
  const out = [{ title: null, lines: [] }];
  let f = false;
  for (const l of body) {
    if (l.startsWith('```')) f = !f;
    if (!f && l.startsWith('## ')) out.push({ title: l.slice(3).trim(), lines: [] });
    else out[out.length - 1].lines.push(l);
  }
  return out;
}

// ---------- Verdichten ----------
function condense(text) {
  const src = text.split('\n');
  const out = [];
  let inCode = false, run = 0, key = '', buf = [];
  const flush = () => {
    if (run > 4) out.push(...buf.slice(0, 2), `${buf[0].match(/^\s*/)[0]}<!-- +${run - 2} gleichartige Zeilen -->`);
    else out.push(...buf);
    run = 0; key = ''; buf = [];
  };
  for (let l of src) {
    if (l.startsWith('```')) { flush(); inCode = !inCode; out.push(l); continue; }
    if (!inCode) { out.push(l); continue; }
    if (l.length > 220) l = l.slice(0, 80) + ' …(lange Zeile gekürzt)';
    const k = l.trim().slice(0, 24);
    if (k && k === key) { run++; buf.push(l); }
    else { flush(); key = k; run = 1; buf = [l]; }
  }
  flush();
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const slugify = s => s.replace(/-doc$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const nice = s => s.replace(/-doc$/, '').replace(/^./, c => c.toUpperCase());
const write = (rel, text) => {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text.trim() + '\n');
};
const block = secs => secs.map(s => `## ${nice(s.title)}\n\n${s.lines.join('\n').trim()}`).join('\n\n');

fs.rmSync(OUT, { recursive: true, force: true });
const rows = { guide: [], component: [] };

for (const d of docs) {
  const meta = take(d.title);
  if (d.mode === 'guide' && DROP_GUIDES.has(d.title)) continue;
  if (!meta) { console.error('ohne llms.txt-Eintrag:', d.title); continue; }
  const secs = sections(d.body);
  const intro = secs[0].lines.join('\n').trim();
  const rest = secs.slice(1);

  if (d.mode === 'guide') {
    const keep = rest.filter(s => !DROP_GUIDE_SECTIONS.has(s.title));
    write(`references/guides/${meta.slug}.md`, condense(`# ${d.title}\n\n${intro}\n\n${block(keep)}`));
    rows.guide.push({ slug: meta.slug, title: d.title, desc: meta.desc, files: [`guides/${meta.slug}.md`] });
    continue;
  }

  // Komponente
  const hasApi = s => s.lines.some(l => /^### (Props|Emits|Templates|Methods|Events)/.test(l));
  const apiStart = rest.findIndex(hasApi);
  const before = apiStart < 0 ? rest : rest.slice(0, apiStart);
  const after = apiStart < 0 ? [] : rest.slice(apiStart);
  const theming = after.filter(s => s.title === 'Pass Through Options' || s.title === 'Theming');
  const api = after.filter(s => !theming.includes(s));
  const a11y = before.filter(s => s.title === 'Accessibility');
  const forms = before.filter(s => FORMS.test(s.title));
  const demos = before.filter(s => s.title !== 'Accessibility' && !FORMS.test(s.title) && s.title !== 'preview-doc');

  const dir = `references/components/${meta.slug}`;
  const files = [];
  const add = (name, text) => { write(`${dir}/${name}`, condense(text)); files.push(`components/${meta.slug}/${name}`); };

  add('api.md', `# ${d.title} — API\n\n${intro}\n\n${block(api)}\n\n${block(a11y)}`);
  if (demos.length) {
    const all = block(demos);
    if (all.length <= SPLIT_LIMIT) add('examples.md', `# ${d.title} — Beispiele\n\n${all}`);
    else {
      const used = new Set();
      const listing = demos.map(s => {
        let n = `examples-${slugify(s.title)}`, i = 2;
        while (used.has(n)) n = `examples-${slugify(s.title)}-${i++}`;
        used.add(n);
        add(`${n}.md`, `# ${d.title} — ${nice(s.title)}\n\n${block([s])}`);
        const first = s.lines.join(' ').trim().split(/(?<=\.)\s/)[0].slice(0, 110);
        return `- \`${n}.md\` — ${nice(s.title)}: ${first}`;
      });
      add('examples.md', `# ${d.title} — Beispiele (Index)\n\nNur die benötigte Datei lesen.\n\n${listing.join('\n')}`);
    }
  }
  if (forms.length) add('forms.md', `# ${d.title} — Formulare (Signal / Reactive / Template-driven)\n\n${block(forms)}`);
  if (theming.length) add('theming.md', `# ${d.title} — Pass Through, CSS-Klassen, Design Tokens\n\n${block(theming)}`);
  rows.component.push({ slug: meta.slug, title: d.title.replace(/^Angular /, '').replace(/ (Component|Directive)$/, ''), desc: meta.desc, files });
}

const ALIASES = [
  ['Calendar', 'datepicker'], ['Dropdown', 'select'], ['InputSwitch', 'toggleswitch'], ['OverlayPanel', 'popover'],
  ['Chips', 'inputtags'], ['TabView / TabMenu', 'tabs'], ['Steps', 'stepper'], ['Messages / InlineMessage', 'message'],
  ['AccordionTab', 'accordion'], ['Password', 'inputpassword'], ['Galleria / Image', 'gallery'], ['ColorPicker', 'inputcolor'],
  ['ImageCompare', 'compare'], ['ScrollPanel', 'scrollarea'], ['pBadge', 'overlaybadge'], ['p-buttonset', 'button (Button Group)'],
];
const table = r => r.map(x => `| ${x.slug} | ${x.title} | ${x.desc.replace(/\|/g, '/')} |`).join('\n');
write('references/index.md', `# PrimeNG Referenzindex

Ordner: \`references/components/<slug>/\` (api.md, examples*.md, forms.md, theming.md) und \`references/guides/<slug>.md\`.

## Alte Namen (laut Migration v20/v22)

| alt | neu (slug) |
|---|---|
${ALIASES.map(a => `| ${a[0]} | ${a[1]} |`).join('\n')}

## Guides

| slug | Titel | Inhalt |
|---|---|---|
${table(rows.guide)}

## Komponenten

| slug | Name | Beschreibung |
|---|---|---|
${table(rows.component)}
`);
console.log('Komponenten', rows.component.length, 'Guides', rows.guide.length, '->', OUT);
