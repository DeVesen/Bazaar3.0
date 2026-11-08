# UI-Grundlagen: Komponenten, Breakpoints, Shell, Feedback

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [leitplanken](../leitplanken.md) (L6) · [auswahlfelder-stammdaten](auswahlfelder-stammdaten.md)
Entscheidungen: E19, E21, E22, E23

## Zweck und Abgrenzung

Hier stehen die **gemeinsamen Gestaltungs- und Bedienregeln** aller Frontends der Suite (Voranmeldung, Basar,
Katalog). Einzelne Komponenten sind unter [`docs/components/`](../../../components/overview.md) beschrieben,
und seitenbezogene Ausprägungen gehören in die Fachbereiche.

## Heute

| Thema | Voranmeldung | Haupt-App |
|---|---|---|
| UI-Bibliothek | PrimeNG, Dumb Components | PrimeNG, Dumb Components |
| Breakpoints | **drei** Stufen: Mobile ≤ 768, Tablet ≤ 1024, Desktop > 1024 (`spec.md` §10/§11) | **zwei** Stufen: Mobile ≤ 768, Desktop > 768 (`spec.md` §7.1) |
| Shell | Sidebar, Burger ab Tablet, Role-Toggle | Sidebar, Burger ab Mobile, kein Toggle |
| Modals | 80 % / 90 vh, Mobile Vollbild | gleich |
| Branding | offen, vermutlich abweichend (prüfen) | Farben und Schrift in `spec.md` §10.1 |
| Seitenrahmen | – | Page-Komponente, 75vw ab 769 px |
| Feedback | Toasts | Toasts (§10.2), Result-Overlay mit Ton und Vibration an Kasse und Scan |

Hinweis: [`docs/style-guide/`](../../../style-guide/README.md) beschreibt ein **fremdes Projekt** (ATLAS/MyTRUMPF,
Angular Material) und passt nicht zur PrimeNG-Regel. Zu klären in E23.

## Ziel

### Gemeinsame Regeln

- **Nur PrimeNG**, ein eigener Wrapper nur dort, wo PrimeNG nichts Passendes hat (Grundregel aus `docs/components/overview.md`).
- **Ein geteilter Komponenten-Bestand** für alle Frontends. Heute liegen die Komponenten doppelt im Code. Zu klären ist, wie sie geteilt werden (z. B. eine gemeinsame Angular-Bibliothek).
- **Ein Breakpoint-Satz** (E21, Empfehlung):

| Stufe | Breite | Navigation | Modals |
|---|---|---|---|
| Mobile | ≤ 768 px | Burger, slide-in | Vollbild, kein Radius |
| Tablet | ≤ 1024 px | Burger, slide-in | 80 % / 90 vh |
| Desktop | > 1024 px | Sidebar fest | 80 % / 90 vh |

- **Ein Branding:** eine Farbpalette, eine Schrift und ein Logo „Bazaar Suite“ für alle drei Frontends. Der Katalog darf sich an die Homepage des Vereins anlehnen (offen).
- **Ein Feedback-Muster:**
  - Toast für Erfolg und Fehler
  - Bestätigungsdialog für Zerstörendes
  - Result-Overlay für Scan- und Kassenvorgänge
  - Fehlertexte aus dem errorCode-Katalog ([api-konventionen](api-konventionen.md))
- **Gleiche Seitenmuster:** Liste mit Filter-Panel und Tabelle, Dialog zum Anlegen und Bearbeiten, KPI-Kacheln, Formular-Seite mit gleichem Raster.
- **Sprache:** UI deutsch, Datums- und Zahlenformat deutsch, Währung Euro.
- **Barrierearmut:** Tastaturbedienung, Kontraste auch auf älteren Laptop-Displays (Vorgabe aus der Haupt-App §10.1).
- **Geräte am Basar-Tag:** Touch-tauglich (Numpad), Scanner per Tastatur-Emulation oder Kamera, Druck über den Browser.

### Frontends (E19)

| Frontend | Nutzer | Besonderheit |
|---|---|---|
| Voranmeldung (Portal) | Verkäufer, Händler, Admin | Mobile-first, denn viele Verkäufer erfassen am Handy |
| Basar | Team, Admin | Tablet- und Desktop-first, Kasse und Scan optimiert |
| Katalog | Interessenten | Mobile-first, ohne Anmeldung, sehr schlank |

## Berührungspunkte

- [auswahlfelder-stammdaten](auswahlfelder-stammdaten.md): Feld-Katalog
- [identitaet-rollen](identitaet-rollen.md): rollenabhängige Navigation, Login-Layout, E22
- alle Fachbereiche: verwenden nur diese Muster

## Offene Fragen

1. E21: Übernimmt die Haupt-App die Tablet-Stufe? Wirkt sich das auf die Kassenansicht aus?
2. Wie wird der gemeinsame Komponenten-Bestand technisch geteilt?
3. Branding der Voranmeldung abgleichen: Weicht es von der Haupt-App ab?
4. E23: Was passiert mit `docs/style-guide/`?

## Nächste Planungsschritte

- Abgleich beider App-Shells und Brandings (Ist) als Tabelle.
- Danach dieses Dokument auf den Status „Entwurf“ bringen.
