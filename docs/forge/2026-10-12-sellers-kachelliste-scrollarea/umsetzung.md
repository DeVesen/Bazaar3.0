# Umsetzung — Plan: docs/forge/2026-10-12-sellers-kachelliste-scrollarea/plan.md

## Abschlussbericht
# Abschlussbericht Umsetzung sellers-kachelliste-scrollarea
Bereich: forge-base/2026-10-12-sellers-kachelliste-scrollarea..HEAD (09a5c44..91de48c), 4 Tasks, 3 Commits (T1 2f30148, T2 af1ded6, T3 91de48c; T4 ohne Diff).

## Urteile
- Task 4 ohne Commit und ohne Task-Review — kein Diff, reiner Absicherungs-Task — falls falsch: fällt im Implementation-Review auf.

## Offene Punkte
- 🟡 variant="auto": laut PrimeNG-CSS Scrollbar opacity 0, sichtbar nur bei Hover/Scroll; Spec meint "nur bei Überlauf" (evtl. "always"). Entscheidung Mensch. Betrifft sellers-page.html und Test render_withSellers_usesAutoScrollbarWithoutFadeMask.
- 🟡 Aura-Token scrollarea.viewport.padding = 1rem rückt Kachelgrid ein; Plan wollte Optik unverändert. Neutralisieren (padding 0 + ggf. padding-inline-end für Scrollbar).
- 🟢 Filterwechsel mit fehlgeschlagenem Request springt trotzdem nach oben.
- AC-01 nur per Sichtprüfung (>=769px).
- Gesamtsuite 858/860: artikel-dialog und session-item-popup 5s-Timeout unter Parallellast, einzeln grün.
- Build-Budget-Warnung 795 kB > 500 kB nicht gegen Basis geprüft.

## Urteile
- Urteil: Task 4 ohne Commit, kein Task-Review — kein Diff, reiner Absicherungs-Task — falls falsch: Fehler fällt im Final-Review/Implementation-Review auf

## Zurückgestellt und geparkt
- Task 1: Bedenken: Gesamtsuite instabil unter Parallellast (5s-Timeouts in fremden Specs, einzeln grün); npm ci im Worktree nötig; dv-angular-build nicht gelaufen
- Task 1: zurückgestellt: sellers-page.spec.ts:195-376 Einrückung 2 statt 4 Leerzeichen (Format)
- Task 1: zurückgestellt: Test render_withSellers_keepsFilterRowsOutsideScrollArea war vor Änderung schon grün (plan-konform)
- Task 2: zurückgestellt: Prettier-Umformatierung Task-1-Tests in spec (Format-Churn, kein Blocker)
- Task 3: Bedenken: Gesamtsuite instabil unter Parallellast (Timeouts, einzeln grün); Build-Budget-Warnung 795kB>500kB nicht gegen Basis geprüft
- Task 3: zurückgestellt: Test für Filterwechsel ohne Ladephase optional (🟡)
- Task 4: Bedenken: 2 Specs (artikel-dialog, session-item-popup) rot in Gesamtsuite wegen 5s-Timeout unter Last, einzeln grün; AC-01 nur per Sichtprüfung

## Stand
- Stand: 91de48c1
- Gesamtlauf: 91de48c 858/860 (2 Timeouts Last, einzeln grün)
