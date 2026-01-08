import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { Plantilla } from '../../../../../Core/Interfaces/Plantilla/plantilla';
import { PlantillaService } from '../../../../../Core/Service/Plantilla/plantilla.service';
import { PreguntaService } from '../../../../../Core/Service/Preguntas/pregunta.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'listar-plantilla',
  standalone: true,
  imports: [ReactiveFormsModule, PaginacionComponent],
  templateUrl: './listar-plantilla.component.html',
  styleUrl: './listar-plantilla.component.css',
})
export class ListarPlantillaComponent {
  listaPlantillas: Plantilla[] = [];
  registrosPaginados: Plantilla[] = [];
  paginaActual: number = 1;
  registrosPorPagina: number = 10;
  totalRegistros: number = 0;
  datosPaginados: Plantilla[] = []; // Datos a mostrar en la tabla
  filtro: string = '';

  constructor(
    private plantillaService: PlantillaService,
    private preguntaService: PreguntaService,
    private router: Router,
    private toastMessage: ToastService
  ) {}

  ngOnInit(): void {
    this.obtenerPlantillas();
  }

  obtenerPlantillas() {
    const paginacion = {
      pagina: this.paginaActual,
      tamanoPagina: this.registrosPorPagina,
      entrada: this.filtro,
    };

    this.plantillaService.obtenerPlantillas(paginacion).subscribe({
      next: (response) => {
        console.log('PLANTILLAS:', response.plantillas);
        (this.listaPlantillas = response.plantillas),
          //console.log( this.listaPlantillas)
          (this.totalRegistros = response.totalCount),
          (this.registrosPaginados = response.plantillas);
      },
      error: (error) => {
        this.toastMessage.showError(error);
      },
    });
  }

  valorFiltro(value: string) {
    if (value === '') {
      this.filtro = value;
      this.obtenerPlantillas();
    } else {
      this.filtro = value;
      this.paginaActual = 1;
      this.obtenerPlantillas();
    }
  }

  onPaginaCambiada(pagina: number): void {
    this.paginaActual = pagina;
    this.obtenerPlantillas();
  }
}
