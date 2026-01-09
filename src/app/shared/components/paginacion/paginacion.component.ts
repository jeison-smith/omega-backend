import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'shared-paginacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginacion.component.html',
})
export class PaginacionComponent {
  @Input() totalRegistros: number = 0;
  @Input() registrosPorPagina: number = 10;
  @Input() datos: any[] = [];
  @Output() cambioPagina = new EventEmitter<number>(); // Emitirá el número de la página

  paginas: number[] = [];
  paginaActual: number = 1;
  Math = Math;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.calcularPaginas();
  }

  ngOnChanges() {
    this.calcularPaginas();
  }

  calcularPaginas() {
    const totalPaginas = Math.ceil(this.totalRegistros / this.registrosPorPagina);
    this.paginas = Array(totalPaginas)
      .fill(0)
      .map((_, i) => i + 1);
  }

  paginasVisibles(): (number | string)[] {
    const totalPaginas = this.paginas.length;

    // Si hay 3 o menos páginas, mostrar todas
    if (totalPaginas <= 3) return this.paginas;

    const visiblePages: (number | string)[] = [];

    // Determinar el rango de páginas a mostrar
    let startPage: number;

    // Si estamos en las primeras páginas
    if (this.paginaActual <= 3) {
      startPage = 1;
    }
    // Si estamos en las últimas páginas
    else if (this.paginaActual >= totalPaginas - 2) {
      startPage = totalPaginas - 2;
    }
    // En medio de las páginas
    else {
      startPage = this.paginaActual - 1;
    }

    // Añadir puntos suspensivos al inicio si no estamos en las primeras páginas
    if (startPage > 1) {
      visiblePages.push('...');
    }

    // Añadir hasta 3 páginas
    for (let i = 0; i < 3; i++) {
      const page = startPage + i;
      if (page <= totalPaginas) {
        visiblePages.push(page);
      }
    }

    // Añadir puntos suspensivos al final si no estamos en las últimas páginas
    if (startPage + 2 < totalPaginas) {
      visiblePages.push('...');
    }

    return visiblePages;
  }

  cambiarPagina(pagina: any) {
    this.paginaActual = pagina;
    this.cambioPagina.emit(this.paginaActual); // Emitimos solo el número de página
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.cambiarPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.paginas.length) {
      this.cambiarPagina(this.paginaActual + 1);
    }
  }
}
