# Betrieb, Basar-Tag-Konnektivität und Notfall

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [zielbild](zielbild.md) · [leitplanken](../leitplanken.md) (L5, L11)
Entscheidungen: E1, E1b, E13, E14, E16, E20
Schlagworte: Betrieb, Hosting, Azure, VPS, Docker Compose, Backup, Datensicherung, Monitoring, Update, Einfrierfenster, Generalprobe, Internet, Leitung, Mobilfunk, Notbetrieb, Inselmodus, Papier-Kassenliste, Technik-Rolle, Kosten

## Zweck und Abgrenzung

Hier steht, wie die Suite **dauerhaft und am Basar-Tag zuverlässig läuft**: Hosting, Datensicherung,
Überwachung, Updates, Internet am Basar-Ort und Notbetrieb.

## Heute

- **Voranmeldung:** geplant auf Azure Container Apps, eine Instanz, Images über CI (`roadmap/R12`).
- **Haupt-App:** Portainer-Stack im LAN, eigene CA, `:latest`-Images (`src/bazaar-app/portainer-stack.yml`).
- Keine konfigurierte Datensicherung, kein Monitoring.

## Ziel

### Hosting (E20, E14, E13)

- **Cloud bevorzugt:** Container-Plattform und verwaltetes PostgreSQL in einer **EU-Region**. Das Konto gehört dem **Verein** (E14), nicht einer Privatperson.
- **Docker-Variante:** ein Compose-Stack, gleiche Images, z. B. auf einem Vereins-Server oder VPS.
- **Kosten:** Budgetrahmen durch den Vorstand (E13). Der Plan liefert dafür eine Kostenschätzung je Variante (offen).

### Internet am Basar-Tag (E1, E1b) – das wichtigste Betriebsthema

Mit E0 laufen Annahme und Kasse über das Internet. Das macht die Leitung am Basar-Ort zum
kritischen Punkt.

| Stufe | Maßnahme | Wirkung |
|---|---|---|
| 0 | **Leitungstest** am Veranstaltungsort vor der Entscheidung (Bandbreite, Stabilität, WLAN-Abdeckung an Kassen) | Faktenbasis |
| 1 | **Zweite Leitung:** Mobilfunk-Router eines anderen Anbieters, automatisches Umschalten | Ausfall wird meist nicht bemerkt |
| 2 | **Papier-Kassenliste** (Basar-Tag-Nummer, Preis) mit Nacherfassung nach Wiederkehr | Verkauf geht weiter, Annahme pausiert |
| 3 (optional) | **Inselmodus:** derselbe Docker-Stack auf einem Laptop mit Datenstand vom Vorabend. Am Ende werden die Daten in die Cloud zurückgespielt. | Volle Funktion ohne Internet, braucht aber eine Rückspiel-Funktion und Übung |

Empfehlung: Stufe 0–2 sind Pflicht, Stufe 3 wird nach dem ersten Basar mit der Suite neu bewertet.

### Datensicherung

| Was | Wie oft | Wohin |
|---|---|---|
| Datenbank Cloud | täglich, am Basar-Tag zusätzlich stündlich | Backup-Funktion des Anbieters + Export außerhalb |
| Datenbank Docker-Variante | täglich, am Basar-Tag alle 15 min | externes Medium |
| Wiederherstellung | vor jeder Saison geübt | – |

### Überwachung

- Einfache Erreichbarkeits-Prüfung je Container, mit Benachrichtigung an die Technik-Rolle.
- Am Basar-Tag: eine Statusanzeige beim Admin (Verbindung, Antwortzeit der Kasse).

### Updates und Einfrierfenster

- Versionierte Images statt `:latest`.
- Eine **Testumgebung** mit gleichem Aufbau.
- **X Wochen vor jedem Basar eingefroren** (E15). Davor gibt es eine **Generalprobe** mit echten Geräten.

### Technik-Rolle am Basar-Tag (E16)

- Eine benannte Person mit Vertretung, Checkliste und Notfallplan.
- Sie entscheidet über die Notbetriebsstufen.

### Geräte am Basar-Ort

- Kassen und Annahme arbeiten im Browser (Laptop/Tablet), Scanner per USB oder Kamera, Druck über den Browser (heute schon so).
- Bei der Cloud-Variante ist **kein lokaler Server** mehr nötig. Es braucht nur WLAN, Internet und Drucker.

## Berührungspunkte

- [zielbild](zielbild.md): Betriebsarten
- [datenschutz](../querschnitt/datenschutz.md): Auftragsverarbeitung, Region, Geräte-Verschlüsselung
- [verkauf-kasse](../fachbereiche/verkauf-kasse.md): Papier-Notbetrieb, Nacherfassung
- [roadmap](../roadmap.md): Einfrierfenster, Generalproben
- [risiken](../risiken.md): R1 Internet

## Offene Fragen

1. Wie ist die Internetleitung am Veranstaltungsort (Stufe 0)?
2. Welcher Kostenrahmen gilt? Welche Kosten entstehen je Variante pro Monat und pro Basar-Tag (Skalierung)?
3. Wer ist die Technik-Rolle, wer die Vertretung?
4. Wird der Inselmodus (Stufe 3) überhaupt benötigt?

## Nächste Planungsschritte

- Leitungstest durchführen.
- Kostenschätzung Cloud gegen VPS erstellen.
- Notfall-Checkliste entwerfen.
