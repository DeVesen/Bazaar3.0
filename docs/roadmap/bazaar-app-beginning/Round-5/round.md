# Round 5 — Test- und Architektur-Test-Setup

## Liefert

Die Test-Infrastruktur beider Schichten, damit jedes nachfolgende fachliche Häppchen von
Anfang an testbar ist.

## Umfang

- Frontend: Jest-Setup für Angular (Konfiguration, Test-Runner, erste
  Beispielkomponente testbar).
- Backend: xUnit-v3-Testprojekt mit `Assert.*` (keine zusätzliche
  Assertion-Bibliothek — Lizenzentscheidung, siehe Referenz), Moq für Mocking.
- Architektur-Testprojekt mit NetArchTest: prüft die im Backend geforderte
  Abhängigkeitsrichtung (`Domain` referenziert nichts, `Application` nur `Domain`, usw.)
  dort, wo der Compiler es nicht erzwingen kann.

## Nicht enthalten

- Fachliche Testfälle — die entstehen mit den jeweiligen fachlichen Epics.

## Referenzen

- [Epic_Projektanlage](../../requirements/bazaar-app/epics/Epic_Projektanlage/epic.md) (Story BPROJ-S06)
- [spec.md §7.0](../../requirements/bazaar-app/spec.md) (Tech-Stack — Tests, Warum-diese-Majors)

## Voraussetzung

Setzt voraus, dass Frontend- und Backend-Grundgerüst bereits existieren.
