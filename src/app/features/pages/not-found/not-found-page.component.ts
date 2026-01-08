import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, Button],
  template: `
    <div class="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <h2 class="text-2xl font-semibold text-foreground">Página no encontrada</h2>
      <p class="text-muted-foreground">La ruta que buscas no existe en este entorno.</p>
      <a routerLink="/proyectos">
        <p-button>Volver a proyectos</p-button>
      </a>
    </div>
  `,
})
export class NotFoundPageComponent {}
