---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: Form (Querschnitts-Regeln)

Kein eigener Wrapper und **kein Layout-Dokument** — hier stehen ausschließlich die
Verhaltensregeln, die für **jedes** Formular der Voranmelde-App gelten (Seiten-Formulare,
Dialoge, Popups). Formulare verlinken hierauf statt die Regeln je Doc zu wiederholen.

## Visuelle Hülle (nicht hier beschrieben)

| Was | Wo |
|---|---|
| Dialog-Rahmen: Header / Body / Footer, Größen `sm`/Standard/`lg`, Footer-Muster | Shared [`modal`](../../../../components/modal/component.md) |
| Seiten-Formular: Card-Container, Panel-Blöcke, Form-Grid (2 Spalten), Label-Stil, Pflichtmarker `*` | Shared [`card`](../../../../components/card/component.md) |

## Regeln

### R-1 — Feldfehler stehen am Feld

Validierungsfehler erscheinen **unter dem betroffenen Feld**, nicht als Toast und nicht
gesammelt am Formularkopf. Text kurz und handlungsleitend.

Beispiel: E-Mail-Duplicate in [registrierung-form.md](registrierung-form.md) — Fehlertext unter
dem E-Mail-Feld, zusätzlich Link zum Login.

### R-2 — Submit-Button gesperrt bis absendbar

Der Primary-Button im Footer trägt `[disabled]`, solange Pflichtfelder fehlen oder eine
fachliche Bedingung nicht erfüllt ist. Kein Absenden-und-dann-meckern.

Beispiel: [registrierung-form.md](registrierung-form.md) — gesperrt solange Passwort-Stärke
< „Mittel" oder Passwörter nicht übereinstimmen.

### R-3 — Enter löst Submit aus

`Enter` im letzten bzw. in einem einzeiligen Feld löst die Primary-Aktion aus, sofern der
Button nach R-2 aktiv ist. Nicht in mehrzeiligen Feldern (`pTextarea`).

Beispiel: [login-form.md](login-form.md) — Enter im Passwort-Feld meldet an.

### R-4 — Erfolgs-Feedback: Toast, außer es enthält Zahlen

| Fall | Komponente |
|---|---|
| Kurze CRUD-Bestätigung („✓ … gespeichert") | [Toast](../standard/toast.md) — Auto-Dismiss |
| Meldung mit Zahlen/Details, die stehen bleiben soll | Shared [`info-area`](../../../../components/info-area/component.md) — kein Auto-Dismiss |
| Server-/Fehler-Antwort auf ein Submit | Shared [`info-area`](../../../../components/info-area/component.md) Typ `error` im Formular (nicht als Toast — Nutzer muss reagieren) |

Beispiel Info-Area: [export-panel.md](export-panel.md) („12 Verkäufer, 87 Artikel exportiert").

### R-5 — Irreversibles erst nach Bestätigung

Löschen und vergleichbar irreversible Aktionen laufen über
[Confirmdialog](../standard/confirmdialog.md); der API-Call erfolgt erst nach Bestätigung. Der
auslösende Button ist `danger` und sitzt im Footer links (Muster „Mit Löschen" im
Shared-`modal`-Doc).

### R-6 — Readonly statt Ausblenden

Nicht editierbare Werte werden als readonly/disabled **angezeigt**, nicht weggelassen —
[input.md](../standard/input.md) Modifier Readonly, [select.md](../standard/select.md) `[disabled]="true"`.

Beispiel: [profil-page.md](profil-page.md) — E-Mail, Verkäufer-Typ, Gebühr/Provision.

### R-7 — Autofokus auf das erste Eingabefeld

Beim Öffnen eines Dialogs/Popups erhält das erste editierbare Feld den Fokus
([input.md](../standard/input.md) Modifier Autofokus). Bei readonly-Dialogen kein Autofokus.

Beispiel: [verkaeufer-dialog.md](verkaeufer-dialog.md) — Vorname.

## Verwendung

| Formular | Typ |
|---|---|
| [login-form.md](login-form.md), [registrierung-form.md](registrierung-form.md) | Seiten-Formular in Card |
| [einstellungen-form.md](einstellungen-form.md), [profil-page.md](profil-page.md) | Seiten-Formular mit Panel-Blöcken |
| [export-panel.md](export-panel.md) | Panel mit Aktion |
| [stammdaten-popup.md](stammdaten-popup.md), [typ-popup.md](typ-popup.md) | Modal `sm` |
| [artikel-dialog.md](artikel-dialog.md), [verkaeufer-dialog.md](verkaeufer-dialog.md) | Modal Standard / `lg` |
| [artikel-readonly-modal.md](artikel-readonly-modal.md) | Modal, nur Anzeige — R-1/2/3/7 entfallen |

## Tags & Piles

**Tags:** #form #validierung #feedback #querschnitt #shared-across-epics
