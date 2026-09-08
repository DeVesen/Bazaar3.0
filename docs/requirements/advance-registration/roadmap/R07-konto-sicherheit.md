---
id: ROADMAP-R07
status: draft
updated: 2026-09-08
---

# R07 — Konto-Sicherheit

**Voranmelde-App · Roadmap-Schritt 7 von 12**

## Worum es geht

Das Profil wird vollständig: Ein Nutzer ändert seine E-Mail-Adresse, ändert sein Passwort und
kann sein Konto samt aller Daten selbst löschen. Bis hierher konnte er nur seinen Steckbrief
pflegen (R02).

## Umfang

- [Epic_Profil](../epics/Epic_Profil/epic.md) **Tab 2 und Tab 3**
- `PUT /api/profile/email` — Änderung erfordert das aktuelle Passwort; kein neues Token nötig,
  da `sub` die Nutzer-ID trägt, nicht die E-Mail
- `PUT /api/profile/password` — erfordert aktuelles Passwort und Bestätigung, löscht **alle**
  Refresh-Token-Zeilen des Nutzers (alle anderen Geräte werden abgemeldet) und gibt dem
  aufrufenden Gerät ein neues Token-Paar
- `DELETE /api/profile` — löscht Konto, Artikel, Nummernblöcke und Refresh-Tokens;
  `403` für die Admin-Rolle
- Passwort-Stärke-Anzeige ([password-strength-meter](../components/password-strength-meter.md))
- Sicherheitsrelevante Rückfragen vor dem Löschen des Kontos

## Nicht in diesem Schritt

- Passwort vergessen / Reset per E-Mail (laut Epic_Login Out-of-Scope für das MVP)
- Zwei-Faktor-Authentifizierung

## Setzt voraus

[R02](R02-nummer-und-profil.md) — Profil-Tab 1 existiert. Praktisch prüfbar wird der Schritt
erst mit Artikeln und Blöcken aus [R03](R03-artikelerfassung.md), weil das Löschen des Kontos
diese mitnehmen muss.

## Fertig, wenn — von Hand prüfbar

1. E-Mail ändern ohne korrektes aktuelles Passwort → wird abgelehnt.
2. E-Mail mit korrektem Passwort ändern → Anmeldung mit der neuen Adresse funktioniert,
   mit der alten nicht mehr.
3. In Browser A das Passwort ändern, während Browser B mit demselben Konto angemeldet ist →
   Browser B fliegt beim nächsten Token-Refresh heraus, Browser A bleibt angemeldet.
4. Passwortänderung ohne korrektes aktuelles Passwort → wird abgelehnt.
5. Als Verkäufer mit Artikeln das eigene Konto löschen → nach Bestätigung ist man abgemeldet,
   die Anmeldung schlägt fehl, und in der Admin-Verkäuferliste ist das Konto verschwunden;
   die Nummern des Blocks sind wieder frei.
6. Als Admin den Tab „Account löschen" aufrufen → Löschen ist nicht möglich.

## Quellen

- [Epic_Profil](../epics/Epic_Profil/epic.md) Abschnitte 3 und 4
- [`api/profile.md`](../api/profile.md) · [`api/auth.md`](../api/auth.md)
- [components/profil-page.md](../components/profil-page.md) ·
  [components/password-strength-meter.md](../components/password-strength-meter.md)

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #profil #sicherheit
