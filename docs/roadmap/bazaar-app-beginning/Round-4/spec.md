---
round: Round-4
status: geklärt
---

# Spec: Round 4 — Docker Compose & Insel-Deployment

## Fein-Spezifikation

### Ziel

Containerisierte Betriebsumgebung: `docker-compose.yml` (nur `db`, Entwicklung) plus
`docker-compose.local.yml` als Overlay für den Insel-Betrieb (Backend- + Frontend-
Container, nginx mit SSL-Terminierung, Frontend proxyt `/api/*`). Keine fachlichen
Endpoints/Seiten, keine Test-Infrastruktur.

Zwei Stories, sequenziell (BPROJ-S05 hängt fachlich von BPROJ-S03 ab — Overlay setzt das
Basis-`docker-compose.yml` voraus):

1. **BPROJ-S03** — `docker-compose.yml` mit Service `db` (Entwicklungs-DB, Frontend/
   Backend laufen auf dem Host).
2. **BPROJ-S05** — `docker-compose.local.yml`-Overlay, Production-Images, nginx mit
   mkcert-SSL, `docs/insel-deployment.md`.

### Kein Referenz-Muster in advance-registration verfügbar

Weder `docker-compose.yml` noch ein SSL/nginx-Overlay existieren bislang in
`src/advance-registration` (VPROJ-S03/S05 offenbar noch nicht umgesetzt) — dieser Plan
folgt daher ausschließlich BPROJ-S03/BPROJ-S05 direkt, ohne Abgleich gegen eine
bestehende Implementierung. Die vorhandene
[`BAR.App/Dockerfile`](../../../../src/advance-registration/frontend/BAR.App/Dockerfile)
und
[`nginx.conf.template`](../../../../src/advance-registration/frontend/BAR.App/nginx.conf.template)
der Voranmelde-App liefern nur ein **Muster für Multi-Stage-Build und Proxy-Location**,
kein SSL (die Voranmelde-App läuft cloud-seitig hinter TLS-Terminierung eines
Vorgelagerten, nicht LAN-Insel-Betrieb) — SSL/mkcert kommt in Round-4 komplett neu aus
BPROJ-S05 dazu.

### Akzeptanzkriterien

Wie in
[BPROJ-S03](../../../requirements/bazaar-app/epics/Epic_Projektanlage/stories/BPROJ-S03-docker-compose-setup.md)
AC-1 bis AC-8 und
[BPROJ-S05](../../../requirements/bazaar-app/epics/Epic_Projektanlage/stories/BPROJ-S05-ssl-insel-deployment.md)
AC-1 bis AC-11, unverändert übernommen.

### Bewusst nicht in diesem Round

Fachliche Endpoints/Seiten, Test-Infrastruktur (BPROJ-S06), Let's-Encrypt/ACME,
Public-Domain-Zertifikate, Certificate Pinning, HSTS-Preloading, Container für Frontend/
Backend in der **Entwicklung** (die laufen dort weiterhin auf dem Host).

