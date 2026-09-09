import { Component, computed, effect, input } from '@angular/core';

export type InfoAreaType = 'success' | 'error' | 'warn' | 'info';

const ICONS: Record<InfoAreaType, string> = { success: '✓', error: '✗', warn: '⚠', info: 'ℹ' };

@Component({
  selector: 'app-info-area',
  template: `
    <div class="info-area info-area--{{ type() }}">
      <span class="info-area__icon">{{ icon() }}</span>
      <span class="info-area__message">{{ message() }}</span>
    </div>
  `,
  styles: [`
    .info-area { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 6px; font-weight: 700; }
    .info-area--success { background: #e3f6e8; color: #1e6b34; }
    .info-area--error { background: #fbe3e3; color: #8a1f1f; }
    .info-area--warn { background: #fdf3d8; color: #8a5a1f; }
    .info-area--info { background: #e3edfb; color: #1f4a8a; }
  `]
})
export class InfoArea {
  readonly type = input.required<InfoAreaType>();
  readonly message = input.required<string>();

  readonly icon = computed(() => ICONS[this.type()]);

  constructor() {
    effect(() => this.playTone(this.type()));
  }

  private playTone(type: InfoAreaType): void {
    if (type === 'info') return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    oscillator.type = type === 'success' ? 'sine' : 'square';
    const [from, to] = type === 'success' ? [880, 1320] : [180, 120];
    oscillator.frequency.setValueAtTime(from, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(to, audioContext.currentTime + 0.15);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
  }
}
