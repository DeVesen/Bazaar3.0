# Lastenheft — Bazaar Suite

**Version:** 0.4  
**Datum:** 2026-06-15  
**Autor:** Sven Reichert  
**Status:** Entwurf

---

## 1. Überblick

Die **Bazaar Suite** ist eine zweiteilige Software-Suite zur Verwaltung eines **Nummern-Basars**. Sie besteht aus:

| App                | Zweck                                                            | Betrieb                            |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------- |
| **Haupt-App**      | Operative Verwaltung am Basar-Tag (Annahme, Verkauf, Abrechnung) | Lokal / intern                     |
| **Voranmelde-App** | Selbstregistrierung und Vorab-Erfassung durch Verkäufer          | Cloud (z. B. Azure Container Apps) |

### Kernidee

Verkäufer erfassen ihre Artikel **vorab** in der Voranmelde-App. Am Basar-Morgen exportiert der Admin alle Daten als JSON und importiert sie in die Haupt-App. Dadurch ist die Artikelannahme am Basar-Tag erheblich vereinfacht, da alle Metadaten bereits vorliegen.

---

## 2. Stakeholder

| Rolle | Beschreibung |
|---|---|
| **Admin** | Betreiber des Basars. Verwaltet alle Stammdaten, Verkäufer, Einstellungen und führt den Export/Import durch. |
| **Verkäufer** | Privatpersonen oder Händler, die Artikel am Basar verkaufen. |
| **Kassenpersonal** | Führt Verkauf und Abrechnung am Basar-Tag durch (Haupt-App). |

---

## 3. Haupt-App

### 3.1 Ziel

Die Haupt-App ist das operative Herzstück am Basar-Tag. Sie läuft lokal und verwaltet den gesamten Ablauf von der Artikelannahme bis zur Abrechnung mit dem Verkäufer.

### 3.2 Seiten / Funktionen

#### Stammdaten-Verwaltung (Admin)
- **Verkäuferverwaltung** — Übersicht, Hinzufügen, Ändern
- **Artikelverwaltung** — Übersicht, Hinzufügen, Ändern
- **Marken-Verwaltung** — Übersicht, Hinzufügen, Ändern
- **Kategorie-Verwaltung** — Übersicht, Hinzufügen, Ändern
- **Verkäufer-Type-Verwaltung** — Übersicht, Hinzufügen, Ändern
- **Einstellungen (Admin)** — systemweite Parameter + Import aus Voranmelde-App

#### Operative Prozesse
- **Artikelannahme** — Verkäufer + Artikel werden aufgenommen; Artikel erhalten den Status "Im Verkauf"
- **Verkauf** — Kassenvorgang (siehe 3.3 Verkaufsprozess)
- **Abrechnung** — Rückgabe nicht verkaufter Artikel + finanzielle Abrechnung mit dem Verkäufer

### 3.3 Verkaufsprozess

#### Artikelnummer-Eingabe

Der Kassierer gibt die **Artikelnummer** (int) in ein dediziertes Eingabefeld ein. Dies ist auf zwei Wegen möglich:

1. **USB-Barcode-Scanner** (Tastatur-Emulation) — Scanner tippt die Nummer direkt ins Feld und bestätigt mit Enter
2. **Kamera-Scan** — Button neben dem Eingabefeld öffnet ein Fenster mit Kamerabild; Verkäufer scannt den QR-Code des Artikels (z. B. via ZXing/ngx-scanner o. ä. Angular-Lib)

#### Artikel-Erkennung

Nach der Eingabe / dem Scan wird der Artikel gesucht:

| Ergebnis | Anzeige |
|---|---|
| **Erkannt & im Verkauf** | Grüner Infotext; Preis-Buttons werden aktiv |
| **Nicht erkannt / falscher Status** | Roter Infotext mit Hinweis |

**Preis-Button (nach erfolgreicher Erkennung):**
- **Preis-Button** (immer vorhanden, da Preis Pflichtfeld) — zeigt den Artikel-Preis an

Klick auf den Preis-Button → Artikel landet im **Warenkorb**, Eingabefeld leert sich, InfoArea zeigt: *„Nächsten Artikel eingeben …"* (grün)

#### Warenkorb

- Liste aller hinzugefügten Artikel der aktuellen Transaktion
- Jeder Eintrag kann einzeln **gelöscht** werden
- Der Warenkorb wird **nicht** persistent in der DB gespeichert — nur die finale Buchung

#### Buchung / Bezahlung

1. Kassierer klickt **„BUCHEN"**
2. Popup öffnet sich:
   - Gesamtbetrag (Summe aller Warenkorb-Artikel)
   - Eingabefeld: „Betrag erhalten (€)" — **Dezimalzahl** (Komma oder Punkt als Trennzeichen), InputGroup mit €-Addon
   - Anzeige: **Rückgeld** (wird live berechnet)
3. Kassierer legt Geld in die Kasse (keine Kassenbuch-Anbindung)
4. Klick auf **„Bezahlt"**:
   - Alle Warenkorb-Artikel erhalten `verkauftAm = jetzt`
   - Warenkorb leert sich
   - Artikelnummer-Eingabe leert sich
   - Infofeld zeigt: *„Ersten Artikel eingeben bitte …"*

### 3.4 Druckfunktionen

#### Artikelannahme-Liste
- Wird **nach der Artikelannahme** ausgedruckt und dem Verkäufer mitgegeben
- Enthält:
  - QR-Code mit der Verkäufer-ID
  - Profilinformationen des Verkäufers
  - Liste aller abgegebenen Artikel (im Verkauf)

#### Verkäufer-Übersicht (bei Abrechnung)
- Wird bei der **Abrechnung** gedruckt
- Gleiche Struktur wie Artikelannahme-Liste, jedoch mit drei Artikelgruppen:
  1. **Im Verkauf** — Artikel noch nicht verkauft (Verkäufer holt diese zurück)
  2. **Verkauft** — erfolgreich verkauft
  3. **Sonstige** — z. B. beschädigt, zurückgezogen
- Verkäufer nutzt diesen Ausdruck, um seine "Im Verkauf"-Artikel physisch einzusammeln

### 3.5 Import (aus Voranmelde-App)

- Der Import ist in der **Einstellungen-Seite** integriert — kein separater Menüpunkt
- Admin wählt die JSON-ASCII-Datei (erstellt von der Voranmelde-App, siehe 4.6) über einen Datei-Picker aus
- Nach Dateiauswahl erscheint eine **Vorschau**: Anzahl Verkäufer / Artikel, welche ersetzt bzw. neu angelegt werden
- Der Admin bestätigt den Import explizit per Button
- Die Datei enthält **nur Verkäufer mit mindestens einem Artikel** (inkl. Admins der Voranmelde-App, die selbst Artikel erfasst haben)
- Die **Verkäufer-ID** aus der Voranmelde-App wird **1:1 übernommen** — sie ist der Schlüssel für die Erkennung
- **Upsert-Logik:**
  1. Existiert ein Verkäufer (anhand der ID) bereits in der Haupt-App → Verkäufer **inkl. aller seiner Artikel vollständig löschen**
  2. Danach: Verkäufer + Artikel aus der Import-Datei neu anlegen
- Artikel, die manuell in der Haupt-App angelegt wurden (ohne Import-Bezug), bleiben unberührt

### 3.6 Statistik-Seite

Die Statistik-Seite bietet eine **Echtzeit-Übersicht** des aktuellen Basar-Stands. Sie ist schreibgeschützt und rein informativ.

#### 3.6.1 Artikel-Übersicht (KPI-Kacheln, Zeile 1)

Reihenfolge der Kacheln:

| # | Kennzahl | Beschreibung |
|---|---|---|
| 1 | Gesamt | Anzahl aller erfassten Artikel |
| 2 | Angenommen | Alle freigegebenen Artikel (freigegeben + verkauft + retour + abgerechnet) |
| 3 | Im Verkauf | Artikel mit Status `freigegeben` |
| 4 | Verkauft | Artikel mit Status `verkauft` oder `abgerechnet` |
| 5 | Retour | Zurückgegebene Artikel |
| 6 | Verkaufsquote | Verkauft / Angenommen × 100 % |

#### 3.6.2 Rückblick (KPI-Kacheln, Zeile 2)

| # | Kennzahl | Beschreibung |
|---|---|---|
| 1 | Warenwert Angenommen | Summe der Preise aller angenommenen Artikel (alle außer Status `registriert`) |
| 2 | Warenwert Retour | Summe der Preise zurückgegebener Artikel (Status `retour`) |
| 3 | Offener Warenwert | Summe der Preise noch im Verkauf befindlicher Artikel (Status `freigegeben`) |

#### 3.6.3 Finanz-Kennzahlen (KPI-Kacheln, Zeile 3)

| # | Kennzahl | Beschreibung |
|---|---|---|
| 1 | Einnahmen Brutto | Summe der Verkaufspreise aller verkauften Artikel |
| 2 | Verdienst Provision | Anteil des Veranstalters aus dem Provisions-Satz des Verkäufer-Typs |
| 3 | Verdienst Gebühren | Pauschalgebühr pro verkauftem Artikel × Anzahl Verkäufe |
| 4 | Verdienst Gesamt | Provision + Gebühren |
| 5 | Auszahlung VK | Einnahmen Brutto − Verdienst Gesamt |

#### 3.6.4 Verkäufer-Leaderboard

- Tabelle mit Rang-Badge (Gold/Silber/Bronze), sortiert nach Verkaufsanzahl
- Spalten: Rang, Verkäufer, (Typ — nur bei "Alle Verkäufer-Typen"), Angenommen, Verkauft, Umsatz, Auszahlung
- **Dropdown-Filter** oberhalb der Tabelle: Umschalten zwischen "Alle Verkäufer-Typen" und einem einzelnen Verkäufer-Typ
- Bei gefilterter Ansicht wird die Typ-Spalte ausgeblendet

#### 3.6.5 Technische Anforderungen

- Alle Berechnungen erfolgen clientseitig auf Basis des aktuellen Anwendungszustands
- Kein separater Backend-Endpunkt erforderlich für die Statistik-Seite
- Die Seite wird bei jedem Seitenaufruf neu berechnet (kein Caching)

---

### 3.7 Verwaltungs-Seiten (Stammdaten)

#### 3.7.1 Verkäufer-Seite

**Filter-Panel** (2-zeiliges Panel oberhalb der Karten-Liste):

| Zeile | Elemente |
|---|---|
| 1 | Freitext-Suche (Name, Ort) · Sortierung-Dropdown · Neu-Button |
| 2 | Status-Dropdown |

**Status-Dropdown:** Alle · Offen · Im Verkauf · Abgerechnet

**Sortierung-Dropdown:**

| Option | Sortierkriterium |
|---|---|
| Name (Standard) | Nachname + Vorname alphabetisch |
| Angenom. Warenwert | Summe aller angenommenen Artikel, absteigend |
| Offener Warenwert | Summe der noch im Verkauf befindlichen Artikel, absteigend |
| Umsatz | Summe der verkauften Artikel, absteigend |

**Verkäufer-Karte:**

- Titelzeile: Name + **Verkäufer-Typ-Chip** (kleiner Tag neben dem Namen)
- Statistik-Grid: Gesamt · Angenommen · Verkauft · Retour
- Footer (3 Spalten gleichbreit): Angenom. Warenwert · Offener Warenwert · Umsatz

| Footer-Wert | Berechnung |
|---|---|
| Angenom. Warenwert | Summe aller Artikel mit `freigegebenAm` gesetzt |
| Offener Warenwert | Summe aller Artikel mit `freigegebenAm` gesetzt, `verkauftAm` und `zurueckgegebenAm` leer |
| Umsatz | Summe aller Artikel mit `verkauftAm` gesetzt |

#### 3.7.2 Abrechnung

**Abrechnen-Button** ist deaktiviert (`disabled`) wenn:
- noch offene Artikel vorhanden sind, **oder**
- kein Artikel jemals freigegeben wurde, **oder**
- der Verkäufer bereits abgerechnet ist (`abgerechnetAm` gesetzt)

#### 3.7.3 Artikel-Seite

**Filter-Panel** (2-zeiliges Panel oberhalb der Tabelle):

| Zeile | Elemente |
|---|---|
| 1 | Freitext-Suche (Bezeichnung, Nummer) — volle Breite |
| 2 | Marken-Dropdown · Kategorien-Dropdown · Verkauf-Status-Dropdown · Artikel-Status-Dropdown |

Zeile 2 verwendet ein **4-Spalten-Grid** (je 25% Breite bei vollem Platz), bricht bei schmalen Viewports auf 2 bzw. 1 Spalte um.

**Sortierbare Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · Status (Multi-Sort per Shift+Klick)

#### 3.7.4 Marken-Tabelle

Spalten: Nr. · Name · Original · **Artikel** (Gesamtanzahl) · **Verkauft** (Anzahl mit `verkauftAm`) · Aktionen

Sortierbare Spalten: Name · Artikel · Verkauft (Multi-Sort per Shift+Klick)

#### 3.7.5 Kategorien-Tabelle

Spalten: Nr. · Name · Original · **Artikel** (Gesamtanzahl) · **Verkauft** (Anzahl mit `verkauftAm`) · Aktionen

Sortierbare Spalten: Name · Artikel · Verkauft (Multi-Sort per Shift+Klick)

#### 3.7.6 Verkäufer-Typen-Tabelle

Spalten: Nr. · Name · Provision % · Gebühr € · **Anzahl VK** (Anzahl Verkäufer mit diesem Typ) · Aktionen

Sortierbare Spalten: Name · Provision % · Gebühr € · Anzahl VK (Multi-Sort per Shift+Klick)

---

### 3.8 Tabellen-Stil (PrimeNG)

Alle Datentabellen in beiden Apps folgen dem **PrimeNG Table**-Pattern:

- **Striped rows** — jede zweite Zeile hat leichten Hintergrundton (`#FAFAFA`)
- **Hover-Highlight** — Zeile hebt sich beim Mouseover hervor
- **Sortierbare Spalten** — Klick auf Spalten-Header sortiert auf-/absteigend; aktiver Sort zeigt Pfeil-Icon (▲/▼)
- **Multi-Column-Sort** — Shift+Klick auf weiteren Header fügt zweite, dritte Sortier-Ebene hinzu; Reihenfolge wird als nummeriertes Badge (①②…) am Header angezeigt
- **Loading-Skeleton** — während Daten laden zeigen Zellen animierte Shimmer-Platzhalter
- Referenz: [PrimeNG Table – Striped](https://primeng.org/table#striped), [Loading Skeleton](https://primeng.org/table#loading-skeleton), [Multi-Sort](https://primeng.org/table#multiple-columns-sort)

---

## 4. Voranmelde-App

### 4.1 Ziel

Verkäufer können sich **vorab** registrieren und ihre Artikelliste pflegen. Admins können Verkäufer einladen. Am Basar-Morgen wird ein Export erstellt, der in die Haupt-App importiert wird.

### 4.2 Rollen

| Rolle | Rechte |
|---|---|
| **Admin** | Alles: Verkäufer anlegen, einladen, Stammdaten verwalten, Export erstellen |
| **Verkäufer** | Eigenes Profil + eigene Artikelliste verwalten |

### 4.3 Registrierung & Einladung

**Selbstregistrierung:**
- Verkäufer registriert sich mit E-Mail + Passwort
- Profil wird direkt angelegt
- Nummernblock wird automatisch zugewiesen (nächster freier)

**Admin-Einladung:**
- Admin legt Verkäufer an und sendet einen Einladungs-Link
- Verkäufer vervollständigt Profil und setzt Passwort über den Link
- Anzahl der initialen Nummernblöcke wird beim Anlegen vom Admin festgelegt

### 4.4 Nummernblock-System

- **Startpunkt:** konfigurierbar (z. B. Nummer 1, 100, 1000)
- **Blockgröße:** konfigurierbar (z. B. 10 Nummern pro Block)
- Jeder Verkäufer erhält beim Anlegen einen oder mehrere **zusammenhängende** Nummernblöcke
- **Automatische Erweiterung:** Ist der aktuelle Block aufgebraucht und der Verkäufer legt einen weiteren Artikel an, wird automatisch der nächste freie Block zugewiesen
- **Sichtbarkeit:** Verkäufer sieht seine Nummernblöcke in der Übersicht, kann sie aber **nicht ändern oder weitere beantragen**

#### Einstellungs-Parameter (Nummernblöcke)

| Parameter | Beschreibung |
|---|---|
| `startNumber` | Erste Artikelnummer überhaupt |
| `blockSize` | Anzahl Nummern pro Block |
| `defaultBlockCount` | Standard-Anzahl Blöcke für neue Verkäufer (Admin kann beim Anlegen überschreiben) |

### 4.5 Seiten

#### Admin — Sidebar-Reihenfolge

```
── Mein Bereich ──────────────
  Home
  Meine Artikel  (Admin darf selbst verkaufen)
  ─────────────── (Trennlinie)
── Verwaltung ────────────────
  Verkäufer
  Artikel
  ─────────────── (Trennlinie)
── Stammdaten ────────────────
  Marken
  Kategorien
  Verkäufer-Types
  ─────────────── (Trennlinie)
── System ────────────────────
  Profil
  Einstellungen
  Export
```

- **Home** — Admin-Dashboard (Kacheln: Countdown, Anzahl Verkäufer, Artikel, Kategorien, Marken)
- **Meine Artikel** — eigene Artikel als Verkäufer anlegen und bearbeiten
- **Verkäufer** — Übersicht, Hinzufügen, Ändern (inkl. Einladungs-Link)
- **Artikel** — Übersicht aller Artikel aller Verkäufer (nur Ansicht, kein Bearbeiten fremder Artikel)
- **Marken** — Übersicht, Hinzufügen, Ändern; **exportierbar + importierbar**
- **Kategorien** — Übersicht, Hinzufügen, Ändern; **exportierbar + importierbar**
- **Verkäufer-Types** — Übersicht, Hinzufügen, Ändern
- **Profil** — eigene Stammdaten (E-Mail nur unter Zugangsdaten änderbar)
- **Einstellungen** — Basar-Konfiguration, Info-Text, Nummernblock-Parameter, System-Einstellungen
- **Export** — JSON-Export erstellen

#### Verkäufer — Sidebar-Reihenfolge

```
── Mein Bereich ──────────────
  Home
  Meine Artikel
  ─────────────── (Trennlinie)
── Konto ─────────────────────
  Profil
  Nummernblöcke
```

- **Home** — Dashboard mit Kacheln und Info-Panel (Einstiegsseite nach Login)
- **Meine Artikel** — eigene Artikel: Übersicht, Hinzufügen, Ändern
- **Profil** — eigene Stammdaten einsehen und bearbeiten
- **Nummernblock-Übersicht** — zugewiesene Blöcke einsehen (read-only)

### 4.5a Home / Dashboard (Verkäufer)

Die Home-Seite ist die **Einstiegsseite** nach dem Login. Sie zeigt dem Verkäufer auf einen Blick alle relevanten Informationen zum bevorstehenden Basar.

#### Kacheln (4 Stück, responsives Grid)

| Kachel | Inhalt |
|---|---|
| **Countdown** | Countdown bis zum Abgabe-Starttermin (Tage / HH:MM:SS, live aktualisiert). Darunter: Datum des Basars. |
| **Meine Artikel** | Anzahl der bisher erfassten Artikel des eingeloggten Verkäufers. |
| **Meine Konditionen** | Provision (%) und Abgabegebühr pro Stück — aus der Verkäufer-Entity (Verkäufer-Type). |
| **Abgabegebühr gesamt** | `Artikel-Anzahl × Abgabegebühr/Stück` — zu erwartende Gesamtgebühr bei Abgabe aller aktuellen Artikel. |

#### Aktivitäts-Heatmap

Unterhalb der Kachel-Row: eine **Aktivitäts-Heatmap** (GitHub-Contribution-Stil).

- **Sichtbarkeit: nur für Admins** — Verkäufer sehen die Heatmap nicht
- Admins sehen die Aktivität **aller Artikel** (nicht nur eigene)
- Zeigt die letzten **12 Wochen** als Grid (Spalte = Woche, Zeile = Wochentag, 7 × 12 Zellen)
- Jede Zelle repräsentiert einen Tag; Farbintensität (4 Stufen + leer) entspricht der Aktivitätsanzahl
- **Aktivität** = Anzahl der Ereignisse `erstelltAm` + `updatedAm` aller Artikel an diesem Tag
- Hover-Tooltip: Datum + Anzahl der Aktivitäten
- Monats-Labels oberhalb des Grids; Wochentag-Labels (Mo/Mi/Fr) links
- Legende (Weniger → Mehr) oben rechts

#### Info-Panel

Unterhalb der Heatmap: ein freies **Informations-Panel** mit mehrzeiligem Text.

- Text wird vom **Admin** in den Einstellungen gepflegt
- **Markdown-Formatierung** wird unterstützt (Überschriften, Fettdruck, Listen, Trennlinien, Code)
- Zweck: Hinweise zu Abgaberegeln, Öffnungszeiten, organisatorischen Details

### 4.5b Home / Dashboard (Admin)

| Kachel | Inhalt |
|---|---|
| **Countdown** | Countdown bis zum Basar (live) |
| **Verkäufer** | Anzahl registrierter Verkäufer |
| **Artikel gesamt** | Anzahl aller erfassten Artikel |
| **Kategorien** | Anzahl aktiver Kategorien |
| **Marken** | Anzahl aktiver Marken |

### 4.5c Einstellungen — Basar-Konfiguration (Admin)

Erweiterung der Einstellungen-Seite um folgende Felder:

| Parameter | Typ | Beschreibung |
|---|---|---|
| `basarDatum` | Datum | Tag des Basars — für den Countdown und die Datumsanzeige |
| `abgabeVon` | Datum + Uhrzeit | Start des Abgabe-Zeitraums — Zieldatum des Countdowns |
| `abgabeBis` | Datum + Uhrzeit | Ende des Abgabe-Zeitraums |
| `defaultTypeId` | Referenz | Standard-Verkäufer-Type für Selbstregistrierung und Login-Seite |
| `infoText` | Markdown-Text | Freitext für das Info-Panel (Verkäufer-Home + Login-Seite) |

### 4.5d Profil — Steckbrief

Die E-Mail-Adresse ist im Steckbrief **schreibgeschützt** (read-only) angezeigt. Änderungen an der E-Mail sind ausschließlich über den Tab **Zugangsdaten** möglich.

### 4.5e Artikelanlage / Artikel bearbeiten

#### Feldlayout (Voranmelde-App)

| Zeile | Felder | Breite | Pflicht |
|---|---|---|---|
| 1 | Artikelnummer (schreibgeschützt, aus Nummernblock) | 50 % | auto |
| 2 | Bezeichnung | 100 % | ✅ |
| 3 | Kategorie (AutoComplete) | 50 % | ✅ |
| 3 | Marke (AutoComplete) | 50 % | ✅ |
| 4 | Größe | 50 % | ✅ |
| 4 | Farbe | 50 % | ✅ |
| 5 | Preis | 50 % | ✅ |
| 6 | Beschreibung | 100 % | ✅ |

- **Artikelnummer:** immer schreibgeschützt — wird automatisch aus dem nächsten freien Nummernblock des Verkäufers vergeben
- **AutoComplete Kategorie/Marke:** identische Implementierung wie in der Haupt-App:
  - Eingabefeld + rechter Button (▾ / +) als zusammengehörige Einheit (`ac-row`)
  - **▾-Modus:** Dropdown öffnet bei Fokus oder Klick auf den Button — zeigt alle oder gefilterte Einträge
  - **+-Modus:** Sobald der eingetippte Wert keinem bestehenden Eintrag exakt entspricht, wechselt der Button zu **+** (grün). Klick oder Enter öffnet ein Modal „Neue Kategorie / Neue Marke anlegen" — nach Bestätigung wird der Wert gespeichert und in die Masterliste aufgenommen
  - Tastatur: `↓/↑` navigieren im Dropdown, `Enter` bestätigt exakten Treffer oder öffnet Neu-anlegen-Dialog, `Escape` schließt das Dropdown

### 4.5f Login-Seite / Redirect nach Login

Nach erfolgreichem Login wird der Benutzer immer auf die **Home-Seite** weitergeleitet — unabhängig von Rolle (Admin oder Verkäufer).

---

### 4.5f Login-Seite

Die Login-Seite ist in **zwei Hälften** aufgeteilt:

```
┌─────────────────────────┬─────────────────────────┐
│   Info-Area (50 %)      │   Login-Form (50 %)     │
│   (dunkler Hintergrund) │   (heller Hintergrund)  │
│                         │                         │
│  ⏱ Countdown            │  [E-Mail]               │
│  💰 Default-Konditionen  │  [Passwort]             │
│  📄 Markdown-Text        │  [Anmelden]             │
│                         │  Noch kein Konto? …     │
└─────────────────────────┴─────────────────────────┘
```

**Info-Area zeigt:**
- Countdown bis zum Basar (live)
- Provision und Abgabegebühr des **Default-Verkäufer-Types** (konfigurierbar in Einstellungen über `defaultTypeId`)
- Den Admin-konfigurierten **Markdown-Info-Text** (gleicher Text wie auf Verkäufer-Home)

Auf Mobile (≤ 768 px) wird die Info-Area ausgeblendet — nur die Login-Form ist sichtbar.

### 4.5g Admin — Verkäufer anlegen / bearbeiten

#### Neuer Verkäufer

Der Admin-Dialog „Neuer Verkäufer" enthält ein eigenes **Nummernblock-Panel** mit zwei Feldern:

| Feld | Beschreibung |
|---|---|
| **Startnummer** | Erste Artikelnummer für diesen Verkäufer (Standard: nächste freie Nummer) |
| **Anzahl initialer Blöcke** | Wie viele zusammenhängende Blöcke der Verkäufer beim Anlegen erhält (Standard: 1) |

#### Verkäufer bearbeiten

Das Nummernblock-Panel zeigt beim Bearbeiten eines bestehenden Verkäufers:

- **Liste aller bereits zugewiesenen Blöcke** (schreibgeschützt, nicht löschbar): je Block Anzeige von `Nr. X – Y` und Anzahl der Nummern
- **Plus-Button „Block hinzufügen"**: weist dem Verkäufer den nächsten freien Block zu (berechnet aus dem höchsten vergebenen `bis`-Wert aller Verkäufer + 1)

#### Admin-Rechte-Toggle

Im Dialog (sowohl Neu als auch Bearbeiten) gibt es einen **Toggle-Schalter** „Dieser Verkäufer hat Admin-Rechte". Ein Verkäufer mit Admin-Rechten erhält nach dem Login die vollständige Admin-Ansicht. Der Toggle ist nur für Admins sichtbar.

### 4.5h Admin — Alle Artikel (Ansicht)

Der Admin sieht unter **Artikel** die vollständige Artikelliste aller Verkäufer. Fremde Artikel können **nicht bearbeitet** werden — eigene Artikel werden ausschließlich über **Meine Artikel** bearbeitet.

- Statt eines Bearbeiten-Buttons gibt es pro Zeile einen **Lupe-Button (🔍)**
- Klick öffnet ein **readonly Modal** (`modal-artikel-view`) mit identischer Feldanordnung wie das Artikel-Bearbeiten-Modal (Zeilen 1–6 gemäß 4.5e)
- Zusätzlich wird oben der **Verkäufer** (Name + Nummer) als schreibgeschütztes Feld angezeigt
- Das Modal hat ausschließlich einen **Schließen-Button** — kein Speichern, kein Löschen

### 4.5i Tabellen in der Voranmelde-App (Multi-Sort)

Alle Tabellen in der Voranmelde-App verwenden dasselbe PrimeNG-Tabellen-Styling und denselben Multi-Sort-Mechanismus wie in der Haupt-App (vgl. Abschnitt 3.8).

| Tabelle | Tabellen-ID | Sortierbare Spalten |
|---------|-------------|---------------------|
| Meine Artikel (Verkäufer) | `table-meine-artikel` | Nr. · Bezeichnung · Kategorie · Marke · Preis |
| Admin — Verkäufer | `table-admin-verkaeufer` | Nr. · Vorname · Nachname · PLZ · Ort · Typ · Provision · Gebühr · Artikel |
| Admin — Alle Artikel | `table-admin-artikel` | Nr. · Bezeichnung · Kategorie · Marke · Preis · Verkäufer |
| Marken | `table-marken` | Name · Artikel |
| Kategorien | `table-kategorien` | Name · Artikel |
| Verkäufer-Typen | `table-types` | Bezeichnung · Provision % · Gebühr € |

**Verhalten (identisch mit Haupt-App):**
- Klick auf Spaltenheader → einfache Sortierung (aufsteigend → absteigend → keine)
- Shift+Klick → fügt eine weitere Sortierstufe hinzu (Multi-Sort)
- Sortier-Priorität wird als nummeriertes Badge auf dem Header angezeigt
- Pfeil-Icon zeigt Richtung (▲ aufsteigend, ▼ absteigend)

### 4.6 Export

- Admin erstellt einen Export als **JSON-ASCII-Datei**
- **Exportiert werden:** alle Verkäufer (inkl. Admins), die **mindestens einen eigenen Artikel** erfasst haben — jeweils mit vollständigem Profil + Artikelliste
- Verkäufer ohne Artikel werden **nicht** exportiert
- Optional wählbar: Marken und/oder Kategorien im selben Export einschließen (für Stammdaten-Synchronisierung mit der Haupt-App)
- Wird manuell in die Haupt-App importiert (Stichtag = Basar-Morgen)

---

## 5. UI-Konventionen & Komponenten

### 5.0 Grundlayout (beide Apps)

Kein Toolbar/Titel-Banner am oberen Rand, solange die Sidebar sichtbar ist. Das Layout besteht ausschließlich aus:

```
┌──────────────┬──────────────────────────────────┐
│   Sidebar    │           Content-Bereich         │
│  (Navigation)│                                   │
└──────────────┴──────────────────────────────────┘
```

- **Sidebar** (links): Navigation, immer sichtbar auf Desktop
- **Content** (rechts): der jeweilige Seiteninhalt
- **Ausnahme Drucken**: beim Drucken wird nur der relevante Content gerendert — keine Sidebar, kein Layout-Chrome

**Burger-Menü (Responsive):**  
Sobald die Sidebar ausgeblendet wird, erscheint eine **Titelleiste** (`#topbar`) am oberen Rand — **dieselbe Farbe/Gradient wie die Sidebar** (kein eigener Farbton). Der Burger-Button (`#btnBurger`) sitzt in dieser Titelleiste links. Ein Overlay-Tap schließt die Sidebar.

- **Haupt-App**: Titelleiste erscheint bei ≤ 768 px (Mobile). Tablet und Desktop sehen nur die Sidebar.  
- **Voranmelde-App**: Titelleiste erscheint bei ≤ 1024 px (Tablet + Mobile). Desktop sieht nur die Sidebar.  
- **Voranmelde-App Sidebar-Footer**: User-Info (Avatar, Name, Logout) und Role-Toggle (Admin/Verkäufer) sitzen immer am unteren Rand der Sidebar — auch im mobilen Zustand nach Öffnen über Burger.

---

### 5.1 Wiederverwendbare UI-Komponenten

#### InputGroup (IG)

Alle Eingabefelder mit Such- oder Scan-Funktion werden als **InputGroup** umgesetzt. Aufbau:

```
[ 🔍 Left-Addon ][ Input-Feld              ][ ✕ ][ Spinner ][ ↩ / 📷 ]
```

| Bereich | Beschreibung |
|---|---|
| **Left-Addon** | Optionaler linker Addon (🔍 Lupe bei Suchfeldern, kein Addon bei reinen Nummernfeldern) |
| **Input-Feld** | Freitexteingabe; Debounce-Suche (800 ms Default, konfigurierbar) |
| **✕ Clear-Button** | Erscheint, wenn Input nicht leer; löscht den Wert und setzt Fokus |
| **Spinner** | Zeigt Ladezustand während der Suche (ersetzt temporär Clear-Button) |
| **Action-Button (rechts)** | Kontext-sensitiv: zeigt ↩ (Enter-Aktion) wenn Input gefüllt, zeigt 📷 (Kamera) wenn Input leer |

**Debounce:** Sucheingaben lösen die Suche erst nach 800 ms Pause aus (konfigurierbar in Einstellungen).

**ENTER-Verhalten:** Kontextabhängig — bei exaktem Treffer: sofortige Aktion. Bei mehreren Treffern: keine Aktion. Bei leerem Feld und Kamera verfügbar: öffnet Kamera.

**€-Addon (Preis-Felder):**  
Alle Preis-Eingabefelder in **beiden Apps** sind ebenfalls InputGroups mit einem **rechten „€"-Addon**:
```
[ Preis eingeben (Kommazahl)    ][ € ]
```
Erlaubte Eingabe: Dezimalzahl mit Komma oder Punkt als Trennzeichen.

---

#### InfoArea

Eine farbige Informationszeile, die Kontext-Feedback gibt. Vier Typen:

| Typ | Hintergrund | Textfarbe | Ton |
|---|---|---|---|
| `success` | Hellgrün | Dunkelgrün | **Ping** (heller Sinuston, 880→1320 Hz) |
| `error` | Hellrot | Dunkelrot | **Zonk** (Quadratwelle, 180→120 Hz) |
| `warn` | Hellgelb | Orangerot | **Zonk** |
| `info` | Hellblau | Dunkelblau | — (kein Ton) |

Format: `[Icon] Nachrichtentext` — einzeilig, fett.

**InfoArea im Verkauf-Kontext (Haupt-App):**
- Beim Navigieren zur Verkauf-Seite: blauer Info-Text *„Ersten Artikel eingeben …"*
- Nach Buchen: blauer Info-Text *„Ersten Artikel eingeben …"*
- Nach Leeren des Warenkorbs: blauer Info-Text *„Ersten Artikel eingeben …"*
- Nach erfolgreichem Artikel-Scan: grüner Erfolgstext mit Preis
- Bei unbekanntem Artikel / falschem Status: roter Fehlertext

---

#### AutoComplete-Dropdown (Marke & Kategorie)

Gilt in **beiden Apps** für alle Marke/Kategorie-Felder (siehe auch 6.2):

```
[ Texteingabe                                   ][ ▾ / + ]
```

- **▾ Button**: Öffnet/Schließt das Dropdown (erscheint, wenn aktueller Wert bekannt ist)
- **+ Button**: Erscheint, wenn der eingetippte Text **nicht** in der Liste ist → Mini-Popup zur Bestätigung
- Dropdown öffnet sich beim Anklicken des Feldes (kein Mindest-Zeichenanzahl)
- Hervorhebung des aktiven Eintrags bei Tastaturnavigation

---

### 5.2 Kamera-Modi

Es gibt zwei Kamera-Modi — welcher verwendet wird, hängt vom Kontext ab:

#### Popup-Modus (Standard)
Wird verwendet in: **Verkauf** (Artikelnummer scannen), **Wizard Schritt 2** (Artikelnummer scannen)

Ein Modal-Overlay öffnet sich mit Kamerabild. Nach Scan: Modal schließt sich, Wert wird ins Eingabefeld übernommen.

#### Inline-Modus (Freigeben & Rückgabe)
Wird verwendet in: **Artikel-Freigeben-Popup**, **Rückgabe-Popup**

Das Eingabefeld wird durch ein Kamerafenster *an derselben Position* ersetzt. Die Bereiche darunter (InfoArea, Artikel-Liste) bleiben sichtbar und unverändert.

**Ablauf nach Scan (Inline-Modus):**
1. Barcode/QR erkannt → Artikel wird gesucht
2. InfoArea zeigt Ergebnis (grün/gelb/rot) mit Tonfeedback
3. Kamerabild wird durch ein **Countdown-Display** ersetzt (gleiche Größe):
   - Kreisförmiger SVG-Countdown läuft rückwärts ab
   - Dauer: konfigurierbar (`scannerPauseMs`, Default 3 000 ms)
4. Nach Ablauf: Kamerabild erscheint wieder — bereit für nächsten Scan
5. **← Eingabe Button**: jederzeit sichtbar → wechselt zurück in den Eingabe-Modus

### 5.3 Verkäufer-Feldanordnung

Gilt für: **Verkäufer bearbeiten** (Haupt-App), **Verkäufer anlegen — Schritt 1** (Wizard, Haupt-App), **Steckbrief** (Voranmelde-App, Seller-View), **Admin Verkäufer-Dialog** (Voranmelde-App).

**Panel 01 — Personendaten**
```
[Vorname *       50%] [Nachname *     50%]
[Anschrift                           100%]
[PLZ             50%] [Ort            50%]
```

**Panel 02 — Kontakt**
```
[Telefon         50%] [E-Mail *       50%]
```

**Panel 03 — Konditionen**
```
[Verkäufer-Type                      100%]
[Gebühr je Stück 50%] [Provision     50%]
```

- Gebühr und Provision werden beim Wechsel des Types **vorausgefüllt** (eigene Werte des Verkäufers, nicht live aus dem Type — siehe 8.5)
- Im **Seller-Steckbrief** (Voranmelde-App) sind Type/Gebühr/Provision **schreibgeschützt** — nur Admin kann diese ändern
- Im **Admin-Dialog** (Voranmelde-App) gibt es zusätzlich das Feld **„Anzahl initialer Nummernblöcke"** unterhalb von Panel 03

**Visuelle Panel-Gestaltung:**  
Jedes Panel ist als **visuell abgesetzter Block** dargestellt — leicht eingefärbter Hintergrund, Rahmen (1 px, dezente Farbe), abgerundete Ecken und Innenabstand. Panels sind klar voneinander getrennt; kein Panel fließt optisch in das nächste.

**Modal-Größen (beide Apps):**
- `≥ 768 px`: **80 % Breite / 90 % Höhe**
- `< 768 px`: **100 % Breite / 100 % Höhe**, kein border-radius

---

## 6. Einstellungen

### 6.0 Einstellungen-Seite (Haupt-App)

Die Haupt-App hat eine **Einstellungen-Seite** (Admin), die systemweite Parameter konfigurierbar macht.

| Parameter | Beschreibung | Default |
|---|---|---|
| `suchDebounceMs` | Verzögerung in ms bevor eine Suchanfrage ausgelöst wird | 800 ms |
| `scannerPauseMs` | Anzeigedauer des Scan-Ergebnisses im Inline-Kamera-Modus (Freigeben/Rückgabe) | 3 000 ms |

Einstellungen werden im `localStorage` des Browsers gespeichert.

---

## 7. Technische Rahmenbedingungen

### 7.0 Tech-Stack

| Komponente | Technologie |
|---|---|
| **Frontend** | Angular 19 (zwei separate Apps: Haupt-App + Voranmelde-App) |
| **Backend** | .NET 9 Web API (zwei separate Backends) |
| **ORM** | Entity Framework Core |
| **Datenbank** | PostgreSQL (beide Apps) |
| **Containerisierung** | Docker / Docker Compose |
| **Mehrsprachigkeit** | ngx-translate (DE + EN, nur Voranmelde-App) |
| **Barcode/QR-Scan** | ZXing / ngx-scanner (Browser-Kamera, offline-fähig) |
| **Icons** | Angular Material Icons (npm-Bundle, kein CDN) |

### 7.1 Responsive Design (beide Apps)

Beide Apps müssen auf Desktop, Tablet und Smartphone nutzbar sein.

| Breakpoint | Sidebar | Titelleiste | Modals |
|---|---|---|---|
| **Desktop** (> 1024 px) | fest sichtbar | keine | 80 % Breite / 90 vh |
| **Tablet** (≤ 1024 px) | Burger-Menü, slide-in (Voranmelde-App) | sichtbar (Voranmelde-App) | 80 % / 90 vh |
| **Mobile** (≤ 768 px) | Burger-Menü, slide-in (beide Apps) | sichtbar (beide Apps) | 100 % / 100 vh, kein border-radius |

**Titelleiste:** Hintergrundfarbe = Sidebar-Farbe (kein separater Farbton). `#btnBurger` öffnet/schließt die Sidebar via `toggleSidebar()` / `closeSidebar()`; ein Overlay schließt sie per Klick außerhalb. Die Sidebar positioniert sich bei `top: 56px` (Höhe der Titelleiste), um darunter zu erscheinen.

### 7.2 Offline-Fähigkeit (Haupt-App)

Die Haupt-App **muss vollständig offline-fähig** sein.

**Hintergrund:** Der Basar findet in Veranstaltungsorten statt, die kein öffentliches Internet bieten. Es wird ein **lokales WLAN/LAN** aufgebaut — ein Server im lokalen Netz hostet die App als Container. Mehrere Clients (Laptops, Tablets, Smartphones) greifen darüber zu. Dieses lokale Netz hat **keinen Internetzugang**.

**Konsequenzen für die Implementierung:**

| Bereich | Anforderung |
|---|---|
| Fonts | Müssen lokal im App-Bundle eingebettet sein — kein CDN |
| Icons | Lokal eingebettet (z. B. Material Icons als npm-Paket, nicht Google CDN) |
| CSS-Bibliotheken | Lokal über npm, kein externer CDN-Link |
| JS-Abhängigkeiten | Ausschließlich über npm-Bundle — keine remote script-Tags |
| QR-/Barcode-Scanner | Muss im Browser via Kamera funktionieren (kein externer Service) |
| Angular-Build | `ng build --configuration production` muss vollständig selbstständig laufen |

Die Voranmelde-App läuft in der Cloud und hat keine Offline-Anforderung.

---

## 8. Gemeinsame Anforderungen

### 8.1 Marken & Kategorien (Synchronisierung)
- Marken und Kategorien können in der Voranmelde-App **exportiert** und in die Haupt-App **importiert** werden (und umgekehrt)
- Ziel: konsistente Stammdaten in beiden Systemen

### 8.1a Marken & Kategorien — `original`-Flag

Jede Marke und jede Kategorie trägt ein boolesches Feld **`original`**:

| Wert | Bedeutung |
|---|---|
| `true` | Vom Admin als Stammdaten-Eintrag angelegt |
| `false` | Nachträglich angelegt — z. B. von einem Verkäufer über das AutoComplete-Popup |

**Verwaltung:**
- Im Anlegen/Bearbeiten-Dialog gibt es einen **Switch** zum Umschalten des `original`-Flags
- In den Listen (Marken- und Kategorien-Übersicht beider Apps) wird der Status als Badge dargestellt:
  - `✓ Original` (grün) — Stammdaten-Eintrag
  - `Neu` (orange) — nachträglich hinzugefügt

**Zweck je App:**

| App | Verwendungszweck |
|---|---|
| **Voranmelde-App** | Erkennen, welche Marken/Kategorien von Verkäufern während der Voranmeldephase neu angelegt wurden |
| **Haupt-App** | Erkennen, welche Marken/Kategorien während der Annahmephase am Basar-Tag neu hinzugekommen sind |

**Automatisches Verhalten:**
- Wird eine neue Marke oder Kategorie über das AutoComplete-Popup angelegt (Verkäufer oder Kassierer tippt einen unbekannten Wert ein), wird `original` automatisch auf `false` gesetzt

**Listen — Artikel-Anzahl-Spalte:**
- In beiden Apps zeigt die Marken- und Kategorien-Liste eine Spalte **„Artikel"** mit der Anzahl der Artikel, die dieser Marke bzw. Kategorie zugeordnet sind
- Beispiel: Kategorie „Jacken" → Artikel-Anzahl = 3

### 8.2 Marken & Kategorien — AutoComplete-Verhalten

In **beiden Apps** gilt für die Felder Marke und Kategorie:

- **AutoComplete-Dropdown** öffnet sich bereits beim **Anklicken des Feldes** (kein Mindest-Zeichen-Eingabe nötig)
- Freie Texteingabe möglich — Anwender kann etwas eingeben, das noch nicht existiert
- Bei unbekanntem Wert: **Popup** → *„‹XYZ› als neue Marke/Kategorie speichern?"*
  - Bestätigt: Eintrag wird direkt angelegt und ausgewählt
  - Abgebrochen: Eingabe bleibt, aber kein neuer Eintrag

### 8.2a Artikel-Timestamps

Jeder Artikel trägt folgende Zeitstempel:

| Feld | Typ | Beschreibung |
|---|---|---|
| `erstelltAm` | DateTime | Wird beim Anlegen automatisch gesetzt (server-seitig) |
| `updatedAm` | DateTime | Wird bei jeder Änderung automatisch aktualisiert (server-seitig) |

- Beide Felder sind **nicht editierbar** durch den Anwender
- `updatedAm` wird in der Voranmelde-App für die **Aktivitäts-Heatmap** auf der Home-Seite ausgewertet
- Bei Neuanlage gilt `updatedAm = erstelltAm`

---

### 8.3 IDs
- Alle Entitäten verwenden eine **8-stellige Unique ID** aus Groß-/Kleinbuchstaben und Zahlen (alphanumerisch, case-sensitive)

### 8.4 Verkäufer-Types
- **Standardwerte / Vorlagen** — kein verbindlicher Join, sondern ein Template
- Werden in beiden Apps gepflegt
- Enthalten: Verkaufsprovisions-Anteil (%) und Abgabegebühr pro Stück (€)
- Beim Anlegen oder Ändern eines Verkäufers wird der Type gewählt → die Felder `provision` und `gebuehr` werden **vorausgefüllt**, können aber individuell überschrieben werden

### 8.5 Verkäufer-Konditionen (eigene Felder)
- Jeder Verkäufer trägt **eigene** Felder `provision` (%) und `gebuehr` (€/Stück) direkt in seiner Entität
- Diese Werte sind **maßgeblich** für alle Berechnungen (Annahme-Gebühr, Abrechnung-Provision) — nicht die Werte des zugewiesenen Types
- Beim Import aus der Voranmelde-App in die Haupt-App gelten die Werte aus dem Verkäufer-Entity, **nicht** die aktuellen Werte des gleichnamigen Types in der Haupt-App
- Admin der Voranmelde-App kann Provision und Gebühr pro Verkäufer individuell nachjustieren

---

## 9. Ablauf-Beschreibungen (UX-Flows)

### 9.1 Artikelübersicht

Gilt für **beide Apps** (mit App-spezifischen Erweiterungen).

#### Filterbereich
| Filter | Voranmelde-App | Haupt-App |
|---|---|---|
| Marke | ✅ | ✅ |
| Kategorie | ✅ | ✅ |
| Freitext (Nummer, Bezeichnung, Kategorie, Marke, Verkäufer Vor-/Nachname) | ✅ | ✅ |
| Verkäufer-Status | ❌ | ✅ |
| Artikelstatus | ❌ | ✅ |

#### Tabellenspalten
| Spalte | Voranmelde-App | Haupt-App |
|---|---|---|
| Artikelnummer | ✅ | ✅ |
| Bezeichnung | ✅ | ✅ |
| Kategorie | ✅ | ✅ |
| Marke | ✅ | ✅ |
| Preis | ✅ | ✅ |
| Verkäufer (Vor- + Nachname) | ❌ | ✅ |
| Artikelstatus | ❌ | ✅ |
| Edit-Button (ganz rechts) | ✅ | ✅ |

#### Aktionen
- **NEU-Button** → öffnet **Artikelanlage** (gleicher Feldaufbau wie Wizard Schritt 2 — 2-Spalten-Grid, Pflichtfelder, AutoComplete für Kategorie/Marke, €-Addon beim Preis)
  - In der Voranmelde-App: Artikelnummer wird automatisch vorausgewählt (nächste freie Nummer)
- **Edit-Button** pro Zeile → öffnet **Artikel bearbeiten** (identisches Layout wie Artikelanlage)
  - Artikelnummer: oben, read-only
  - **Löschen-Button** im Footer, ganz links (neben Abbrechen + Speichern)

#### Artikelstatus-Popup (nur Haupt-App)

Klick auf den Artikelstatus-Badge öffnet ein Popup mit Zeitstempeln und Aktions-Buttons:

| Feld | Wert vorhanden | Wert NULL |
|---|---|---|
| Erstellt Am | Zeitstempel (read-only) | — |
| Freigegeben Am | Zeitstempel + **Löschen-Button** | **Setzen-Button** |
| Verkauft Am | Zeitstempel + **Löschen-Button** | **Setzen-Button** |
| Rückgegeben Am | Zeitstempel + **Löschen-Button** | **Setzen-Button** |
| Abgerechnet Am | Zeitstempel (read-only) | — |

**Kaskadierungs-Regel beim Löschen:**  
Wird ein früherer Zeitstempel gelöscht, werden alle nachfolgenden ebenfalls auf NULL gesetzt.  
Beispiel: Löschen von „Freigegeben Am" → auch „Verkauft Am" und „Rückgegeben Am" werden NULL.

**Gegenseitige Sperre:**  
Ein Artikel kann nicht gleichzeitig „Verkauft" und „Rückgegeben" sein.  
→ Ist `verkauftAm` gesetzt, ist der Setzen-Button bei `rückgegebenAm` deaktiviert — und umgekehrt.

---

### 9.2 Verkäuferübersicht

#### Voranmelde-App — Profil-Page

Tab-Navigation innerhalb der Profil-Page:
1. **Steckbrief** — alle Stammdaten einsehen und bearbeiten
2. **Zugangsdaten ändern** — E-Mail und/oder Passwort ändern
3. **Löschen** — Account löschen (mit Bestätigungsdialog)

#### Haupt-App — Verkäuferliste (Karten-Layout)

**Filterbereich:**
- Verkäufer-Status: `Offen` | `Im Verkauf` | `Abgerechnet`
- Freitextsuche

**Status-Definition:**
| Status | Bedingung |
|---|---|
| **Offen** | Kein Artikel ist aktuell freigegeben |
| **Im Verkauf** | Mindestens ein Artikel freigegeben; noch nicht abgerechnet |
| **Abgerechnet** | `abgerechnetAm` ist gesetzt |

**Karten-Aufbau (je Verkäufer):**

```
[Vorname Nachname]          [Edit-Button] [Scanner-Button]
[PLZ Ort                              #VerkäuferID]

[Verkäufer-Status-Badge]

Artikel gesamt: X    |  Freigegeben: X
Verkauft: X          |  Rückgegeben: X

Warenwert (freigegeben): X,XX €  |  Umsatz: X,XX €
```

- **Edit-Button** → öffnet Verkäuferverwaltung (Stammdaten bearbeiten)
- **Scanner-Button** → öffnet **Artikel-Freigeben-Popup** (siehe 7.5)
- **Klick auf Verkäufer-Status-Badge** → Popup mit Abrechungs-Zeitstempel:
  - Zeigt: „Abgerechnet Am ‹Zeitstempel›"
  - **Löschen-Button** zum Zurücksetzen auf NULL
  - Kein manuelles Setzen möglich — wird nur durch den Abrechnungsprozess gesetzt

**NEU-Button** (über der Liste) → startet **Verkäufer-Anlage-Wizard** (Schritt 1: Verkäuferanlage)

---

### 9.3 Artikelannahme-Page (Haupt-App)

Entry-Page für den Annahme-Prozess. Besteht aus einem **InputGroup-Suchfeld** (🔍 Addon, Debounce, kein Kamera-Button) und einer **Verkäufer-Liste** darunter.

#### Verhalten des Suchfelds

| Eingabe | Verhalten |
|---|---|
| (leer) | Alle Verkäufer werden in der Liste angezeigt |
| Text eingegeben | Filtert nach: Verkäufer-ID, Vorname, Nachname |
| Genau 1 Treffer + ENTER | Öffnet Verkäufer-Anlage-Wizard → Schritt 2 (Artikelannahme) |
| Mehr als 1 Treffer + ENTER | Keine Aktion |
| Kein Treffer | Liste wird ausgeblendet; **Anlegen-Button** erscheint |

#### Aktionen
- **Klick auf einen Verkäufer in der Liste** → Verkäufer-Anlage-Wizard → Schritt 2 (Artikelannahme)
- **Anlegen-Button klicken** (oder ENTER wenn Anlegen-Button sichtbar) → Verkäufer-Anlage-Wizard → Schritt 1 (Verkäuferanlage)
  - Die aktuelle Sucheingabe wird als Vorname/Nachname vorbelegt: Text **vor dem ersten Leerzeichen** = Vorname, Text **danach** = Nachname

---

### 9.4 Verkäufer-Anlage-Wizard (Haupt-App)

Zweiseitiger Wizard: **Schritt 1 — Verkäuferanlage** → **Schritt 2 — Artikelannahme**

#### Schritt 1: Verkäuferanlage

Formular mit allen Verkäufer-Feldern (siehe **5.3 Verkäufer-Feldanordnung**). Klick auf **„Weiter"** → Verkäufer wird sofort in der DB angelegt → Wizard wechselt zu Schritt 2.

Vorname/Nachname-Vorbelegung aus der Sucheingabe (Trennung am ersten Leerzeichen).

#### Schritt 2: Artikelannahme

Layout: **70 % Artikeleingabe | 30 % Übersicht**

**Artikeleingabe (links):**

Formular-Layout als 2-Spalten-Grid. Felder und Reihenfolge:

| Feld | Typ | Spalte | Pflicht |
|---|---|---|---|
| Artikelnummer | InputGroup (kein Addon, Kamera-Popup-Button rechts) | links | ✅ |
| Bezeichnung | Texteingabe | ganze Breite | ✅ |
| Kategorie | AutoComplete (▾/+) | links | ✅ |
| Marke | AutoComplete (▾/+) | rechts | ✅ |
| Preis | InputGroup (€ rechts) | rechts | ✅ |
| Größe | Texteingabe | links | ❌ |
| Farbe | Texteingabe | rechts | ❌ |
| Beschreibung | Textarea | ganze Breite | ❌ |

Pflichtfelder sind mit `*` markiert. Der **„Übernehmen"-Button** ist deaktiviert, solange Pflichtfelder leer sind.

Sonderfall **importierter Verkäufer:**  
Gibt der Anwender eine Artikelnummer ein und bestätigt mit ENTER → vorhandener Artikel aus der Voranmelde-Import-Liste wird geladen und die Felder werden vorausgefüllt. Alle Felder bleiben bearbeitbar.

Sonderfall **neue Nummer:**  
Die Artikelnummer wird auf **systemweite Eindeutigkeit** geprüft (beide Apps, gemeinsamer Nummernraum).

Nach Ausfüllen aller Pflichtfelder: Klick auf **„Übernehmen"** → Artikel erscheint in der Übersichtsliste rechts; alle Eingabefelder leeren sich; Fokus springt zurück auf Artikelnummer-Feld.

**Übersicht (rechts):**

Aufbau von oben nach unten:

1. **Artikelliste** — zeigt alle in dieser Sitzung erfassten Artikel (Artikelnummer + Bezeichnung)
   - Klick auf einen Eintrag → Popup mit allen Feldern; Bezeichnung, Kategorie, Marke, Preis änderbar
   - Artikel sind in diesem Zustand **noch nicht in der DB gespeichert**

2. **Gebühr** — `Anzahl Artikel × Verkäufer.gebuehr` (eigenes Feld des Verkäufers, nicht aus dem Type direkt)

3. **Speichern-Button** → Popup erscheint:
   - Gesamtgebühr
   - Eingabefeld: „Betrag erhalten (€)" — **Dezimalzahl**, InputGroup mit €-Addon
   - Anzeige: **Rückgeld** (live berechnet)
   - Klick auf **„Buchen"**:
     - Alle Artikel aus der Liste werden in der DB gespeichert / aktualisiert
     - Jeder Artikel bekommt automatisch `freigegebenAm = jetzt` → sofort im Verkauf
     - **Druckdialog** startet automatisch (Artikelannahme-Liste mit QR-Code)

---

### 9.5 Artikel-Freigeben-Popup (Haupt-App)

Erreichbar über den **Scanner-Button** in der Verkäufer-Karte.

#### Layout: Eingabe-Modus

Eingabefeld (Artikelnummer) + AutoComplete-Liste darunter.

| Zustand | Verhalten |
|---|---|
| (leer) | Liste zeigt alle noch **nicht freigegebenen** Artikel dieses Verkäufers |
| Eingabe | Filtert die Liste nach Artikelnummer |
| Genau 1 Treffer + ENTER | Artikel bekommt `freigegebenAm = jetzt`; Eingabefeld leert sich; Liste zeigt wieder alle ausstehenden |
| Kein Treffer | Liste verschwindet; Text: *„Artikel nicht bekannt"* |
| Alle freigegeben | Nur Text: *„Alle Artikel freigegeben"* |

Neben dem Eingabefeld: **BC-Button** → wechselt in den Kamera-Modus.

#### Layout: Kamera-Modus

Kamerabild wird statt Eingabefeld + Liste angezeigt.

Nach erfolgreichem Scan (BC/QR erkannt):

| Ergebnis | Anzeige | Farbe | Dauer |
|---|---|---|---|
| Erfolgreich freigegeben | Bestätigungstext | 🟢 Grün | `<einstellbar>` Sek. (Default: 5) |
| Bereits freigegeben | Hinweistext | 🟡 Gelb | `<einstellbar>` Sek. |
| Nicht bekannt | Fehlertext | 🔴 Rot | `<einstellbar>` Sek. |

Nach Ablauf der Anzeigezeit → Kamerabild ist wieder aktiv.

**Abbrechen-Button** → wechselt zurück in den Eingabe-Modus (Eingabefeld + Liste).

---

### 9.6 Abrechnung / Rückgabe (Haupt-App)

#### Einstieg — Verkäufer-Selektion

Identisches AutoComplete-Suchfeld + Verkäufer-Liste wie bei der Artikelannahme (7.3).

**Unterschied:** Es muss **exakt ein** Verkäufer selektiert werden — kein „Anlegen"-Button.

| Eingabe | Verhalten |
|---|---|
| (leer) | Alle Verkäufer in der Liste |
| Text eingegeben | Filtert nach Verkäufer-ID, Vorname, Nachname |
| Genau 1 Treffer + ENTER **oder** Klick auf Verkäufer | Wechsel zur Abrechungs-Ansicht |
| Mehr als 1 Treffer + ENTER | Keine Aktion |

Die Seite funktioniert als **Wizard**: Selektion wird ausgeblendet, Abrechnungs-Ansicht eingeblendet. In der Abrechnungs-Ansicht gibt es ein **„Zurück"**-Element zur Selektion.

#### Abrechnungs-Ansicht

**Kopfzeile (einstufig, gleiche Zeile):**

```
[Vorname Nachname]  [Anschrift, PLZ Ort]        [Drucken] [Zurückgeben] [Abrechnen]
```

**Button-Regeln:**

| Button | Aktiv wenn |
|---|---|
| **Drucken** | Immer aktiv |
| **Zurückgeben** | Mindestens 1 Artikel noch „Im Verkauf" |
| **Abrechnen** | Mindestens 1 Artikel wurde freigegeben **UND** alle freigegebenen Artikel sind entweder Verkauft oder Zurückgegeben (kein Artikel mehr „offen im Verkauf") |

**Kennzahlen-Kacheln (unter der Kopfzeile):**

```
┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│  Offene Artikel     │  │  Verkaufte Artikel   │  │  Umsatz          │
│  (noch im Verkauf)  │  │                      │  │  (verkaufte Art.)│
└─────────────────────┘  └──────────────────────┘  └──────────────────┘
```

**Artikelliste** (darunter) — alle Artikel dieses Verkäufers (wie Artikelübersicht 7.1, gefiltert auf diesen Verkäufer).

---

#### Zurückgeben-Popup

Identisch zum **Artikel-Freigeben-Popup** (7.5) — gleicher Aufbau, gleiche Kamera/Eingabe-Modi, gleiche Scan-Feedback-Logik.

**Einziger Unterschied:** Statt `freigegebenAm` wird `rückgegebenAm = jetzt` gesetzt.

---

#### Abrechnen-Popup

Auflistung der Abrechungsposten:

```
Umsatz (Summe verkaufter Artikel)                        XX,XX €
Provision (Umsatz × Verkäufer.provision %)             − XX,XX €
────────────────────────────────────────────────────────────────
Auszahlung an Verkäufer                                  XX,XX €
```

> Maßgeblich ist `Verkäufer.provision` — das eigene Feld der Verkäufer-Entität, nicht der aktuell zugewiesene Type-Wert.

Klick auf **„Buchen"** → `abgerechnetAm = jetzt` wird am Verkäufer gesetzt.

---

## 10. Offene Fragen / Klärungsbedarf

| # | Frage | Status |
|---|---|---|
| 1 | Wie genau funktioniert der Kassenvorgang beim **Verkauf**? Scanner, manuelle Eingabe, oder beides? | ✅ Beides: USB-Scanner (Tastaturemulation) + Kamera-Scan via Button |
| 2 | Gibt es eine maximale Artikel-Anzahl pro Verkäufer? | ✅ Keine harte Grenze — de facto unbegrenzt durch automatisches Nummernblock-Nachrücken |
| 3 | Sollen Marken/Kategorien **Freitext** bleiben oder aus der verwalteten Liste gewählt werden müssen? | ✅ AutoComplete + Freitext möglich; neuer Wert per Popup bestätigen |
| 4 | Welche **Einstellungen** soll der Admin in der Haupt-App konfigurieren können? | ✅ Einstellungen-Seite vorhanden: `suchDebounceMs` (Default 800 ms) und `scannerPauseMs` (Default 3 000 ms). Nummernblock-Einstellungen nur in Voranmelde-App. |
| 5 | Soll die Voranmelde-App **Mehrsprachigkeit** unterstützen? | ✅ Ja — DE + EN via ngx-translate |
| 6 | Gibt es ein **Provisionssystem** — d. h. unterschiedliche Konditionen je nach Verkäufer-Type? | ✅ Ja, via Verkäufer-Type |
| 7 | Soll die Haupt-App **offline-fähig** sein (z. B. bei schlechtem WLAN am Basar)? | ✅ Ja — lokales LAN, kein Internetzugang; alles muss im Bundle sein |
| 8 | Wie lange soll das Scan-Ergebnis im Kamera-Modus angezeigt werden? | ✅ Konfigurierbar, Default 5 Sekunden |
| 9 | Kann der Anwender im Artikeleingabe-Wizard auch Artikel **löschen** die noch nicht gespeichert sind? | ✅ Ja — Löschen-Button pro Eintrag in der Session-Liste; keine DB-Auswirkung |
| 10 | Soll beim Artikel-Freigeben-Popup der Scan-Feedback-Ton oder visuelle Signale (Vibration auf Mobile) geben? | ✅ Beides — Ton via Web Audio API + Vibration via Navigator.vibrate() |
