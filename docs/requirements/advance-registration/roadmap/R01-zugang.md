---
id: ROADMAP-R01
status: draft
updated: 2026-09-08
---

# R01 — „Ich komme rein"

**Voranmelde-App · Roadmap-Schritt 1 von 12**

## Worum es geht

Ein Verkäufer kann sich selbst registrieren und anmelden, ein Admin kann sich anmelden.
Nach der Anmeldung erreicht er die geschützten Seiten der App, ein Reload wirft ihn nicht
heraus, und Logout beendet die Sitzung sauber.

Das ist der erste Schritt mit sichtbarem Nutzen: ab hier gibt es Konten.

## Umfang

- [Epic_Login](../epics/Epic_Login/epic.md) vollständig — Login-Layout mit Info-Panel,
  Login-Formular, Selbstregistrierung, Demo-Hinweis nur in der Entwicklungsversion
- Endpoints `POST /api/auth/login`, `/register`, `/refresh` samt Token-Hülle und
  Refresh-Token-Rotation → [`api/auth.md`](../api/auth.md)
- Entitäten [`verkaeufer`](../entities/verkaeufer.md), [`refresh-token`](../entities/refresh-token.md),
  [`verkaeufer-typ`](../entities/verkaeufer-typ.md), [`einstellungen`](../entities/einstellungen.md)
  als Tabellen samt Migration
- **Seed-Daten in der Migration**, damit die Registrierung ohne Einstellungsseite funktioniert:
  ein Verkäufer-Typ als Default-Typ sowie eine Einstellungszeile mit `startNumber`, `blockSize`
  und `defaultBlockCount`. Diese Seeds werden in R09 durch die pflegbare Einstellungsseite ersetzt.
- Ein Admin-Konto als Seed, damit die Admin-Rolle überhaupt erreichbar ist
- Guards greifen: nicht angemeldet → Weiterleitung auf die Login-Seite; Logout im
  Sidebar-Footer beendet die Sitzung

## Nicht in diesem Schritt

- `POST /api/auth/set-password` und der Einladungs-Flow — gehört zu R06
- Passwort vergessen, Zwei-Faktor und alles unter „Out-of-Scope (MVP)" im Epic
- Nummernblock-Zuweisung bei der Registrierung (R02)
- Profil-Seite, Rollen-Umschalter in der Sidebar

## Setzt voraus

[R00](R00-fundament.md) — Shell, Routing, Auth-Infrastruktur, Interceptor stehen.

## Fertig, wenn — von Hand prüfbar

1. Auf der Login-Seite über „Registrieren" ein neues Konto mit E-Mail und Passwort anlegen —
   danach ist man angemeldet und landet auf der Startseite.
2. Registrierung mit derselben E-Mail ein zweites Mal → Fehlermeldung, kein zweites Konto.
3. Abmelden, wieder mit denselben Daten anmelden → funktioniert.
4. Anmeldung mit falschem Passwort → Fehlermeldung, kein Zugang.
5. Seite neu laden, während man angemeldet ist → man bleibt angemeldet.
6. Eine geschützte Route direkt in die Adressleiste tippen, ohne angemeldet zu sein →
   Weiterleitung auf die Login-Seite.
7. Mit dem Admin-Seed anmelden → die Admin-Einträge der Sidebar sind sichtbar,
   als Verkäufer nicht.

## Quellen

- [Epic_Login](../epics/Epic_Login/epic.md)
- [`api/auth.md`](../api/auth.md) · [`api/cross-cutting.md`](../api/cross-cutting.md)
- [`spec.md`](../spec.md) §4 Rollen & Rechte · §5 Registrierung & Einladung · §12.5 Demo-Hinweis

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #login #auth
