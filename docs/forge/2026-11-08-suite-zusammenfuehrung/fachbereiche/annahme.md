# Fachbereich Annahme – Übergabe Verkäufer → Basar-Team

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [artikel-lebenszyklus](../querschnitt/artikel-lebenszyklus.md) · [nummern](../querschnitt/nummern.md) · [druck-etiketten](druck-etiketten.md)
Entscheidungen: E3, E4, E8, E9, E12
Schlagworte: Annahme, Artikelannahme, Abgabe, Freigabe-Scan, Übergabe, Annahmetisch, Annahmegebühr, Abgabe-Beleg, Ablehnen, Laufkunde, Nachmeldung, Massenannahme

## Zweck und Abgrenzung

Die Annahme am Basar-Tag: Der Verkäufer bringt seine Artikel, das Team prüft und übernimmt sie in seine
Verantwortung. Danach sind sie **Im Verkauf**. Sie ersetzt den heutigen Import, den Freigabe-Scan und die Artikelannahme.

## Heute

Haupt-App: [`Epic_Artikelannahme`](../../../requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md), Freigabe-Scan in
[`Epic_Verkaeufer`](../../../requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md) §6, JSON-Import in den Einstellungen.

- Am Morgen importiert der Admin die Voranmeldedaten. Erst danach kann angenommen werden.
- Es gibt zwei Wege: den Freigabe-Scan (Vorangemeldete in Masse) und die Artikelannahme (Laufkunden und Korrekturen).
- Die Annahmegebühr wird kassiert, danach wird der Abgabe-Beleg gedruckt.
- Beim Umnummerieren wird der Artikel gelöscht und neu angelegt (V1).

## Ziel

### Ablauf am Annahmetisch

1. **Verkäufer identifizieren:** QR im Profil scannen, Nummer eingeben oder nach Namen suchen. Laufkunden werden neu angelegt (E8).
2. **Artikel annehmen:** Etikett scannen oder Nummer eingeben. Das System findet den vorangemeldeten Artikel über die Voranmelde-Nummer.
   - Es zeigt **Systempreis**, Bezeichnung und Größe zum Abgleich mit dem Etikett (E12).
   - Die Basar-Tag-Nummer wird gesetzt: gleich der Voranmelde-Nummer (E3, c') oder aus dem Ausnahme-Bereich.
   - Korrekturen an Preis und Angaben sind möglich. Der Artikel bleibt **derselbe Datensatz**.
3. **Ablehnen** mit Grund (Flecken, Saison, Rückruf). Der Artikel wird „Abgelehnt“, der Verkäufer sieht den Grund.
4. **Nachmeldungen und Laufkunden-Artikel** werden direkt erfasst und bekommen eine Nummer aus dem Ausnahme-Bereich auf einem Blanko-Etikett.
5. **Abschließen:**
   - Annahmegebühr kassieren.
   - Die Konditionen der Teilnahme werden eingefroren (E9).
   - Abgabe-Beleg drucken.
   - Alle angenommenen Artikel sind **Im Verkauf**, für den Verkäufer gesperrt und im Katalog sichtbar (ab Verkaufsöffnung).

**Kein Import mehr:** Die vorangemeldeten Daten sind schon im gemeinsamen Bestand (E0).

### Tempo

- Massenannahme ist möglich: alle Artikel eines Verkäufers per Scan-Serie, ohne Dialog je Artikel.
- Der Dialog öffnet nur bei Abweichungen.

## Berührungspunkte

- [lebenszyklus](../querschnitt/artikel-lebenszyklus.md): Übergang Entwurf → Im Verkauf / Abgelehnt
- [nummern](../querschnitt/nummern.md): Vergabe, Ausnahme-Bereich
- [druck-etiketten](druck-etiketten.md): Abgabe-Beleg, Blanko-Etiketten
- [voranmeldung](voranmeldung.md): Sperre beginnt
- [verkauf-kasse](verkauf-kasse.md): ab jetzt verkaufbar

## Offene Fragen

1. Darf die Annahme vor Verkaufsöffnung stattfinden (Vortag)? Bis dahin wäre der Artikel „Im Verkauf“, aber noch nicht verkaufbar. Braucht es einen Zwischenzustand „angenommen“?
2. Annahmegebühr: Wird sie bar am Tisch oder vorab online bezahlt (Online-Zahlung ist Nicht-Ziel)?
3. Wie viele Annahmetische, wie viele Artikel pro Stunde? Davon hängt der Tempo-Bedarf ab.
4. Regeln für Ablehnungsgründe: feste Liste oder Freitext?

## Nächste Planungsschritte

- Ablauf mit der Orga am Tisch durchspielen (Papierprototyp).
- Ausnahmefälle sammeln: unleserliches Etikett, fremde Nummer, abgerechneter Verkäufer kommt mit neuer Kiste.
