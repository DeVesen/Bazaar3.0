import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { LucideMenu } from '@lucide/angular';
import { Sidebar as AppSidebar } from './sidebar/sidebar';

const MOBILE_BREAKPOINT = '(max-width: 768px)';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ButtonModule, SidebarModule, LucideMenu, AppSidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell implements OnInit, OnDestroy {
  private readonly router = inject(Router);

  readonly isMobile = signal(false);
  readonly open = signal(true);

  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.isMobile()) {
          this.open.set(false);
        }
      });
  }

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
