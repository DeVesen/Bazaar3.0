# API-Konventionen der Suite

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [leitplanken](../leitplanken.md) (L8) · [identitaet-rollen](identitaet-rollen.md) · [zielbild](../architektur/zielbild.md)
Entscheidungen: E2, E25, E26
Schlagworte: API, Endpunkt, Route, ProblemDetails, errorCode, Fehler, 409, Paginierung, Suche, Sortierung, Auth-Stufe, ID, Kennung, Vertrag, Kompatibilität

## Zweck und Abgrenzung

Hier stehen die **einheitlichen Regeln für alle Schnittstellen** der Suite. Die einzelnen Endpunkte gehören in
die spätere Spec der jeweiligen Module.

## Heute

Beide Apps haben eine eigene, weitgehend ähnliche Querschnittsdatei. **Führend ist die Haupt-App (E25):**
[`advance-registration/api/cross-cutting.md`](../../../requirements/advance-registration/api/cross-cutting.md) und
[`bazaar-app/api/cross-cutting.md`](../../../requirements/bazaar-app/api/cross-cutting.md).

| Thema | Voranmeldung | Haupt-App |
|---|---|---|
| Präfix | `/api`, eigene Daten mit `/mine`, öffentlich `/api/public/` | `/api` |
| Ressourcen | englisch, Plural, kebab-case | gleich |
| Fehler | ProblemDetails + `errorCode` **für Übersetzung** | ProblemDetails + `errorCode` **für Programmlogik, nicht für Übersetzung** |
| errorCode-Katalog | eigener | eigener |
| Paginierung, Suche, Sortierung | eigene Regeln | eigene Regeln |
| Sperrregeln, Transaktions-Vorgänge | – | eigene Abschnitte (§7, §8) |
| IDs | 8 Zeichen alphanumerisch | gleich |

## Ziel

- **Eine** Querschnittsdatei für die Suite. Sie ersetzt beide heutigen, sobald die Suite-Spec entsteht.
- **Pfade je Container:**
  - Portal-API und Basar-API teilen die Konventionen, nicht zwingend die Routen.
  - Öffentliches liegt immer unter `/api/public/` und wird vom Katalog-Container bedient.
- **Fehler:**
  - ProblemDetails (RFC 9457) mit **einem** errorCode-Katalog.
  - **Regel der Haupt-App (E26):** Die Suite ist einsprachig deutsch. Der deutsche Meldungstext steht in `detail`, der `errorCode` (z. B. `article.number_taken`) dient der **Programmlogik**, also besonderen Reaktionen im Frontend, nicht der Übersetzung.
  - Validierungsfehler kommen zusätzlich in `errors`, Schlüssel ist der englische DTO-Feldname.
  - Die Abbildung erfolgt zentral an einer Stelle im Backend.
- **Paginierung, Suche, Sortierung:** eine Regel. Basis ist die Haupt-App, ergänzt um Fälle, die nur die Voranmeldung kennt (z. B. `/mine`, `/api/public/`).
- **Zustandsabhängige Sperren:** Antwort `409` mit errorCode, z. B. „Artikel liegt beim Basar-Team“ ([lebenszyklus](artikel-lebenszyklus.md)).
- **Gleichzeitigkeit:** Konflikte bei paralleler Änderung werden erkannt und mit `409` beantwortet.
- **Auth-Stufen:** anonym / angemeldet / Rolle (Verkäufer, Team, Admin) je Endpunkt, passend zur [Rechte-Matrix](identitaet-rollen.md).
- **Kennungen:** ein Format suite-weit. Vor Ort erzeugte Kennungen dürfen nicht mit Portal-Kennungen kollidieren. Mit **einer** Datenbank ist das per Unique-Constraint gelöst.
- **Kompatibilität (L10):** Die neuen APIs bedienen zunächst die heutigen Verträge beider Frontends. Abweichungen werden versioniert und angekündigt.

## Berührungspunkte

- [identitaet-rollen](identitaet-rollen.md): Auth-Stufen
- [ui-grundlagen](ui-grundlagen.md): Fehlertexte im Frontend
- [migration](../architektur/migration.md): Kompatibilität der Verträge

## Offene Fragen

1. Paginierung: serverseitig überall, auch an der Kasse?

## Nächste Planungsschritte

- Beide Querschnittsdateien Abschnitt für Abschnitt abgleichen und eine Vereinigungsliste erstellen.
