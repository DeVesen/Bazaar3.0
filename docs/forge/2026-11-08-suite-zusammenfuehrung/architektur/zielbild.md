# Zielbild der Infrastruktur

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [leitplanken](../leitplanken.md) (L1, L3, L4, L5) · [datenmodell](../querschnitt/datenmodell.md)
Entscheidungen: E0 (entschieden), E1, E2, E10a, E19, E20
Schlagworte: Zielbild, Infrastruktur, Container, Portal-API, Basar-API, Katalog, Datenbank, Schema, Modul, Modularer Monolith, Hexagonal, Microservices, Lastisolation, Cloud, Docker, Betriebsart

## Zweck und Abgrenzung

Hier wird beschrieben, **wie die Suite technisch aufgebaut ist**: Bausteine, Datenbank,
Lastisolation und Betriebsarten. Betrieb und Notfall stehen in [betrieb](betrieb.md), der Weg dorthin in
[migration](migration.md).

## Heute

- **Zwei getrennte Systeme mit zwei Datenbanken:**
  - Voranmeldung: Cloud, modularer Monolith `BAR.*`, Schema je Modul (`src/advance-registration/backend`).
  - Haupt-App: LAN, Schichten-Hexagon `Bazaar.*`, ein Schema (`src/bazaar-app/backend`).
- Verbunden sind sie nur über eine JSON-Datei: Export in der Voranmeldung, Import in der Haupt-App.
- Gemeinsam sind schon: .NET, PostgreSQL, ein 8-stelliges ID-Format, Kennungen, die beim Import 1:1 übernommen werden.

## Ziel

### Grundsatz (E0)

**Eine** Infrastruktur mit **einer** Datenbank, betrieben **in der Cloud** (bevorzugt) oder als
**Docker-Stack** auf eigenem Server. Beide Varianten nutzen dieselben Images. Unterschiede gibt es nur in
der Konfiguration.

### Bausteine (E2, Empfehlung)

```
                   ┌───────────────── Eine Codebasis (Module je Fachbereich) ─────────────────┐
                   │                                                                           │
  Verkäufer/       │  ┌──────────────┐      ┌──────────────┐      ┌──────────────────────┐    │
  Händler  ───────►│  │ Portal-API   │      │ Basar-API    │◄─────┤ Basar-Team (Annahme, │    │
  (Voranmelde-     │  │ Container 1  │      │ Container 2  │      │ Kasse, Rückgabe …)   │    │
   Frontend)       │  └──────┬───────┘      └──────┬───────┘      └──────────────────────┘    │
                   │         │   gemeinsame Datenbank (Schema je Modul)                        │
                   │         └──────────────┬──────┘                                           │
                   │                ┌───────▼────────┐   bereinigte Daten ohne Personenbezug   │
                   │                │  PostgreSQL    │──────────────┐                          │
                   │                └────────────────┘              ▼                          │
                   │                                      ┌──────────────────┐                 │
  Interessenten ──────────────────── Cache / CDN ────────►│ Katalog          │ Container 3     │
  (Homepage)       │                                      └──────────────────┘                 │
                   └───────────────────────────────────────────────────────────────────────────┘
```

| Baustein | Wer nutzt ihn | Was er tut | Warum eigener Container |
|---|---|---|---|
| **Portal-API** | Verkäufer, Händler, Admin (Vorbereitung) | Registrierung, Profil, Meine Artikel, Status-Sicht | Anmeldeansturm und Händler-Massenimporte belasten die Kasse nicht |
| **Basar-API** | Basar-Team, Admin | Annahme, Kasse, Rückgabe, Abrechnung, Druck, Statistik | Kasse hat Vorrang (L5) und wird eigenständig skaliert |
| **Katalog** | Interessenten (anonym) | Liefert die öffentliche Liste aus vorbereiteten Daten | Öffentlicher Verkehr ist vollständig isoliert (L4) |

- **Eine Codebasis:** Beide APIs bestehen aus denselben Modulen. Jeder Container schaltet nur die
  Endpunkte seiner Nutzergruppe frei. Damit sind Fachlogik und Regeln (z. B. die Änderungssperre) **an genau einer Stelle** definiert.
- **Module je Fachbereich**, z. B. Identität, Verkäufer, Artikel, Voranmeldung, Annahme, Kasse,
  Abrechnung, Stammdaten, Basar, Druck, Katalog-Projektion. Jedes Modul hat ein eigenes Schema und spricht andere Module nur über deren
  Schnittstelle an. Das Muster stammt aus der heutigen Voranmeldung (`BAR.Modules.*`, Spec §10.0.1).
- **Frontends:**
  - Das Voranmelde-Frontend spricht mit der Portal-API.
  - Das Haupt-App-Frontend spricht mit der Basar-API.
  - Der Katalog bekommt ein neues, schlankes Frontend.
  - Die APIs bedienen zunächst die **heutigen Schnittstellenverträge**, damit beide Frontends nur die Adresse ändern (Z7, L10).

### Alternativen (zur Entscheidung E2)

| Option | Beschreibung | Bewertung |
|---|---|---|
| A | Ein Backend-Container für alles + Katalog | am einfachsten. Ein Ansturm auf die Voranmeldung trifft aber auch die Kasse. |
| **B** | Eine Codebasis, Portal-API + Basar-API + Katalog | **Empfehlung**: Lastisolation bei einem Code, einem Modell und einem Stack |
| C | Microservices mit eigener Datenbank je Dienst | widerspricht E0 (eine Datenbank) und ist zu viel Betrieb fürs Ehrenamt |

### Datenbank

- **Eine** PostgreSQL-Instanz mit **einem Schema je Modul** und eigenen Datenbankrechten je Container.
  Der Katalog liest zum Beispiel nur seine Projektion.
- **Ein Artikel ist ein Datensatz** über den ganzen Lebenszyklus ([lebenszyklus](../querschnitt/artikel-lebenszyklus.md)).
- **Gleichzeitigkeit** ist abgesichert: Zwei Kassen können nicht denselben Artikel verkaufen. Die Datenbank-Constraints sichern
  die Eindeutigkeit der Nummern je Basar ([nummern](../querschnitt/nummern.md)).

### Öffentlicher Katalog (E10a)

- Eine Projektion der Artikel „Im Verkauf“ **ohne Personenbezug** wird etwa alle 30–60 Sekunden aktualisiert.
- Der Katalog-Container liefert sie mit HTTP-Cache aus, davor bei Bedarf ein CDN.
- Viele Besucher erzeugen damit **keine** Last auf Kasse oder Voranmeldung.

### Betriebsarten

| | Cloud (bevorzugt) | Docker auf eigenem Server |
|---|---|---|
| Hosting | z. B. Azure Container Apps + verwaltetes PostgreSQL, EU (E20) | ein Compose-Stack (alle Container + PostgreSQL + Reverse Proxy) |
| Erreichbarkeit | öffentlich mit TLS | öffentlich mit TLS. Der Server muss aus dem Internet erreichbar sein, sonst gibt es keine Voranmeldung. |
| Skalierung | je Container einzeln | durch die Größe des Servers |
| Inselmodus (E1b) | – | derselbe Stack auf einem Laptop am Basar-Ort, nur als Notbetrieb |

## Berührungspunkte

- [betrieb](betrieb.md): Hosting, Backup, Konnektivität am Basar-Tag
- [identitaet-rollen](../querschnitt/identitaet-rollen.md): welche Rolle welchen Container nutzt
- [api-konventionen](../querschnitt/api-konventionen.md): Pfade je Container
- [oeffentlicher-katalog](../fachbereiche/oeffentlicher-katalog.md): Inhalt der Projektion

## Offene Fragen

1. Bedienen die neuen APIs die heutigen Verträge 1:1, oder wird ein neuer, gemeinsamer Vertrag mit Anpassung der Frontends eingeführt? Empfehlung: zuerst 1:1, dann zusammenführen.
2. Wie wird die Last abgeschätzt (Verkäuferzahl, Artikelzahl, Kassen, erwartete Besucher des Katalogs)? Belastbare Zahlen fehlen.
3. Sollen Portal-API und Basar-API in der Docker-Variante zu einem Container zusammengefasst werden dürfen, um Ressourcen zu sparen?

## Nächste Planungsschritte

- E2 und E20 entscheiden.
- Modulschnitt festlegen (Liste der Module mit Schema und Verantwortung) → eigenes Dokument `architektur/module.md`.
