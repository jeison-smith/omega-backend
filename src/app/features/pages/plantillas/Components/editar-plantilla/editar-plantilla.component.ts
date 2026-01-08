import { ChangeDetectorRef, Component, ViewChild, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ActivatedRoute, Route, Router } from '@angular/router';

import { EditarCamposPlantillaComponent } from './editar-campos-plantilla/editar-campos-plantilla.component';
import { Location } from '@angular/common';
import { EditarSeccionesPlantillaComponent } from './editar-secciones-plantilla/editar-secciones-plantilla.component';
import { Plantilla } from '../../../../../Core/Interfaces/Plantilla/plantilla';
import { actualizarPlantilla } from '../../../../../Core/Interfaces/Plantilla/actualizar-plantilla';
import { PlantillaService } from '../../../../../Core/Service/Plantilla/plantilla.service';
import { PreguntaService } from '../../../../../Core/Service/Preguntas/pregunta.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { OpcionesPlantilla } from '../../../../../Core/Interfaces/Plantilla/opcion-plantilla';
import { CamposPlantilla } from '../../../../../Core/Interfaces/Plantilla/campos-plantilla';
import { Restriccion } from '../../../../../Core/Interfaces/Plantilla/restriccion';

@Component({
  selector: 'editar-plantilla',
  standalone: true,
  imports: [ReactiveFormsModule, EditarCamposPlantillaComponent, EditarSeccionesPlantillaComponent],
  templateUrl: './editar-plantilla.component.html',
})
export class EditarPlantillaComponent {
  //@ViewChild(EditarSeccionesPlantillaComponent) editarSeccionesPlantilla!: EditarSeccionesPlantillaComponent;
  @ViewChild(EditarCamposPlantillaComponent) editarCamposPlantilla!: EditarCamposPlantillaComponent;

  camposForm!: WritableSignal<FormGroup>;
  campos: any[] = [];
  restricciones: Restriccion[] = [];
  plantilla!: Plantilla;
  actualizarPlantilla!: actualizarPlantilla;
  menuVisible: boolean = false;
  loading: boolean = false;
  editandoNombre: boolean = false;
  nombreTemporal: string = '';

  constructor(
    private fb: FormBuilder,
    private plantillaService: PlantillaService,
    private preguntaService: PreguntaService,
    private route: ActivatedRoute,
    private toastMessage: ToastService,
    private router: Router,
    private ref: ChangeDetectorRef,
    private location: Location
  ) {
    this.camposForm() = signal(
      this.fb.group({
        campos: this.fb.array([]),
        idPlantilla: ['', Validators.required],
        nombrePlantilla: ['', Validators.required],
        estado: ['', Validators.required],
      })
    );
  }

  ngOnInit() {
    const idPlantilla = this.route.snapshot.paramMap.get('id')!;

    this.preguntaService.cargarPlantilla(Number(idPlantilla)).subscribe({
      next: () => {
        this.plantilla = this.preguntaService.getPlantilla();
        console.log(this.plantilla);
        this.cargarPlantilla();
      },
      error: (err) => {
        console.error('Error al cargar la plantilla:', err);
      },
    });
  }

  ngAfterViewInit() {
    if (this.editarCamposPlantilla) {
      this.editarCamposPlantilla.cargarCamposPlantilla(this.plantilla.campos);
    }
  }

  get camposArray(): FormArray {
    return this.camposForm()().get('campos') as FormArray;
  }

  camposActivos(): any[] {
    return this.camposArray.controls.filter((campo) => campo.get('estado')?.value === true);
  }

  agregarCampo(tipoCampo: number) {
    this.menuVisible = false;
    const orden = this.camposArray.length > 0 ? this.camposArray.length + 1 : 1;

    const fieldConfig = {
      idCampo: 0,
      orden: orden,
      tipoCampo: tipoCampo, // Tipo de campo (ej. texto, lista, etc.)
      etiqueta: '', // Pregunta
      descripcion: '', // Descripción adicional
      requerido: false, // Si es obligatorio o no
      multiRespuesta: false,
      restriccion: 0,
      estado: true,
    };

    // Crear el FormGroup dinámicamente basado en el tipo
    const fieldGroup = this.fb.group({
      id: [fieldConfig.idCampo, Validators.required],
      orden: [fieldConfig.orden, Validators.required],
      etiqueta: [fieldConfig.etiqueta, Validators.required], // Pregunta
      descripcion: [fieldConfig.descripcion], // Descripción
      tipo: [fieldConfig.tipoCampo, Validators.required],
      multiRespuesta: [fieldConfig.multiRespuesta],
      restriccion: [fieldConfig.restriccion],
      estado: [fieldConfig.estado],
      requerido: [fieldConfig.requerido], // Campo obligatorio
      ...(tipoCampo === 4 && { opciones: this.fb.array([]) }), // Opciones para listas
      ...(tipoCampo === 2 && { opciones: this.fb.array([]) }), // Opciones para opciones
    });

    this.campos.push(fieldConfig);
    this.camposArray.push(fieldGroup);
  }

  goToVistaPrevia() {
    const idPlantilla = this.route.snapshot.paramMap.get('id')!;
    this.triggerActualizarCampos();
    this.router.navigate(['/home/plantillas/vista-previa', idPlantilla]);
  }

  estadoPlantilla(event: any) {
    const isChecked = event.target.checked;
    const campo = this.camposForm()();
    campo.get('estado')?.setValue(isChecked);
    this.preguntaService.actualizarEstadoPlantilla(isChecked);
  }

  triggerActualizarCampos() {
    var camposActualizacion = this.guardarCamposPlantilla(0);
    console.log('plantilla actualuzada');
    console.log(camposActualizacion);
  }

  cargarPlantilla() {
    this.camposForm()().patchValue({
      idPlantilla: this.plantilla.id,
      nombrePlantilla: this.plantilla.nombrePlantilla,
      estado: this.plantilla.estado,
    });

    this.toastMessage.showSuccess('Datos de la plantilla cargados correctamente.');
  }

  eliminarCampo(index: number): void {
    if (index >= 0 && index < this.camposArray.length) {
      const campo = this.camposArray.at(index);
      if (campo) {
        if (campo.get('id')?.value <= 0) {
          this.camposArray.removeAt(index);
        } else {
          campo.get('estado')?.setValue(false);
        }
        this.reordenarCampos();
        //console.log(campo);
      }
    } else {
      console.error('Índice fuera de rango');
    }
  }

  reordenarCampos(): void {
    let orden = 1;
    this.camposArray.controls.forEach((campo) => {
      if (campo.get('estado')?.value === true) {
        campo.get('orden')?.setValue(orden);
        orden++;
      }
    });
  }

  arriba(index: number) {
    if (index > 0) {
      this.swapOpciones(index, index - 1);
    }
  }

  abajo(index: number) {
    if (index < this.camposArray.length - 1) {
      this.swapOpciones(index, index + 1);
    }
  }

  private swapOpciones(index1: number, index2: number): void {
    const campos = this.camposArray;
    const temp = campos.at(index1);
    campos.setControl(index1, campos.at(index2));
    campos.setControl(index2, temp);
  }

  menu_popup(event: MouseEvent): void {
    this.menuVisible = !this.menuVisible;
    event.stopPropagation(); // Evitar que el clic sea propagado y activado el escuchador de fuera del menú
  }

  toggleEditarNombre(): void {
    this.editandoNombre = true;
    this.nombreTemporal = this.plantilla.nombrePlantilla; // Guardar el nombre actual
  }

  cancelarEdicionNombre(): void {
    this.editandoNombre = false;
    this.nombreTemporal = this.plantilla.nombrePlantilla; // Restaurar el valor original
  }

  guardarNombre() {
    if (this.nombreTemporal.trim() === '') {
      this.toastMessage.showError('El nombre no puede estar vacío.');
      return;
    }

    this.plantilla.nombrePlantilla = this.nombreTemporal;
    this.editandoNombre = false;

    const campo = this.camposForm()();
    campo.get('nombrePlantilla')?.setValue(this.nombreTemporal);
    this.preguntaService.actualizarNombrePlantilla(this.nombreTemporal);
  }
  guardarPlantilla() {
    this.loading = true;

    const campos = this.guardarCamposPlantilla(0).campos;

    // Asegurar que los campos se guardan antes de guardarFinal()
    this.preguntaService.actualizarCampos(campos, 0);

    this.preguntaService.guardarFinal();

    this.loading = false;
    this.location.back();
  }

  guardarCamposPlantilla(id: number) {
    var actualizarPlantilla = {
      campos: this.camposArray.value.map(
        (campo: any, index: number): CamposPlantilla => ({
          id: campo.id,
          orden: index + 1,
          etiqueta: campo.etiqueta,
          descripcion: campo.descripcion,
          tipo: campo.tipo,
          requerido: campo.requerido,
          multirespuesta: campo.multiRespuesta,
          restriccion: campo.restriccion === 0 ? null : campo.restriccion,
          estado: campo.estado,
          opciones: campo.opciones?.map(
            (opcion: any): OpcionesPlantilla => ({
              ...opcion,
              etiqueta: opcion.etiqueta,
              estado: opcion.estado,
              campos:
                Array.isArray(campo.campos?.value) && campo.campos.value.length > 0
                  ? campo.campos.value
                  : [],
            })
          ),
        })
      ),
    };

    this.preguntaService.actualizarCampos(actualizarPlantilla.campos, id);
    return actualizarPlantilla;
  }
}

