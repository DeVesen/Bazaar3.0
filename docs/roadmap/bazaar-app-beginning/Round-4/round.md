# Round 4 — Docker Compose & Insel-Deployment

## Liefert

Die containerisierte Betriebsumgebung: Docker Compose für lokale Entwicklung und ein
separates Overlay für den tatsächlichen Insel-Betrieb (lokales LAN ohne Internet).

## Umfang

- Docker Compose für Entwicklung: Datenbankdienst (`db`).
- Production-Images: Backend-Container, Frontend-Container (statisches Angular-Bundle
  hinter nginx).
- Separates Compose-Overlay für den Insel-Betrieb (Deployment-Achse: ein
  Backend-Container + ein Frontend-Container, kein Microservice-Zuschnitt).
- SSL/HTTPS-Konfiguration für den lokalen LAN-Betrieb.
- Sicherstellen, dass keine Komponente zur Laufzeit einen externen Netzwerkzugriff
  benötigt (Fonts, Icons, JS-Abhängigkeiten bereits lokal aus Round 1/2 gebündelt).

## Nicht enthalten

- Fachliche Endpoints oder Seiten.
- Test-Infrastruktur (eigenes Häppchen).

## Referenzen

- [Epic_Projektanlage](../../requirements/bazaar-app/epics/Epic_Projektanlage/epic.md) (Stories BPROJ-S03, BPROJ-S05)
- [spec.md §7.2](../../requirements/bazaar-app/spec.md) (Offline-Fähigkeit)

## Voraussetzung

Setzt voraus, dass Frontend- und Backend-Grundgerüst sowie die Datenbankanbindung
bereits existieren.
