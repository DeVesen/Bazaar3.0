# Umsetzung — Plan: docs/forge/2026-10-13-ergebnis-einblendung/plan.md

## Abschlussbericht
# Abschlussbericht Umsetzung — Ergebnis-Einblendung

Bereich: `forge-base/2026-10-13-ergebnis-einblendung..HEAD` (54b6105..73008ae)
Tasks: 4 (alle fertig), 1 Final-Fix-Welle (73008ae)

## Urteile
- Urteil: Task-1-Finding 🔴 (PING/ZONK-Duplikat zu scan-feedback.ts) geparkt — Spec-Maßstab: Randbedingung „app-scan-feedback bleibt für Wareneingang unverändert", Plan-Entscheidungen E/R1/F legen Trennung bewusst fest, kein W-Eintrag widerspricht — Kosten falls falsch: Drift zwischen Tonmustern, spätere Konsolidierung.

## Offene Punkte
- settlement-page.spec `template_sellerSelected_rendersOnlyIconBackButtonOnTheLeftAndNoActionsLeftOfTheName` rot, laut allen Läufen unberührt von diesem Diff; Beleg erbracht: auf Basis 54b6105 einzeln gelaufen (Inhalt der Dateien mit 54b6105 verglichen), derselbe Test rot (`AssertionError: expected 'Zurück' to be ''`, 1 failed | 39 passed), also vorbestehend; wird als eigener Fix außerhalb dieses Merges geführt.
- 🟡 Anforderungs-Doku nicht nachgezogen: Epic_Verkaeufer/epic.md:205, Epic_Verkauf/stories/VERKAUF-S01-eingabemodi.md:24, Epic_Abrechnung/epic.md:123 sprechen noch von Countdown-Feedback.
- 🟢 Feature-Profile bazaar-app-sellers / bazaar-app-settlement beschreiben noch Ring-Countdown (Profile-Update nach Merge).
- 🟢 ScanCompleteEvent-Doc: `'already-set'` jetzt auch für frühere `'unknown'`-Fälle.
- Zurückgestellt (Test-Stil, plan-vorgeschrieben): Mehrfach-Assertions in specs; reduced-motion-Test ohne Eigenwert; handleArticleFound Fehlerblock 5× (checkout-page.ts); component.md-Politur result-overlay.

## Urteile
- Urteil: Finding Task 1 (🔴 PING/ZONK-Duplikat zu scan-feedback.ts) geparkt, nicht gefixt — Spec-Maßstab: Randbedingung "app-scan-feedback bleibt für Wareneingang unverändert" + Plan-Entscheidungen E/R1/F legen Trennung bewusst fest; Kommentar markiert die Synchronität; kein W-Eintrag in Spec/Plan widerspricht — Kosten falls falsch: Drift zwischen beiden Tonmustern, später Konsolidierung nötig.

## Zurückgestellt und geparkt
- Task 1: Bedenken: Gesamtsuite 996/997, settlement-page.spec 'template_sellerSelected_rendersOnlyIconBackButtonOnTheLeftAndNoActionsLeftOfTheName' rot, ausserhalb Task, vermutlich vorbestehend; npm ci im Worktree (nicht committet)
- Task 1: geparkt — PING/ZONK-Duplikat — Urteil: bewusst getrennt laut Plan (E/R1/F), echt, zurückgestellt
- Task 1: zurückgestellt: 🟡 Mehrfach-Assertions in result-cue.spec (Plan-vorgeschrieben); 🟡 Index-Kopplung onended-Test; 🟢 Literal 'cart'
- Task 2: zurückgestellt: 🟡 reduced-motion-Test prüft nichts Eigenes (matchMedia ungenutzt); 🟡 Mehrfach-Assertions/mehrzeilige Acts in result-overlay.spec; 🟢 Index in component.md nennt nicht existierende Überschriften
- Task 3: Bedenken: Spec-Helfer byNumberMap musste als Record<number, ByNumberFixture | HttpErrorResponse> typisiert werden; component.md Zeile 108 (pauseMs 'Anzeigedauer des Scan-Feedbacks') evtl. veraltet, nicht im Brief
- Task 3: zurückgestellt: 🟡 component.md:108 pauseMs-Zeile veraltet; 🟡 component.md:50/87 veraltete Feedback-Overlay-Hinweise; 🟢 Abschnitt-Platzierung component.md; 🟢 scanLocked-Kommentar scan-dialog.ts:196; 🟢 Testnamen/confirmVia (plan-vorgeschrieben)
- Task 4: zurückgestellt: 🟡 handleArticleFound: Fehlerblock (foundArticle.set(null), showResult('failed'), Fokus) 5× statt einmal hinter switch (Abweichung vom Brief); 🟢 Mehrfach-Aktion im Test onTyped_WhileOverlayIsShown (Brief)

## Stand
- Stand: 73008aea
- Gesamtlauf: 0a4ffde grün (1050 Tests, 1 vorbestehend rot: settlement-page)

## Planabweichungen
- Task 3: `resetSession` setzt `resultEvent` zusätzlich auf null (Fix 73008aea, verhindert veraltete Einblendung beim erneuten Öffnen), und `result-overlay/component.md` trägt dazu eine Zeile; beides steht nicht im Plan. Keine Wirkung auf Namen, Signaturen oder Constraints.
