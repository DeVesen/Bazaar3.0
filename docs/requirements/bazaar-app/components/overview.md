---
status: reviewed
reviewed-date: 2026-08-17
---

# Komponenten — Haupt-App

**App-lokale UI-Komponenten.** Hier steht nur, was ausschließlich in der Haupt-App vorkommt.
Alles, was beide Apps nutzen, liegt suite-weit in
[`docs/components/`](../../../components/overview.md) und wird von hier **verlinkt, nicht
kopiert**.

**Struktur:** flach, ohne Unterordner. Die Trennung in „custom" und „forms" wäre unscharf —
ein Dialog ist beides — und ein Verzeichnis mit 16 Dateien braucht keine Fächer.

Grundregeln (Dumb Component, ausschließlich PrimeNG) → [`docs/components/overview.md`](../../../components/overview.md)

---

## Seiten und Bereiche

| Komponente | Beschreibung | Epic |
|---|---|---|
| [seller-card](seller-card.md) | Verkäufer-Kachel mit Identität, Status, vier Zählern und drei Warenwert-Summen | [Verkäufer](../epics/Epic_Verkaeufer/epic.md) |
| [seller-detail-modal](seller-detail-modal.md) | Nachschau: Verkäufernummer, QR-Code, vollständige Artikelliste — rein lesend | [Verkäufer](../epics/Epic_Verkaeufer/epic.md) |
| [intake-wizard](intake-wizard.md) | Zweistufiger Annahme-Ablauf samt Sitzungsliste und Abschluss | [Artikelannahme](../epics/Epic_Artikelannahme/epic.md) |
| [cart](cart.md) | Warenkorb des Kassenvorgangs mit Doppelscan-Sperre und Storno | [Verkauf](../epics/Epic_Verkauf/epic.md) |
| [settlement-panel](settlement-panel.md) | Abrechnen-Popup: drei Posten, eine Rundung | [Abrechnung](../epics/Epic_Abrechnung/epic.md) |
| [leaderboard](leaderboard.md) | Rangliste mit Rang-Badge und Typ-Filter | [Statistik](../epics/Epic_Statistik/epic.md) |
| [import-panel](import-panel.md) | JSON-Import: Vorschau, Typ-Zuordnung, Stammdaten-Auswahl | [Einstellungen](../epics/Epic_Einstellungen/epic.md) |
| [user-management](user-management.md) | Benutzerliste und Benutzer-Dialog | [Einstellungen](../epics/Epic_Einstellungen/epic.md) |
| [settings-form](settings-form.md) | Systemparameter — derzeit genau einer | [Einstellungen](../epics/Epic_Einstellungen/epic.md) |
| [login-form](login-form.md) | Anmeldung mit Benutzername, einspaltig, ohne Info-Panel | [Login](../epics/Epic_Login/epic.md) |
| [change-password-page](change-password-page.md) | Passwortwechsel, erzwungen oder freiwillig | [Login](../epics/Epic_Login/epic.md) |
| [topbar](topbar.md) | Mobile Kopfleiste mit Burger-Button | [App Shell](../epics/Epic_App_Shell/epic.md) |

## Dialoge

| Komponente | Beschreibung | Epic |
|---|---|---|
| [verkaeufer-dialog](verkaeufer-dialog.md) | Verkäufer anlegen und bearbeiten, mit Konditionen und Typwechsel | [Verkäufer](../epics/Epic_Verkaeufer/epic.md) |
| [artikel-dialog](artikel-dialog.md) | Artikel bearbeiten, mit gestaffelten Sperren | [Artikel](../epics/Epic_Artikel/epic.md) |
| [article-status-popup](article-status-popup.md) | Zeitstempel korrigieren, Admin-only, mit Kaskaden-Bestätigung | [Artikel](../epics/Epic_Artikel/epic.md) |

## Druckansichten

| Komponente | Beschreibung | Epic |
|---|---|---|
| [print-abgabe-beleg](print-abgabe-beleg.md) | Quittung über abgegebene Artikel und gezahlte Annahmegebühr | [Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md) |
| [print-verkaeufer-uebersicht](print-verkaeufer-uebersicht.md) | Einsammelliste bzw. Auszahlungsbeleg — ein Dokument, zwei Reifegrade | [Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md) |

---

## Was hier bewusst nicht steht

| Element | Warum |
|---|---|
| Sitzungsliste der Artikelannahme | vollständig in [intake-wizard](intake-wizard.md) Abschnitt 3 beschrieben — sie kommt nur dort vor, eine eigene Datei wäre eine zweite Quelle |
| „Seite nicht gefunden" | ein zentrierter Satz; BSHELL-S03 AC-7 beschreibt sie vollständig |
| Sidebar, Sidebar-Footer, Filter-Panel, Stammdaten-Popup, Typ-Popup | **suite-weit** — beide Apps nutzen sie, Varianten stehen dort in Tabellen |
| Table, Badge, Card, Modal, Input-Group, Info-Area, KPI-Tile, Payment-Panel, Scan-Dialog, Seller-Search, Barcode-Scanner, AutoComplete-Create, QR-Code, Numpad | **suite-weit**, unverändert übernommen |
| Atomare Felder (Input, Select, Button, InputNumber, Boolean-Input, Datepicker, Confirmdialog, Toast) | **suite-weit**; Formulare hier verlinken sie statt sie zu beschreiben |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #components #overview #haupt-app
