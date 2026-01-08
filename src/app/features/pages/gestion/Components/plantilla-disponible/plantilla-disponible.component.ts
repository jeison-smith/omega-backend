import { Component } from '@angular/core';

import { take } from 'rxjs';
import { Plantilla } from '../../../../../Core/Interfaces/Plantilla/plantilla';
import { PlantillaService } from '../../../../../Core/Service/Plantilla/plantilla.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';

@Component({
  selector: 'plantilla-disponible',
  templateUrl: './plantilla-disponible.component.html',
  styleUrl: './plantilla-disponible.component.css',
})
export class PlantillaDisponibleComponent {
  listaPlantillas: Plantilla[] = [];
  registrosPaginados: Plantilla[] = [];
  paginaActual: number = 1;
  filtro = '';
  registrosPorPagina: number = 1000;
  totalRegistros: number = 0;
  datosPaginados: Plantilla[] = [];
  listView: boolean = true;

  constructor(private plantillaService: PlantillaService, private toastMessage: ToastService) {}

  ngOnInit(): void {
    this.obtenerPlantillas();
  }

  obtenerPlantillas() {
    const paginacion = {
      pagina: this.paginaActual,
      tamanoPagina: this.registrosPorPagina,
      entrada: this.filtro,
    };

    this.plantillaService
      .obtenerPlantillasGestion(paginacion.entrada)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          (this.listaPlantillas = response.plantillas.filter(
            (plantilla) => plantilla.estado === true
          )),
            (this.totalRegistros = response.totalCount),
            (this.registrosPaginados = response.plantillas);
        },
        error: (error) => {
          this.toastMessage.showError(error);
        },
      });
  }

  valorFiltro(value: string) {
    console.log(value);
    if (value === '') {
      this.filtro = value;
      this.obtenerPlantillas();
    } else {
      this.filtro = value;
      this.paginaActual = 1;
      this.obtenerPlantillas();
    }
  }
}
