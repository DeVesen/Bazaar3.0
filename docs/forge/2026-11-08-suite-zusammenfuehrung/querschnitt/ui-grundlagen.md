# UI-Grundlagen: Komponenten, Breakpoints, Shell, Feedback

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [leitplanken](../leitplanken.md) (L0, L6) · [auswahlfelder-stammdaten](auswahlfelder-stammdaten.md)
Entscheidungen: E19, E21, E22, E23, E25
Schlagworte: Breakpoint, Responsive, Mobile, Desktop, Tablet, Sidebar, Burger, Shell, Modal, Toast, Result-Overlay, Branding, Styleguide, Industry, PrimeNG, Dumb Component, Page, Form-Grid

## Zweck und Abgrenzung

Hier stehen die **gemeinsamen Gestaltungs- und Bedienregeln** aller Frontends der Suite (Voranmeldung, Basar,
Katalog). Einzelne Komponenten sind unter [`docs/components/`](../../../components/overview.md) beschrieben.
Seitenbezogene Ausprägungen gehören in die Fachbereiche.

**Maßstab ist die Haupt-App (L0, E25).** Ihre Regeln sind bewährt. Die Voranmeldung wird angeglichen.

## Heute

| Thema | Haupt-App (**führend**) | Voranmeldung (wird angeglichen) |
|---|---|---|
| UI-Bibliothek | PrimeNG, Dumb Components | gleich |
| Shell-Breakpoints | **zwei Stufen:** Mobile ≤ 768 / Desktop > 768 (`bazaar-app/spec.md` §7.1) | drei Stufen (zusätzlich Tablet ≤ 1024) |
| Shell | Sidebar fest ab 769 px, Titelleiste nur Mobile, **kein Role-Toggle** (§4) | Sidebar, Burger ab Tablet, Role-Toggle |
| Seitenrahmen | [Page](../../../components/page/component.md): 75vw ab 769 px | – |
| Modals | 80 % / 90 vh, Mobile 100 % ohne Radius | gleich |
| Branding | Styleguide **„Industry“** ([`bazaar-app/design/industry-styleguide.md`](../../../requirements/bazaar-app/design/industry-styleguide.md)), §10.1 | abweichend bzw. ungeprüft |
| Feedback | Toasts (§10.2), Result-Overlay mit Ton und Vibration an Kasse und Scan | Toasts |

## Ziel

### Regeln

- **Nur PrimeNG.** Ein eigener Wrapper nur, wo PrimeNG nichts Passendes hat (Grundregel aus `docs/components/overview.md`).
- **Ein geteilter Komponenten-Bestand** für alle Frontends. Heute liegen die Komponenten doppelt im Code. Wie sie geteilt werden, ist noch offen (z. B. eine gemeinsame Angular-Bibliothek).
- **Breakpoints (E21, entschieden):**

| Ebene | Regel | Quelle |
|---|---|---|
| Shell (Navigation, Titelleiste) | Mobile ≤ 768 px: Burger, slide-in, Titelleiste · Desktop > 768 px: Sidebar fest | Haupt-App §7.1 |
| Seitenrahmen | ≤ 768 px volle Breite · ≥ 769 px max. 75vw zentriert | [Page](../../../components/page/component.md) |
| Komponenten | eigene Stufen laut Komponenten-Doku, z. B. Form-Grid einspaltig ≤ 1024 px ([Card](../../../components/card/component.md)), Modal gestuft ([Modal](../../../components/modal/component.md)), Filter-Panel kollabiert < 768 px | `docs/components/` |

  Die Tablet-Stufe der Voranmelde-**Shell** entfällt.
- **Branding (E23, entschieden):** Styleguide „Industry“ der Haupt-App für alle drei Frontends: Farben, Schrift (Barlow Condensed), Logo „Bazaar **Suite**“ und Kontrastvorgaben (WCAG AA, auch für ältere Laptop-Displays). Der Katalog darf sich zusätzlich an die Vereins-Homepage anlehnen (offen). `docs/style-guide/` gilt **nicht**, es beschreibt ein fremdes Projekt.
- **Kein Role-Toggle (E22).** Die rollenabhängige Navigation folgt der [Rechte-Matrix](identitaet-rollen.md).
- **Ein Feedback-Muster:**
  - Toast für Erfolg und Fehler
  - Bestätigungsdialog bei zerstörenden Aktionen
  - Result-Overlay für Scan und Kasse
  - Fehlermeldungen: Der deutsche Text kommt aus dem Backend (`detail`). Der `errorCode` steuert nur besondere Reaktionen im Frontend ([api-konventionen](api-konventionen.md), E26)
- **Gleiche Seitenmuster:** Liste mit Filter-Panel und Tabelle, Dialog zum Anlegen und Bearbeiten, KPI-Kacheln, Formularseite im Form-Grid.
- **Sprache:** UI deutsch, Datum und Zahlen im deutschen Format, Euro.
- **Geräte am Basar-Tag:** Touch-tauglich (Numpad), Scanner per Tastatur-Emulation oder Kamera, Druck über den Browser.

### Frontends (E19)

| Frontend | Nutzer | Schwerpunkt |
|---|---|---|
| Voranmeldung (Portal) | Verkäufer, Händler | häufig am Handy genutzt. Mobile-Stufe besonders sorgfältig. |
| Basar | Team, Admin | Desktop und Tablet im Querformat, Kasse und Scan optimiert (heutige Haupt-App) |
| Katalog | Interessenten | Mobile-Stufe, ohne Anmeldung, sehr schlank |

## Berührungspunkte

- [auswahlfelder-stammdaten](auswahlfelder-stammdaten.md): Feld-Katalog
- [identitaet-rollen](identitaet-rollen.md): rollenabhängige Navigation, Login-Layout
- alle Fachbereiche: verwenden nur diese Muster

## Offene Fragen

1. Welche Seiten der Voranmeldung nutzen heute die Tablet-Stufe der Shell (z. B. Verkäufernummer-Panel, Profil) und wie werden sie angeglichen?
2. Wie wird der gemeinsame Komponenten-Bestand technisch geteilt?
3. Wird `docs/style-guide/` (fremdes Projekt) entfernt?

## Nächste Planungsschritte

- Abgleich der Voranmelde-Oberfläche mit Styleguide und Shell der Haupt-App als Liste der Abweichungen.
