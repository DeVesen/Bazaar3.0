import { ChangeDetectionStrategy, Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PrintService } from '../../../../core/print/print.service';
import { Page } from '../../../../shared/components/page/page';
import { LabelCard } from '../../../../shared/components/label-sheet/label-card';
import { LabelContent, LabelGraphic } from '../../../../shared/components/label-sheet/label-graphic';
import { AVERY_16_GEOMETRY, labelsPerSheet } from '../../../../shared/components/label-sheet/label-geometry';
import { LabelSheet } from '../../../../shared/components/label-sheet/label-sheet';
import { LabelSlot, placeLabels, startPositionPreview } from '../../../../shared/components/label-sheet/label-slots';
import { BlankLabelsStore } from '../../blank-labels-store';
import { LIBRARY_FULL_ERROR_CODE, LabelPrintDefaults, NAME_TAKEN_ERROR_CODE, SheetFormat } from '../../data/blank-labels-api';
import { imageFileError, imageNameOf, readFileAsDataUrl } from '../../model/image-file';
import {
  INITIAL_CONTENT_TEXTS,
  LabelContentField,
  LabelContentTexts,
  previewStartNumber,
  previewStartPosition,
  validateLabelContent,
} from '../../model/label-content-rules';
import {
  SheetFormatField,
  SheetFormatTexts,
  canSaveFormat,
  formatNameError,
  normalizeFormatName,
  textsFromGeometry,
  validateSheetFormat,
} from '../../model/sheet-format-rules';
import { ImageChoice, LabelContentFieldChange, LabelContentForm } from '../../components/label-content-form/label-content-form';
import { LibraryImageOption } from '../../components/graphic-picker/graphic-picker';
import { SheetFormatFieldChange, SheetFormatForm } from '../../components/sheet-format-form/sheet-format-form';
import { StartPositionForm } from '../../components/start-position-form/start-position-form';

const CONFIRM_KEY = 'blankLabels';

interface ProblemDetailsBody {
  errorCode?: string;
}

function errorCodeOf(error: unknown): string | undefined {
  if (!(error instanceof HttpErrorResponse)) return undefined;
  return (error.error as ProblemDetailsBody | null)?.errorCode;
}

/**
 * Integration: Seite „Etiketten-Vordruck" (nur Admin). Hält die Eingaben der Bereiche A (Bogenformat),
 * B (Etiketten-Inhalt) und C (Startposition), leitet daraus Prüfungen und Vorschauen ab und verdrahtet
 * Speichern, Löschen und Drucken. Keine Verbindung zu Artikeln: Nummern werden weder geprüft noch angelegt.
 */
@Component({
  selector: 'app-blank-labels-page',
  imports: [Page, ButtonModule, ConfirmDialogModule, SheetFormatForm, LabelContentForm, StartPositionForm, LabelSheet, LabelCard],
  templateUrl: './blank-labels-page.html',
  styleUrl: './blank-labels-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlankLabelsPage {
  private readonly store = inject(BlankLabelsStore);
  private readonly printService = inject(PrintService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly formats = this.store.formats;
  /** Bibliotheksbilder für die Auswahl; `dataUrl` ist `null`, bis das Vorschaubild geladen ist. */
  readonly libraryImages = computed<LibraryImageOption[]>(() => {
    const contents = this.store.imageContents();
    return this.store.images().map((image) => ({ id: image.id, name: image.name, dataUrl: contents[image.id] ?? null }));
  });
  readonly formatTexts = signal<SheetFormatTexts>(textsFromGeometry(AVERY_16_GEOMETRY));
  readonly selectedFormatId = signal<string | null>(null);
  readonly formatName = signal('');
  readonly contentTexts = signal<LabelContentTexts>(INITIAL_CONTENT_TEXTS);
  readonly logo = signal<LabelGraphic | null>(null);
  readonly sellerSymbol = signal<LabelGraphic | null>(null);
  /** Ladefehler der gemerkten Werte: Dann nichts speichern, sonst überschreiben Initialwerte die gemerkten. */
  private readonly defaultsLoadFailed = signal(false);
  private readonly lastEditedFormatField = signal<SheetFormatField | null>(null);
  private readonly lastEditedContentField = signal<LabelContentField | null>(null);

  readonly formatValidation = computed(() => validateSheetFormat(this.formatTexts(), this.lastEditedFormatField()));
  readonly geometry = computed(() => this.formatValidation().geometry);
  readonly perSheet = computed(() => {
    const geometry = this.geometry();
    return geometry === null ? null : labelsPerSheet(geometry);
  });
  readonly nameError = computed(() => formatNameError(this.formatName()));
  readonly canSave = computed(() => canSaveFormat(this.formatValidation(), this.formatName()));
  readonly contentValidation = computed(() =>
    validateLabelContent(this.contentTexts(), this.perSheet(), this.lastEditedContentField()),
  );
  readonly canPrint = computed(() => this.geometry() !== null && this.contentValidation().run !== null);

  readonly emptySheetSlots = computed<LabelSlot[]>(() => {
    const perSheet = this.perSheet();
    return perSheet === null ? [] : startPositionPreview(1, perSheet);
  });
  readonly startPositionSlots = computed<LabelSlot[]>(() => {
    const perSheet = this.perSheet();
    return perSheet === null ? [] : startPositionPreview(previewStartPosition(this.contentTexts().startPosition, perSheet), perSheet);
  });
  /** Etikett der Vorschau: Maße des gültigen Bogenformats, sonst Avery 16er. */
  readonly previewLabelSize = computed(() => this.geometry() ?? AVERY_16_GEOMETRY);
  readonly previewNumber = computed(() => previewStartNumber(this.contentTexts().startNumber));
  readonly content = computed<LabelContent>(() => ({
    logo: this.logo(),
    sellerSymbol: this.sellerSymbol(),
    currencySymbol: this.contentTexts().currencySymbol,
  }));

  constructor() {
    this.store.loadFormats();
    this.store.loadImages(() =>
      this.messageService.add({ severity: 'error', summary: 'Bibliothek konnte nicht geladen werden' }),
    );
    this.store.loadDefaults().subscribe({
      next: (defaults) => this.applyDefaults(defaults),
      error: () => this.onDefaultsLoadFailed(),
    });
  }

  onFormatFieldChange(change: SheetFormatFieldChange): void {
    this.formatTexts.update((texts) => ({ ...texts, [change.field]: change.text }));
    this.lastEditedFormatField.set(change.field);
  }

  onFormatSelected(id: string): void {
    const format = this.formats().find((candidate) => candidate.id === id);
    if (format === undefined) return;
    this.formatTexts.set(textsFromGeometry(format));
    this.formatName.set(format.name);
    this.selectedFormatId.set(format.id);
    this.lastEditedFormatField.set(null);
  }

  onSaveFormat(): void {
    this.saveFormat(false);
  }

  onDeleteFormat(): void {
    const format = this.formats().find((candidate) => candidate.id === this.selectedFormatId());
    if (format === undefined) return;
    this.confirmationService.confirm({
      key: CONFIRM_KEY,
      header: 'Bogenformat löschen',
      message: `Bogenformat „${format.name}" löschen?`,
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.deleteFormat(format),
    });
  }

  onContentFieldChange(change: LabelContentFieldChange): void {
    this.contentTexts.update((texts) => ({ ...texts, [change.field]: change.text }));
    this.lastEditedContentField.set(change.field);
  }

  /** Prüfen wie bisher, dann in die Bibliothek legen und für das Feld wählen (kopiert die Data-URL, kein Verweis). */
  onImageChosen(choice: ImageChoice): void {
    const error = imageFileError(choice.file);
    if (error !== null) {
      this.messageService.add({ severity: 'error', summary: 'Bild nicht übernommen', detail: error });
      return;
    }
    readFileAsDataUrl(choice.file).then(
      (dataUrl) => this.uploadImage(choice, dataUrl),
      () => this.messageService.add({ severity: 'error', summary: 'Bild konnte nicht gelesen werden' }),
    );
  }

  onImageDeleteRequested(id: string): void {
    const image = this.store.images().find((candidate) => candidate.id === id);
    if (image === undefined) return;
    this.confirmationService.confirm({
      key: CONFIRM_KEY,
      header: 'Bild löschen',
      message: `Bild „${image.name}“ aus der Bibliothek löschen?`,
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.deleteImage(id),
    });
  }

  /** Merkt Logo, Symbol und Währung im Backend und öffnet den Druckdialog mit allen Bögen. */
  onPrint(): void {
    const geometry = this.geometry();
    const run = this.contentValidation().run;
    if (geometry === null || run === null) return;
    const content = this.content();
    this.rememberDefaults(content);
    this.printService.printLabelSheets({
      geometry,
      sheets: placeLabels(run.startNumber, run.count, run.startPosition, labelsPerSheet(geometry)),
      content,
    });
  }

  private onDefaultsLoadFailed(): void {
    this.defaultsLoadFailed.set(true);
    this.messageService.add({
      severity: 'warn',
      summary: 'Letzte Werte konnten nicht geladen werden',
      detail: 'Eingaben werden nicht gemerkt.',
    });
  }

  private applyDefaults(defaults: LabelPrintDefaults): void {
    this.defaultsLoadFailed.set(false);
    this.logo.set(defaults.logo);
    this.sellerSymbol.set(defaults.sellerSymbol);
    this.contentTexts.update((texts) => ({ ...texts, currencySymbol: defaults.currencySymbol }));
  }

  private saveFormat(overwrite: boolean): void {
    const geometry = this.geometry();
    if (geometry === null || !this.canSave()) return;
    const name = normalizeFormatName(this.formatName());
    this.store.saveFormat({ ...geometry, name, overwrite }).subscribe({
      next: (saved) => this.onFormatSaved(saved),
      error: (error: unknown) => this.onFormatSaveFailed(error, name),
    });
  }

  private onFormatSaved(saved: SheetFormat): void {
    this.selectedFormatId.set(saved.id);
    this.formatName.set(saved.name);
    this.messageService.add({ severity: 'success', summary: `Bogenformat „${saved.name}" gespeichert` });
  }

  /** 409: Den Namen gibt es schon (auch wenn ein anderer Admin ihn inzwischen gespeichert hat). */
  private onFormatSaveFailed(error: unknown, name: string): void {
    if (errorCodeOf(error) === NAME_TAKEN_ERROR_CODE) {
      this.confirmOverwrite(name);
      return;
    }
    this.messageService.add({ severity: 'error', summary: 'Bogenformat konnte nicht gespeichert werden' });
  }

  private confirmOverwrite(name: string): void {
    this.confirmationService.confirm({
      key: CONFIRM_KEY,
      header: `Bogenformat „${name}" existiert bereits`,
      message: 'Überschreiben?',
      acceptLabel: 'Überschreiben',
      rejectLabel: 'Abbrechen',
      accept: () => this.saveFormat(true),
    });
  }

  private deleteFormat(format: SheetFormat): void {
    this.store.deleteFormat(format.id).subscribe({
      next: () => this.selectedFormatId.set(null),
      error: () => this.messageService.add({ severity: 'error', summary: 'Bogenformat konnte nicht gelöscht werden' }),
    });
  }

  private uploadImage(choice: ImageChoice, dataUrl: string): void {
    this.store.uploadImage({ name: imageNameOf(choice.file), dataUrl }).subscribe({
      next: () => this.graphicOf(choice.target).set({ kind: 'image', value: dataUrl }),
      error: (error: unknown) => this.onImageUploadFailed(error),
    });
  }

  /** 409: Die Bibliothek ist voll; alles andere (z. B. 400) meldet das Bild als nicht übernommen. */
  private onImageUploadFailed(error: unknown): void {
    if (errorCodeOf(error) === LIBRARY_FULL_ERROR_CODE) {
      this.messageService.add({ severity: 'error', summary: 'Bibliothek voll', detail: 'Bitte zuerst ein Bild löschen.' });
      return;
    }
    this.messageService.add({ severity: 'error', summary: 'Bild nicht übernommen' });
  }

  /** Ein damit gewähltes Logo oder Symbol bleibt erhalten: Die Auswahl hält eine Kopie der Data-URL. */
  private deleteImage(id: string): void {
    this.store.deleteImage(id).subscribe({
      error: () => this.messageService.add({ severity: 'error', summary: 'Bild konnte nicht gelöscht werden' }),
    });
  }

  private rememberDefaults(content: LabelContent): void {
    if (this.defaultsLoadFailed()) return;
    this.store.saveDefaults(content).subscribe({
      error: () => this.messageService.add({ severity: 'warn', summary: 'Logo, Symbol und Währung konnten nicht gemerkt werden' }),
    });
  }

  private graphicOf(target: ImageChoice['target']): WritableSignal<LabelGraphic | null> {
    return target === 'logo' ? this.logo : this.sellerSymbol;
  }
}
