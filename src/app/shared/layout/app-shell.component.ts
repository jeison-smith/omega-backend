import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AppSidebarComponent } from './app-sidebar.component';
import { AppHeaderComponent } from './app-header.component';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, AppSidebarComponent, AppHeaderComponent],
  template: `
    <div class="min-h-screen flex w-full">
      <app-sidebar />
      <div class="flex-1 flex flex-col min-h-screen">
        <div class="env-banner">AMBIENTE DE PRE-PRODUCCIÓN</div>
        <app-header [title]="pageTitle()" />
        <main class="flex-1 p-6 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AppShellComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        let current = this.route.firstChild;
        while (current?.firstChild) {
          current = current.firstChild;
        }
        return (current?.snapshot.data['title'] as string) || 'Dashboard';
      })
    ),
    { initialValue: 'Dashboard' }
  );
}
