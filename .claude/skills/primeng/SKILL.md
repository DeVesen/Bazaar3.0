---
name: primeng
description: Use when writing, changing or reviewing Angular UI with PrimeNG (primeng/* imports, p-* components, pButton, PrimeIcons), including its theming, icons, accessibility, animations, forms integration or version upgrade.
---

# PrimeNG v22

Referenzen gelten für v22. Trainingswissen ist veraltet (`<p-button icon="pi pi-x">`, `pTemplate`, `styleClass`, `pi`-Icon-Klassen): Code nur aus den Referenzen schreiben.

## Referenzen gezielt laden

1. Komponente bestimmen. Ordner: `references/components/<slug>/`. Slug oder alter Name unklar: in `references/index.md` per Grep suchen.
2. Je Komponente zuerst `api.md`, dann nur was die Aufgabe braucht:
   - `examples-<variante>.md`: Liste in `examples.md` (Variante, z. B. `examples-button-group.md`).
   - `forms.md`: ngModel, Reactive oder Signal Forms.
   - `theming.md`: nur bei Styling, PassThrough, Design Tokens.
3. Querschnitt: `references/guides/<slug>.md` (accessibility, animations, icons, passthrough, theming-styled, theming-unstyled, tailwind, rtl, configuration, installation, migration-v19 bis v22).
4. Mehrere Komponenten: je Komponente nur die passende Datei laden, nie einen ganzen Ordner.
