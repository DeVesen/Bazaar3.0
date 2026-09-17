---
round: Round-4
status: geplant
---

# Plan: Round 4 — Docker Compose & Insel-Deployment

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-1/plan.md](../Round-1/plan.md): `src/bazaar-app/frontend/` mit `ng build
  --configuration production` → Output landet unter `dist/bazaar-app/browser/`
  (Angular-Projektname `bazaar-app`, analog `BAR.App` → `dist/BAR.App/browser`) — genauer
  Pfad beim `Dockerfile`-Schreiben gegen die tatsächliche `angular.json` aus Round-1
  verifizieren.
- [Round-2/plan.md](../Round-2/plan.md): `src/bazaar-app/backend/Bazaar.Api` mit
  `GET /health`, CORS nur in Development (kein Production-Origin-Zweig — im Insel-Betrieb
  läuft CORS gar nicht, da Frontend und `/api/*` denselben Origin teilen, s. BPROJ-S05
  AC-9).
- [Round-3/plan.md](../Round-3/plan.md): `BazaarDbContext` liest
  `ConnectionStrings__DefaultConnection`; `/health` ist inzwischen der
  `AddDbContextCheck`-Health-Check (`200`/`503`), **kein** statisches `{"status":
  "healthy"}` mehr — das Overlay-`depends_on: service_healthy` (AC-1b) bezieht sich auf
  den `db`-Container-Health-Check aus BPROJ-S03, nicht auf `/health` selbst.
- Bekannte Env-Var-Namen aus Round-2/Round-3, die in `.env.example` dieses Rounds
  vollständig auftauchen müssen (BPROJ-S03 „Environment-Variablen"):
  `ConnectionStrings__DefaultConnection`, `Jwt__Issuer`, `Jwt__Audience`, `Jwt__Secret`
  (Namensform aus Round-2/plan.md Schritt 11 ggf. auf `Jwt__Secret` vs. `Jwt__SigningKey`
  abgleichen — BPROJ-S03 nennt `Jwt__Secret`, Round-2/plan.md nutzte `SigningKey` als
  C#-Property-Namen; **Konfigurationsschlüssel folgt BPROJ-S03 wörtlich:
  `Jwt__Secret`**, C#-seitig bindet `JwtOptions.SigningKey` einfach an diesen Schlüssel).

## Implementationsplan

### Teil A — BPROJ-S03: Entwicklungs-Datenbank

#### 1. `docker-compose.yml` (Projekt-Root)

```yaml
services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: bazaar
      POSTGRES_USER: bazaar
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - bazaar-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bazaar -d bazaar"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 10s

volumes:
  bazaar-db-data:
```

Ausschließlich dieser eine Service (AC-1, AC-8) — kein `frontend`/`backend` hier.

#### 2. `.env.example` (Projekt-Root, vollständige Variablenliste)

```
POSTGRES_PASSWORD=changeme
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=bazaar;Username=bazaar;Password=changeme
Jwt__Issuer=bazaar-app
Jwt__Audience=bazaar-app
Jwt__Secret=changeme-min-32-chars
SEED_ADMIN_USER=admin
SEED_ADMIN_PASSWORD=changeme
LOCAL_HOSTNAME=bazaar.local
```

`.env` selbst wird lokal aus `.env.example` kopiert und **nicht** committet.

#### 3. `.gitignore` ergänzen

```
.env
```

(Prüfen, ob bereits vorhanden — Projekt-Root-`.gitignore` ggf. erweitern statt
duplizieren.)

#### 4. Verifikation Teil A

- `docker compose up -d` → `docker compose ps` zeigt `db` als `healthy` binnen 60 s
  (AC-2).
- `psql -h localhost -U bazaar -d bazaar` (oder `docker compose exec db pg_isready`)
  bestätigt Erreichbarkeit.
- `docker compose down` → Volume bleibt (`docker volume ls` zeigt `bazaar-db-data`
  weiterhin); `docker compose down -v` entfernt es (AC-6).

### Teil B — BPROJ-S05: Insel-Deployment mit SSL

#### 5. `backend/Dockerfile` (Production-Image)

Multi-Stage: `mcr.microsoft.com/dotnet/sdk:10.0` (Build/Publish) →
`mcr.microsoft.com/dotnet/aspnet:10.0` (Runtime), `dotnet publish Bazaar.Api -c Release
-o /app`, `ENTRYPOINT ["dotnet", "Bazaar.Api.dll"]`.

#### 6. `frontend/Dockerfile` (Multi-Stage, letzte Stage `nginx:alpine`)

Analog
[`BAR.App/Dockerfile`](../../../../src/advance-registration/frontend/BAR.App/Dockerfile),
aber mit SSL-Zertifikaten statt reinem HTTP:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS final
COPY --from=build /app/dist/bazaar-app/browser /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80 443
```

Kein separater nginx-Service, kein geteiltes Build-Volume (AC-2) — Build-Output liegt im
Image.

#### 7. `nginx/nginx.conf.template`

Angelehnt an
[`BAR.App/nginx.conf.template`](../../../../src/advance-registration/frontend/BAR.App/nginx.conf.template)
(Proxy-Pattern für `/api/*` und `/health`, `try_files … /index.html`), erweitert um
SSL-Terminierung und HTTP→HTTPS-Redirect:

```nginx
server {
    listen 80;
    server_name ${LOCAL_HOSTNAME};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ${LOCAL_HOSTNAME};
    root /usr/share/nginx/html;
    index index.html;

    ssl_certificate     /etc/nginx/certs/bazaar.pem;
    ssl_certificate_key /etc/nginx/certs/bazaar-key.pem;

    location /api/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`envsubst` ersetzt `${LOCAL_HOSTNAME}` beim Containerstart (Standardverhalten des
`nginx:alpine`-Images für `/etc/nginx/templates/*.template`, AC-7). Port 80 liefert
**ausschließlich** den Redirect, keinen Inhalt (AC-5).

#### 8. `docker-compose.local.yml` (Overlay)

```yaml
services:
  db:
    ports: []   # AC-1: Port-Veröffentlichung im Insel-Betrieb entfernt
    restart: unless-stopped

  backend:
    build: ./src/bazaar-app/backend
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__DefaultConnection: ${ConnectionStrings__DefaultConnection}
      Jwt__Issuer: ${Jwt__Issuer}
      Jwt__Audience: ${Jwt__Audience}
      Jwt__Secret: ${Jwt__Secret}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build: ./src/bazaar-app/frontend
    ports:
      - "80:80"
      - "443:443"
    environment:
      LOCAL_HOSTNAME: ${LOCAL_HOSTNAME}
    volumes:
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - backend
    restart: unless-stopped
```

`ports: []` auf `db` überschreibt die Basis-Compose-Datei vollständig (Docker-Compose-
Merge-Semantik: eine leere Liste im Overlay ersetzt, statt zu addieren) — Nachweis in
Schritt 12 gegenprüfen, sonst `!override`-Notation verwenden.

#### 9. Zertifikate (`nginx/certs/`, gitignored)

`nginx/certs/` zu `.gitignore` hinzufügen (AC-8). Kein Zertifikat wird generiert oder
eingecheckt — das übernimmt der Betreiber per mkcert gemäß Anleitung (Schritt 11).

#### 10. `.env.example` um `LOCAL_HOSTNAME` ergänzen

Bereits in Schritt 2 vorweggenommen (vollständige Liste ab Teil A) — hier nur
gegenprüfen, dass der Eintrag tatsächlich vorhanden ist. Keine CORS-Variable einführen
(AC-9).

#### 11. `docs/insel-deployment.md`

Enthält gemäß BPROJ-S05 AC-11 exakt sechs Schritte: (1) mkcert installieren, (2) Root-CA
erzeugen/installieren, (3) `mkcert bazaar.local 192.168.x.y` (Hostname **und** LAN-IP im
SAN), (4) Root-CA auf LAN-Endgeräten importieren (Android, iOS, Windows), (5)
Startbefehl `docker compose -f docker-compose.yml -f docker-compose.local.yml up -d`,
(6) beide gültigen Aufrufadressen (Hostname und IP).

#### 12. Verifikation Teil B

- `docker compose -f docker-compose.yml -f docker-compose.local.yml build` — beide
  Dockerfiles bauen durch.
- `docker compose -f docker-compose.yml -f docker-compose.local.yml up -d` →
  `backend` startet erst nach `db: healthy` (AC-1b, per `docker compose logs` prüfen).
- `curl -k https://localhost/api/health` → Antwort vom Backend (Proxy funktioniert,
  AC-4).
- `curl -I http://localhost` → `301` nach `https://…`, kein Body (AC-5).
- `docker compose -f docker-compose.yml -f docker-compose.local.yml config` prüfen,
  dass `db.ports` im gemergten Ergebnis leer ist (Nachweis zu Schritt 8).
- Mit echtem mkcert-Zertifikat und auf einem zweiten LAN-Gerät (Smartphone-Browser):
  `https://<LOCAL_HOSTNAME>` und `https://<LAN-IP>` beide ohne Warnung, `getUserMedia()`
  testweise über eine Minimal-Seite aufrufen (AC-10) — kein Fachcode für den
  Kamera-Test nötig, ein `<video>` mit `navigator.mediaDevices.getUserMedia()` in der
  Browser-Konsole genügt als Nachweis.

## Reihenfolge

Teil A (1–4) vollständig vor Teil B, da BPROJ-S05 das Basis-Compose voraussetzt
(Abhängigkeit laut Story). Innerhalb Teil B: 5–7 können parallel entstehen (unabhängige
Dockerfiles/Config), 8 hängt von 5–7 ab, 9–10 begleitend, 11 nach 8 (referenziert den
finalen Startbefehl), 12 abschließend.
