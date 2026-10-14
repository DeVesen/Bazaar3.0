import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
 * Freitext 1 bis 5). Eigener Speichern-Button, eigener Endpoint — unabhängig vom
 * `settings-form` (Scan-Pause). Die Route `/settings` trägt bereits `adminGuard`, deshalb
 * prüft diese Komponente die Rolle nicht erneut.
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

  readonly maxLength = PRINT_TEXT_MAX_LENGTH;
  readonly sections: readonly { key: PrintTextSection; title: string }[] = [
    { key: 'abgabeBeleg', title: 'Abgabe-Beleg' },
    { key: 'verkaeuferUebersicht', title: 'Verkäufer-Übersicht' },
  ];
  readonly fields: readonly { key: PrintTextField; label: string }[] = [
    { key: 'text1', label: 'Freitext 1 (Kopfzeile links)' },
    { key: 'text2', label: 'Freitext 2 (Kopfzeile Mitte)' },
    { key: 'text3', label: 'Freitext 3 (über der Artikelliste)' },
    { key: 'text4', label: 'Freitext 4 (Fußzeile links)' },
    { key: 'text5', label: 'Freitext 5 (Fußzeile Mitte)' },
  ];
  readonly helpText =
    'Markdown: Überschriften, Fett, Kursiv, Absätze, Listen und Tabellen. Links, Bilder und HTML werden nicht dargestellt. Änderungen gelten ab dem nächsten Druck.';
  readonly spaceHint =
    'Der Platz auf dem Beleg ist begrenzt: Freitext 1, 2, 4 und 5 fassen nur wenige Zeilen in Kopf- bzw. Fußzeile, Freitext 3 höchstens 15 cm über der Artikelliste. Längerer Text wird beim Druck abgeschnitten.';

  readonly texts = signal<PrintTexts>(emptyPrintTexts());
  readonly saving = signal(false);
  /** Erst nach erfolgreichem Laden darf gespeichert werden, sonst überschreiben leere Felder die Sätze. */
  readonly loaded = signal(false);

  constructor() {
    this.printTextsApi.get().subscribe({
      next: (texts) => {
        this.texts.set(texts);
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
    this.saving.set(true);
    this.printTextsApi.update(this.texts()).subscribe({
      next: () => {
        this.saving.set(false);
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
}
