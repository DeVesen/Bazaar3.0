import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { PopoverModule } from 'primeng/popover';
import { MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InfoArea } from '@shared/info-area/info-area';
import { MarkdownText } from '@shared/markdown-text/markdown-text';
import { SettingsApiService, SettingsDto, SettingsPayload } from '../settings-api.service';

const EMPTY_SETTINGS: SettingsDto = {
  registrationDeadline: null,
  dropOffFrom: null,
  dropOffUntil: null,
  bazaarFrom: null,
  bazaarUntil: null,
  defaultTypeId: null,
  infoText: null,
  startNumber: null,
  blockSize: null,
  defaultBlockCount: null
};
import { SellerTypeOptionsApiService, SellerTypeOption } from '@features/operations/seller-type-options-api.service';

const INFO_TEXT_MAX_LENGTH = 4000;
const INFO_TEXT_WARN_THRESHOLD = 3800;

interface ValidationProblem {
  errors?: Record<string, string[]>;
  detail?: string;
}

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, ButtonModule, DatePickerModule, SelectModule, InputNumberModule, TextareaModule, PopoverModule, InfoArea, MarkdownText, TranslatePipe],
  templateUrl: './SettingsPage.html',
  styleUrl: './SettingsPage.scss'
})
export class SettingsPage {
  private readonly api = inject(SettingsApiService);
  private readonly sellerTypeApi = inject(SellerTypeOptionsApiService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly INFO_TEXT_MAX_LENGTH = INFO_TEXT_MAX_LENGTH;

  readonly sellerTypes = signal<SellerTypeOption[]>([]);
  readonly registrationDeadline = signal<Date | null>(null);
  readonly dropOffFrom = signal<Date | null>(null);
  readonly dropOffUntil = signal<Date | null>(null);
  readonly bazaarFrom = signal<Date | null>(null);
  readonly bazaarUntil = signal<Date | null>(null);
  readonly defaultTypeId = signal<string | null>(null);
  readonly infoText = signal<string>('');
  readonly startNumber = signal<number | null>(null);
  readonly blockSize = signal<number | null>(null);
  readonly defaultBlockCount = signal<number | null>(null);

  readonly fieldErrors = signal<Record<string, string[]>>({});
  readonly saveError = signal<string | null>(null);

  readonly infoTextLength = computed(() => this.infoText().length);
  readonly infoTextNearLimit = computed(() => this.infoTextLength() >= INFO_TEXT_WARN_THRESHOLD);

  readonly canSave = computed(() =>
    (this.startNumber() ?? 0) > 0 &&
    (this.blockSize() ?? 0) > 0 &&
    (this.defaultBlockCount() ?? 0) > 0);

  constructor() {
    this.sellerTypeApi.getAll().subscribe((types) => this.sellerTypes.set(types));
    this.api.get().subscribe((dto) => this.applySettings(dto));
  }

  save(): void {
    if (!this.canSave()) return;

    this.fieldErrors.set({});
    this.saveError.set(null);

    const payload: SettingsPayload = {
      registrationDeadline: this.toIso(this.registrationDeadline()),
      dropOffFrom: this.toIso(this.dropOffFrom()),
      dropOffUntil: this.toIso(this.dropOffUntil()),
      bazaarFrom: this.toIso(this.bazaarFrom()),
      bazaarUntil: this.toIso(this.bazaarUntil()),
      defaultTypeId: this.defaultTypeId(),
      infoText: this.infoText() || null,
      startNumber: this.startNumber() ?? 0,
      blockSize: this.blockSize() ?? 0,
      defaultBlockCount: this.defaultBlockCount() ?? 0
    };

    this.api.update(payload).subscribe({
      next: (dto) => {
        this.applySettings(dto);
        this.messageService.add({ severity: 'success', summary: this.translate.instant('settings.saveSuccess') });
      },
      error: (response: { status: number; error?: ValidationProblem }) => {
        if (response.status === 400 && response.error?.errors) {
          this.fieldErrors.set(response.error.errors);
        } else if (response.status === 409) {
          this.saveError.set(response.error?.detail ?? this.translate.instant('settings.saveConflictDefault'));
        } else {
          this.saveError.set(this.translate.instant('settings.saveFailed'));
        }
      }
    });
  }

  private applySettings(dto: SettingsDto | null): void {
    dto ??= EMPTY_SETTINGS;

    this.registrationDeadline.set(this.toDate(dto.registrationDeadline));
    this.dropOffFrom.set(this.toDate(dto.dropOffFrom));
    this.dropOffUntil.set(this.toDate(dto.dropOffUntil));
    this.bazaarFrom.set(this.toDate(dto.bazaarFrom));
    this.bazaarUntil.set(this.toDate(dto.bazaarUntil));
    this.defaultTypeId.set(dto.defaultTypeId);
    this.infoText.set(dto.infoText ?? '');
    this.startNumber.set(dto.startNumber);
    this.blockSize.set(dto.blockSize);
    this.defaultBlockCount.set(dto.defaultBlockCount);
  }

  private toDate(iso: string | null): Date | null {
    return iso ? new Date(iso) : null;
  }

  private toIso(date: Date | null): string | null {
    return date ? date.toISOString() : null;
  }
}
