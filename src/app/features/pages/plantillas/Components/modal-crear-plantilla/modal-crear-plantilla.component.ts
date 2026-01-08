import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ProyectoDisponible } from '../../../../../Core/Interfaces/Proyecto/proyecto-disponible';
import { CrearPlantilla } from '../../../../../Core/Interfaces/Plantilla/crear-plantilla';
import { ProyectoService } from '../../../../../Core/Service/Proyecto/proyecto.service';
import { PlantillaService } from '../../../../../Core/Service/Plantilla/plantilla.service';
import { CategoriaService } from '../../../../../Core/Service/categoria/categoria.service';
import { ModalService } from '../../../../../Core/Service/Modal/modal.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';

@Component({
  selector: 'modal-crear-plantilla',
  standalone: true,
  imports: [],
  templateUrl: './modal-crear-plantilla.component.html',
  styleUrl: './modal-crear-plantilla.component.css',
})
export class ModalCrearPlantillaComponent {
  visible: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';

  listaProyectos: ProyectoDisponible[] = [];
  listaCategorias: any[] = [];

  crearPlantillaForm!: FormGroup;
  creaPlantilla!: CrearPlantilla;

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private plantillaService: PlantillaService,
    private categoriaService: CategoriaService,
    private modalService: ModalService,
    private router: Router,
    private toastMessage: ToastService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.crearPlantillaForm = this.fb.group({
      nombre: ['', Validators.required],
      idProyecto: ['', Validators.required],
      //idCategoria: ['', Validators.required]
    });

    //escuchar servicio de abrir el modal
    this.modalService.modalEvent$.subscribe((isVisible) => {
      this.visible = isVisible;
      //  console.log(this.visible);
    });

    // Cargar listas
    this.listarProyectos();

    this.listarCategorias();

    // Inicializar formulario
    this.crearPlantillaForm = this.fb.group({
      nombre: ['', Validators.required],
      idProyecto: ['', Validators.required],
      idCategoria: ['', Validators.required], // <-- Nuevo campo obligatorio
    });

    this.modalService.modalEvent$.subscribe((isVisible) => {
      this.visible = isVisible;
    });
  }
  // Obtener proyectos
  listarProyectos() {
    this.proyectoService
      .obtenerProyectos({
        pagina: 1,
        tamanoPagina: 1000,
        entrada: '',
      })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          console.log('Respuesta de proyectos:', response);

          // Tu API devuelve "proyectos"
          this.listaProyectos = response.proyectos || [];

          console.log('Proyectos cargados:', this.listaProyectos);
        },
        error: () => {
          this.toastMessage.showError('No se pudieron cargar los proyectos');
        },
      });
  }

  // Obtener categorías
  listarCategorias() {
    this.categoriaService
      .listarCategorias()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          console.log('Respuesta de categorías:', response);

          // La API devuelve items, así que lo tomamos de allí
          this.listaCategorias = response.items || [];

          console.log('Categorías cargadas:', this.listaCategorias);
        },
        error: () => {
          this.toastMessage.showError('No se pudieron cargar las categorías');
        },
      });
  }

  // Crear plantilla
  crearPlantilla() {
    this.loading = true;
    this.creaPlantilla = this.crearPlantillaForm.value;
    this.crearPlantillaForm.disable();
    var suscripcion = this.plantillaService
      .crearPlantilla(this.creaPlantilla)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          if (response) {
            this.toastMessage.showSuccess('Plantilla creada correctamente');
            this.visible = false;
            setTimeout(() => {
              this.router.navigate(['/home/plantillas']);
            }, 500);
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.crearPlantillaForm.enable();
          this.toastMessage.showError(error);
        },
      });
  }

  validarPlantillaDuplicada(nombre: string) {
    if (nombre !== null) {
      this.plantillaService.validarDuplicado(nombre).subscribe({
        next: (response) => {
          if (response.response) {
            this.errorMessage = 'Ya existe una plantilla con este nombre';
          } else {
            this.errorMessage = '';
          }
        },
      });
    }
  }

  cerrarModal(): void {
    this.visible = false;
    this.errorMessage = '';
    this.crearPlantillaForm.reset();
  }

  showDialog(): void {
    this.visible = true;
  }

  closeDialog(): void {
    this.visible = false;
  }
}
