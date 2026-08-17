---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API-Übersicht — Haupt-App

Gesamtindex aller Endpoints. Verbindliche Details stehen in den verlinkten
Ressourcen-Dateien, die Querschnitts-Regeln (Verb-Muster, Auth-Stufen, Fehlerform,
Pagination, Transaktionen, Sperrregeln) einmalig in
[`cross-cutting.md`](cross-cutting.md).

**Backend:** .NET 10 Minimal API · **Basis-Präfix:** `/api` (Ausnahme `/health`)

---

## Auth-Stufen

| Stufe | Bedeutung |
|---|---|
| `public` | Kein Token nötig |
| `authenticated` | Gültiges Access-Token, Rolle egal |
| `admin` | Access-Token mit `role`-Claim `admin`, sonst `403` |

Fachliche Zuordnung → Rechte-Matrix in [`spec.md`](../spec.md) Abschnitt 4.1.

---

## Alle Endpoints

### Öffentlich

| Endpoint | Auth | Datei |
|---|---|---|
| `GET /health` | `public` | — (BPROJ-S02; **ohne** `/api`-Präfix, ohne Auth, liefert `{ "status": "healthy" }`) |
| `POST /api/auth/login` | `public` | [auth.md](auth.md) |

### Konto

| Endpoint | Auth | Datei |
|---|---|---|
| `PUT /api/auth/password` | `authenticated` | [auth.md](auth.md) |

Es gibt **kein** `POST /api/auth/logout` und keinen Refresh-Endpoint — ein Access-Token, 16 Stunden, Logout löscht nur den `localStorage` ([Epic_Login](../epics/Epic_Login/epic.md)).

### Verkäufer

| Endpoint | Auth | Datei |
|---|---|---|
| `GET /api/sellers` | `authenticated` | [sellers.md](sellers.md) |
| `GET /api/sellers/search` | `authenticated` | [sellers.md](sellers.md) |
| `POST /api/sellers` | `authenticated` | [sellers.md](sellers.md) |
| `PUT /api/sellers/{id}` | `authenticated` | [sellers.md](sellers.md) |
| `DELETE /api/sellers/{id}` | `authenticated` | [sellers.md](sellers.md) |
| `GET /api/sellers/{id}/articles` | `authenticated` | [sellers.md](sellers.md) |

### Abrechnung

| Endpoint | Auth | Datei |
|---|---|---|
| `GET /api/sellers/{id}/settlement` | `authenticated` | [settlement.md](settlement.md) |
| `POST /api/sellers/{id}/settlement` | `authenticated` | [settlement.md](settlement.md) |
| `DELETE /api/sellers/{id}/settlement` | `admin` | [settlement.md](settlement.md) |
| `PUT /api/articles/{id}/return` | `authenticated` | [settlement.md](settlement.md) |

### Artikel

| Endpoint | Auth | Datei |
|---|---|---|
| `GET /api/articles` | `authenticated` | [articles.md](articles.md) |
| `GET /api/articles/by-number/{number}` | `authenticated` | [articles.md](articles.md) |
| `GET /api/articles/next-number` | `authenticated` | [articles.md](articles.md) |
| `PUT /api/articles/{id}` | `authenticated` | [articles.md](articles.md) |
| `PUT /api/articles/{id}/timestamps` | `admin` | [articles.md](articles.md) |
| `DELETE /api/articles/{id}` | `admin` | [articles.md](articles.md) |

### Vorgänge (atomar, siehe [cross-cutting.md](cross-cutting.md) Abschnitt 6)

| Endpoint | Auth | Datei |
|---|---|---|
| `POST /api/intake` | `authenticated` | [intake.md](intake.md) |
| `POST /api/release` | `authenticated` | [release.md](release.md) |
| `POST /api/sales` | `authenticated` | [sales.md](sales.md) |
| `POST /api/sales/undo` | `authenticated` | [sales.md](sales.md) |

### Stammdaten

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
| `GET /api/seller-types` | `authenticated` | [seller-types.md](seller-types.md) |
| `POST /api/seller-types` | `admin` | [seller-types.md](seller-types.md) |
| `PUT /api/seller-types/{id}` | `admin` | [seller-types.md](seller-types.md) |
| `DELETE /api/seller-types/{id}` | `admin` | [seller-types.md](seller-types.md) |

### System

| Endpoint | Auth | Datei |
|---|---|---|
| `GET /api/statistics` | `authenticated` | [statistics.md](statistics.md) |
| `GET /api/settings` | `authenticated` | [settings.md](settings.md) |
| `PUT /api/settings` | `admin` | [settings.md](settings.md) |
| `GET /api/users` | `admin` | [users.md](users.md) |
| `POST /api/users` | `admin` | [users.md](users.md) |
| `PUT /api/users/{id}` | `admin` | [users.md](users.md) |
| `DELETE /api/users/{id}` | `admin` | [users.md](users.md) |
| `POST /api/import/preview` | `admin` | [import.md](import.md) |
| `POST /api/import` | `admin` | [import.md](import.md) |

---

## Zuordnung Epic → API

| Epic | Dateien |
|---|---|
| [Epic_Login](../epics/Epic_Login/epic.md) | [auth.md](auth.md) |
| [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) | [sellers.md](sellers.md), [release.md](release.md), [settlement.md](settlement.md) |
| [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) | [seller-types.md](seller-types.md) |
| [Epic_Marken](../epics/Epic_Marken/epic.md) · [Epic_Kategorien](../epics/Epic_Kategorien/epic.md) | [master-data.md](master-data.md) |
| [Epic_Artikel](../epics/Epic_Artikel/epic.md) | [articles.md](articles.md) |
| [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) | [intake.md](intake.md), [sellers.md](sellers.md), [articles.md](articles.md) |
| [Epic_Verkauf](../epics/Epic_Verkauf/epic.md) | [sales.md](sales.md), [articles.md](articles.md) |
| [Epic_Abrechnung](../epics/Epic_Abrechnung/epic.md) | [settlement.md](settlement.md) |
| [Epic_Statistik](../epics/Epic_Statistik/epic.md) | [statistics.md](statistics.md) |
| [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) | [settings.md](settings.md), [users.md](users.md), [import.md](import.md) |
| [Epic_App_Shell](../epics/Epic_App_Shell/epic.md) | keine eigenen Endpoints — Guards und Interceptor arbeiten auf allen |
| [Epic_Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md) | keine eigenen Endpoints — druckt vorhandene Daten |
| [Epic_Projektanlage](../epics/Epic_Projektanlage/epic.md) | `GET /health` |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #overview #endpoints #haupt-app
