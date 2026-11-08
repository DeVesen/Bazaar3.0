# Artikel-Lebenszyklus – wer darf wann was

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [leitplanken](../leitplanken.md) (L1, L2) · [nummern](nummern.md) · [glossar](../glossar.md)
Entscheidungen: E0, E5, E5b, E6, E12, E18

> **Herzstück der Suite.** Jeder Fachbereich richtet sich nach diesem Dokument. Braucht ein
> Fachbereich einen weiteren Zustand oder eine andere Regel, wird sie **hier** ergänzt.

## Zweck und Abgrenzung

Hier stehen die Zustände eines Artikels, die Übergänge, wer sie auslöst und wer in welchem Zustand
was ändern darf. Wie die Nummern vergeben werden, steht in [nummern](nummern.md).

## Heute

- **Voranmeldung:** Ein Artikel hat **keinen** Zustand und ist jederzeit änderbar (`advance-registration/entities/artikel.md`).
- **Haupt-App:** Der Zustand wird aus Zeitstempeln abgeleitet: `acceptedAt`, `releasedAt`, `soldAt`, `returnedAt` (`Bazaar.Domain/Article/Article.cs`). Die Annahme setzt `acceptedAt` und `releasedAt` gleichzeitig. Vorangemeldete Artikel bekommen nie `acceptedAt` (V8).
- Zwischen beiden liegt die Datei-Übergabe. Danach existiert der Artikel doppelt.

## Ziel

**Ein** Artikel-Datensatz durchläuft alle Zustände (L1). Die Verantwortung wechselt durch die
**Annahme** zum Basar-Team und durch die **Rückgabe** zurück zum Verkäufer (L2).

### Zustände

```
            Verkäufer verantwortlich                   Basar-Team verantwortlich              Verkäufer
 ┌───────────┐  Annahme   ┌─────────────┐  Kasse   ┌──────────┐
 │ Entwurf   │──────────►│ Im Verkauf  │────────►│ Verkauft │──────────┐
 └─────┬─────┘           └──────┬──────┘◄────────└──────────┘ Storno   │ Abrechnung
       │ Annahme abgelehnt      │ Rückgabe                             ▼
       ▼                        ▼                                ┌────────────┐
 ┌───────────┐           ┌──────────────┐                        │ Abgerechnet│ (Verkäufer-Ebene)
 │ Abgelehnt │           │ Zurückgegeben│──► wieder Verkäufer     └────────────┘
 └───────────┘           └──────────────┘    (E5b: für nächsten Basar wiederverwendbar)
 Basar-Ende ohne Annahme → Nicht abgegeben      Im Verkauf → Verlust | Gespendet (E18)
```

| Zustand | Verantwortlich | Bedeutung | Ausgelöst durch |
|---|---|---|---|
| **Entwurf** | Verkäufer | erfasst, Voranmelde-Nummer vergeben | Verkäufer legt an (Portal) |
| **Im Verkauf** | Basar-Team | physisch angenommen, Basar-Tag-Nummer vergeben, Gebühr kassiert | Annahme |
| **Abgelehnt** | Verkäufer | bei der Annahme nicht angenommen (Flecken, Saison, Rückruf), mit Grund | Annahme |
| **Verkauft** | Basar-Team | an der Kasse bezahlt | Kasse (Storno führt zurück zu Im Verkauf) |
| **Zurückgegeben** | Verkäufer | an den Verkäufer zurückgegeben | Rückgabe |
| **Nicht abgegeben** | Verkäufer | angemeldet, aber nie gebracht | automatisch zum Basar-Ende bzw. bei der Abrechnung |
| **Verlust** | Basar-Team | nicht auffindbar, blockiert die Abrechnung nicht | Team / Admin |
| **Gespendet** (optional) | – | Spenden statt Rückgabe oder Abholfrist abgelaufen | Rückgabe / Admin (E18) |

**Abgerechnet** ist ein Zustand des **Verkäufers je Basar**, nicht des Artikels. Danach ist im Basar
nichts mehr änderbar.

### Wer darf was (Änderungsrechte)

| Zustand | Verkäufer (Portal) | Basar-Team | Admin |
|---|---|---|---|
| Entwurf (vor Voranmeldeschluss) | alles ändern, löschen, neu anlegen | lesen | alles |
| Entwurf (nach Voranmeldeschluss) | ändern und löschen, **nicht neu anlegen**. Bei Preisänderung erscheint der Hinweis „Etikett anpassen“ (E5). | lesen | alles |
| **Im Verkauf** | **nur lesen** (Änderungssperre, E5) | Preis und Angaben korrigieren | alles |
| Verkauft | nur lesen | nur lesen (Preis gesperrt) | Storno |
| Zurückgegeben | wiederverwenden für den nächsten Basar (E5b) | lesen | alles |
| Abgelehnt, Nicht abgegeben | ändern, wiederverwenden | lesen | alles |
| nach Abrechnung | nur lesen | nur lesen | Abrechnung stornieren |

- **Die Sperre wirkt in der Fachlogik**, nicht nur in der Oberfläche. Sie gilt auch für Datei-Import, Konto-Löschung und Admin-Massenaktionen.
- **Konto löschen** geht nur, solange kein Artikel beim Team liegt oder unabgerechnet ist. Gesetzliche Aufbewahrung siehe [datenschutz](datenschutz.md).
- **Preis bei Abweichung** zwischen Etikett und System: Es gilt das System. Die Annahme zeigt den Systempreis (E12).

### Was der Verkäufer sieht (E6)

| Zustand | Sichtbar für den Verkäufer |
|---|---|
| Entwurf | Voranmelde-Nummer |
| Im Verkauf | zusätzlich **Basar-Tag-Nummer**, Zeitpunkt der Annahme, gezahlte Gebühr |
| Verkauft | „verkauft“ und ein vorläufiger Verkaufswert vor Provision |
| Abgelehnt | Grund |
| nach Abrechnung | Auszahlung und Beleg |

### Mehrere Basare

- Jeder Zustandswechsel gehört zu genau einem Basar.
- **Wiederverwenden** (E5b) heißt: Der Artikel wird für den nächsten Basar wieder Entwurf und bekommt eine neue Voranmelde-Nummer. Offen ist, ob als neuer Datensatz mit Verweis oder als derselbe Datensatz mit Basar-Historie.
- Die Daten vergangener Basare bleiben unveränderlich.

## Berührungspunkte

- [nummern](nummern.md): Vergabe der Basar-Tag-Nummer bei der Annahme
- [annahme](../fachbereiche/annahme.md), [verkauf-kasse](../fachbereiche/verkauf-kasse.md), [rueckgabe-abrechnung](../fachbereiche/rueckgabe-abrechnung.md): lösen die Übergänge aus
- [voranmeldung](../fachbereiche/voranmeldung.md): Sperre und Sicht für den Verkäufer
- [oeffentlicher-katalog](../fachbereiche/oeffentlicher-katalog.md): zeigt nur „Im Verkauf“
- [datenmodell](datenmodell.md): Abbildung (Zeitstempel bzw. Zustandsfeld, Basar-Bezug)

## Offene Fragen

1. Wiederverwenden: neuer Datensatz mit Verweis oder Basar-Historie am selben Datensatz?
2. Freigabe getrennt von der Annahme? Heute gibt es einen „Freigabe-Scan“ für Vorangemeldete. Empfehlung: Er geht in der Annahme auf (ein Schritt).
3. Darf das Team einen Artikel „zurück auf Entwurf“ setzen, z. B. bei versehentlicher Annahme?
4. Verlust: Wer haftet, und wie fließt er in die Abrechnung ein? Das muss die Orga klären.

## Nächste Planungsschritte

- E5, E5b und E18 abstimmen.
- Übergänge als Liste von Ereignissen mit Vorbedingungen ausformulieren (Grundlage für die Stories).
