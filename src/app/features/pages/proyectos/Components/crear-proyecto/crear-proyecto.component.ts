import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { identifierName } from '@angular/compiler';
import { CrearProyecto } from '../../../../../Core/Interfaces/Proyecto/crear-proyecto';
import { ProyectoService } from '../../../../../Core/Service/Proyecto/proyecto.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { UsuarioService } from '../../../../../Core/Service/Usuario/usuario.service';

@Component({
  selector: 'crear-proyecto',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './crear-proyecto.component.html',
})
export class CrearProyectoComponent {
  crearProyectoForm!: FormGroup;
  creaProyecto!: CrearProyecto;
  errorMessage = signal('');
  visible: boolean = false;
  loading = signal(false);
  usuarioActual: any = null; // Usuario en sesión
  usuarios: any[] = []; // Lista para buscar ID si falla sesión

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private toastMessage: ToastService,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarioActual();
    this.cargarUsuarios(); // Cargar usuarios por si necesitamos buscar el ID
    this.crearProyectoForm = this.fb.group({
      nombre: ['', Validators.required],
      estado: [''],
    });
  }

  // Obtener usuario actual de la sesión
  obtenerUsuarioActual() {
    const userInfo = localStorage.getItem('FalconUserInfo');
    if (userInfo) {
      this.usuarioActual = JSON.parse(userInfo);
      console.log('Usuario en sesión:', this.usuarioActual);
    } else {
      console.error('No se encontró información del usuario en sesión');
      this.toastMessage.showError('No se pudo obtener la información del usuario');
    }
  }

  // Cargar lista de usuarios para fallback
  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios({ pagina: 1, tamanoPagina: 500, entrada: '' }).subscribe({
      next: (resp) => {
        this.usuarios = resp.usuarios || [];
      },
    });
  }

  crearProyecto(): void {
    // Validar que exista usuario en sesión
    let idUsuarioFinal = this.usuarioActual?.idUsuario;

    // Lógica de respaldo: buscar por nombre si no hay ID
    if (!idUsuarioFinal && this.usuarioActual && this.usuarioActual.nombre) {
      console.log('Buscando ID de usuario por nombre en proyectos:', this.usuarioActual.nombre);
      const usuarioEncontrado = this.usuarios.find((u) => u.nombre === this.usuarioActual.nombre);
      if (usuarioEncontrado) {
        idUsuarioFinal = usuarioEncontrado.idUsuario;
      }
    }

    if (!idUsuarioFinal) {
      this.toastMessage.showError('No se pudo identificar el usuario en sesión');
      return;
    }

    this.loading.set(true);
    this.creaProyecto = {
      ...this.crearProyectoForm.value,
      idUsuario: idUsuarioFinal, // Usar el ID encontrado o de sesión
    };

    console.log('Creando proyecto con usuario ID:', idUsuarioFinal);
    this.crearProyectoForm.disable();

    this.proyectoService.crearProyecto(this.creaProyecto).subscribe({
      next: (response) => {
        if (response) {
          this.toastMessage.showSuccess('Proyecto creado correctamente');
          this.visible = false;
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
          this.loading.set(false);
      },
      error: (error) => {
          this.loading.set(false);
        this.toastMessage.showError(error);
        this.crearProyectoForm.enable();
        console.error('Error al crear proyecto:', error);
      },
    });
  }

  cerrarModal(): void {
    this.visible = false;
    this.errorMessage.set('');
    this.crearProyectoForm.reset();
  }

  validarProyectoDuplicado(nombre: string) {
    if (nombre !== '') {
      this.proyectoService.validarDuplicado(nombre).subscribe({
        next: (response) => {
          if (response) {
            if (response.response) {
          this.errorMessage.set('Ya existe un proyecto con este nombre');
            } else {
          this.errorMessage.set('');
            }
          }
        },
      });
    }
  }

  showDialog(): void {
    this.visible = true;
  }
}
