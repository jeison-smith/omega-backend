import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass } from '@angular/common';

const menuItems = [
  { title: 'Usuarios', url: '/usuarios', icon: 'users' },
  { title: 'Proyectos', url: '/proyectos', icon: 'folder' },
  { title: 'Categorías', url: '/categorias', icon: 'tags' },
  { title: 'Plantillas', url: '/plantillas', icon: 'file-text' },
  { title: 'Gestión', url: '/gestion', icon: 'settings' },
  { title: 'Reportes', url: '/reportes', icon: 'bar-chart' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, NgClass],
  template: `
    <aside
      class="h-screen bg-slate-900 flex flex-col transition-all duration-300 ease-in-out sticky top-0 z-20"
      [ngClass]="{ 'w-20': collapsed(), 'w-60': !collapsed() }"
    >
      <div class="flex items-center h-16 px-4 border-b border-slate-800">
        <div class="flex items-center gap-3 overflow-hidden">
          <div
            class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg"
          >
            <span class="text-white font-bold text-sm">A</span>
          </div>
          @if (!collapsed()) {
          <div>
            <h1 class="font-bold text-white text-base leading-tight">atlantic</h1>
            <p class="text-[10px] text-slate-400 leading-none">Quantum Innovations</p>
          </div>
          }
        </div>
      </div>

      <nav class="flex-1 py-4 px-2 overflow-y-auto">
        <ul class="space-y-1">
          @for (item of menuItems; track item.url) {
          <li>
            <a
              [routerLink]="item.url"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer"
              [ngClass]="{
                'bg-blue-600 text-white shadow-md': isActive(item.url),
                'text-slate-300 hover:text-white hover:bg-slate-800': !isActive(item.url)
              }"
            >
              <i [class]="'pi pi-' + item.icon + ' w-5 h-5 flex-shrink-0'"></i>
              @if (!collapsed()) {
              <span class="font-medium text-sm">{{ item.title }}</span>
              }
            </a>
          </li>
          }
        </ul>
      </nav>

      <div class="p-2 border-t border-slate-800">
        <button
          type="button"
          (click)="toggleCollapsed()"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <i
            [class]="'pi ' + (collapsed() ? 'pi-chevron-right' : 'pi-chevron-left') + ' w-5 h-5'"
          ></i>
          @if (!collapsed()) {
          <span class="text-sm">Colapsar</span>
          }
        </button>
      </div>
    </aside>
  `,
})
export class AppSidebarComponent {
  private router = inject(Router);
  readonly collapsed = signal(false);
  readonly menuItems = menuItems;

  toggleCollapsed() {
    this.collapsed.update((value) => !value);
  }

  isActive(url: string) {
    return this.router.url === url;
  }
}
