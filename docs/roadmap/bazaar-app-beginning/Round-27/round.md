# Round 27 — Einstellungen: Benutzerverwaltung

## Liefert

Die Verwaltung der App-Benutzer (Admin/Kassenpersonal) — das letzte Häppchen der
Einstellungen-Seite.

## Umfang

- Bereich Benutzerverwaltung (Komponente `user-management`): Tabelle + Dialog zum
  Anlegen, Rolle ändern, Passwort zurücksetzen, Löschen.
- Backend: Endpoints `GET/POST /api/users` (admin), `PUT/DELETE /api/users/{id}`
  (admin).
- Letzter Admin nicht löschbar und nicht degradierbar (`409`).
- Kein Self-Service-Passwort-Reset (kein Mailserver) — Reset ausschließlich durch einen
  Admin über diesen Bereich.
- Nutzt die in Epic_Login angelegten `User`-/`Role`-Bausteine (kein neues Auth-Modell).

## Nicht enthalten

- Der Login-Vorgang selbst und Passwortregeln — bereits in Round 10 umgesetzt.

## Referenzen

- [Epic_Einstellungen](../../requirements/bazaar-app/epics/Epic_Einstellungen/epic.md)
- [Epic_Login](../../requirements/bazaar-app/epics/Epic_Login/epic.md)

## Voraussetzung

Setzt voraus, dass Login (User-/Role-Modell, Auth-Endpoints) bereits existiert.
