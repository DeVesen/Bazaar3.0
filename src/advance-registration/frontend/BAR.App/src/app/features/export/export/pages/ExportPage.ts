import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InfoArea } from '@shared/info-area/info-area';
import { ExportApiService } from '../export-api.service';

interface ExportJson {
  sellers: { id: string; articles: unknown[] }[];
}

@Component({
  selector: 'app-export-page',
  imports: [FormsModule, TranslatePipe, ButtonModule, CheckboxModule, InfoArea],
  template: `
    <h1>{{ 'export.title' | translate }}</h1>

    <p-checkbox [binary]="true" [ngModel]="includeBrands()" (ngModelChange)="includeBrands.set($event)" inputId="export-include-brands" />
    <label for="export-include-brands">{{ 'export.includeBrands' | translate }}</label>

    <p-checkbox [binary]="true" [ngModel]="includeCategories()" (ngModelChange)="includeCategories.set($event)" inputId="export-include-categories" />
    <label for="export-include-categories">{{ 'export.includeCategories' | translate }}</label>

    <button pButton type="button" (click)="onExport()">{{ 'export.submit' | translate }}</button>

    @if (resultMessage(); as message) {
      <app-info-area type="info" [message]="message" />
    }
    @if (errorMessage(); as error) {
      <app-info-area type="error" [message]="error" />
    }
  `
})
export class ExportPage {
  private readonly exportApi = inject(ExportApiService);
  private readonly translate = inject(TranslateService);

  readonly includeBrands = signal(false);
  readonly includeCategories = signal(false);
  readonly resultMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  onExport(): void {
    this.resultMessage.set(null);
    this.errorMessage.set(null);

    this.exportApi.export({ includeBrands: this.includeBrands(), includeCategories: this.includeCategories() }).subscribe({
      next: ({ blob, fileName }) => {
        this.triggerDownload(blob, fileName);
        this.showCounts(blob);
      },
      error: () => this.errorMessage.set(this.translate.instant('export.error'))
    });
  }

  private showCounts(blob: Blob): void {
    blob.text().then((text) => {
      const parsed = JSON.parse(text) as ExportJson;
      const articleCount = parsed.sellers.reduce((sum, s) => sum + s.articles.length, 0);
      this.resultMessage.set(this.translate.instant('export.success', { sellerCount: parsed.sellers.length, articleCount }));
    });
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
