# Lastenheft — Bazaar Suite

**Version:** 0.3  
**Datum:** 2026-06-14  
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
- **Einstellungen (Admin)** — systemweite Parameter

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

**Preis-Buttons (nach erfolgreicher Erkennung):**
- **Button 1 — Preis** (immer vorhanden, da Pflichtfeld)
- **Button 2 — Alternativ-Preis** (nur sichtbar/aktiv wenn `alternativPreis` gesetzt)

Klick auf einen Preis-Button → Artikel landet im **Warenkorb**, Eingabefeld leert sich, Infobereich zeigt: *„Nächster Artikel …"*

#### Warenkorb

- Liste aller hinzugefügten Artikel der aktuellen Transaktion
- Jeder Eintrag kann einzeln **gelöscht** werden
- Der Warenkorb wird **nicht** persistent in der DB gespeichert — nur die finale Buchung

#### Buchung / Bezahlung

1. Kassierer klickt **„BUCHEN"**
2. Popup öffnet sich:
   - Gesamtbetrag (Summe aller Warenkorb-Artikel)
   - Eingabefeld: „Betrag erhalten"
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

- Admin importiert eine JSON-ASCII-Datei
- **Upsert-Logik:** Existiert ein Verkäufer bereits (anhand der ID), wird er **inkl. aller Artikel vollständig gelöscht** und dann **neu angelegt**
- Artikel, die manuell in der Haupt-App angelegt wurden, bleiben unberührt (kein Import-Bezug)

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

#### Nur Admin
- **Marken-Verwaltung** — Übersicht, Hinzufügen, Ändern; **exportierbar + importierbar**
- **Kategorie-Verwaltung** — Übersicht, Hinzufügen, Ändern; **exportierbar + importierbar**
- **Verkäufer-Verwaltung** — Übersicht, Hinzufügen, Ändern (inkl. Einladungs-Link)
- **Verkäufer-Type-Verwaltung** — Übersicht, Hinzufügen, Ändern
- **Artikelverwaltung (nur Übersicht)** — Admin sieht alle Artikel aller Verkäufer
- **Einstellungen** — Nummernblock-Parameter, System-Einstellungen

#### Verkäufer
- **Profil** — eigene Stammdaten einsehen und bearbeiten
- **Artikelverwaltung** — eigene Artikel: Übersicht, Hinzufügen, Ändern
- **Nummernblock-Übersicht** — zugewiesene Blöcke einsehen (read-only)

### 4.6 Export

- Admin erstellt einen Export als **JSON-ASCII-Datei**
- Enthält alle Verkäufer mit Profil + Artikelliste
- Wird manuell in die Haupt-App importiert (Stichtag = Basar-Morgen)

---

## 5. Technische Rahmenbedingungen

### 5.1 Offline-Fähigkeit (Haupt-App)

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

## 6. Gemeinsame Anforderungen

### 6.1 Marken & Kategorien (Synchronisierung)
- Marken und Kategorien können in der Voranmelde-App **exportiert** und in die Haupt-App **importiert** werden (und umgekehrt)
- Ziel: konsistente Stammdaten in beiden Systemen

### 6.2 Marken & Kategorien — AutoComplete-Verhalten

In **beiden Apps** gilt für die Felder Marke und Kategorie:

- **AutoComplete-Dropdown** öffnet sich bereits beim **Anklicken des Feldes** (kein Mindest-Zeichen-Eingabe nötig)
- Freie Texteingabe möglich — Anwender kann etwas eingeben, das noch nicht existiert
- Bei unbekanntem Wert: **Popup** → *„‹XYZ› als neue Marke/Kategorie speichern?"*
  - Bestätigt: Eintrag wird direkt angelegt und ausgewählt
  - Abgebrochen: Eingabe bleibt, aber kein neuer Eintrag

### 6.3 IDs
- Alle Entitäten verwenden eine **8-stellige Unique ID** aus Groß-/Kleinbuchstaben und Zahlen (alphanumerisch, case-sensitive)

### 6.4 Verkäufer-Types
- Definieren die wirtschaftlichen Konditionen eines Verkäufers
- Werden in beiden Apps gepflegt
- Enthalten: Verkaufsprovisions-Anteil und Abgabegebühr pro Stück

---

## 7. Ablauf-Beschreibungen (UX-Flows)

### 7.1 Artikelübersicht

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
- **NEU-Button** → öffnet **Artikelanlage** (Formular: Nummer, Bezeichnung, Kategorie, Marke, Preis)
  - In der Voranmelde-App: Artikelnummer wird automatisch vorausgewählt (nächste freie Nummer)
- **Edit-Button** pro Zeile → öffnet **Artikelverwaltung** (gleiche Felder + Löschen-Button)

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

### 7.2 Verkäuferübersicht

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
[PLZ Ort]

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

### 7.3 Artikelannahme-Page (Haupt-App)

Entry-Page für den Annahme-Prozess. Besteht aus einem **AutoComplete-Suchfeld** und einer **Verkäufer-Liste** darunter.

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

### 7.4 Verkäufer-Anlage-Wizard (Haupt-App)

Zweiseitiger Wizard: **Schritt 1 — Verkäuferanlage** → **Schritt 2 — Artikelannahme**

#### Schritt 1: Verkäuferanlage

Formular mit allen Verkäufer-Feldern. Klick auf **„Weiter"** → Verkäufer wird sofort in der DB angelegt → Wizard wechselt zu Schritt 2.

Vorname/Nachname-Vorbelegung aus der Sucheingabe (Trennung am ersten Leerzeichen).

#### Schritt 2: Artikelannahme

Layout: **70 % Artikeleingabe | 30 % Übersicht**

**Artikeleingabe (links):**

Eingabefelder: Artikelnummer, Bezeichnung, Kategorie, Marke, Preis (+ weitere optionale Felder).

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

2. **Gebühr** — `Anzahl Artikel × Abgabegebühr pro Stück (aus Verkäufer-Type)`

3. **Speichern-Button** → Popup erscheint:
   - Gesamtgebühr
   - Eingabefeld: „Betrag erhalten"
   - Anzeige: **Rückgeld** (live berechnet)
   - Klick auf **„Buchen"**:
     - Alle Artikel aus der Liste werden in der DB gespeichert / aktualisiert
     - Jeder Artikel bekommt automatisch `freigegebenAm = jetzt` → sofort im Verkauf
     - **Druckdialog** startet automatisch (Artikelannahme-Liste mit QR-Code)

---

### 7.5 Artikel-Freigeben-Popup (Haupt-App)

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

### 7.6 Abrechnung / Rückgabe (Haupt-App)

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
Umsatz (Summe verkaufter Artikel)          XX,XX €
Verkäufer-Provision (Umsatz × Provision%) − XX,XX €
──────────────────────────────────────────────────
Auszahlung an Verkäufer                    XX,XX €
```

Klick auf **„Buchen"** → `abgerechnetAm = jetzt` wird am Verkäufer gesetzt.

---

## 8. Offene Fragen / Klärungsbedarf

| # | Frage | Status |
|---|---|---|
| 1 | Wie genau funktioniert der Kassenvorgang beim **Verkauf**? Scanner, manuelle Eingabe, oder beides? | ✅ Beides: USB-Scanner (Tastaturemulation) + Kamera-Scan via Button |
| 2 | Gibt es eine maximale Artikel-Anzahl pro Verkäufer? | ✅ Keine harte Grenze — de facto unbegrenzt durch automatisches Nummernblock-Nachrücken |
| 3 | Sollen Marken/Kategorien **Freitext** bleiben oder aus der verwalteten Liste gewählt werden müssen? | ✅ AutoComplete + Freitext möglich; neuer Wert per Popup bestätigen |
| 4 | Welche **Einstellungen** soll der Admin in der Haupt-App konfigurieren können? | ✅ Aktuell keine — Nummernblock-Einstellungen nur in Voranmelde-App |
| 5 | Soll die Voranmelde-App **Mehrsprachigkeit** unterstützen? | 🔲 Offen |
| 6 | Gibt es ein **Provisionssystem** — d. h. unterschiedliche Konditionen je nach Verkäufer-Type? | ✅ Ja, via Verkäufer-Type |
| 7 | Soll die Haupt-App **offline-fähig** sein (z. B. bei schlechtem WLAN am Basar)? | ✅ Ja — lokales LAN, kein Internetzugang; alles muss im Bundle sein |
| 8 | Wie lange soll das Scan-Ergebnis im Kamera-Modus angezeigt werden? | ✅ Konfigurierbar, Default 5 Sekunden |
| 9 | Kann der Anwender im Artikeleingabe-Wizard auch Artikel **löschen** die noch nicht gespeichert sind? | 🔲 Offen |
| 10 | Soll beim Artikel-Freigeben-Popup der Scan-Feedback-Ton oder visuelle Signale (Vibration auf Mobile) geben? | 🔲 Offen |
