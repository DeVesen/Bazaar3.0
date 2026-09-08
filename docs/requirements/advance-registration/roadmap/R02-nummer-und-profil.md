---
id: ROADMAP-R02
status: draft
updated: 2026-09-08
---

# R02 — „Ich sehe meine Nummer"

**Voranmelde-App · Roadmap-Schritt 2 von 12**

## Worum es geht

Ein frisch registrierter Verkäufer bekommt automatisch seinen Nummernblock zugewiesen,
kann ihn einsehen und seinen Steckbrief pflegen. Damit hat er nach der Anmeldung zum
ersten Mal etwas Eigenes in der App.

## Umfang

- Nummernblock-Vergabe beim Registrieren: der nächste freie, zusammenhängende Block nach den
  Parametern `startNumber`, `blockSize` und `defaultBlockCount` aus [`spec.md`](../spec.md) §6
  (in diesem Schritt noch aus den R01-Seeds)
- Entität [`nummernblock`](../entities/nummernblock.md) samt Migration
- [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md) vollständig — Seite
  „Konto → Nummernblöcke", read-only, je Block die Anzeige „N Nummern · M vergeben"
  über `GET /api/blocks/mine`
- [Epic_Profil](../epics/Epic_Profil/epic.md) **nur Tab 1 (Steckbrief)** —
  `GET /api/profile` und `PUT /api/profile`, inklusive aufgelöstem `sellerType`
  (Bezeichnung, Provision, Gebühr) laut [`spec.md`](../spec.md) §11.7

## Nicht in diesem Schritt

- Profil-Tab 2 (E-Mail und Passwort ändern) und Tab 3 (Account löschen) — R07
- Blöcke nachreservieren oder löschen durch den Admin — R06
- Automatische Blockerweiterung bei vollem Block — R04
- Verkäufernummer-Karte auf der Startseite — R10

## Setzt voraus

[R01](R01-zugang.md) — Konten existieren, Registrierung läuft.

## Fertig, wenn — von Hand prüfbar

1. Ein neues Konto registrieren → die Seite „Nummernblöcke" zeigt sofort einen zugewiesenen
   Block, passend zu den Seed-Parametern (z. B. 100–109).
2. Ein zweites Konto registrieren → es bekommt den nächsten Block (110–119), keine Überschneidung.
3. Auf der Nummernblock-Seite gibt es keine Möglichkeit, etwas zu ändern oder zu beantragen.
4. Im Profil Vorname, Nachname, Ort eintragen, speichern, Seite neu laden → Werte stehen noch da.
5. Das Profil zeigt den zugewiesenen Verkäufer-Typ samt Provision und Gebühr an, ohne dass
   der Verkäufer Zugriff auf die Typen-Verwaltung hat.
6. Eine im Profil mitgesendete E-Mail-Änderung wird ignoriert — die E-Mail ändert sich nicht.

## Quellen

- [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md) · [Epic_Profil](../epics/Epic_Profil/epic.md)
- [`api/blocks.md`](../api/blocks.md) · [`api/profile.md`](../api/profile.md)
- [`spec.md`](../spec.md) §6 Nummernblock-System · §11.6 · §11.7

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #nummernblock #profil
