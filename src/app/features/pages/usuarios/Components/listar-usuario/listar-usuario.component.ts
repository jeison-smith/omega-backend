import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EliminarUsuarioComponent } from '../eliminar-usuario/eliminar-usuario.component';
import { EditarUsuarioComponent } from '../editar-usuario/editar-usuario.component';
import { Usuario } from '../../../../../Core/Interfaces/Usuario/usuario';
import { UsuarioService } from '../../../../../Core/Service/Usuario/usuario.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { take } from 'rxjs';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'listar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EliminarUsuarioComponent,
    EditarUsuarioComponent,
    PaginacionComponent,
  ],
  templateUrl: 'listar-usuario.component.html',
})
export class ListarUsuarioComponent {
  listaUsuarios: Usuario[] = [];
  registrosPaginados: Usuario[] = [];
  paginaActual: number = 1;
  registrosPorPagina: number = 5;
  totalRegistros: number = 0;
  datosPaginados: Usuario[] = []; // Datos a mostrar en la tabla
  filtro: string = '';
  isMenuOpen: number = -1;
  isEditarActivo: number = -1;

  @ViewChild('popupMenu') popupMenu!: ElementRef;
  @ViewChild(EliminarUsuarioComponent) eliminarUsuarioComponent!: EliminarUsuarioComponent;
  @ViewChild(EditarUsuarioComponent) editarUsuarioComponent!: EditarUsuarioComponent;

  constructor(
    private usuarioService: UsuarioService,
    private toastMessage: ToastService,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    // Detectar clics fuera del menú
    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (this.isMenuOpen !== -1) {
        // Si el menú está abierto y el clic no fue en el botón ni en el menú, cerramos el menú
        if (
          !this.popupMenu.nativeElement.contains(event.target) &&
          !(event.target instanceof HTMLElement && event.target.closest('.table_actions'))
        ) {
          this.isMenuOpen = -1; // Cerrar el menú
        }
      }
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    const paginacion = {
      pagina: this.paginaActual,
      tamanoPagina: this.registrosPorPagina,
      entrada: this.filtro,
    };

    this.usuarioService
      .obtenerUsuarios(paginacion)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          (this.listaUsuarios = response.usuarios),
            (this.totalRegistros = response.totalCount),
            (this.registrosPaginados = response.usuarios);
        },
        error: (error) => {
          this.toastMessage.showError(error);
        },
      });
  }

  valorFiltro(value: string) {
    if (value === '') {
      this.filtro = value;
      this.obtenerUsuarios();
    } else {
      this.filtro = value;
      this.paginaActual = 1;
      this.obtenerUsuarios();
    }
  }

  onPaginaCambiada(pagina: number): void {
    this.paginaActual = pagina;
    this.obtenerUsuarios();
  }

  mostrarEliminar(id: number) {
    if (this.eliminarUsuarioComponent) {
      this.eliminarUsuarioComponent.mostrarDialogo(id);
    }
  }

  mostrarEditar(id: number) {
    if (this.editarUsuarioComponent) {
      this.editarUsuarioComponent.showDialog(id);
    }
  }

  menu_popup(index: number, event: MouseEvent): void {
    if (this.isMenuOpen === index) {
      this.isMenuOpen = -1; // Si el menú ya está abierto, lo cerramos
    } else {
      this.isMenuOpen = index; // Abrimos el menú correspondiente
    }

    event.stopPropagation(); // Evitar que el clic sea propagado y activado el escuchador de fuera del menú
  }
}
