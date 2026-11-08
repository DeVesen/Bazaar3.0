# API-Konventionen der Suite

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [leitplanken](../leitplanken.md) (L8) · [identitaet-rollen](identitaet-rollen.md) · [zielbild](../architektur/zielbild.md)
Entscheidungen: E2

## Zweck und Abgrenzung

Hier stehen die **einheitlichen Regeln für alle Schnittstellen** der Suite. Die einzelnen Endpunkte gehören in
die spätere Spec der jeweiligen Module.

## Heute

Beide Apps haben eine eigene, weitgehend ähnliche Querschnittsdatei:
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
  - ProblemDetails mit **einem** errorCode-Katalog.
  - Grundsatz: Der `errorCode` ist ein stabiler Schlüssel für Programmlogik **und** für Texte im Frontend.
  - Den Widerspruch zwischen den beiden heutigen Regeln auflösen.
- **Paginierung, Suche, Sortierung:** eine Regel. Basis ist die Voranmeldung, ergänzt um die Haupt-App-Sonderfälle.
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

1. errorCode: Ist er künftig die Übersetzungsgrundlage? Wo liegen die Texte (Frontend oder Backend)?
2. Paginierung: serverseitig überall, auch an der Kasse?

## Nächste Planungsschritte

- Beide Querschnittsdateien Abschnitt für Abschnitt abgleichen und eine Vereinigungsliste erstellen.
