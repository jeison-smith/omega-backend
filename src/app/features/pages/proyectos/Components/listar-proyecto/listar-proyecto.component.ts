import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { Proyecto } from '../../../../../Core/Interfaces/Proyecto/proyecto';
import { ActualizarProyecto } from '../../../../../Core/Interfaces/Proyecto/actualizar-proyecto';
import { ProyectoService } from '../../../../../Core/Service/Proyecto/proyecto.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { ModalService } from '../../../../../Core/Service/Modal/modal.service';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'listar-proyecto',
  standalone: true,
  imports: [RouterModule, PaginacionComponent],
  templateUrl: './listar-proyecto.component.html',
  styleUrl: './listar-proyecto.component.css',
})
export class ListarProyectoComponent {
  listaProyectos: Proyecto[] = [];
  registrosPaginados: Proyecto[] = [];
  paginaActual: number = 1;
  registrosPorPagina: number = 10;
  totalRegistros: number = 0;
  datosPaginados: Proyecto[] = []; // Datos a mostrar en la tabla
  filtro: string = '';
  actualizarProyecto!: ActualizarProyecto;

  constructor(
    private proyectoService: ProyectoService,
    private toastMessage: ToastService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerProyectos();
  }

  obtenerProyectos() {
    const paginacion = {
      pagina: this.paginaActual,
      tamanoPagina: this.registrosPorPagina,
      entrada: this.filtro,
    };

    this.proyectoService.obtenerProyectos(paginacion).subscribe({
      next: (response) => {
        (this.listaProyectos = response.proyectos),
          (this.totalRegistros = response.totalCount),
          (this.registrosPaginados = response.proyectos);
      },
      error: (error) => {
        this.toastMessage.showError(error);
      },
    });
  }

  estadoProyecto(event: any, idProyecto: number) {
    const isChecked = event.target.checked;
    this.actualizarProyecto = {
      idProyecto: idProyecto,
      estado: isChecked,
    };

    this.proyectoService
      .actualizarProyecto(this.actualizarProyecto)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          if (response) {
            this.toastMessage.showSuccess('Proyecto actualizado correctamente');
            this.obtenerProyectos();
          }
        },
        error: (error) => {
          this.toastMessage.showError(error);
        },
      });
  }

  redirigircategoria(idProyecto: number) {
    this.router.navigate(['/home/categorias'], {
      queryParams: { poyectId: idProyecto },
    });
  }

  abrirModalCrearPlantilla(): void {
    this.modalService.abrirModal();
    //  console.log('hola')
  }

  valorFiltro(value: string) {
    if (value === '') {
      this.filtro = value;
      this.obtenerProyectos();
    } else {
      this.filtro = value;
      this.paginaActual = 1;
      this.obtenerProyectos();
    }
  }

  onPaginaCambiada(pagina: number): void {
    this.paginaActual = pagina;
    this.obtenerProyectos();
  }
}
