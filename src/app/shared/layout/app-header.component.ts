import { Component, Input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import 'primeicons/primeicons.css';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, Select],

  template: `
    <header
      class="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10"
    >
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-foreground">{{ title }}</h1>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden md:flex items-center relative">
          <i
            class="pi pi-search"
            name="search"
            [className]="'w-4 h-4 absolute left-3 text-muted-foreground'"
          ></i>
          <input type="text" placeholder="Buscar..." class="input-search pl-9 w-64" />
        </div>

        <p-button class="relative">
          <i class="pi pi-user" name="bell" [className]="'w-5 h-5 text-muted-foreground'"></i>
          <span class="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </p-button>

        <p-select>
          <div
            dropdown-trigger
            class="flex items-center gap-3 hover:bg-muted rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
          >
            <div
              class="h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center"
            >
              JP
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-foreground">Jeison Parada</p>
              <p class="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
          <div dropdown-content class="w-56">
            <p class="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">Mi cuenta</p>
            <div class="border-t border-border/70"></div>
            <button class="dropdown-item">Perfil</button>
            <button class="dropdown-item">Configuración</button>
            <div class="border-t border-border/70"></div>
            <button class="dropdown-item text-destructive flex items-center gap-2">
              <i class="pi pi-user" -icon name="log-out" [className]="'w-4 h-4'"></i>
              Cerrar sesión
            </button>
          </div>
        </p-select>
      </div>
    </header>
  `,
})
export class AppHeaderComponent {
  @Input() title = 'Dashboard';
  readonly menuOpen = signal(false);
}
