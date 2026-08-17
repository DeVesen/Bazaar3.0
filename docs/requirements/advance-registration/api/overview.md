---
status: reviewed
reviewed-date: 2026-08-17
---

# API-Übersicht — Voranmelde-App

Gesamtindex aller Endpoints. Verbindliche Details stehen in den verlinkten
Ressourcen-Dateien, die Querschnitts-Regeln (Auth-Stufen, Fehlerform,
Pagination, Sortierung, Löschsemantik) einmalig in
[`cross-cutting.md`](cross-cutting.md).

**Backend:** .NET 10 Minimal API · **Basis-Präfix:** `/api` (Ausnahme `/health`)

---

## Auth-Stufen

| Stufe | Bedeutung |
|---|---|
| `public` | Kein Token nötig |
| `authenticated` | Gültiges Access-Token, Rolle egal |
| `admin` | Access-Token mit `role`-Claim `admin`, sonst `403` |

---

## Alle Endpoints

### Öffentlich

| Endpoint | Auth | Datei |
|---|---|---|
| `GET /health` | `public` | [public.md](public.md) — Liveness, ohne Datenbankprüfung |
| `GET /health/ready` | `public` | [public.md](public.md) — Readiness, mit Datenbankprüfung |
| `GET /api/public/info` | `public` | [public.md](public.md) |
| `POST /api/auth/login` | `public` | [auth.md](auth.md) |
| `POST /api/auth/register` | `public` | [auth.md](auth.md) |
| `POST /api/auth/refresh` | `public` | [auth.md](auth.md) |
| `POST /api/auth/set-password` | `public` | [auth.md](auth.md) |

### Eigene Daten

| Endpoint | Auth | Datei |
|---|---|---|
| `GET /api/home/seller` | `authenticated` | [home.md](home.md) |
| `GET /api/profile` | `authenticated` | [profile.md](profile.md) |
| `PUT /api/profile` | `authenticated` | [profile.md](profile.md) |
| `PUT /api/profile/email` | `authenticated` | [profile.md](profile.md) |
| `PUT /api/profile/password` | `authenticated` | [profile.md](profile.md) |
| `DELETE /api/profile` | `authenticated` | [profile.md](profile.md) |
| `GET /api/articles/mine` | `authenticated` | [articles.md](articles.md) |
| `POST /api/articles` | `authenticated` | [articles.md](articles.md) |
| `PUT /api/articles/{id}` | `authenticated` | [articles.md](articles.md) |
| `DELETE /api/articles/{id}` | `authenticated` | [articles.md](articles.md) |
| `GET /api/blocks/mine` | `authenticated` | [blocks.md](blocks.md) |

### Stammdaten (Lesen und Anlegen für alle)

| Endpoint | Auth | Datei |
|---|---|---|
| `GET /api/brands` | `authenticated` | [master-data.md](master-data.md) |
| `POST /api/brands` | `authenticated` | [master-data.md](master-data.md) |
| `PUT /api/brands/{id}` | `admin` | [master-data.md](master-data.md) |
| `DELETE /api/brands/{id}` | `admin` | [master-data.md](master-data.md) |
| `GET /api/categories` | `authenticated` | [master-data.md](master-data.md) |
| `POST /api/categories` | `authenticated` | [master-data.md](master-data.md) |
| `PUT /api/categories/{id}` | `admin` | [master-data.md](master-data.md) |
| `DELETE /api/categories/{id}` | `admin` | [master-data.md](master-data.md) |

### Admin

| Endpoint | Auth | Datei |
|---|---|---|
| `GET /api/home/admin` | `admin` | [home.md](home.md) |
| `GET /api/articles` | `admin` | [articles.md](articles.md) |
| `GET /api/articles/{id}` | `admin` | [articles.md](articles.md) |
| `GET /api/sellers` | `admin` | [sellers.md](sellers.md) |
| `POST /api/sellers` | `admin` | [sellers.md](sellers.md) |
| `PUT /api/sellers/{id}` | `admin` | [sellers.md](sellers.md) |
| `DELETE /api/sellers/{id}` | `admin` | [sellers.md](sellers.md) |
| `POST /api/sellers/{id}/invite` | `admin` | [sellers.md](sellers.md) |
| `GET /api/blocks/next-free` | `admin` | [blocks.md](blocks.md) |
| `POST /api/sellers/{id}/blocks` | `admin` | [blocks.md](blocks.md) |
| `DELETE /api/sellers/{id}/blocks/{blockId}` | `admin` | [blocks.md](blocks.md) |
| `GET /api/seller-types` | `admin` | [seller-types.md](seller-types.md) |
| `POST /api/seller-types` | `admin` | [seller-types.md](seller-types.md) |
| `PUT /api/seller-types/{id}` | `admin` | [seller-types.md](seller-types.md) |
| `DELETE /api/seller-types/{id}` | `admin` | [seller-types.md](seller-types.md) |
| `GET /api/settings` | `admin` | [settings.md](settings.md) |
| `PUT /api/settings` | `admin` | [settings.md](settings.md) |
| `GET /api/export` | `admin` | [export.md](export.md) |

**43 Endpoints** in 12 Ressourcen-Dateien.

---

## Dateien

| Datei | Inhalt |
|---|---|
| [cross-cutting.md](cross-cutting.md) | Pfad-Konventionen, Auth-Stufen, `ProblemDetails`, Status-Codes, Pagination, Sortierung, Löschsemantik, Ownership, UI-Feedback |
| [auth.md](auth.md) | Login, Registrierung, Token-Refresh, Invite-Passwort |
| [public.md](public.md) | Termine + Default-Konditionen + Info-Text ohne Auth, Health-Check |
| [home.md](home.md) | Dashboard-Kennzahlen Verkäufer und Admin |
| [profile.md](profile.md) | Eigene Stammdaten, Zugangsdaten, Account-Löschung |
| [articles.md](articles.md) | Artikel-CRUD (eigene) und Admin-Readonly-Sicht |
| [sellers.md](sellers.md) | Verkäufer-Verwaltung durch den Admin, Einladungs-Links |
| [blocks.md](blocks.md) | Nummernblöcke — Vergabe, Vorschlag, Löschsperre, Auto-Erweiterung |
| [master-data.md](master-data.md) | Marken und Kategorien (endpoint-seitig identisch) |
| [seller-types.md](seller-types.md) | Verkäufer-Typen und Konditionen |
| [settings.md](settings.md) | Systemweite Konfiguration |
| [export.md](export.md) | JSON-Export für die Haupt-App |

---

## Zuordnung Epic → API-Datei

| Epic | API-Datei(en) |
|---|---|
| [Epic_Projektanlage](../epics/Epic_Projektanlage/epic.md) | [public.md](public.md) (`/health`) |
| [Epic_App_Shell](../epics/Epic_App_Shell/epic.md) | [cross-cutting.md](cross-cutting.md), [auth.md](auth.md) |
| [Epic_Login](../epics/Epic_Login/epic.md) | [auth.md](auth.md), [public.md](public.md) |
| [Epic_Home_Verkaeufer](../epics/Epic_Home_Verkaeufer/epic.md) | [home.md](home.md) |
| [Epic_Home_Admin](../epics/Epic_Home_Admin/epic.md) | [home.md](home.md) |
| [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) | [articles.md](articles.md) |
| [Epic_Alle_Artikel](../epics/Epic_Alle_Artikel/epic.md) | [articles.md](articles.md) |
| [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) | [sellers.md](sellers.md), [blocks.md](blocks.md) |
| [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) | [seller-types.md](seller-types.md) |
| [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md) | [blocks.md](blocks.md) |
| [Epic_Marken](../epics/Epic_Marken/epic.md) | [master-data.md](master-data.md) |
| [Epic_Kategorien](../epics/Epic_Kategorien/epic.md) | [master-data.md](master-data.md) |
| [Epic_Profil](../epics/Epic_Profil/epic.md) | [profile.md](profile.md) |
| [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) | [settings.md](settings.md) |
| [Epic_Export](../epics/Epic_Export/epic.md) | [export.md](export.md) |
| [Epic_Countdown_Widget](../epics/Epic_Countdown_Widget/epic.md) | [public.md](public.md) |

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #overview #index #endpoints #voranmelde-app
