# Bazaar Suite — Overview

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

- [Anforderungen (Lastenheft)](bazaar-app/requirements.md)
- [Features](bazaar-app/features/)
  - [Artikelannahme](bazaar-app/features/Feature_Artikelannahme/feature.md)
  - [Verkauf](bazaar-app/features/Feature_Verkauf/feature.md)
  - [Abrechnung](bazaar-app/features/Feature_Abrechnung/feature.md)
  - [Artikel](bazaar-app/features/Feature_Artikel/feature.md)
  - [Verkäufer](bazaar-app/features/Feature_Verkaeufer/feature.md)
  - [Verkäufer-Typen](bazaar-app/features/Feature_Verkaeufer_Typen/feature.md)
  - [Marken](bazaar-app/features/Feature_Marken/feature.md)
  - [Kategorien](bazaar-app/features/Feature_Kategorien/feature.md)
  - [Statistik](bazaar-app/features/Feature_Statistik/feature.md)
  - [Druckfunktionen](bazaar-app/features/Feature_Druckfunktionen/feature.md)
  - [Einstellungen](bazaar-app/features/Feature_Einstellungen/feature.md)

### Voranmelde-App

- [Anforderungen (Lastenheft)](advance-registration/requirements.md)
- [Features](advance-registration/features/)
  - [Login](advance-registration/features/Feature_Login/feature.md)
  - [Home (Verkäufer)](advance-registration/features/Feature_Home_Verkaeufer/feature.md)
  - [Home (Admin)](advance-registration/features/Feature_Home_Admin/feature.md)
  - [Meine Artikel](advance-registration/features/Feature_Meine_Artikel/feature.md)
  - [Alle Artikel](advance-registration/features/Feature_Alle_Artikel/feature.md)
  - [Verkäufer](advance-registration/features/Feature_Verkaeufer/feature.md)
  - [Verkäufer-Typen](advance-registration/features/Feature_Verkaeufer_Typen/feature.md)
  - [Nummernblöcke](advance-registration/features/Feature_Nummernbloecke/feature.md)
  - [Marken](advance-registration/features/Feature_Marken/feature.md)
  - [Kategorien](advance-registration/features/Feature_Kategorien/feature.md)
  - [Profil](advance-registration/features/Feature_Profil/feature.md)
  - [Einstellungen](advance-registration/features/Feature_Einstellungen/feature.md)
  - [Export](advance-registration/features/Feature_Export/feature.md)

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

Die JSON-Datenschnittstelle zwischen Voranmelde-App (Export) und Haupt-App (Import) ist das Verbindungsglied beider Apps. Details → Voranmelde-App [Feature Export](advance-registration/features/Feature_Export/feature.md) und Haupt-App [Einstellungen (Import)](bazaar-app/features/Feature_Einstellungen/feature.md).
