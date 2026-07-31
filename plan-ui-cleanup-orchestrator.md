# Orchestrator: UI-Altlasten aus Requirements → richtige Orte überführen

Du bist ein Orchestrator-Agent. Du beauftragst und überwachst Sub-Agents.

**Wichtigste Regel für alle Sub-Agents:**
Jeder Agent bekommt nur den minimalen Kontext, den er für seine Aufgabe braucht —
nicht den Gesamtplan, nicht fremde Dateien.

---

## Ziel

In den Requirements-Dokumenten der Bazaar Suite stecken UI-Specs, die dort nicht
hingehören. Sie werden an die richtigen Stellen überführt:

| Inhalt | Ziel |
|---|---|
| App- und Feature-übergreifende UI-Komponenten | `docs/components/<name>/component.md` (neu anlegen oder erweitern) |
| Feature-spezifische UI-Specs | Story-Datei unter `<feature-verzeichnis>/stories/` |
| Echte Anforderungen | bleiben in requirements.md |

Die betroffenen Sections in den requirements.md werden am Ende durch kompakte
Verweise ersetzt.

---

## Repository & Branch

- Pfad: `/home/user/Bazaar3.0`
- Branch: `claude/features-requirements-review-m22u53`

Betroffene Quelldateien:
- `docs/requirements/bazaar-app/requirements.md` → Sections 6 + 11
- `docs/requirements/advance-registration/requirements.md` → Sections 9 + 13

Feature-Verzeichnisse Haupt-App:
`docs/requirements/bazaar-app/features/<Feature>/`

Feature-Verzeichnisse Voranmelde-App:
`docs/requirements/advance-registration/features/<Feature>/`

Komponenten-Verzeichnis: `docs/components/`

Story-Konvention: `<feature-verzeichnis>/stories/<FEAT-CODE>-S<nn>-<slug>.md`
(Story-Struktur: id, status, depends-on, Ziel, Kontext, Scope, UI-Spec, Akzeptanzkriterien,
Abhängigkeiten)

---

## Phase 1 — Inventur (2 Agents, parallel)

> Starte beide sofort. Ihre Ausgaben steuern alle späteren Phasen.
> Kein Commit, nur strukturierter Output.

**Agent 1A**
Lies ausschließlich `docs/requirements/bazaar-app/requirements.md`, Sections 6 und 11.
Klassifiziere jeden Unterabschnitt:
- `→ docs/components/<name>/` (app-/feature-übergreifende UI-Komponente)
- `→ story in Feature_X` (feature-spezifische UI-Spec, nenne das Ziel-Feature)
- `→ bleibt in requirements.md` (echte Anforderung, kein UI-Spec)
Ausgabe: Tabelle mit Abschnitt, Klassifizierung, Begründung. Kein Commit.

**Agent 1B**
Lies ausschließlich `docs/requirements/advance-registration/requirements.md`,
Sections 9 und 13.
Aufgabe identisch wie Agent 1A. Kein Commit.

---

## Phase 2 — Neue Component-Docs anlegen (parallel, nach Phase 1)

Starte diese Agents sobald Phase 1 abgeschlossen ist.
Finales Set ergibt sich aus Phase-1-Ergebnis. Vorgesehene Agents:

**Agent 2A — input-group**
Lies: Section 6.1 aus `bazaar-app/requirements.md` und Section 9.1 aus
`advance-registration/requirements.md`.
Lege `docs/components/input-group/component.md` an.
Führe app-übergreifende Teile zusammen. Kennzeichne App-spezifische Unterschiede.
Commit + Push auf Branch.

**Agent 2B — info-area**
Lies: Section 6.2 (Haupt-App) + Section 9.2 (Voranmelde-App).
Lege `docs/components/info-area/component.md` an.
Commit + Push.

**Agent 2C — badge**
Lies: Section 11.6 (Haupt-App) + Section 13.6 (Voranmelde-App).
Lege `docs/components/badge/component.md` an.
Rang-Badges (Gold/Silber/Bronze) sind nur Haupt-App — kennzeichnen.
Commit + Push.

**Agent 2D — modal**
Lies: Section 11.5 (Haupt-App) + Section 13.5 (Voranmelde-App).
Lege `docs/components/modal/component.md` an.
Größenvarianten (sm / standard / lg) und Footer-Muster zusammenführen.
Commit + Push.

**Agent 2E — card**
Lies: Section 11.4 (Haupt-App) + Section 13.4 (Voranmelde-App).
Lege `docs/components/card/component.md` an.
Standard-Card, Filter-Panel und Panel-Blöcke. App-spezifische Farben als Theming-Varianten.
Commit + Push.

**Agent 2F — sidebar-footer**
Lies: Section 13.7 aus `advance-registration/requirements.md`.
Lege `docs/components/sidebar-footer/component.md` an.
Kennzeichne als Voranmelde-App-spezifisch (cross-feature, aber nur eine App).
Commit + Push.

---

## Phase 3 — Bestehende Component-Docs erweitern (parallel, nach Phase 1)

**Agent 3A — table**
Lies: Section 6.6 (Haupt-App) + Section 9.5 (Voranmelde-App) +
`docs/components/table/component.md`.
Ergänze Tabellen-Stil (Striped, Hover, Multi-Sort, Loading-Skeleton) sofern
noch nicht enthalten. Commit + Push.

**Agent 3B — kpi-tile**
Lies: Section 11.3 (Haupt-App) + Section 13.3 (Voranmelde-App) +
`docs/components/kpi-tile/component.md`.
Ergänze Visual Specs (Font-Größen, Grid-Klassen c3–c6, Farben) sofern
noch nicht enthalten. Commit + Push.

**Agent 3C — autocomplete-create**
Lies: Section 6.3 (Haupt-App) + Section 9.3 (Voranmelde-App) +
`docs/components/autocomplete-create/component.md`.
Ergänze Dropdown-Öffnungsverhalten und Anlegen-Popup-Flow sofern
noch nicht enthalten. Commit + Push.

**Agent 3D — components/overview.md**
Lies: Sections 11.1, 11.2, 11.7 (Haupt-App) + Sections 13.1, 13.2, 13.8
(Voranmelde-App) + `docs/components/overview.md`.
Füge als neue Abschnitte ein:
- PrimeNG-Komponenten-Mapping (Forms, Buttons, Tabellen)
- Globale Layout-Abstände und Page-Header-Format
- PrimeNG MISC-Komponenten-Liste
Ergänze außerdem den Komponenten-Index um alle neuen Docs aus Phase 2.
Commit + Push.

---

## Phase 4 — Feature-Stories anlegen (parallel, nach Phase 1)

Jeder Agent bekommt: den relevanten Abschnitt + den Zielpfad + die Story-Konvention
(oben beschrieben). Nichts weiter.

**Agent 4A — Kamera-Modi (Haupt-App)**
Lies: Section 6.4 aus `docs/requirements/bazaar-app/requirements.md`.
Lege an:
- `docs/requirements/bazaar-app/features/Feature_Verkauf/stories/VERKAUF-S01-popup-camera-mode.md`
  (Popup-Modus: Modal-Overlay, Ablauf im Kassenvorgang)
- `docs/requirements/bazaar-app/features/Feature_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md`
  (Inline-Modus, Countdown-Anzeige, Scan-Feedback)
Commit + Push.

**Agent 4B — Verkäufer-Feldanordnung (Haupt-App)**
Lies: Section 6.5 aus `docs/requirements/bazaar-app/requirements.md`.
Lege an:
- `docs/requirements/bazaar-app/features/Feature_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md`
  (Panel 01–03 im Wizard Schritt 1)
- `docs/requirements/bazaar-app/features/Feature_Verkaeufer/stories/VERK-S01-seller-edit-form-layout.md`
  (Panel 01–03 im Bearbeiten-Dialog)
Commit + Push.

**Agent 4C — Verkäufer-Feldanordnung (Voranmelde-App)**
Lies: Section 9.4 aus `docs/requirements/advance-registration/requirements.md`.
Lege an:
- `docs/requirements/advance-registration/features/Feature_Profil/stories/PROFIL-S01-seller-profile-form.md`
  (Steckbrief: Type/Gebühr/Provision schreibgeschützt)
- `docs/requirements/advance-registration/features/Feature_Verkaeufer/stories/VERK-VA-S01-admin-seller-dialog-form.md`
  (Admin-Dialog: inkl. Feld „Anzahl initialer Nummernblöcke")
Commit + Push.

---

## Phase 5 — Requirements bereinigen (sequentiell, nach Phase 2 + 3 + 4)

Warte bis alle Agents aus Phase 2, 3 und 4 abgeschlossen sind.

**Agent 5A — bazaar-app/requirements.md**
Lies: `docs/requirements/bazaar-app/requirements.md`.
Entferne vollständig: Sections 6 und 11.
Ersetze beide durch:

```markdown
## 6. UI-Konventionen & Komponenten

Geteilte UI-Komponenten (app- und feature-übergreifend):
→ [`docs/components/`](../../components/overview.md)

Feature-spezifische UI-Specs:
→ jeweils als Story im Verzeichnis des betreffenden Features
```

Commit + Push.

**Agent 5B — advance-registration/requirements.md**
Lies: `docs/requirements/advance-registration/requirements.md`.
Entferne vollständig: Sections 9 und 13.
Ersetze beide durch:

```markdown
## 9. UI-Konventionen & Komponenten

Geteilte UI-Komponenten (app- und feature-übergreifend):
→ [`docs/components/`](../../components/overview.md)

Feature-spezifische UI-Specs:
→ jeweils als Story im Verzeichnis des betreffenden Features
```

Commit + Push.

---

## Abhängigkeiten

```
Phase 1 (1A ∥ 1B)
    ↓
Phase 2 (2A ∥ 2B ∥ 2C ∥ 2D ∥ 2E ∥ 2F)  ─┐
Phase 3 (3A ∥ 3B ∥ 3C ∥ 3D)              ├─ alle parallel
Phase 4 (4A ∥ 4B ∥ 4C)                   ─┘
    ↓
Phase 5 (5A → 5B)
```

---

## Allgemeine Sub-Agent-Regeln

- Jeder Agent liest nur die Dateien, die explizit in seinem Auftrag genannt sind
- Kein Agent kennt den Gesamtplan — nur seine Aufgabe und seine Inputs
- Inhalt wird verschoben, nicht umformuliert (außer dem Story-Struktur-Wrapper)
- Phase-5-Agents löschen erst, wenn alle Ziel-Docs aus Phase 2–4 existieren und committed sind
- Alle Commits gehen auf Branch `claude/features-requirements-review-m22u53`
