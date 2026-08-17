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

In der Cloud wird SSL vom Hosting-Anbieter übernommen. Im Inselbetrieb wird SSL durch einen **nginx-Reverse-Proxy** als eigenem Docker-Service terminiert. Das .NET-Backend selbst bleibt HTTP-only — kein Code-Change an der Anwendung.

Das bestehende `docker-compose.yml` (Dev-Umgebung, localhost, `ng serve`) bleibt unverändert. Der Insel-Betrieb verwendet ein **docker-compose-Overlay** (`docker-compose.local.yml`), das zwei Dinge ergänzt: den nginx-Service **und** ein Production-Image des Frontends.

**Frontend produktiv als statische Dateien:** Der Dev-Server `ng serve` wird im Insel-Betrieb nicht verwendet. Stattdessen erzeugt ein Multi-Stage-Build `ng build --configuration production`, und nginx liefert das Ergebnis direkt aus dem Dateisystem aus — kein Proxy auf einen Node-Prozess. Damit gibt es produktiv genau einen Origin: nginx. Das ist der Grund, warum das Backend keine CORS-Policy in `Production` braucht (siehe [BPROJ-S02](BPROJ-S02-dotnet-api-anlegen.md) AC-6).

**Zertifikat-Strategie:** `mkcert` erzeugt ein lokal vertrauenswürdiges Zertifikat. Das Root-Zertifikat wird einmalig auf dem Server-Rechner und auf jedem LAN-Endgerät installiert — danach keine Browser-Warnung mehr.

```
Browser (HTTPS :443)
        │
        ▼
┌─────────────────────────────────┐
│  nginx        :443              │  ← SSL-Terminierung, ein Origin
│  ├── /        statische Dateien │  ← Production-Build, aus Volume
│  └── /api/*   Proxy             │
└──────────────┬──────────────────┘
               │  intern HTTP (Docker-Netz)
               ▼
            backend
            (:5000)
```

## Scope

**In Scope:** `docker-compose.local.yml` mit nginx-Service und Frontend-Production-Image, `frontend/Dockerfile` (Multi-Stage-Build), `nginx/nginx.conf` (SSL-Terminierung, statische Dateien + `/api/*`-Proxy), `nginx/certs/` (gitignored, von mkcert befüllt), `.env.example`-Eintrag für den Insel-Hostnamen, `docs/insel-deployment.md` mit mkcert-Einrichtungsanleitung.

**Out of Scope:** Let's Encrypt / ACME-Automatisierung, Public-Domain-Zertifikate, Certificate Pinning, HSTS-Preloading.

## Dateistruktur

```
docker-compose.local.yml         ← Overlay für Inselbetrieb
frontend/
└── Dockerfile                   ← Multi-Stage: ng build --configuration production
nginx/
├── nginx.conf                   ← statische Dateien + /api-Proxy
└── certs/                       ← .gitignore-d
    ├── bazaar.pem               ← von mkcert generiert
    └── bazaar-key.pem           ← von mkcert generiert
docs/
└── insel-deployment.md          ← Einrichtungsanleitung
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine `docker-compose.local.yml` bereitstellen, die als Overlay zum Basis-`docker-compose.yml` einen Service `nginx` ergänzt und den Service `frontend` auf das Production-Image umstellt (kein `ng serve`).
- [ ] **AC-1b** — THE SYSTEM SHALL ein `frontend/Dockerfile` als Multi-Stage-Build bereitstellen, das `ng build --configuration production` ausführt und den Build-Output in ein von nginx gemountetes Volume legt.
- [ ] **AC-2** — WHEN `docker compose -f docker-compose.yml -f docker-compose.local.yml up` ausgeführt wird, THEN SHALL nginx auf Port 443 lauschen und alle HTTPS-Requests entgegennehmen.
- [ ] **AC-3** — THE SYSTEM SHALL nginx so konfigurieren, dass Requests an `/api/*` an `http://backend:5000` weitergeleitet werden und alle übrigen Requests aus dem statischen Build-Output bedient werden; unbekannte Pfade SHALL auf `index.html` fallen (Angular-Client-Routing).
- [ ] **AC-4** — THE SYSTEM SHALL nginx so konfigurieren, dass das Zertifikat und der Key aus dem gemounteten Pfad `/etc/nginx/certs/bazaar.pem` bzw. `/etc/nginx/certs/bazaar-key.pem` gelesen werden.
- [ ] **AC-5** — THE SYSTEM SHALL den Pfad `nginx/certs/` in `.gitignore` eintragen, sodass Zertifikatsdateien nicht ins Repository gelangen.
- [ ] **AC-6** — THE SYSTEM SHALL `.env.example` um die Variable `LOCAL_HOSTNAME` ergänzen. Eine CORS-Variable SHALL **nicht** eingeführt werden — Frontend und API teilen im Insel-Betrieb denselben Origin (siehe [BPROJ-S02](BPROJ-S02-dotnet-api-anlegen.md) AC-6).
- [ ] **AC-7** — WHEN ein Browser auf einem LAN-Gerät (nicht localhost) die App über `https://<LOCAL_HOSTNAME>` öffnet und das mkcert-Root-Zertifikat installiert ist, THEN SHALL kein Sicherheits-Warning erscheinen und `getUserMedia()` SHALL ohne Fehler starten.
- [ ] **AC-8** — THE SYSTEM SHALL eine `docs/insel-deployment.md` bereitstellen, die folgende Schritte beschreibt: (1) mkcert installieren, (2) Root-CA erzeugen und ins System installieren, (3) Zertifikat für Hostname/IP generieren, (4) Root-CA auf LAN-Endgeräten importieren (Android, iOS, Windows), (5) `docker compose`-Startbefehl für den Inselbetrieb.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S03 | Docker Compose Basis muss existieren; das Overlay setzt die Services `frontend`, `backend` und `db` voraus |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #ssl #https #nginx #docker #mkcert #inselbetrieb #kamera #secure-context
