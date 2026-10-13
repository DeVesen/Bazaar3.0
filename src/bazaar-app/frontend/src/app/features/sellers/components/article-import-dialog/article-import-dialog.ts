import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ArticleImportApi } from '../../data/article-import-api';
import { FileDropzone } from '../../../../shared/components/file-dropzone/file-dropzone';

export const SUCCESS_CLOSE_DELAY_MS = 1500;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

const MESSAGE_FORMATS = 'Erlaubt sind nur Dateien im Format XLSX, XLS oder CSV.';
const MESSAGE_ONE_FILE = 'Bitte genau eine Datei wählen';
const MESSAGE_TOO_LARGE = 'Die Datei ist größer als 2 MB.';
const MESSAGE_TIMEOUT = 'Zeitüberschreitung: Der Server hat nicht innerhalb von 3 Minuten geantwortet.';
const MESSAGE_GENERIC = 'Der Import ist fehlgeschlagen.';

const HTTP_PAYLOAD_TOO_LARGE = 413;

type ImportPhase = 'idle' | 'importing' | 'success';

function hasAcceptedExtension(fileName: string): boolean {
  const lowerCaseName = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension));
}

/** Der Server liefert die Fehlerliste als `detail` (ProblemDetails); ein Proxy-Abbruch trägt keinen. */
function messageOfError(error: unknown): string {
  if (error instanceof TimeoutError) return MESSAGE_TIMEOUT;
  if (!(error instanceof HttpErrorResponse)) return MESSAGE_GENERIC;

  const detail = (error.error as { detail?: string } | null)?.detail;
  if (detail) return detail;
  if (error.status === HTTP_PAYLOAD_TOO_LARGE) return MESSAGE_TOO_LARGE;
  return MESSAGE_GENERIC;
}

/**
 * Modal „Artikel importieren" an der Verkäufer-Kachel: eine Datei wählen (Drag & Drop oder Dateidialog),
 * „Import" startet den synchronen Import. Während des Imports ist das Modal gesperrt; bei Erfolg zeigt es
 * kurz ein Check-Icon und schließt dann selbst, bei Fehler bleibt es mit Meldung und gewählter Datei offen.
 */
@Component({
  selector: 'app-article-import-dialog',
  imports: [DialogModule, ButtonModule, MessageModule, ProgressSpinnerModule, FileDropzone],
  templateUrl: './article-import-dialog.html',
  styleUrl: './article-import-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleImportDialog {
  private readonly importApi = inject(ArticleImportApi);

  readonly visible = input<boolean>(false);
  readonly sellerId = input.required<string>();

  readonly visibleChange = output<boolean>();
  /** Anzahl importierter Artikel; kommt nach der Erfolgsanzeige, direkt vor `visibleChange(false)`. */
  readonly imported = output<number>();

  readonly file = signal<File | null>(null);
  readonly phase = signal<ImportPhase>('idle');
  readonly message = signal<string | null>(null);

  readonly busy = computed(() => this.phase() !== 'idle');
  readonly canImport = computed(() => this.file() !== null && this.phase() === 'idle');

  readonly acceptAttribute = ACCEPTED_EXTENSIONS.join(',');

  private closeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.closeTimer));

    // Jedes Öffnen beginnt leer.
    effect(() => {
      if (this.visible()) this.reset();
    });
  }

  onFilesChosen(files: File[]): void {
    if (this.busy()) return;
    if (files.length !== 1) {
      this.message.set(MESSAGE_ONE_FILE);
      return;
    }

    const [chosen] = files;
    if (!hasAcceptedExtension(chosen.name)) {
      this.message.set(MESSAGE_FORMATS);
      return;
    }

    this.file.set(chosen);
    this.message.set(null);
  }

  startImport(): void {
    const chosen = this.file();
    if (chosen === null || this.phase() !== 'idle') return;
    if (chosen.size > MAX_FILE_BYTES) {
      this.message.set(MESSAGE_TOO_LARGE);
      return;
    }

    this.message.set(null);
    this.phase.set('importing');
    this.importApi.importArticles(this.sellerId(), chosen, navigator.language).subscribe({
      next: (result) => this.showSuccessThenClose(result.importedCount),
      error: (error: unknown) => this.showError(error),
    });
  }

  onVisibleChange(visible: boolean): void {
    if (this.busy()) return;
    this.visibleChange.emit(visible);
  }

  private showSuccessThenClose(importedCount: number): void {
    this.phase.set('success');
    this.closeTimer = setTimeout(() => {
      this.imported.emit(importedCount);
      this.visibleChange.emit(false);
    }, SUCCESS_CLOSE_DELAY_MS);
  }

  private showError(error: unknown): void {
    this.phase.set('idle');
    this.message.set(messageOfError(error));
  }

  private reset(): void {
    clearTimeout(this.closeTimer);
    this.file.set(null);
    this.message.set(null);
    this.phase.set('idle');
  }
}
