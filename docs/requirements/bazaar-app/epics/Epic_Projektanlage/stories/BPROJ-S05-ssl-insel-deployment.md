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

**Im Insel-Betrieb laufen alle Teile im Container** — anders als in der Entwicklung, wo nur die Datenbank containerisiert ist ([BPROJ-S03](BPROJ-S03-docker-compose-setup.md)). Hier entwickelt niemand; hier soll ein Rechner nach dem Einschalten die App bereitstellen.

**Das Frontend-Image ist der Webserver.** Ein Multi-Stage-Build baut die Angular-App und legt das Ergebnis in eine letzte Stage auf Basis von `nginx:alpine`. Dieser Container liefert die statischen Dateien aus **und** proxyt `/api/*` an das Backend. Es gibt keinen separaten nginx-Service und kein geteiltes Volume für den Build-Output.

Grund: Der Build-Output gehört ins Image, nicht in ein Laufzeit-Volume. Sonst kann ein alter Volume-Inhalt neben einem neuen Image stehen, und niemand sieht, welcher Stand tatsächlich ausgeliefert wird.

**Zertifikat-Strategie:** `mkcert` erzeugt ein lokal vertrauenswürdiges Zertifikat. Das Root-Zertifikat wird einmalig auf dem Server-Rechner und auf jedem LAN-Endgerät installiert — danach keine Browser-Warnung mehr.

```
Browser (HTTP :80)  ──301──▶  HTTPS
Browser (HTTPS :443)
        │
        ▼
┌─────────────────────────────────┐
│  frontend (nginx:alpine)  :443  │  ← SSL-Terminierung, ein Origin
│  ├── /        statische Dateien │  ← im Image, aus dem Build
│  └── /api/*   Proxy             │
└──────────────┬──────────────────┘
               │  intern HTTP (Docker-Netz)
        ┌──────┴───────┐
        ▼              ▼
     backend         db
     (:5000)      (nicht veröffentlicht)
```

## Scope

**In Scope:** `docker-compose.local.yml` als Overlay, `frontend/Dockerfile` (Multi-Stage mit `nginx:alpine` als letzter Stage), `nginx/nginx.conf.template` (SSL, statische Dateien, `/api`-Proxy, HTTP-Weiterleitung), `nginx/certs/` (gitignored, von mkcert befüllt), `.env.example`-Eintrag für den Insel-Hostnamen, `docs/insel-deployment.md` mit mkcert-Einrichtungsanleitung.

**Out of Scope:** Let's Encrypt / ACME-Automatisierung, Public-Domain-Zertifikate, Certificate Pinning, HSTS-Preloading.

## Dateistruktur

```
docker-compose.local.yml         ← Overlay für Inselbetrieb
frontend/
└── Dockerfile                   ← Multi-Stage, letzte Stage nginx:alpine
nginx/
├── nginx.conf.template          ← wird beim Start per envsubst verarbeitet
└── certs/                       ← .gitignore-d
    ├── bazaar.pem               ← von mkcert generiert
    └── bazaar-key.pem           ← von mkcert generiert
docs/
└── insel-deployment.md          ← Einrichtungsanleitung
```

## Konfiguration

**`nginx.conf.template` statt `nginx.conf`:** Das offizielle nginx-Image verarbeitet alles unter `/etc/nginx/templates/` beim Start per `envsubst`. Damit wird `server_name ${LOCAL_HOSTNAME};` zur Laufzeit gesetzt, ohne die Datei zu bearbeiten. Eine statische `nginx.conf` könnte die Variable aus `.env` nicht lesen.

| Festlegung | Wert |
|---|---|
| Basis-Image letzte Stage | `nginx:alpine` |
| Port HTTPS | `443:443` |
| Port HTTP | `80:80` — ausschließlich `301` auf `https://` |
| Zertifikat | `/etc/nginx/certs/bazaar.pem`, Key `/etc/nginx/certs/bazaar-key.pem` |
| Fallback für Client-Routing | unbekannte Pfade → `index.html` |
| `restart` (alle Insel-Services) | `unless-stopped` |
| `db`-Port | im Overlay **entfernt** |

**HTTP liefert keinen Inhalt**, auch nicht die Startseite. Niemand tippt ein Schema; ohne Weiterleitung landet das Tablet entweder auf einer nicht erreichbaren Adresse oder — schlimmer — auf einer funktionierenden HTTP-Seite, auf der die Kamera stumm bleibt.

**`restart: unless-stopped`**, damit der Basar-Rechner einen Stromausfall übersteht, ohne dass jemand `docker compose up` tippen muss.

**Der `ports`-Eintrag von `db` wird im Overlay ausdrücklich entfernt.** In der Entwicklung ist er nötig (`dotnet ef` läuft vom Host), im Insel-Betrieb hätte er nur eine Wirkung: die Datenbank im LAN erreichbar zu machen.

## Zertifikat

Das Zertifikat trägt **Hostname und LAN-IP im SAN**:

```
mkcert bazaar.local 192.168.x.y
```

Beides, weil beide Aufrufwege vorkommen: Wer den Namen nicht kennt oder wessen Gerät die Namensauflösung nicht mitmacht, tippt die IP — und bekäme bei einem Zertifikat nur auf den Namen trotz installierter Root-CA eine Warnung. Die Einrichtungsanleitung nennt beide Adressen als gültig.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine `docker-compose.local.yml` bereitstellen, die den Service `frontend` auf das Production-Image umstellt, `443:443` und `80:80` veröffentlicht, den `ports`-Eintrag von `db` entfernt und allen Services `restart: unless-stopped` gibt.
- [ ] **AC-2** — THE SYSTEM SHALL ein `frontend/Dockerfile` als Multi-Stage-Build bereitstellen, dessen letzte Stage auf `nginx:alpine` basiert und den Output von `ng build --configuration production` enthält. Ein separater nginx-Service und ein geteiltes Build-Volume SHALL **nicht** existieren.
- [ ] **AC-3** — WHEN `docker compose -f docker-compose.yml -f docker-compose.local.yml up -d` ausgeführt wird, THEN SHALL der Frontend-Container auf 443 lauschen und HTTPS-Requests entgegennehmen.
- [ ] **AC-4** — THE SYSTEM SHALL Requests an `/api/*` an `http://backend:5000` weiterleiten und alle übrigen Requests aus dem statischen Build-Output bedienen; unbekannte Pfade SHALL auf `index.html` fallen.
- [ ] **AC-5** — WHEN ein Request über HTTP auf Port 80 eintrifft, THEN SHALL das System mit `301` auf dieselbe Adresse unter `https://` antworten und **keinen** Inhalt über HTTP ausliefern.
- [ ] **AC-6** — THE SYSTEM SHALL Zertifikat und Key aus `/etc/nginx/certs/bazaar.pem` bzw. `/etc/nginx/certs/bazaar-key.pem` lesen.
- [ ] **AC-7** — THE SYSTEM SHALL `nginx/nginx.conf.template` verwenden und `${LOCAL_HOSTNAME}` beim Containerstart per `envsubst` einsetzen.
- [ ] **AC-8** — THE SYSTEM SHALL den Pfad `nginx/certs/` in `.gitignore` eintragen.
- [ ] **AC-9** — THE SYSTEM SHALL `.env.example` um `LOCAL_HOSTNAME` ergänzen. Eine CORS-Variable SHALL **nicht** eingeführt werden — Frontend und API teilen im Insel-Betrieb denselben Origin (siehe [BPROJ-S02](BPROJ-S02-dotnet-api-anlegen.md) AC-6).
- [ ] **AC-10** — WHEN ein Browser auf einem LAN-Gerät die App über `https://<LOCAL_HOSTNAME>` **oder** über die LAN-IP öffnet und das mkcert-Root-Zertifikat installiert ist, THEN SHALL kein Sicherheits-Warning erscheinen und `getUserMedia()` SHALL ohne Fehler starten.
- [ ] **AC-11** — THE SYSTEM SHALL eine `docs/insel-deployment.md` bereitstellen, die folgende Schritte beschreibt: (1) mkcert installieren, (2) Root-CA erzeugen und ins System installieren, (3) Zertifikat für **Hostname und LAN-IP** generieren, (4) Root-CA auf LAN-Endgeräten importieren (Android, iOS, Windows), (5) `docker compose`-Startbefehl für den Inselbetrieb, (6) beide gültigen Aufrufadressen nennen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S03 | Das Overlay setzt das Basis-`docker-compose.yml` und den Service `db` voraus |

Die Services `frontend` und `backend` entstehen erst mit diesem Overlay als Container — in der Entwicklung laufen sie auf dem Host.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #ssl #https #nginx #docker #mkcert #inselbetrieb #kamera #secure-context
