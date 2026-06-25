# Bazaar 3.0 — Anforderungsdokumentation

Dieses Verzeichnis enthält alle Anforderungen, Spezifikationen, Druck-Vorlagen und klickbaren POC-Prototypen für die **Bazaar Suite**.

## Struktur

| Datei / Ordner | Inhalt |
|---|---|
| [`lastenheft.md`](lastenheft.md) | Lastenheft — Was soll das System leisten? (Auftraggeber-Sicht) |
| [`entitaeten.md`](entitaeten.md) | Datenmodell — alle Entitäten beider Apps mit Feldern und App-Zugehörigkeit |
| [`poc/`](poc/) | POC v1 — Klickbare HTML-Prototypen (Dummy-Daten, kein Angular/dotnet) |
| [`POC-v2/`](POC-v2/) | POC v2 — Überarbeitete HTML-Prototypen mit Responsive-Design und Toast-Feedback |
| [`Druck-Beispiele/`](Druck-Beispiele/) | PDF-Vorlagen für Druckausgaben (Abgabe-Info, Abrechnungs-Info) |

## Status

| Dokument        | Status               |
|-----------------|----------------------|
| Lastenheft      | ✅ Entwurf v0.6       |
| Entitäten       | ✅ Entwurf v0.2       |
| POC v1          | ✅ Fertig             |
| POC v2          | ✅ Fertig (Responsive) |
| Pflichtenheft   | 🔲 Ausstehend        |
| Stories / Tasks | 🔲 Ausstehend        |

## Dokument-Beschreibungen

### lastenheft.md
Vollständige Anforderungsspezifikation aus Auftraggeber-Sicht.
Enthält Rollen (Admin, Verkäufer, Kassierer), alle Feature-Beschreibungen, Einschränkungen und Abnahmekriterien.
Kapitel-Referenzen wie `Lastenheft 3.6.5` oder `Lastenheft 11.9` verweisen auf Abschnitte dieser Datei.

### entitaeten.md
Datenmodell beider Apps (Haupt-App 🏠 / Voranmelde-App ☁️ / beide ✅).
Felder, Typen, Pflicht-Kennzeichen und fachliche Bedeutung je Entität.

### poc/ und POC-v2/
Klickbare HTML-Einzeldateien — keine Build-Abhängigkeiten, direkt im Browser öffnen.
- `haupt-app.html` — UI der Haupt-App (Artikelannahme, Kasse, Abrechnung)
- `voranmelde-app.html` — UI der Voranmelde-App (Verkäufer-Self-Service)

### Druck-Beispiele/
PDF-Beispiele für die physischen Druckausgaben des Basars:
- `Abgabe-Info.pdf` — Informationszettel für Verkäufer bei Artikelabgabe
- `Abrechnungs-Info.pdf` — Abrechnungsbeleg für Verkäufer nach dem Basar
