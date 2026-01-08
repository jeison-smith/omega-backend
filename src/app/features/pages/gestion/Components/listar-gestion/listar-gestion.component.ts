import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EliminarGestionComponent } from '../eliminar-gestion/eliminar-gestion.component';
import { GestionService } from '../../../../Core/Service/Gestion/gestion.service';
import { ToastService } from '../../../../Core/Service/Toast/toast.service';
import { Gestion } from '../../../../Core/Interfaces/Gestion/gestion';
import { EliminarGestionComponent } from '../eliminar-gestion/eliminar-gestion.component';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { PlantillaService } from '../../../../Core/Service/Plantilla/plantilla.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'listar-gestion',
  standalone: true,
  imports: [CommonModule, RouterModule, EliminarGestionComponent],
  templateUrl: './listar-gestion.component.html',
})
export class ListarGestionComponent {
  listaRespuestas: Gestion[] = [];
  registrosPaginados: Gestion[] = [];
  paginaActual: number = 1;
  registrosPorPagina: number = 5;
  totalRegistros: number = 0;
  datosPaginados: Gestion[] = []; // Datos a mostrar en la tabla
  filtro: string = '';
  isMenuOpen: number = -1;
  isEliminarActivo: number = -1;
  idRol = '-1';

  @ViewChild('popupMenu') popupMenu!: ElementRef;
  @ViewChild(EliminarGestionComponent) eliminarGestionComponent!: EliminarGestionComponent;

  // Dashboard Properties
  categories: any[] = [];
  selectedCategory: any = null;
  templates: any[] = []; // All templates for the selected category
  filteredTemplates: any[] = []; // Filtered by search
  selectedTemplate: any = null;
  searchText: string = '';
  showDropdown: boolean = false;
  menuAbiertoId: number | null = null; // ID del registro cuyo menú está abierto

  @HostListener('document:click')
  cerrarMenu() {
    this.menuAbiertoId = null;
  }

  toggleMenu(id: number, event: MouseEvent) {
    event.stopPropagation();
    if (this.menuAbiertoId === id) {
      this.menuAbiertoId = null;
    } else {
      this.menuAbiertoId = id;
    }
  }

  constructor(
    private gestionService: GestionService,
    private toastMessage: ToastService,
    private authService: AuthService,
    private plantillaService: PlantillaService, // Injected
    private router: Router // Injected for navigation
  ) {}

  ngOnInit(): void {
    this.obtenerRol();
    this.obtenerGestion();
    this.obtenerCategorias(); // Start by fetching categories
  }

  // Obtener las categorías (Proyectos) disponibles
  obtenerCategorias() {
    console.log('Obteniendo categorías (proyectos)...');
    const paginacion = { pagina: 1, tamanoPagina: 100, entrada: '' };

    this.plantillaService
      .obtenerProyectos(paginacion)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta de proyectos:', response);

          // Intentar diferentes estructuras de respuesta
          if (Array.isArray(response)) {
            this.categories = response;
          } else if (response.listaProyectos) {
            this.categories = response.listaProyectos;
          } else if (response.proyectos) {
            this.categories = response.proyectos;
          } else if (response.data) {
            this.categories = response.data;
          } else {
            console.warn('Estructura de respuesta no reconocida:', response);
            this.categories = [];
          }

          console.log(' Categorías cargadas:', this.categories);

          // Auto-seleccionar la primera categoría si existe
          if (this.categories.length > 0) {
            this.selectCategory(this.categories[0]);
          } else {
            console.warn('No se encontraron categorías');
          }
        },
        error: (err) => {
          console.error(' Error al cargar categorías:', err);
          this.toastMessage.showError('Error al cargar las categorías');
        },
      });
  }

  // Seleccionar una categoría y cargar sus plantillas
  selectCategory(category: any) {
    console.log('Categoría seleccionada:', category);
    this.selectedCategory = category;
    this.searchText = '';
    this.selectedTemplate = null;
    this.showDropdown = false;

    // Obtener el ID de la categoría (puede ser 'id', 'idProyecto', etc.)
    const categoryId = category.id || category.idProyecto || category.ID;
    console.log('ID de categoría:', categoryId);

    if (categoryId) {
      this.obtenerPlantillasPorCategoria(categoryId);
    } else {
      console.warn('La categoría no tiene ID válido');
    }
  }

  // Obtener plantillas filtradas por categoría
  obtenerPlantillasPorCategoria(categoryId: number) {
    console.log('🔍 Obteniendo plantillas para categoría ID:', categoryId);

    this.plantillaService
      .obtenerPlantillas({ pagina: 1, tamanoPagina: 100, entrada: '' })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          console.log('📦 Respuesta de plantillas:', response);

          const allTemplates = response.plantillas || [];
          console.log('📋 Total de plantillas:', allTemplates.length);

          // Filtrar plantillas por la categoría seleccionada
          // Intentamos diferentes campos que podrían contener la relación con el proyecto
          const categoryName =
            this.selectedCategory.nombre ||
            this.selectedCategory.nombreProyecto ||
            this.selectedCategory.proyecto;

          this.templates = allTemplates.filter((t: any) => {
            const match =
              t.proyecto === categoryName ||
              t.nombreProyecto === categoryName ||
              t.idProyecto === categoryId ||
              t.proyectoId === categoryId;

            if (match) {
              console.log('✓ Plantilla coincide:', t.nombrePlantilla);
            }
            return match;
          });

          console.log('✅ Plantillas filtradas:', this.templates.length);

          // Si no hay coincidencias, mostrar todas para debugging
          if (this.templates.length === 0 && allTemplates.length > 0) {
            // TEMPORAL: Mostrar todas las plantillas si no hay coincidencias
            // Esto ayuda a identificar el problema de estructura de datos
            this.templates = allTemplates;
          }

          this.filteredTemplates = [...this.templates];
          console.log('🎯 Plantillas disponibles para mostrar:', this.filteredTemplates.length);
        },
        error: (err) => {
          this.toastMessage.showError('Error al cargar las plantillas');
        },
      });
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  filterTemplates(event: any) {
    const query = event.target.value.toLowerCase();
    this.searchText = query;
    this.filteredTemplates = this.templates.filter((t) =>
      t.nombrePlantilla.toLowerCase().includes(query)
    );
    this.showDropdown = true;
  }

  selectTemplate(template: any) {
    this.selectedTemplate = template;
    this.searchText = template.nombrePlantilla;
    this.showDropdown = false;

    // Navigate to Gestion Plantilla (Create Mode)
    // We assume passing the ID allows loading the template to fill it.
    // If 'listar-gestion' is 'Mis Casos', then filling a new one usually goes to a create route.
    // If the route 'respuesta-plantilla/:id' is for VIEWING/EDITING an existing answer,
    // we need to know the route for CREATING.
    // Based on `GestionPlantillaComponent`, it loads a template by ID param.
    // If we pass the template ID, does it create a new instance?
    // `GestionPlantillaComponent` uses `id` to load template structure AND options.
    // It doesn't seem to load an *answer* unless we are in `RespuestaPlantillaComponent`.
    // So `gestion/gestion-plantilla/:id` likely means "Manage Template ID X" (Create new case).

    this.router.navigate(['home/gestion/gestion-plantilla', template.id]);
  }

  // Cerrar el dropdown cuando se hace clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.template-selector');

    if (!clickedInside && this.showDropdown) {
      this.showDropdown = false;
    }
  }

  obtenerGestion() {
    const paginacion = {
      pagina: this.paginaActual,
      tamanoPagina: this.registrosPorPagina,
      entrada: this.filtro,
      entradaPlantilla: '',
    };
    this.gestionService
      .obtenerGestiones(paginacion)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          //console.log(response)
          (this.listaRespuestas = response.listaRespuestas),
            (this.totalRegistros = response.total),
            (this.registrosPaginados = response.listaRespuestas);
        },
        error: (error) => {
          this.toastMessage.showError(error);
        },
      });
  }

  obtenerRol(): void {
    this.authService
      .getInfoUsuario()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          //console.log(response)
          this.idRol = response.rol;
        },
        error: (error) => {
          this.toastMessage.showError(error);
        },
      });
  }

  valorFiltro(value: string) {
    if (value === '') {
      this.filtro = value;
      this.obtenerGestion();
    } else {
      this.filtro = value;
      this.paginaActual = 1;
      this.obtenerGestion();
    }
  }

  onPaginaCambiada(pagina: number): void {
    this.paginaActual = pagina;
    this.obtenerGestion();
  }

  menu_popup(index: number, event: MouseEvent): void {
    if (this.isMenuOpen === index) {
      this.isMenuOpen = -1; // Si el menú ya está abierto, lo cerramos
    } else {
      this.isMenuOpen = index; // Abrimos el menú correspondiente
    }

    event.stopPropagation(); // Evitar que el clic sea propagado y activado el escuchador de fuera del menú
  }

  mostrarEliminar(idGestion: number) {
    if (this.eliminarGestionComponent) {
      this.eliminarGestionComponent.mostrarDialogo(idGestion);
    }
  }
}
