import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { take } from 'rxjs';
import { CrearUsuario } from '../../../../../Core/Interfaces/Usuario/crear-usuario';
import { Paginacion } from '../../../../../Core/Interfaces/TablaPaginada/paginacion';
import { UsuarioService } from '../../../../../Core/Service/Usuario/usuario.service';
import { ProyectoService } from '../../../../../Core/Service/Proyecto/proyecto.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'crear-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Dialog],
  templateUrl: './crear-usuario.component.html',
})
export class CrearUsuarioComponent {
  crearUsuarioForm!: FormGroup;
  creaUsuario!: CrearUsuario;
  loading = signal(false);
  errorMessage = signal('');
  visible: boolean = false;
  availableProyectos: { id: string; nombre: string; selected: boolean }[] = [];
  selectedProyectos: { id: string; nombre: string; selected: boolean }[] = [];
  paginacionProyecto: Paginacion = {
    pagina: 1,
    tamanoPagina: 100,
    entrada: '',
  };
  isDropdownOpen: boolean = false;
  selected: string[] = [];
  searchTerm = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private proyectoService: ProyectoService,
    private toastMessage: ToastService
  ) {}

  ngOnInit(): void {
    this.crearUsuarioForm = this.fb.group({
      id: ['', Validators.required],
      nombreUsuario: [{ value: '', disabled: true }],
      idRol: ['', Validators.required],
      searchTerm: [''],
    });

    this.obtenerProyectos();
  }

  //aqui empieza

  abrirListaProyectos(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  proyectosFiltrados() {
    const searchTerm = this.crearUsuarioForm.get('searchTerm')?.value?.toLowerCase() || '';
    return this.availableProyectos.filter((proyecto) =>
      proyecto.nombre.toLowerCase().includes(searchTerm)
    );
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const dropdownContainer = document.querySelector('.dropdown-container') as HTMLElement;

    // Si el clic es fuera del dropdown, cerramos el dropdown
    if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
      this.isDropdownOpen = false;
    }
  }

  // Función para manejar el cambio de estado del checkbox
  onCheckboxChange(proyecto: { id: string; nombre: string; selected: boolean }) {
    const index = this.selectedProyectos.findIndex((p) => p.id === proyecto.id);
    if (index === -1) {
      this.selectedProyectos.push(proyecto); // Agregar a la lista si no está seleccionado
    } else {
      this.selectedProyectos.splice(index, 1); // Eliminar de la lista si ya está seleccionado
    }
  }

  // Función para comprobar si un proyecto está seleccionado
  isChecked(proyecto: { id: string; nombre: string; selected: boolean }) {
    return this.selectedProyectos.some((p) => p.id === proyecto.id);
  }

  //aqui termina

  // Mostrar los proyectos seleccionados
  getSelectedProyectos() {
    const proyectosSeleccionadosGroup = this.crearUsuarioForm.get(
      'proyectosSeleccionados'
    ) as FormGroup;

    Object.keys(proyectosSeleccionadosGroup.controls).forEach((id) => {
      if (proyectosSeleccionadosGroup.get(id)?.value) {
        this.selected.push(id);
      }
    });
    //console.log('Proyectos seleccionados:', this.selected);
  }

  crearUsuario(): void {
    this.loading.set(true);
    this.creaUsuario = this.crearUsuarioForm.value;
    this.creaUsuario.idProyecto = this.selectedProyectos.map((proyecto) => proyecto.id);
    this.usuarioService.crearUsuario(this.creaUsuario).subscribe({
      next: (response) => {
        // console.log(response)
        if (response) {
          this.toastMessage.showSuccess('Usuario creado correctamente');
          this.visible = false;
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        // console.log(error)
        this.toastMessage.showError(
          error || 'Ocurrio un error inesperado, comunicate con soporte de aplicaciones'
        );
      },
    });
  }

  validarUsuario(id: string) {
    this.errorMessage.set('');
    this.usuarioService
      .validarUsuario(id)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          if (response) {
            this.errorMessage.set('');
            this.crearUsuarioForm.patchValue({ nombreUsuario: response.nombre });
          } else {
            this.crearUsuarioForm.patchValue({ nombreUsuario: 'Usuario no encontrado' });
          }
        },
        error: (error) => {
          this.errorMessage.set('Usuario no encontrado');
          this.crearUsuarioForm.patchValue({ nombreUsuario: '' });
        },
      });
  }

  cerrarModal(): void {
    this.visible = false;
    this.errorMessage.set('');
    this.crearUsuarioForm.reset();
    this.selectedProyectos = [];
    this.availableProyectos = [];
    this.obtenerProyectos();
  }

  obtenerProyectos(): void {
    this.proyectoService
      .obtenerProyectos(this.paginacionProyecto)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          // Mapear la respuesta para obtener solo id y nombre de cada proyecto
          this.availableProyectos = response.proyectos.map((proyecto: any) => ({
            id: proyecto.id,
            nombre: proyecto.nombre,
            selected: false,
          }));
        },
        error: (error) => {
          this.toastMessage.showError(error);
        },
      });
  }

  removeFromSelected(tag: { id: string; nombre: string; selected: boolean }): void {
    this.selectedProyectos = this.selectedProyectos.filter((p) => p.id !== tag.id); // Eliminar del tag seleccionado
  }

  showDialog(): void {
    this.visible = true;
  }
}
