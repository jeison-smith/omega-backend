import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
//import { CrearCategoria } from '../../../../Core/Interfaces/Categoria/categoria';

import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { take } from 'rxjs';
import { ProyectoService } from '../../../../../Core/Service/Proyecto/proyecto.service';
import { CategoriaService } from '../../../../../Core/Service/categoria/categoria.service';
import { UsuarioService } from '../../../../../Core/Service/Usuario/usuario.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { DialogModule } from 'primeng/dialog';
import { PaginacionComponent } from '../../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'crear-categoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    DialogModule,
    PaginacionComponent,
    FormsModule,
  ],
  templateUrl: './crear-categoria.component.html',
})
export class CrearCategoriaComponent implements OnInit {
  formCategoria!: WritableSignal<FormGroup>;
  proyectosDisponibles: any[] = [];
  categorias: any[] = [];
  usuarios: any[] = [];
  visible = signal(false);
  loading = signal(false);

  //modalAbierto = false;
  estaGuardando = false;
  filtro: string = '';
  errorMessage = signal(''); // Mensaje de error para categorías duplicadas
  usuarioActual: any = null; // Usuario en sesión
  categoriasPaginadas: any[] = []; // Categorías de la página actual
  totalRegistros: number = 0; // Total de registros

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private categoriaService: CategoriaService,
    private usuarioService: UsuarioService,
    private toast: ToastService,
    private authService: AuthService,
    private router: Router
  ) {
    this.formCategoria = signal(
      this.fb.group({
        nombreCategoria: ['', Validators.required],
        idProyecto: ['', Validators.required],
        //idUsuario: ['', Validators.required],
        estado: [true, Validators.required],
      })
    );
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.obtenerUsuarioActual();
    // Cargar usuarios primero, luego categorías para poder mapear correctamente
    this.cargarUsuarios(() => {
      this.cargarCategorias(); // Cargar categorías después de usuarios
      this.cargarProyectosActivos();
    });
  }

  // ======================================================
  // OBTENER USUARIO ACTUAL DE LA SESIÓN
  // ======================================================
  obtenerUsuarioActual() {
    const userInfo = localStorage.getItem('FalconUserInfo');
    if (userInfo) {
      this.usuarioActual = JSON.parse(userInfo);
      console.log('Usuario en sesión:', this.usuarioActual);
    } else {
      console.error('No se encontró información del usuario en sesión');
      this.toast.showError('No se pudo obtener la información del usuario');
    }
  }

  // FORMULARIO
  // ======================================================
  crearFormulario() {
    this.formCategoria.set(
      this.fb.group({
        nombreCategoria: ['', Validators.required],
        idProyecto: ['', Validators.required],
        //idUsuario: ['', Validators.required],
        estado: [true, Validators.required],
      })
    );
  }

  // BUSCAR CATEGORÍAS
  // ======================================================
  buscar() {
    this.categoriaService.listarCategorias(1, 50, this.filtro).subscribe({
      next: (resp: any) => {
        this.categorias = resp.items ?? resp.categorias ?? [];
        this.mapearUsuarios();
        this.totalRegistros = this.categorias.length;
        this.onPaginaCambiada(1);
      },
    });
  }

  //Redirigir a plantilla
  redirigirPlantillas(idCategoria: number) {
    this.router.navigate(['/home/plantillas'], {
      queryParams: { catId: idCategoria },
    });
  }

  cerrarModal() {
    this.visible.set(false);
  }

  showDialog() {
    this.visible.set(true);
    this.errorMessage.set(''); // Limpiar mensaje de error al abrir el modal
  }

  // ======================================================
  // VALIDAR CATEGORÍA DUPLICADA
  // ======================================================
  validarCategoriaDuplicada(nombreCategoria: string | null) {
    if (!nombreCategoria || nombreCategoria.trim() === '') {
      this.errorMessage.set('');
      return;
    }

    const nombreNormalizado = nombreCategoria.trim().toLowerCase();
    const existe = this.categorias.some(
      (cat) => cat.nombre.trim().toLowerCase() === nombreNormalizado
    );

    if (existe) {
      this.errorMessage.set('Ya existe una categoría con este nombre');
    } else {
      this.errorMessage.set('');
    }
  }

  // CARGAR USUARIOS
  // ======================================================
  cargarUsuarios(callback?: () => void) {
    this.usuarioService
      .obtenerUsuarios({
        pagina: 1,
        tamanoPagina: 500,
        entrada: '',
      })
      .subscribe({
        next: (resp) => {
          this.usuarios = resp.usuarios || [];
          console.log('Usuarios cargados:', this.usuarios);
          // Ejecutar callback si existe
          if (callback) {
            callback();
          }
        },
        error: () => this.toast.showError('Error cargando usuarios'),
      });
  }
  //mapear Usuario creador
  private mapearUsuarios() {
    this.categorias = this.categorias.map((cat) => {
      const usuario = this.usuarios.find((u) => u.idUsuario === cat.usuarioCreador);
      return {
        ...cat,
        usuarioCreadorNombre: usuario ? usuario.nombre : 'No asignado',
      };
    });
  }

  obtenerNombreUsuario(idUsuario: number): string {
    if (!idUsuario) return 'No asignado';

    const usuario = this.usuarios.find((u) => u.idUsuario === idUsuario);
    return usuario ? usuario.nombre : 'No asignado';
  }

  // Cambiar estado de categoría
  cambiarEstado(idCategoria: number, nuevoEstado: boolean) {
    const idUsuario = Number(localStorage.getItem('userId') ?? 1);

    this.categoriaService.cambiarEstado(idCategoria, nuevoEstado, idUsuario).subscribe({
      next: () => {
        this.toast.showSuccess('Estado actualizado correctamente');
        // Actualizar el estado en la lista local
        const categoria = this.categorias.find((c) => c.id === idCategoria);
        if (categoria) {
          categoria.estado = nuevoEstado;
        }
      },
      error: (err) => {
        this.toast.showError('Error al cambiar el estado');
        console.error(err);
      },
    });
  }
  // ======================================================
  // CARGAR PROYECTOS
  // ======================================================
  cargarProyectosActivos() {
    const body = { pagina: 1, tamanoPagina: 50, entrada: '' };

    this.categoriaService.obtenerProyectos(body).subscribe((resp) => {
      this.proyectosDisponibles = resp.data ?? resp.proyectos ?? [];
      console.log('Proyectos cargados:', this.proyectosDisponibles);
    });
  }

  // ======================================================
  // CARGAR CATEGORÍAS (adaptado a listarCategorias)
  // ======================================================
  cargarCategorias() {
    this.categoriaService.listarCategorias(1, 50, '').subscribe({
      next: (resp: any) => {
        this.categorias = resp.categorias ?? resp.items ?? [];
        console.log('Categorías cargadas:', this.categorias);

        this.mapearUsuarios();
        this.totalRegistros = this.categorias.length;
        // Inicializar con la primera página
        this.onPaginaCambiada(1);
      },
      error: () => this.toast.showError('Error cargando categorías'),
    });
  }

  // ======================================================
  // MANEJAR CAMBIO DE PÁGINA
  // ======================================================
  onPaginaCambiada(numeroPagina: number) {
    const registrosPorPagina = 10;
    const inicio = (numeroPagina - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    this.categoriasPaginadas = this.categorias.slice(inicio, fin);
    console.log(
      `Página ${numeroPagina}: Mostrando registros ${inicio + 1} a ${Math.min(
        fin,
        this.categorias.length
      )}`
    );
    console.log('Categorías paginadas:', this.categoriasPaginadas);
  }

  // ======================================================
  // GUARDAR CATEGORÍA
  // ======================================================
  guardarCategoria() {
    if (!this.formCategoria().valid) {
      this.formCategoria().markAllAsTouched();
      return;
    }

    // Validar que no exista error de categoría duplicada
    if (this.errorMessage() !== '') {
      this.toast.showError(this.errorMessage());
      return;
    }

    // Validar que exista usuario en sesión
    let idUsuarioFinal = this.usuarioActual?.idUsuario;

    // Si no tiene idUsuario, intentamos buscarlo en la lista de usuarios por el nombre
    if (!idUsuarioFinal && this.usuarioActual && this.usuarioActual.nombre) {
      //console.log('Buscando ID de usuario por nombre:', this.usuarioActual.nombre);
      const usuarioEncontrado = this.usuarios.find((u) => u.nombre === this.usuarioActual.nombre);
      if (usuarioEncontrado) {
        idUsuarioFinal = usuarioEncontrado.idUsuario;
        //console.log('Usuario encontrado en lista:', usuarioEncontrado);
      }
    }

    if (!idUsuarioFinal) {
      this.toast.showError('No se pudo identificar el usuario en sesión (ID no encontrado)');
      console.error('Usuario actual:', this.usuarioActual);
      return;
    }

    this.estaGuardando = true;
    const body = {
      nombre: this.formCategoria().value.nombreCategoria,
      idProyecto: this.formCategoria().value.idProyecto,
      idUsuario: idUsuarioFinal, // Usar el ID encontrado
      estado: Boolean(this.formCategoria().value.estado),
    };

    console.log('Guardando categoría con usuario ID:', idUsuarioFinal);

    this.categoriaService.crearCategoria(body).subscribe({
      next: () => {
        this.toast.showSuccess('Categoría creada con éxito');
        this.cerrarModal();
        this.cargarCategorias(); //  recarga la tabla automáticamente
        setTimeout(() => window.location.reload(), 1500);
      },
      error: (err) => {
        this.toast.showError('Error al guardar categoría');
        console.error('Error al guardar:', err);
      },
      complete: () => (this.estaGuardando = false),
    });
  }
}
