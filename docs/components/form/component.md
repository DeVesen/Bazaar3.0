---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: Form (Querschnitts-Regeln)

Kein eigener Wrapper und **kein Layout-Dokument** — hier stehen ausschließlich die
Verhaltensregeln, die für **jedes** Formular **beider Apps** gelten (Seiten-Formulare,
Dialoge, Popups). Formulare verlinken hierauf statt die Regeln je Doc zu wiederholen.

**Verwendung:** beide Apps. Die Datei lag ursprünglich app-lokal in der Voranmelde-App, wurde
aber von den suite-weiten Dateien [`stammdaten-popup`](../stammdaten-popup/component.md) und
[`typ-popup`](../typ-popup/component.md) referenziert — eine suite-weite Beschreibung, die von
einer app-lokalen abhängt, ist eine umgekehrte Schichtung. Die sieben Regeln selbst sind nicht
app-spezifisch.

## Geltung in der Haupt-App

Alle sieben Regeln gelten dort ebenfalls. Zwei brauchen eine Ergänzung, weil die Haupt-App
Vorgänge kennt, die die Voranmelde-App nicht hat:

| Regel | Haupt-App |
|---|---|
| R-1 bis R-3, R-6, R-7 | unverändert |
| **R-4** | zusätzlich: Beträge, die der Verkäufer **behält**, gehören auf einen Ausdruck, nicht in einen Toast — Annahmegebühr und Auszahlung stehen auf dem [Abgabe-Beleg](../../requirements/bazaar-app/components/print-abgabe-beleg.md) bzw. der [Verkäufer-Übersicht](../../requirements/bazaar-app/components/print-verkaeufer-uebersicht.md). Ein Toast verschwindet; eine Quittung nicht |
| **R-5** | verschärft: Bestätigungsdialoge nennen **die konkreten Werte**, nicht nur die Aktion — „Auszahlung von 332,94 € vom 17.08. wird verworfen", „Gebühr 0,50 € → 1,00 €", „Verkauft am 17.08. 14:22 wird ebenfalls entfernt". Alles, was Geld bewegt oder Geldhistorie löscht, muss vorher beziffert sein |

R-5 in dieser Schärfe ist der Ertrag des Haupt-App-Reviews: Ein Bestätigungsdialog, der nur
„Wirklich löschen?" fragt, verhindert Fehlklicks — aber keine falschen Entscheidungen.

## Visuelle Hülle (nicht hier beschrieben)

| Was | Wo |
|---|---|
| Dialog-Rahmen: Header / Body / Footer, Größen `sm`/Standard/`lg`, Footer-Muster | Shared [`modal`](../modal/component.md) |
| Seiten-Formular: Card-Container, Panel-Blöcke, Form-Grid (2 Spalten), Label-Stil, Pflichtmarker `*` | Shared [`card`](../card/component.md) |

## Regeln

### R-1 — Feldfehler stehen am Feld

Validierungsfehler erscheinen **unter dem betroffenen Feld**, nicht als Toast und nicht
gesammelt am Formularkopf. Text kurz und handlungsleitend.

Beispiel: E-Mail-Duplicate in [registrierung-form.md](../../requirements/advance-registration/components/registrierung-form.md) — Fehlertext unter
dem E-Mail-Feld, zusätzlich Link zum Login.

### R-2 — Submit-Button gesperrt bis absendbar

Der Primary-Button im Footer trägt `[disabled]`, solange Pflichtfelder fehlen oder eine
fachliche Bedingung nicht erfüllt ist. Kein Absenden-und-dann-meckern.

Beispiel: [registrierung-form.md](../../requirements/advance-registration/components/registrierung-form.md) — gesperrt solange Passwort-Stärke
< „Mittel" oder Passwörter nicht übereinstimmen.

### R-3 — Enter löst Submit aus

`Enter` im letzten bzw. in einem einzeiligen Feld löst die Primary-Aktion aus, sofern der
Button nach R-2 aktiv ist. Nicht in mehrzeiligen Feldern (`pTextarea`).

Beispiel: [login-form.md](../../requirements/advance-registration/components/login-form.md) — Enter im Passwort-Feld meldet an.

### R-4 — Erfolgs-Feedback: Toast, außer es enthält Zahlen

| Fall | Komponente |
|---|---|
| Kurze CRUD-Bestätigung („✓ … gespeichert") | [Toast](../toast/component.md) — Auto-Dismiss |
| Meldung mit Zahlen/Details, die stehen bleiben soll | Shared [`info-area`](../info-area/component.md) — kein Auto-Dismiss |
| Server-/Fehler-Antwort auf ein Submit | Shared [`info-area`](../info-area/component.md) Typ `error` im Formular (nicht als Toast — Nutzer muss reagieren) |

Beispiel Info-Area: [export-panel.md](../../requirements/advance-registration/components/export-panel.md) („12 Verkäufer, 87 Artikel exportiert").

### R-5 — Irreversibles erst nach Bestätigung

Löschen und vergleichbar irreversible Aktionen laufen über
[Confirmdialog](../confirmdialog/component.md); der API-Call erfolgt erst nach Bestätigung. Der
auslösende Button ist `danger` und sitzt im Footer links (Muster „Mit Löschen" im
Shared-`modal`-Doc).

### R-6 — Readonly statt Ausblenden

Nicht editierbare Werte werden als readonly/disabled **angezeigt**, nicht weggelassen —
[input.md](../input/component.md) Modifier Readonly, [select.md](../select/component.md) `[disabled]="true"`.

Beispiel: [profil-page.md](../../requirements/advance-registration/components/profil-page.md) — E-Mail, Verkäufer-Typ, Gebühr/Provision.

### R-7 — Autofokus auf das erste Eingabefeld

Beim Öffnen eines Dialogs/Popups erhält das erste editierbare Feld den Fokus
([input.md](../input/component.md) Modifier Autofokus). Bei readonly-Dialogen kein Autofokus.

Beispiel: [verkaeufer-dialog.md](../../requirements/advance-registration/components/verkaeufer-dialog.md) — Vorname.

## Verwendung

### Voranmelde-App

| Formular | Typ |
|---|---|
| [login-form.md](../../requirements/advance-registration/components/login-form.md), [registrierung-form.md](../../requirements/advance-registration/components/registrierung-form.md) | Seiten-Formular in Card |
| [einstellungen-form.md](../../requirements/advance-registration/components/einstellungen-form.md), [profil-page.md](../../requirements/advance-registration/components/profil-page.md) | Seiten-Formular mit Panel-Blöcken |
| [export-panel.md](../../requirements/advance-registration/components/export-panel.md) | Panel mit Aktion |
| [stammdaten-popup.md](../stammdaten-popup/component.md), [typ-popup.md](../typ-popup/component.md) | Modal `sm` |
| [artikel-dialog.md](../../requirements/advance-registration/components/artikel-dialog.md), [verkaeufer-dialog.md](../../requirements/advance-registration/components/verkaeufer-dialog.md) | Modal Standard / `lg` |
| [artikel-readonly-modal.md](../../requirements/advance-registration/components/artikel-readonly-modal.md) | Modal, nur Anzeige — R-1/2/3/7 entfallen |

### Haupt-App

| Formular | Typ |
|---|---|
| [login-form](../../requirements/bazaar-app/components/login-form.md), [change-password-page](../../requirements/bazaar-app/components/change-password-page.md) | Seiten-Formular in Card |
| [settings-form](../../requirements/bazaar-app/components/settings-form.md) | Seiten-Formular |
| [import-panel](../../requirements/bazaar-app/components/import-panel.md) | Panel mit Aktion |
| [verkaeufer-dialog](../../requirements/bazaar-app/components/verkaeufer-dialog.md), [artikel-dialog](../../requirements/bazaar-app/components/artikel-dialog.md) | Modal Standard |
| [settlement-panel](../../requirements/bazaar-app/components/settlement-panel.md), [article-status-popup](../../requirements/bazaar-app/components/article-status-popup.md) | Modal `sm` — R-5 in verschärfter Form |
| [user-management](../../requirements/bazaar-app/components/user-management.md) | Tabelle + Modal `sm` |
| [seller-detail-modal](../../requirements/bazaar-app/components/seller-detail-modal.md) | Modal, nur Anzeige — R-1/2/3/7 entfallen |

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #form #validierung #feedback #querschnitt #shared-across-epics
