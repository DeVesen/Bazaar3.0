# Component: Table

**Bibliothek:** PrimeNG `p-table`
**Verwendung:** Beide Apps — überall dort, wo Listen von Datensätzen angezeigt werden.

---

## Überblick

Die Tabelle ist die zentrale Darstellungskomponente für Listen (Artikel, Verkäufer, Marken, Kategorien usw.). Sie folgt einem einheitlichen Aufbau aus optionaler Toolbar, Tabellenkopf, Datenzeilen und optionaler Paginierung.

---

## 1. Grundstruktur

```
┌─────────────────────────────────────────────────────┐
│  [Toolbar]   optional: Titel + „+ Neu"-Button rechts │
├──────┬──────────┬────────┬────────┬──────────────────┤
│  Nr. │ Spalte 2 │  ...   │  ...   │    Aktionen      │  ← Header (sortierbar)
├──────┼──────────┼────────┼────────┼──────────────────┤
│  ... │   ...    │  ...   │  ...   │  [✏️]  [🔍]      │
│  ... │   ...    │  ...   │  ...   │  [✏️]  [🔍]      │
├──────┴──────────┴────────┴────────┴──────────────────┤
│  [Paginierung]                          optional      │
└─────────────────────────────────────────────────────┘
```

---

## 2. Toolbar

Die Toolbar erscheint **oberhalb** der Tabelle und ist optional.

| Element | Position | Wann |
|---|---|---|
| Seitenüberschrift / Feature-Titel | links | immer |
| „+ Neu"-Button | rechts | nur wenn Anlegen erlaubt |

Fehlt die Berechtigung zum Anlegen, entfällt der „+ Neu"-Button vollständig — kein deaktivierter Button.

---

## 3. Spalten

### Spaltentypen

| Typ | Darstellung | Beispiel |
|---|---|---|
| Text | Plaintext | Bezeichnung, Name |
| Zahl | Rechtsbündig | Nr., Menge |
| Währung | Rechtsbündig, 2 Dezimalstellen | Preis |
| Datum | Lokales Format (`dd.MM.yyyy`) | Erstellt Am |
| Badge | `p-tag` mit Severity | Status |
| Aktionen | Icon-Buttons, rechtsbündig | Edit, View |

### Aktionsspalte

Die Aktionsspalte ist immer die **letzte Spalte** und hat **keine Spaltenüberschrift**.

| Button | Icon | Wann |
|---|---|---|
| Bearbeiten | `pi-pencil` | Datensatz editierbar |
| Ansicht (readonly) | `pi-search` | Nur Lese-Zugriff |
| Löschen | `pi-trash` | Löschen direkt in der Liste erlaubt (selten) |

Button-Stil: `p-button [text]="true" [rounded]="true"` — kein Hintergrund, nur Icon.

---

## 4. Sortierung

- **Einfache Sortierung:** Klick auf Spaltenüberschrift — wechselt zwischen aufsteigend → absteigend → unsortiert.
- **Multi-Sort:** `Shift + Klick` auf weitere Spaltenköpfe fügt eine Sortierebene hinzu.
- **Sortierrichtung:** Pfeil-Icon im Spaltenkopf zeigt aktive Richtung an.
- Nicht alle Spalten sind sortierbar — welche es sind, definiert das jeweilige Feature-Dokument.

---

## 5. Paginierung

Wird aktiviert, wenn die Datenmenge eine definierte Schwelle überschreitet (Standard: **25 Zeilen**).

- Position: unterhalb der Tabelle, rechtsbündig.
- Seitengrößen-Auswahl: `[10, 25, 50]`.
- Anzeige: `„Zeige X – Y von Z Einträgen"`.
- Bei weniger Einträgen als die kleinste Seitengröße: Paginierung wird **ausgeblendet**.

---

## 6. Leerer Zustand (Empty State)

Sind keine Datensätze vorhanden (oder liefert der aktive Filter kein Ergebnis), zeigt die Tabelle einen zentrierten Hinweis:

```
Keine Einträge gefunden.
```

Kein Icon, kein Button — nur der Text. Wirkt der Filter mit → Hinweis lautet:

```
Keine Einträge für den gewählten Filter gefunden.
```

---

## 7. Verhalten bei Aktionen (Edit / Neu)

- **Bearbeiten:** Klick auf Edit-Button öffnet einen **Dialog (Modal)** — kein Seitenwechsel.
- **Neu anlegen:** Klick auf „+ Neu"-Button öffnet denselben Dialog im Anlegen-Modus.
- Nach **Speichern** oder **Löschen** im Dialog: Tabelle aktualisiert sich ohne vollständigen Seiten-Reload.

---

## 8. Responsive

| Viewport | Verhalten |
|---|---|
| Desktop (≥ 1024 px) | Alle Spalten sichtbar |
| Tablet (768–1023 px) | Unwichtige Spalten ausgeblendet (je Feature definiert) |
| Mobil (< 768 px) | Gestapelte Darstellung (`responsiveLayout="stack"`) |

---

## 9. Verwendung in Features

| Feature | App | Tabellen-ID |
|---|---|---|
| Alle Artikel (Admin) | Voranmelde-App | `table-admin-artikel` |
| Meine Artikel | Voranmelde-App | — |
| Verkäufer | Beide | — |
| Verkäufer-Typen | Beide | — |
| Marken | Beide | — |
| Kategorien | Beide | — |
| Artikel | Haupt-App | — |

→ Details zu Spalten und Sortierung: jeweiliges Feature-Dokument.
