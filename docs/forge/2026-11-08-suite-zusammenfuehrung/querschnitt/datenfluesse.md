# Datenflüsse – wer liefert welche Daten an wen

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [artikel-lebenszyklus](artikel-lebenszyklus.md) · [datenmodell](datenmodell.md) · [leitplanken](../leitplanken.md) (L1, L2)
Entscheidungen: E0, E5, E6, E9, E10
Schlagworte: Datenfluss, Datenaustausch, Übergabe, Schnittstelle fachlich, Auslöser, Ereignis, Zusammenspiel, liefert, nutzt, rein, raus, D-Nummer

> **Landkarte des Zusammenspiels.** Jeder Fachbereich führt im Abschnitt „Datenflüsse: rein / raus“ nur
> die **D-Nummern** von hier. Neue oder geänderte Flüsse werden **hier** eingetragen (Arbeitsregel
> „eine Quelle je Wahrheit“). Fachliche Sicht: *wer* liefert *was* an *wen*, *wann*. Das *Wie*
> (Technik) ist nicht Thema. Alles liegt in **einer** Datenbank (E0). „Liefern“ heißt also:
> Daten entstehen oder ändern sich, und andere Bereiche dürfen sie ab dann nutzen.

## Überblick

```
                     Verwaltung (Basar, Termine, Stammdaten, Konten)
                          │ D1–D4 (gelten für alle)
                          ▼
 Voranmeldung ──D5,D6──► Annahme ──D9──► Verkauf/Kasse ──D12──► Rückgabe/Abrechnung
   ▲   ▲                   │  │            │   │                   │    │
   │   └────D10 (Sicht)────┘  │            │   └─D13 (Sicht)─┐     │    │
   │                          ├─D11────────┼──► Katalog ◄────┘     │    │
   └───────D15, D17 (Ergebnis, wieder beim Verkäufer)──────────────┘    │
                              └──────► Druck, Statistik ◄───────────────┘
```

## Landkarte

| # | Daten | von | an | Auslöser / wann | Zustand danach | Wer darf danach ändern |
|---|---|---|---|---|---|---|
| D1 | Basar mit Terminen und Nummernbereichen | Verwaltung | alle | Admin legt den Basar an bzw. ändert ihn | – | Admin |
| D2 | Marken, Kategorien, Verkäufer-Typen | Verwaltung (Pflege), alle Rollen (Neu über AutoComplete) | Voranmeldung, Annahme (Katalog erhält sie über D11) | jederzeit | Neu-Einträge `original = false` | Admin (ändern, zusammenführen) |
| D3 | Konten und Rollen | Verwaltung, Voranmeldung (Selbstregistrierung) | alle | Registrierung, Einladung, Anlage durch Admin | – | Konto-Inhaber (eigene Daten), Admin |
| D4 | Konditionen-Vorlage (Provision, Annahmegebühr) | Verwaltung (Verkäufer-Typ) | Voranmeldung (Anzeige), Annahme | Typ-Pflege | – | Admin |
| D5 | Verkäufer und Teilnahme am Basar, Nummernblöcke | Voranmeldung | Annahme, Verwaltung, Statistik | Registrierung bzw. Teilnahme | – | Verkäufer (Kontakt), Admin |
| D6 | Artikel im Entwurf (Angaben, Preis, Voranmelde-Nummer) | Voranmeldung | Annahme, Verwaltung, Druck (Artikelliste), Statistik | Verkäufer erfasst; Neuanlage bis Voranmeldeschluss | **Entwurf** | Verkäufer bis zur Annahme (E5) |
| D7 | Laufkunde (Verkäufer ohne Konto) | Annahme | Verwaltung, Abrechnung, Statistik | Anlage am Annahmetisch | – | Kassenpersonal, Admin |
| D8 | Artikel aus Nachmeldung oder von Laufkunden | Annahme | geht in D9 ein (gleiche Empfänger) | Erfassung am Annahmetisch | direkt **Im Verkauf** | Kassenpersonal |
| D9 | **Annahme:** Artikel angenommen, Basar-Tag-Nummer, Korrekturen, gezahlte Annahmegebühr, eingefrorene Konditionen | Annahme | Kasse, Rückgabe/Abrechnung, Druck (Abgabe-Beleg), Statistik | Abschluss der Annahme je Verkäufer | **Im Verkauf** | Kassenpersonal; Verkäufer **gesperrt** |
| D10 | Annahme-Sicht für den Verkäufer: Basar-Tag-Nummer, Zustand, Gebühr, Ablehnungsgrund | Annahme | Voranmeldung | mit D9 bzw. Ablehnung | Im Verkauf / Abgelehnt | – (nur lesen) |
| D11 | Öffentliche Artikelliste (Positivliste, ohne Personenbezug) | Annahme (neu im Verkauf), Kasse (weg nach Verkauf), Rückgabe (weg nach Rückgabe) | Katalog | laufend, ca. jede Minute | – | – (nur lesen) |
| D12 | **Kassenvorgang:** verkaufte Artikel, Summe, Kassierer, Zeit; Storno | Kasse | Rückgabe/Abrechnung, Statistik | Bezahlen bzw. Storno | **Verkauft** (Storno: zurück zu Im Verkauf) | niemand (Storno nur durch Kasse bzw. Admin) |
| D13 | Verkaufs-Sicht für den Verkäufer: „verkauft“, vorläufiger Wert | Kasse | Voranmeldung | mit D12 | Verkauft | – (nur lesen) |
| D14 | **Rückgabe:** zurückgegebene Artikel, Verlust, Spende | Rückgabe | Abrechnung, Statistik | Rückgabe-Scan je Artikel | **Zurückgegeben** / Verlust / Gespendet | Verkäufer (Zurückgegeben: wiederverwenden, E5b) |
| D15 | Rückgabe-Sicht für den Verkäufer | Rückgabe | Voranmeldung | mit D14 | wieder beim Verkäufer | Verkäufer |
| D16 | **Abrechnung:** Verkaufssumme, Provision, Auszahlung, Beleg; Nicht abgegeben markiert | Abrechnung | Statistik, Druck (Beleg) | Abschluss je Verkäufer, wenn nichts mehr im Verkauf | Teilnahme **abgerechnet** | niemand (Storno nur durch Admin) |
| D17 | Ergebnis für den Verkäufer: Auszahlung, Beleg | Abrechnung | Voranmeldung | mit D16 | – | – (nur lesen) |
| D18 | Kennzahlen | Statistik (berechnet aus allen Flüssen) | Verwaltung (Dashboard), Voranmeldung (eigene Kennzahlen), Katalog (nur Aggregate) | laufend | – | – |

## Regeln für alle Flüsse

- **Ein Datensatz, kein Kopieren** (L1): Ein Fluss ändert den Zustand oder fügt Daten hinzu. Er erzeugt keine Kopie.
- **Wer verantwortlich ist, steht im [Lebenszyklus](artikel-lebenszyklus.md).** Diese Landkarte nennt nur die Auslöser.
- **Sichten für den Verkäufer** (D10, D13, D15, D17) sind reine Leserechte. Inhalt und Umfang regelt E6.
- **Öffentlich** (D11, Aggregate aus D18) nur nach der Positivliste in [datenschutz](datenschutz.md).
- **Bei Unklarheit** gilt der heutige Ablauf der Haupt-App (E25).

## Berührungspunkte

- alle [Fachbereiche](../fachbereiche/): Abschnitt „Datenflüsse: rein / raus“
- [artikel-lebenszyklus](artikel-lebenszyklus.md): Zustände und Rechte
- [datenmodell](datenmodell.md): welche Entität betroffen ist

## Offene Fragen

1. D2: Werden Neu-Einträge (`original = false`) sofort im Katalog sichtbar (siehe auswahlfelder, Frage 3)?
2. D9: Gibt es Annahme vor Verkaufsöffnung, also einen Zwischenzustand „angenommen, noch nicht im Verkauf“ (siehe annahme, Frage 1)?
3. D13: Darf ein vorläufiger Wert angezeigt werden (E6)?
4. Fehlen Flüsse, z. B. E-Mail-Benachrichtigungen an Verkäufer (siehe voranmeldung, Frage 3)?

## Nächste Planungsschritte

- Bei jedem Fachgespräch die betroffenen D-Zeilen prüfen und schärfen (Skill `suite-fachgespraech`).
