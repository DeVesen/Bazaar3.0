---
id: BPROJ-S05
status: draft
depends-on: [BPROJ-S03]
---

# Story: SSL/HTTPS für den Inselbetrieb

## Ziel

Ein Betreiber startet die Bazaar-App im lokalen LAN (Inselbetrieb) über HTTPS, sodass der Browser auf allen LAN-Geräten den Kamerazugriff (`getUserMedia`) ohne Sicherheitswarnung erlaubt.

## Kontext

Der Browser erlaubt `getUserMedia()` (Kamera für Barcode-Scanner) nur in einem **Secure Context**. `localhost` gilt automatisch als sicher — jede andere Adresse (LAN-IP, lokaler Hostname) erfordert HTTPS. Da die Bazaar-App im LAN auf Tablets und weiteren Endgeräten geöffnet wird, ist HTTPS im Inselbetrieb zwingend.

In der Cloud wird SSL vom Hosting-Anbieter übernommen. Im Inselbetrieb wird SSL durch einen **nginx-Reverse-Proxy** als eigenem Docker-Service terminiert. Die Angular-App und das .NET-Backend selbst bleiben HTTP-only — kein Code-Change an den Anwendungen.

Das bestehende `docker-compose.yml` (Dev-Umgebung, localhost) bleibt unverändert. Der Insel-Betrieb verwendet ein **docker-compose-Overlay** (`docker-compose.local.yml`), das den nginx-Service ergänzt.

**Zertifikat-Strategie:** `mkcert` erzeugt ein lokal vertrauenswürdiges Zertifikat. Das Root-Zertifikat wird einmalig auf dem Server-Rechner und auf jedem LAN-Endgerät installiert — danach keine Browser-Warnung mehr.

```
Browser (HTTPS :443)
        │
        ▼
┌───────────────┐
│  nginx        │  ← SSL-Terminierung
│  port 443     │
└───────┬───────┘
        │  intern HTTP (Docker-Netz)
   ┌────┴────┐
   │         │
   ▼         ▼
frontend   backend
(:4200)    (:5000)
```

## Scope

**In Scope:** `docker-compose.local.yml` mit nginx-Service, `nginx/nginx.conf` (SSL-Terminierung + Proxy), `nginx/certs/` (gitignored, von mkcert befüllt), CORS-Erweiterung im Backend für den HTTPS-Origin, `.env.example`-Einträge für Insel-Konfiguration, `docs/insel-deployment.md` mit mkcert-Einrichtungsanleitung.

**Out of Scope:** Let's Encrypt / ACME-Automatisierung, Public-Domain-Zertifikate, Certificate Pinning, HSTS-Preloading.

## Dateistruktur

```
docker-compose.local.yml         ← Overlay für Inselbetrieb
nginx/
├── nginx.conf                   ← Proxy-Konfiguration
└── certs/                       ← .gitignore-d
    ├── bazaar.pem               ← von mkcert generiert
    └── bazaar-key.pem           ← von mkcert generiert
docs/
└── insel-deployment.md          ← Einrichtungsanleitung
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine `docker-compose.local.yml` bereitstellen, die als Overlay zum Basis-`docker-compose.yml` exakt einen zusätzlichen Service `nginx` definiert.
- [ ] **AC-2** — WHEN `docker compose -f docker-compose.yml -f docker-compose.local.yml up` ausgeführt wird, THEN SHALL nginx auf Port 443 lauschen und alle HTTPS-Requests entgegennehmen.
- [ ] **AC-3** — THE SYSTEM SHALL nginx so konfigurieren, dass Requests an `/api/*` an `http://backend:5000` weitergeleitet werden; alle übrigen Requests gehen an `http://frontend:4200`.
- [ ] **AC-4** — THE SYSTEM SHALL nginx so konfigurieren, dass das Zertifikat und der Key aus dem gemounteten Pfad `/etc/nginx/certs/bazaar.pem` bzw. `/etc/nginx/certs/bazaar-key.pem` gelesen werden.
- [ ] **AC-5** — THE SYSTEM SHALL den Pfad `nginx/certs/` in `.gitignore` eintragen, sodass Zertifikatsdateien nicht ins Repository gelangen.
- [ ] **AC-6** — THE SYSTEM SHALL im .NET-Backend die CORS-Konfiguration um den per Environment-Variable konfigurierbaren HTTPS-Origin (`CORS_ORIGIN_LOCAL`) erweitern, sodass Requests vom nginx-HTTPS-Frontend akzeptiert werden.
- [ ] **AC-7** — THE SYSTEM SHALL `.env.example` um die Variablen `LOCAL_HOSTNAME` und `CORS_ORIGIN_LOCAL` ergänzen.
- [ ] **AC-8** — WHEN ein Browser auf einem LAN-Gerät (nicht localhost) die App über `https://<LOCAL_HOSTNAME>` öffnet und das mkcert-Root-Zertifikat installiert ist, THEN SHALL kein Sicherheits-Warning erscheinen und `getUserMedia()` SHALL ohne Fehler starten.
- [ ] **AC-9** — THE SYSTEM SHALL eine `docs/insel-deployment.md` bereitstellen, die folgende Schritte beschreibt: (1) mkcert installieren, (2) Root-CA erzeugen und ins System installieren, (3) Zertifikat für Hostname/IP generieren, (4) Root-CA auf LAN-Endgeräten importieren (Android, iOS, Windows), (5) `docker compose`-Startbefehl für den Inselbetrieb.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S03 | Docker Compose Basis muss existieren; das Overlay setzt die Services `frontend`, `backend` und `db` voraus |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #ssl #https #nginx #docker #mkcert #inselbetrieb #kamera #secure-context
