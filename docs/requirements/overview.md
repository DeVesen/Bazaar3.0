---
id: DOC-001
status: draft
updated: 2026-07-31
---

# Bazaar Suite — Overview

## Index
- Die Suite — App-Übersicht
- Kernidee — Workflow-Beschreibung
- Stakeholder — Rollen
- Dokumentation — Feature-Links
- Querschnittsthemen — Übergreifendes
- Tags & Piles — Ablage

**Version:** 1.0
**Datum:** 2026-07-26
**Autor:** Sven Reichert
**Status:** Entwurf

---

## Die Suite

Die **Bazaar Suite** ist eine zweiteilige Software-Suite zur Verwaltung eines **Nummern-Basars**. Beide Apps sind eigenständig, arbeiten aber als Einheit: Die Voranmelde-App bereitet den Basar vor, die Haupt-App führt ihn durch.

| App | Zweck | Betrieb |
|---|---|---|
| **Haupt-App** | Operative Verwaltung am Basar-Tag (Artikelannahme, Verkauf, Abrechnung) | Lokal / internes LAN |
| **Voranmelde-App** | Selbstregistrierung und Vorab-Erfassung durch Verkäufer | Cloud (z. B. Azure Container Apps) |

---

## Kernidee

Verkäufer erfassen ihre Artikel **vorab** in der Voranmelde-App. Am Basar-Morgen exportiert der Admin alle Daten als JSON-Datei und importiert sie in die Haupt-App. Dadurch sind alle Metadaten (Verkäufer, Artikel, Stammdaten) bereits vorhanden — die Artikelannahme am Basar-Tag beschränkt sich auf die physische Übergabe.

```
Voranmelde-App          Basar-Tag
(Wochen vorher)
                         Haupt-App
Verkäufer →  Artikel    ← JSON-Import
erfassen    registrieren   (einmalig)
```

---

## Stakeholder

| Rolle | App | Beschreibung |
|---|---|---|
| **Admin** | Beide | Betreiber des Basars. Verwaltet Stammdaten, Verkäufer, Einstellungen; führt Export/Import durch. |
| **Verkäufer** | Voranmelde-App | Registriert sich selbst, pflegt Profil und Artikelliste vorab. |
| **Kassenpersonal** | Haupt-App | Führt Artikelannahme, Verkauf und Abrechnung am Basar-Tag durch. |

---

## Dokumentation

### Haupt-App

- [Anforderungen (Lastenheft)](bazaar-app/spec.md)
- [Features](bazaar-app/features/)
  - **Setup**
  - [Projektanlage](bazaar-app/features/Epic_Projektanlage/epic.md)
  - [App Shell](bazaar-app/features/Epic_App_Shell/epic.md)
  - **Tagesgeschäft**
  - [Artikelannahme](bazaar-app/features/Epic_Artikelannahme/epic.md)
  - [Verkauf](bazaar-app/features/Epic_Verkauf/epic.md)
  - [Abrechnung](bazaar-app/features/Epic_Abrechnung/epic.md)
  - **Stammdaten**
  - [Artikel](bazaar-app/features/Epic_Artikel/epic.md)
  - [Verkäufer](bazaar-app/features/Epic_Verkaeufer/epic.md)
  - [Verkäufer-Typen](bazaar-app/features/Epic_Verkaeufer_Typen/epic.md)
  - [Marken](bazaar-app/features/Epic_Marken/epic.md)
  - [Kategorien](bazaar-app/features/Epic_Kategorien/epic.md)
  - **System**
  - [Statistik](bazaar-app/features/Epic_Statistik/epic.md)
  - [Druckfunktionen](bazaar-app/features/Epic_Druckfunktionen/epic.md)
  - [Einstellungen](bazaar-app/features/Epic_Einstellungen/epic.md)

### Voranmelde-App

- [Anforderungen (Lastenheft)](advance-registration/spec.md)
- [Features](advance-registration/features/)
  - **Setup**
  - [Projektanlage](advance-registration/features/Epic_Projektanlage/epic.md)
  - [App Shell](advance-registration/features/Epic_App_Shell/epic.md)
  - **Zugang**
  - [Login](advance-registration/features/Epic_Login/epic.md)
  - **Mein Bereich**
  - [Home (Verkäufer)](advance-registration/features/Epic_Home_Verkaeufer/epic.md)
  - [Home (Admin)](advance-registration/features/Epic_Home_Admin/epic.md)
  - [Meine Artikel](advance-registration/features/Epic_Meine_Artikel/epic.md)
  - **Verwaltung (Admin)**
  - [Alle Artikel](advance-registration/features/Epic_Alle_Artikel/epic.md)
  - [Verkäufer](advance-registration/features/Epic_Verkaeufer/epic.md)
  - [Verkäufer-Typen](advance-registration/features/Epic_Verkaeufer_Typen/epic.md)
  - [Nummernblöcke](advance-registration/features/Epic_Nummernbloecke/epic.md)
  - [Marken](advance-registration/features/Epic_Marken/epic.md)
  - [Kategorien](advance-registration/features/Epic_Kategorien/epic.md)
  - **Konto & System**
  - [Profil](advance-registration/features/Epic_Profil/epic.md)
  - [Einstellungen](advance-registration/features/Epic_Einstellungen/epic.md)
  - [Export](advance-registration/features/Epic_Export/epic.md)

---

## Querschnittsthemen

> Diese Abschnitte werden nach Abschluss der Umstrukturierung ausgearbeitet.

### Gemeinsame Entitäten & Datenmodell

Beide Apps teilen sich ein Datenmodell für Kernentitäten (Artikel, Verkäufer, Marken, Kategorien, Verkäufer-Typen). Die Felder und App-Zugehörigkeit sind in der Entitätenbeschreibung dokumentiert:

→ [entities.md](entities.md)

### Überschneidende Features & Komponenten

Welche Features und UI-Komponenten in beiden Apps existieren und ob/wie sie sich unterscheiden — wird im Rahmen der Epic/Feature-Generierung herausgearbeitet.

App- und Feature-übergreifende **UI-Komponenten** (Aussehen, Verhalten, Funktionen) sind hier dokumentiert:

→ [`docs/components/`](../components/) — ein Verzeichnis pro Komponente, Einstieg: [overview.md](../components/overview.md)

| Komponente | Beschreibung | Verzeichnis |
|---|---|---|
| **Table** | Listenansicht mit Sortierung, Paginierung, Filter und Aktionsspalte | [table/](../components/table/component.md) |
| **Scan-Dialog** | Barcode-/Kamera-Scanner-Popup zum Setzen von Artikel-Zeitstempeln | [scan-dialog/](../components/scan-dialog/component.md) |
| **KPI-Tile** | Einzelne Kennzahl-Kachel im konfigurierbaren Grid (`c3`–`c6`) | [kpi-tile/](../components/kpi-tile/component.md) |
| **AutoComplete-Create** | AutoComplete mit ▾-Auswahl und +-Anlegen-Modus | [autocomplete-create/](../components/autocomplete-create/component.md) |
| **Seller-Search** | Verkäufer-Suchfeld-Panel (InputGroup in Card mit Trefferliste) | [seller-search/](../components/seller-search/component.md) |
| **Payment-Panel** | Kassier-Panel: Gesamtbetrag + Betrag-erhalten + live Rückgeld | [payment-panel/](../components/payment-panel/component.md) |
| **Countdown** | Live-Countdown (Tage + HH:MM:SS) bis Zieldatum; Varianten kpi / info-box | [countdown/](../components/countdown/component.md) |
| **Activity-Heatmap** | 12-Wochen-Aktivitäts-Grid mit Farb-Levels und Hover-Tooltip | [activity-heatmap/](../components/activity-heatmap/component.md) |

### Export / Import (Datenschnittstelle)

Die JSON-Datenschnittstelle zwischen Voranmelde-App (Export) und Haupt-App (Import) ist das Verbindungsglied beider Apps. Details → Voranmelde-App [Feature Export](advance-registration/features/Epic_Export/epic.md) und Haupt-App [Einstellungen (Import)](bazaar-app/features/Epic_Einstellungen/epic.md).

---

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #overview #suite #haupt-app #voranmelde-app #navigation
