---
id: F-BA-009
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Verkäufer-Typen

## Index
- Überblick — Typ-Stammdaten
- 1. Tabelle — Spalten & Sortierung
- 2. Aktionen — Neu & Bearbeiten
- 3. Verhalten beim Zuweisen — Vorbelegung und Typwechsel
- 4. Auflösung beim Import — Unbekannte Typnamen
- 5. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Verkäufer-Typen
**Route:** `/seller-types`
**Sichtbar für:** Admin (Pflege) · Kassenpersonal (nur lesen)

Entity-Details → [`entities/verkaeufer-typ.md`](../../entities/verkaeufer-typ.md)
Component-Details → Tabelle: [Table](../../../../components/table/component.md)

**Ziel:** Admin pflegt Verkäufer-Typen mit Provisions- und Gebührensätzen für die automatische Abrechnungsberechnung.

**User Story:** Als Admin möchte ich Verkäufer-Typen mit Provisions- und Gebührensätzen definieren, damit die Abrechnung je Typ automatisch berechnet werden kann.

---

## Überblick

Verwaltung der Verkäufer-Typen (z. B. „Privat", „Händler", „Verein"). Typen sind **Vorlagen** für Provision und Gebühr — die Werte werden an den Verkäufer kopiert und dort vom Admin überschreibbar ([`spec.md`](../../spec.md) Abschnitte 9.6/9.7).

Das ist der bewusste Unterschied zur Voranmelde-App: Dort gibt es keinen Override, Änderungen am Typ wirken sofort live auf alle zugewiesenen Verkäufer. Hier zählt der Wert am Verkäufer, weil am Basar-Tag die Abrechnung nachvollziehbar bleiben muss — eine Typänderung um 14 Uhr darf keine bereits gedruckte Auszahlung nachträglich verändern.

---

## 1. Tabelle

→ Komponente: [Table](../../../../components/table/component.md)

**Spalten:** Name · Provision % · Gebühr € · **Verkäufer** (Anzahl zugewiesener) · Aktionen

**Sortierbare Spalten:** Name · Provision % · Gebühr € · Verkäufer (Multi-Sort per Shift+Klick)

**Default-Sortierung:** Name aufsteigend.

Keine ID-Spalte: Eine Typ-ID interessiert niemanden — anders als bei Marken, wo sie beim Import-Abgleich hilft. Der Typ wird über seinen Namen identifiziert, auch app-übergreifend (Abschnitt 4).

Die Spalte **Verkäufer** (`sellerCount`) macht vor einer Änderung sichtbar, wie viele Verkäufer betroffen sind, und ist dieselbe Zahl, die über die Löschsperre entscheidet.

---

## 2. Aktionen

Nur für die Rolle Admin sichtbar. Kassenpersonal sieht die Tabelle ohne Aktionsspalte und ohne „+ Neu".

**„+ Neu"-Button** (Seitentitel) → öffnet Popup mit:
- „Name"
- „Provision (%)"
- „Gebühr (€)"

**„Edit"-Button** pro Zeile → öffnet Popup mit denselben Feldern vorausgefüllt.

Wertebereiche werden **serverseitig** geprüft, nicht nur im Formular: `commissionRate` zwischen 0 und 100, `itemFee` nicht negativ. Ein Formular lässt sich umgehen, der Handler nicht — und eine Provision von 150 % würde die Abrechnung stillschweigend zerlegen.

---

## 3. Verhalten beim Zuweisen zu Verkäufer

Wird einem Verkäufer ein Typ zugewiesen, werden dessen Felder `salesCommission` und `feePerItem` aus dem Typ **belegt**. Maßgeblich für alle Berechnungen (Annahmegebühr, Auszahlung) sind danach die **eigenen Felder des Verkäufers**, nicht die aktuellen Werte des Typs.

**Typwechsel überschreibt.** Wechselt der Admin den Typ eines bestehenden Verkäufers, werden beide Felder mit den Werten des neuen Typs überschrieben — auch dann, wenn dort vorher ein manueller Wert stand. Die UI fragt vorher nach und nennt dabei die konkreten alten und neuen Werte.

Grund: Ein Typwechsel ist die Aussage „dieser Verkäufer hat andere Konditionen". Würde ein alter Override überleben, hätte der Wechsel keine Wirkung, und niemand könnte sehen, warum. Umgekehrt entstünden Verkäufer, deren angezeigter Typ nicht zu ihren Zahlen passt — das fällt erst bei der Auszahlung auf, und dann steht der Verkäufer davor.

**Wer darf was:** Den Typ wählen darf auch Kassenpersonal (beim Anlegen eines Verkäufers am Annahmetisch). Die Konditionen **überschreiben** darf ausschließlich der Admin; Kassenpersonal sieht sie schreibgeschützt. Rechte-Matrix → [`spec.md`](../../spec.md) Abschnitt 4.1.

**Vorbelegung beim Anlegen:** Das Formular schlägt den **am häufigsten zugewiesenen Typ** vor (die Zahl liegt mit `sellerCount` ohnehin vor). Das ist eine Vorbelegung im Formular, **keine** serverseitige Regel — der Endpoint verlangt weiterhin ein explizites `sellerTypeId`. Einen konfigurierbaren Default-Typ wie in der Voranmelde-App gibt es hier nicht: Er wäre ein weiterer Einstellungs-Parameter, der gepflegt werden muss und im Zweifel falsch steht.

---

## 4. Auflösung beim Import

Der JSON-Import aus der Voranmelde-App liefert `sellerType` als **Namen**, nicht als ID ([`import-format.md`](../../entities/import-format.md)) — eine ID aus der anderen App wäre hier bedeutungslos. Diese App löst den Namen gegen ihre eigenen Typen auf und belegt daraus die Konditionen des Verkäufers.

**Unbekannter Typname:** Der Import bricht nicht ab und legt auch nichts automatisch an. Die Import-Vorschau in [Epic_Einstellungen](../Epic_Einstellungen/epic.md) listet jeden unbekannten Typnamen mit der Anzahl betroffener Verkäufer auf und verlangt vom Admin eine Zuordnung auf einen existierenden Typ.

Kein automatisches Anlegen, weil ein Typ Provision und Gebühr trägt — die kann der Import nicht erfinden, und ein Typ mit 0 % Provision wäre ein stiller Geldverlust. Kein stilles Ersetzen durch einen Standard aus demselben Grund.

---

## 5. Backend & API

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/seller-types` | `authenticated` | Liste aller Typen inkl. `sellerCount` |
| `POST /api/seller-types` | `admin` | Legt Typ an. `409` bei bereits vergebener Bezeichnung (nach Trim, case-insensitiv), `400` bei ungültigen Wertebereichen |
| `PUT /api/seller-types/{id}` | `admin` | Aktualisiert Typ. Wirkt **nicht** rückwirkend auf bereits zugewiesene Verkäufer (Abschnitt 3) |
| `DELETE /api/seller-types/{id}` | `admin` | `409` falls noch Verkäufern zugewiesen |

**`GET` ist `authenticated`, nicht `admin`** — hier weicht die Haupt-App bewusst von der Voranmelde-App ab, wo alle vier Endpoints Admin-only sind. Der Grund: Kassenpersonal legt in der Artikelannahme neue Verkäufer an, und `sellerTypeId` ist am Verkäufer ein Pflichtfeld ([`entities/verkaeufer.md`](../../entities/verkaeufer.md)) — ohne Typenliste kann es das Feld nicht füllen. In der Voranmelde-App entsteht diese Situation nicht, weil dort kein Verkäufer andere Verkäufer anlegt.

Es gibt **keine** Löschsperre wegen eines Default-Typs (Gegenstück zu VA AC-4) — diese App kennt keinen `defaultTypeId`.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit Feldern für Name, Provision (%) und Gebühr (€) öffnen.
2. **AC-2** — WHEN ein neuer Typ gespeichert wird, THEN SHALL das System ihn in der Datenbank anlegen und in der Tabelle anzeigen.
3. **AC-3** — IF ein Typ mit einer Bezeichnung angelegt werden soll, die nach Trim und ohne Berücksichtigung der Groß-/Kleinschreibung bereits existiert, THEN SHALL das System ihn mit `409` ablehnen.
4. **AC-4** — IF `commissionRate` außerhalb von 0–100 liegt oder `itemFee` negativ ist, THEN SHALL das System die Anfrage serverseitig mit `400` ablehnen — unabhängig davon, was das Formular zulässt.
5. **AC-5** — WHEN einem Verkäufer ein Typ zugewiesen wird, THEN SHALL das System `salesCommission` und `feePerItem` des Verkäufers mit den Werten des Typs belegen.
6. **AC-6** — WHEN der Typ eines bestehenden Verkäufers gewechselt wird, THEN SHALL das System vorher einen Bestätigungsdialog mit den konkreten alten und neuen Werten anzeigen und nach Bestätigung beide Felder überschreiben — auch wenn dort ein manuell gesetzter Wert stand.
7. **AC-7** — THE SYSTEM SHALL bei der Abrechnung ausschließlich die eigenen Felder `salesCommission` und `feePerItem` des Verkäufers verwenden, nicht die aktuellen Werte des Typs.
8. **AC-8** — IF ein Verkäufer-Typ gelöscht werden soll, der noch Verkäufern zugewiesen ist, THEN SHALL das System eine Fehlermeldung anzeigen und nicht löschen.
9. **AC-9** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL das System „+ Neu", „Edit" und „Löschen" nicht rendern; ein dennoch gesendeter Schreib-Request SHALL mit `403` abgelehnt werden.
10. **AC-10** — WHEN das Formular zum Anlegen eines Verkäufers geöffnet wird, THEN SHALL das System den am häufigsten zugewiesenen Typ vorbelegen, ohne die Auswahl zu erzwingen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #verkäufer-typen #provision #gebühr #stammdaten #crud #haupt-app
