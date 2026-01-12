import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],

  template: `
    <header
      class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm"
    >
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden md:flex items-center relative">
          <i
            class="pi pi-search"
            [className]="'w-4 h-4 absolute left-3 text-gray-400'"
          ></i>
          <input type="text" placeholder="Buscar..." class="input-search pl-9 w-64" />
        </div>

        <button class="relative p-2 hover:bg-gray-100 rounded-lg transition">
          <i class="pi pi-bell w-5 h-5 text-gray-600"></i>
          <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        </button>

        <div class="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition cursor-pointer">
          <div
            class="h-9 w-9 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center"
          >
            JP
          </div>
          <div class="hidden md:block text-left">
            <p class="text-sm font-medium text-gray-900">Jeison Parada</p>
            <p class="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class AppHeaderComponent {
  @Input() title = 'Dashboard';
  readonly menuOpen = signal(false);
}
