import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import {
  PRINT_TEXT_MAX_LENGTH,
  PrintTextField,
  PrintTextSection,
  PrintTexts,
  PrintTextsApi,
  emptyPrintTexts,
} from '../../data/print-texts-api';

/**
 * Admin-Formular für die zehn Freitexte der Belege (Abgabe-Beleg und Verkäufer-Übersicht, je
 * Freitext 1 bis 5). Ein gemeinsamer Speichern-Button für beide Vorlagen, eigener Endpoint —
 * unabhängig vom `settings-form` (Scan-Pause). Die Route `/settings` trägt bereits `adminGuard`,
 * deshalb prüft diese Komponente die Rolle nicht erneut.
 *
 * Die Felder stehen wie auf dem Beleg: Freitext 1 und 2 nebeneinander, Freitext 3 über die
 * ganze Breite, Freitext 4 und 5 nebeneinander (docs/forge/2026-10-18-einstellungen-tabs/spec.md).
 * `hasUnsavedChanges`/`discardChanges()` dienen der Rückfrage beim Tab-Wechsel.
 */
@Component({
  selector: 'app-print-texts-form',
  imports: [FormsModule, ButtonModule, TextareaModule],
  templateUrl: './print-texts-form.html',
  styleUrl: './print-texts-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintTextsForm {
  private readonly printTextsApi = inject(PrintTextsApi);
  private readonly messageService = inject(MessageService);

  /** Zuletzt geladener oder gespeicherter Stand — Bezug für `hasUnsavedChanges` und `discardChanges()`. */
  private readonly savedTexts = signal<PrintTexts>(emptyPrintTexts());

  readonly maxLength = PRINT_TEXT_MAX_LENGTH;
  readonly sections: readonly { key: PrintTextSection; title: string }[] = [
    { key: 'abgabeBeleg', title: 'Abgabe-Beleg' },
    { key: 'verkaeuferUebersicht', title: 'Verkäufer-Übersicht' },
  ];
  readonly fields: readonly { key: PrintTextField; label: string; fullWidth: boolean }[] = [
    { key: 'text1', label: 'Freitext 1 (Kopfzeile links)', fullWidth: false },
    { key: 'text2', label: 'Freitext 2 (Kopfzeile Mitte)', fullWidth: false },
    { key: 'text3', label: 'Freitext 3 (über der Artikelliste)', fullWidth: true },
    { key: 'text4', label: 'Freitext 4 (Fußzeile links)', fullWidth: false },
    { key: 'text5', label: 'Freitext 5 (Fußzeile Mitte)', fullWidth: false },
  ];
  readonly helpText =
    'Markdown: Überschriften, Fett, Kursiv, Absätze, Listen und Tabellen. Links, Bilder und HTML werden nicht dargestellt. Änderungen gelten ab dem nächsten Druck.';
  readonly spaceHint =
    'Der Platz auf dem Beleg ist begrenzt: Freitext 1, 2, 4 und 5 fassen nur wenige Zeilen in Kopf- bzw. Fußzeile, Freitext 3 höchstens 15 cm über der Artikelliste. Längerer Text wird beim Druck abgeschnitten.';

  readonly texts = signal<PrintTexts>(emptyPrintTexts());
  readonly saving = signal(false);
  /** Erst nach erfolgreichem Laden darf gespeichert werden, sonst überschreiben leere Felder die Sätze. */
  readonly loaded = signal(false);
  readonly hasUnsavedChanges = computed(() => this.differsFromSaved(this.texts()));

  constructor() {
    this.printTextsApi.get().subscribe({
      next: (texts) => {
        this.texts.set(texts);
        this.savedTexts.set(texts);
        this.loaded.set(true);
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Freitexte konnten nicht geladen werden',
        }),
    });
  }

  valueOf(section: PrintTextSection, field: PrintTextField): string {
    return this.texts()[section][field];
  }

  onChange(section: PrintTextSection, field: PrintTextField, value: string): void {
    this.texts.update((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  }

  onSave(): void {
    if (!this.loaded()) {
      return;
    }
    const texts = this.texts();
    this.saving.set(true);
    this.printTextsApi.update(texts).subscribe({
      next: () => {
        this.saving.set(false);
        this.savedTexts.set(texts);
        this.messageService.add({ severity: 'success', summary: '✓ Freitexte gespeichert' });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Freitexte konnten nicht gespeichert werden',
        });
      },
    });
  }

  /**
   * Verwirft ungespeicherte Eingaben und zeigt wieder den zuletzt gespeicherten Stand.
   * Während eines laufenden Speicherns verwirft sie nichts: Die Antwort macht den gesendeten Stand
   * zum Bezug, Anzeige, Bezug und Server bleiben damit gleich.
   */
  discardChanges(): void {
    if (this.saving()) return;
    this.texts.set(this.savedTexts());
  }

  private differsFromSaved(texts: PrintTexts): boolean {
    const saved = this.savedTexts();
    return this.sections.some((section) =>
      this.fields.some((field) => texts[section.key][field.key] !== saved[section.key][field.key]),
    );
  }
}
