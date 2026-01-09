import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CategoriaService } from '../../../../../Core/Service/categoria/categoria.service';
import { Toast } from 'primeng/toast';
import { UsuarioService } from '../../../../../Core/Service/Usuario/usuario.service';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'listar-categorias',
  standalone: true,
  imports: [CommonModule, RouterModule, Toast, PaginacionComponent],
  templateUrl: './listar-categorias.component.html',
})
export class ListarCategoriasComponent {
  listaCategorias: any[] = [];
  registrosPaginados: any[] = [];
  usuarios: any[] = [];
  totalRegistros: number = 0;
  paginaActual: number = 1;
  registrosPorPagina: number = 10;
  filtro: string = '';

  constructor(
    private categoriaService: CategoriaService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarUsuarios(); // Primero cargamos usuarios
  }

  // =============================================================
  //  Cargar usuarios una sola vez para resolver el nombre del creador
  // =============================================================
  cargarUsuarios() {
    this.usuarioService
      .obtenerUsuarios({
        pagina: 1,
        tamanoPagina: 500, // suficiente para traer todos
        entrada: '',
      })
      .subscribe({
        next: (resp) => {
          this.usuarios = resp.usuarios || [];
          this.obtenerCategorias(); // Luego cargamos categorías
        },
        error: () => this.showError('Error cargando usuarios'),
      });
  }

  // =============================================================
  //  Listar categorías y asignar creadorNombre
  // =============================================================
  obtenerCategorias() {
    this.categoriaService
      .listarCategorias(this.paginaActual, this.registrosPorPagina, this.filtro)
      .subscribe({
        next: (response) => {
          const categorias = response.items || [];
          // Resolver nombre del creador según su ID
          this.listaCategorias = categorias.map((cat: any) => {
            const usuario = this.usuarios.find((u) => u.idUsuario === cat.usuarioCreador);
            return {
              ...cat,
              creadorNombre: usuario ? usuario.nombre : 'Sin nombre',
            };
          });

          this.registrosPaginados = this.listaCategorias;
          this.totalRegistros = response.total || 0;
        },
        error: (error) => {
          this.showError(error);
        },
      });
  }

  // =============================================================
  // Cambiar estado
  // =============================================================
  cambiarEstado(id: number, estado: boolean) {
    const usuario = Number(localStorage.getItem('idUsuario') || 1);

    this.categoriaService.cambiarEstado(id, estado, usuario).subscribe({
      next: () => {
        this.showSuccess('Estado actualizado');
        this.obtenerCategorias();
      },
      error: (err) => this.showError(err),
    });
  }

  // =============================================================
  // Filtrar
  // =============================================================
  filtrar(value: string) {
    this.filtro = value;
    this.paginaActual = 1;
    this.obtenerCategorias();
  }

  // =============================================================
  // Cambiar página
  // =============================================================
  onPaginaCambiada(pagina: number) {
    this.paginaActual = pagina;
    this.obtenerCategorias();
  }

  // =============================================================
  // Navegar a crear categoría
  // =============================================================
  navegarACrearCategoria() {
    this.router.navigate(['/categorias/crear-categoria']);
  }

  // =============================================================
  // Navegar a crear plantilla con el ID de la categoría
  // =============================================================
  navegarACrearPlantilla(idCategoria: number) {
    // Navegar a crear plantilla pasando el ID de la categoría como parámetro
    this.router.navigate(['/plantillas/crear-plantilla'], {
      queryParams: { categoriaId: idCategoria },
    });
  }

  // Simple feedback helpers; replace with app's toast/message service when available
  private showError(message: any) {
    console.error(message);
  }

  private showSuccess(message: string) {
    console.log(message);
  }
}
