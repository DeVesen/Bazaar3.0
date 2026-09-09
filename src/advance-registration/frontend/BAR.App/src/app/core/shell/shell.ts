import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LucideMenu } from '@lucide/angular';
import { Sidebar } from './sidebar/sidebar';

const MOBILE_BREAKPOINT = '(max-width: 1024px)';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ButtonModule, SidebarModule, ToastModule, ConfirmDialogModule, LucideMenu, Sidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell implements OnInit, OnDestroy {
  readonly isMobile = signal(false);
  readonly open = signal(true);

  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;

  ngOnInit(): void {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    this.mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    this.isMobile.set(this.mediaQuery.matches);
    this.open.set(!this.mediaQuery.matches);
    this.mediaQueryListener = (event) => {
      this.isMobile.set(event.matches);
      this.open.set(!event.matches);
    };
    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
  }
}
