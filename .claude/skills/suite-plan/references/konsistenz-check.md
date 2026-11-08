# Konsistenz-Check für den Planungs-Hub

Ziel: Der Plan bleibt aus einem Guss. Mit Grep, Glob und Read prüfen (plattformunabhängig). `HUB/` =
`docs/forge/2026-11-08-suite-zusammenfuehrung/`, `historie/` immer ausnehmen.

| # | Prüfung | Wie | Bei Befund |
|---|---|---|---|
| K1 | **Köpfe vollständig** | Grep `^Status:`, `^Lesen zusammen mit:`, `^Schlagworte:` mit Glob `**/*.md`, Zähler je Datei | Kopf nach Vorlage ergänzen |
| K2 | **Verweise gültig** | Grep `\]\(([^)#]+)` in geänderten Dateien; jedes Ziel per Glob prüfen (Pfad relativ zur Datei) | Pfad korrigieren |
| K3 | **E-Nummern existieren** | Grep `\bE[0-9]+b?\b` in Teildokumenten; jede Nummer in `entscheidungen.md` per Grep `^\| \*?\*?E⟨n⟩ ` nachschlagen | Entscheidung anlegen oder Verweis korrigieren |
| K4 | **Entscheidungsstatus aktuell** | Die im Teildokument genannte Empfehlung bzw. Entscheidung mit der Zeile in `entscheidungen.md` vergleichen | Teildokument an das Log angleichen, nie umgekehrt |
| K5 | **Keine doppelten Regeln** | Kernaussagen des Querschnitts (z. B. „ab Annahme gesperrt“, „768 px“) per Grep in `fachbereiche/` suchen | durch einen Verweis auf den Querschnitt ersetzen |
| K6 | **Begriffe einheitlich** | Abgelöste Begriffe aus `glossar.md` (Spalte „Löst ab“, z. B. `Abgabegebühr`, `Freigabe-Scan`) per Grep suchen | Glossarbegriff verwenden, außer im Abschnitt „Heute“ |
| K7 | **Haupt-App führt** | Bei Regeln, die beide Apps kennen, die Quelle prüfen: steht die Haupt-App-Regel im Ziel? | angleichen oder eine bewusste Ausnahme als Entscheidung loggen |
| K8 | **Index deckt ab** | Für neue Schlagworte des Kopfs per Grep in `index.md` prüfen | Indexzeile ergänzen |
| K9 | **Prüfvermerke offen** | Grep `⚠ prüfen` | dem Nutzer melden, abarbeiten oder bewusst stehen lassen |
| K10 | **Länge** | Zeilen der geänderten Teildokumente zählen (Read zeigt Zeilennummern) | über ~150 Zeilen aufteilen (Ablauf F); Nachschlagewerke ausgenommen |
| K11 | **Ebene** | Nach Implementierungsdetails suchen (Klassennamen, Spaltentypen, HTTP-Verben in Ziel-Abschnitten) | auf Stakeholder-Ebene zurückführen oder als „Hinweis für die Umsetzung“ kennzeichnen |

Ergebnis an den Nutzer: Tabelle der Befunde mit Datei, Prüfung und Vorschlag. Behoben wird erst nach Zustimmung, außer bei
reinen Formfehlern (K1, K2, K8).
