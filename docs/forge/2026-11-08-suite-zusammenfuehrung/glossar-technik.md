# Glossar Technik – Schlagwörter in Klartext

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](README.md)
Lesen zusammen mit: [glossar](glossar.md) (Fachbegriffe) · [index](index.md) (Stichwortsuche)
Schlagworte: Buzzword, Technikbegriff, Abkürzung, Erklärung, Klartext

Technische Begriffe, die in Plan, Specs oder Gesprächen auftauchen, jeweils in einem Satz für
Nicht-Techniker erklärt und mit Bezug zur Suite. Fachbegriffe (Annahme, Basar-Tag-Nummer …)
stehen in [glossar](glossar.md). **Status** zeigt, ob ein Konzept im Plan gilt, verworfen ist
oder nur zur Erklärung dient.

| Begriff | Klartext | Bezug in der Suite | Status |
|---|---|---|---|
| **API / Endpunkt** | Schnittstelle, über die Frontend und Backend Daten austauschen; ein Endpunkt ist eine einzelne Adresse darin | [api-konventionen](querschnitt/api-konventionen.md) | gilt |
| **Audience** | Angabe im Anmelde-Token, für welche Anwendung es gilt | [identitaet-rollen](querschnitt/identitaet-rollen.md) | gilt |
| **AVV** | Auftragsverarbeitungsvertrag nach DSGVO mit einem Dienstleister (z. B. Cloud-Anbieter) | [datenschutz](querschnitt/datenschutz.md) | gilt |
| **Azure Container Apps** | Cloud-Dienst von Microsoft, der Container betreibt und skaliert | [betrieb](architektur/betrieb.md), E20 | Empfehlung |
| **Backend / Frontend** | Backend: Server-Programm mit Fachlogik und Daten. Frontend: Oberfläche im Browser. | [zielbild](architektur/zielbild.md) | gilt |
| **Backup / Restore** | Datensicherung bzw. deren Wiederherstellung | [betrieb](architektur/betrieb.md) | gilt |
| **Breakpoint** | Bildschirmbreite, ab der sich das Layout ändert (Handy ↔ Desktop) | [ui-grundlagen](querschnitt/ui-grundlagen.md), E21 | gilt (wie Haupt-App) |
| **Cache** | Zwischenspeicher, der oft abgefragte Daten bereithält und Server entlastet | [oeffentlicher-katalog](fachbereiche/oeffentlicher-katalog.md) | gilt |
| **CDN** | Netz von Zwischenspeichern im Internet, das viele Besucher bedient | [zielbild](architektur/zielbild.md), E10a | optional |
| **CI / Pipeline** | Automatischer Ablauf, der bei jeder Änderung baut, testet und Images erstellt | [betrieb](architektur/betrieb.md) | gilt |
| **Concurrency / Gleichzeitigkeit** | Absicherung, dass zwei gleichzeitige Änderungen sich nicht überschreiben (z. B. zwei Kassen, ein Artikel) | [datenmodell](querschnitt/datenmodell.md), V5 | gilt |
| **Container / Image** | Container: ein abgeschottet laufendes Programm. Image: seine Bauvorlage. | [zielbild](architektur/zielbild.md) | gilt |
| **Docker / Compose / Stack** | Werkzeug für Container. Compose beschreibt mehrere Container als einen „Stack“. | [zielbild](architektur/zielbild.md), E0 | gilt (Alternative zur Cloud) |
| **DSGVO** | Datenschutz-Grundverordnung der EU | [datenschutz](querschnitt/datenschutz.md) | gilt |
| **Dumb Component** | Oberflächen-Baustein ohne eigene Logik; bekommt Daten und meldet Ereignisse | [ui-grundlagen](querschnitt/ui-grundlagen.md) | gilt |
| **Durchstich** | Ein Fachthema wird vollständig von der Oberfläche bis zur Datenbank umgesetzt | Spec Haupt-App §7.0.2 | gilt (Umsetzung) |
| **EARS** | Schreibweise für Akzeptanzkriterien („WHEN …, THE SYSTEM SHALL …“) | Epics/Stories | gilt (Umsetzung) |
| **Epic / Story** | Epic: großes Fachthema. Story: umsetzbares Teilstück mit Akzeptanzkriterien. | `docs/requirements/<app>/epics/` | gilt (Umsetzung) |
| **errorCode / ProblemDetails** | Standardform für Fehlerantworten. Der errorCode ist ein stabiler Schlüssel für Reaktionen im Frontend. | [api-konventionen](querschnitt/api-konventionen.md), E26 | gilt (wie Haupt-App) |
| **Exclusion-Constraint / Unique-Constraint** | Regel in der Datenbank, die Überschneidungen bzw. Doppelte verhindert | [nummern](querschnitt/nummern.md), [datenmodell](querschnitt/datenmodell.md) | gilt |
| **Feature-Flag** | Schalter, mit dem eine neue Funktion ein- oder ausgeschaltet wird | [roadmap](roadmap.md) | optional |
| **Fremdschlüssel** | Datenbank-Verweis von einem Datensatz auf einen anderen, der gültig sein muss | [datenmodell](querschnitt/datenmodell.md) | gilt |
| **Generalprobe / Staging** | Probedurchlauf auf einer Testumgebung mit gleichem Aufbau wie der Echtbetrieb | [betrieb](architektur/betrieb.md) | gilt |
| **Hexagonal (Ports & Adapter)** | Bauweise, bei der die Fachlogik in der Mitte liegt und Technik (DB, HTTP) austauschbar außen angedockt ist | [zielbild](architektur/zielbild.md), L3 | gilt |
| **ID / Kennung** | Eindeutiger Schlüssel eines Datensatzes (heute 8 Zeichen, z. B. `a7Bx29Qk`) | [api-konventionen](querschnitt/api-konventionen.md) | gilt |
| **Inselmodus** | Notbetrieb: dieselbe Suite läuft am Basar-Ort lokal und spielt Daten danach zurück | [betrieb](architektur/betrieb.md), E1b | optional |
| **JWT / Token / Refresh-Token** | Digitale Eintrittskarte nach dem Login. Ein Refresh-Token erneuert sie. | [identitaet-rollen](querschnitt/identitaet-rollen.md), V9 | gilt |
| **Lastisolation** | Ein Ansturm auf einen Teil (z. B. Katalog) bremst andere Teile (z. B. Kasse) nicht | [zielbild](architektur/zielbild.md), L4/L5 | gilt |
| **Microservices** | Viele kleine, getrennt betriebene Dienste mit je eigener Datenbank | [zielbild](architektur/zielbild.md), E2 Option C | **verworfen** |
| **Migration (Datenbank)** | Versionierte Änderung am Datenbankaufbau | [migration](architektur/migration.md) | gilt |
| **Modul / Modularer Monolith** | Ein Programm, intern sauber in Fachbereiche (Module) getrennt | [zielbild](architektur/zielbild.md), L3 | gilt |
| **Monitoring** | Automatische Überwachung, ob alles läuft, mit Benachrichtigung | [betrieb](architektur/betrieb.md) | gilt |
| **Outbox / Event-Warteschlange** | Muster zum zuverlässigen Versand von Ereignissen zwischen Systemen | [Plan v1](historie/uebersichtsplan-v1.md) | **verworfen** (eine Datenbank, E0) |
| **Paginierung** | Seitenweise Auslieferung langer Listen | [api-konventionen](querschnitt/api-konventionen.md) | gilt |
| **PostgreSQL** | Die eingesetzte Datenbank | [zielbild](architektur/zielbild.md) | gilt |
| **PrimeNG** | Bibliothek mit Oberflächen-Bausteinen für Angular. In der Suite die einzige erlaubte UI-Bibliothek. | [ui-grundlagen](querschnitt/ui-grundlagen.md) | gilt |
| **Projektion / Read-Model** | Vorbereitete, vereinfachte Sicht auf Daten nur zum Lesen (z. B. Katalog ohne Personendaten) | [oeffentlicher-katalog](fachbereiche/oeffentlicher-katalog.md) | gilt |
| **Rate-Limit** | Bremse gegen zu viele Anfragen, z. B. gegen Passwort-Raten oder Bots | [identitaet-rollen](querschnitt/identitaet-rollen.md) | gilt |
| **Reverse Proxy / nginx** | Vorgeschalteter Server, der Anfragen an die richtigen Container verteilt und TLS übernimmt | [betrieb](architektur/betrieb.md) | gilt |
| **Schema** | Abgetrennter Bereich in der Datenbank, einer je Modul | [zielbild](architektur/zielbild.md) | gilt |
| **Snapshot / Gesamtstand-Abgleich** | Regelmäßige Übertragung des kompletten Stands zwischen zwei Datenbanken | [Plan v2](historie/uebersichtsplan-v2.md) | **verworfen** (eine Datenbank, E0) |
| **Strangler** | Altsystem schrittweise ablösen statt in einem großen Sprung | [migration](architektur/migration.md), [roadmap](roadmap.md) | gilt |
| **TLS / HTTPS** | Verschlüsselte Verbindung im Browser | [betrieb](architektur/betrieb.md) | gilt |
| **Toast** | Kurze Einblendung am Bildschirmrand (Erfolg/Fehler) | [ui-grundlagen](querschnitt/ui-grundlagen.md) | gilt |
| **VPS** | Gemieteter virtueller Server, z. B. für die Docker-Variante | [betrieb](architektur/betrieb.md), E20 | Alternative |
| **Worktree / Feature-Branch** | Getrennte Arbeitskopie bzw. ein Entwicklungszweig in Git | CLAUDE.md (nur für die Umsetzung) | gilt (Umsetzung) |
