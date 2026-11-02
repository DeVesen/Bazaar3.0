import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FileDropzone } from '../../../../shared/components/file-dropzone/file-dropzone';
import { LABEL_ICON_KEYS, LABEL_ICON_TITLES, LabelGraphic } from '../../../../shared/components/label-sheet/label-graphic';
import { LabelGraphicView } from '../../../../shared/components/label-sheet/label-graphic-view';
import { IMAGE_FILE_ACCEPT } from '../../model/image-file';

interface IconOption {
  key: string;
  title: string;
  graphic: LabelGraphic;
}

/**
 * Leaf: Auswahl für Logo oder Verkäufer-Symbol — „Keins", ein Icon der Icon-Liste oder ein
 * eigenes Bild. Die gewählte Datei geht unverändert an den Aufrufer, der Art und Größe prüft.
 */
@Component({
  selector: 'app-graphic-picker',
  imports: [ButtonModule, FileDropzone, LabelGraphicView],
  templateUrl: './graphic-picker.html',
  styleUrl: './graphic-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphicPicker {
  readonly label = input.required<string>();
  readonly value = input<LabelGraphic | null>(null);

  readonly valueChange = output<LabelGraphic | null>();
  readonly fileChosen = output<File>();

  readonly accept = IMAGE_FILE_ACCEPT;
  readonly icons: IconOption[] = LABEL_ICON_KEYS.map((key) => ({
    key,
    title: LABEL_ICON_TITLES[key],
    graphic: { kind: 'icon', value: key },
  }));

  readonly selectedIconKey = computed(() => {
    const value = this.value();
    return value?.kind === 'icon' ? value.value : null;
  });

  readonly currentImage = computed(() => {
    const value = this.value();
    return value?.kind === 'image' ? value : null;
  });

  /** `FileDropzone` meldet nur nicht leere Auswahlen; übernommen wird die erste Datei. */
  onFilesChosen(files: File[]): void {
    this.fileChosen.emit(files[0]);
  }
}
