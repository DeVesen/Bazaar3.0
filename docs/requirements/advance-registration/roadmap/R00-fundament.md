---
id: ROADMAP-R00
status: draft
updated: 2026-09-09
---

# R00 — Fundament

**Voranmelde-App · Roadmap-Schritt 0 · Vorbedingung für alles Weitere**

## Worum es geht

Die Voranmelde-App bekommt ihr technisches Gerüst: ein Angular-Frontend, eine .NET-Minimal-API
in vier Projekten, eine PostgreSQL-Datenbank per Docker Compose, EF Core mit erster Migration,
Test- und Architektur-Setup — und darauf die App-Shell mit Sidebar, responsivem Layout,
Routing-Skeleton, Auth-Infrastruktur und PrimeNG-Theme.

Dieser Schritt liefert **keine Fachlichkeit**. Er ist der einzige Schritt der Roadmap, nach dem
ein Nutzer nichts fachlich Sinnvolles tun kann. Sein Ergebnis ist eine lauffähige, leere App,
in die ab R01 Fachlichkeit eingehängt wird.

## Umfang

- [Epic_Projektanlage](../epics/Epic_Projektanlage/epic.md) — alle fünf Stories
  (Angular-Projekt, .NET-API, Docker Compose, EF Core, Test- und Architektur-Setup)
- [Epic_App_Shell](../epics/Epic_App_Shell/epic.md) — alle fünf Stories
  (Sidebar-Navigation, responsives Layout, Routing-Skeleton, Auth-Infrastruktur, PrimeNG-Theme)
- ngx-translate einrichten: DE vollständig gepflegt, EN-Datei existiert und wird mitgeführt,
  darf aber leer bleiben (Füllung in R12)
- Sidebar-Einträge aus [`spec.md`](../spec.md) §7 als Platzhalter-Routen, die auf leere
  Seiten zeigen

## Nicht in diesem Schritt

- Jede Form von Geschäftslogik, jeder fachliche Endpoint
- Login-Formular und Registrierung (R01) — hier entsteht nur die Auth-**Infrastruktur**
  (Token-Speicher, Interceptor, Guards), noch kein Anmeldevorgang
- Englische Übersetzungstexte

## Vor dem Start klären

[`spec.md`](../spec.md) §13 Frage 3 ist offen: der Konflikt zwischen dem
[Industry-Styleguide](../design/industry-styleguide.md) (Lucide-Icons, eigene CSS-Klassen,
Blueprint-Eckkreuze) und der PrimeNG-Grundregel aus §10.0.4. Diese Entscheidung muss vor
dem Theme-Setup fallen, sonst wird VSHELL-S05 zweimal gebaut.

## Fertig, wenn — von Hand prüfbar

1. `docker compose up` startet Datenbank, API und Frontend ohne Fehler.
2. Die App öffnet sich im Browser und zeigt die Sidebar mit allen Einträgen aus §7.
2b. Ohne echten Login vorführen: Browser-Konsole öffnen und eine der beiden Zeilen einfügen —
    Rolle **admin**:
    ```js
    localStorage.setItem('bazaar_token', `${btoa(JSON.stringify({alg:'none',typ:'JWT'}))}.${btoa(JSON.stringify({sub:'demo-admin',role:'admin',exp:Math.floor(Date.now()/1000)+23328000}))}.demo`);
    location.reload();
    ```
    Rolle **seller**:
    ```js
    localStorage.setItem('bazaar_token', `${btoa(JSON.stringify({alg:'none',typ:'JWT'}))}.${btoa(JSON.stringify({sub:'demo-seller',role:'seller',exp:Math.floor(Date.now()/1000)+23328000}))}.demo`);
    location.reload();
    ```
3. Fenster auf ≤ 768 px verkleinern: Sidebar wird zum Burger-Menü, Titelleiste erscheint,
   Sidebar-Footer bleibt am unteren Rand.
4. Der Health-Endpoint der API antwortet mit `200`.
5. Die erste EF-Core-Migration ist eingespielt, die Datenbank enthält die Tabellen.
6. Frontend-Tests (Jest) und Backend-Tests (xUnit) laufen grün, der NetArchTest-Architekturtest
   ist dabei und schlägt bei einer verbotenen Referenzrichtung an.

## Quellen

- [`spec.md`](../spec.md) §7 Navigation · §10 Technische Rahmenbedingungen
- [Epic_Projektanlage](../epics/Epic_Projektanlage/epic.md)
- [Epic_App_Shell](../epics/Epic_App_Shell/epic.md)
- [design/industry-styleguide.md](../design/industry-styleguide.md)

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #setup #app-shell
