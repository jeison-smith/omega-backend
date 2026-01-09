import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  WritableSignal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { Toast } from 'primeng/toast';
import { CampoTextoComponent } from '../campos/campo-texto/campo-texto.component';
import { CampoOpcionComponent } from '../campos/campo-opcion/campo-opcion.component';
import { CampoFechaComponent } from '../campos/campo-fecha/campo-fecha.component';
import { CampoListaComponent } from '../campos/campo-lista/campo-lista.component';
import { PreguntaService } from '../../../../../../Core/Service/Preguntas/pregunta.service';
import { ToastService } from '../../../../../../Core/Service/Toast/toast.service';

@Component({
  selector: 'editar-campos-plantilla',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CampoTextoComponent,
    CampoOpcionComponent,
    CampoFechaComponent,
    CampoListaComponent,
    Toast,
  ],
  templateUrl: './editar-campos-plantilla.component.html',
})
export class EditarCamposPlantillaComponent {
  menuVisible: boolean = false;
  camposForm: WritableSignal<FormGroup>;
  campos: any[] = [];
  @Input() camposs!: FormArray;
  @Input() esRamificacion = false;
  @Input() campos$: Observable<any[]> = new Observable();
  @Output() actualizarCampos = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private preguntaService: PreguntaService,
    private cdf: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    this.camposForm = signal(
      this.fb.group({
        campos: this.fb.array([]),
      })
    );
  }

  ngOnInit() {
    this.camposForm.set(
      this.fb.group({
        campos: this.camposs,
      })
    );

    this.menuVisible = false;
  }

  ngAfterViewInit() {
    this.cdf.detectChanges();
  }

  ngOnDestroy() {}
  cargarCamposPlantilla(campos: any) {
    this.camposArray.clear();

    if (campos && campos.length > 0) {
      if (campos && campos.length > 0) {
        campos.forEach((campo: any) => {
          this.camposArray.push(
            this.fb.group({
              id: [campo.id, Validators.required],
              orden: [campo.orden, Validators.required],
              etiqueta: [campo.etiqueta, Validators.required],
              descripcion: [campo.descripcion],
              tipo: [campo.tipo, Validators.required],
              requerido: [campo.requerido],
              multiRespuesta: [campo.multirespuesta],
              restriccion: [campo.restriccion],
              estado: [campo.estado],
              opciones: this.fb.array(
                (campo.opciones || []).map((opcion: any) =>
                  this.fb.group({
                    id: [opcion.id],
                    etiqueta: [opcion.etiqueta, Validators.required],
                    estado: [opcion.estado],
                    campos: [opcion.campos],
                  })
                )
              ),
            })
          );
        });
      }
    }

    console.log('Secciones cargadas:', this.camposArray.value);
  }
  ActualizarCampos() {
    this.actualizarCampos.emit();
  }

  get camposArray(): FormArray {
    return this.camposs as FormArray;
  }

  getFormGroup(index: number): FormGroup {
    return this.camposArray.at(index) as FormGroup;
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

  camposActivos(): any[] {
    return this.camposArray.controls.filter((campo) => campo.get('estado')?.value === true);
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

  menu_popup(event: MouseEvent) {
    event.stopPropagation();
    this.menuVisible = !this.menuVisible;
  }

  agregarCampo(tipoCampo: number) {
    this.menuVisible = false;
    console.log('Agregar campo tipo:', tipoCampo);
    const orden = this.camposArray.length > 0 ? this.camposArray.length + 1 : 1;
    const idNuevo = this.preguntaService.generarIdNuevo();

    // Map Checkbox (5) to Option (2) with multiRespuesta = true
    let finalTipo = tipoCampo;
    let isMultiRespuesta = false;

    if (tipoCampo === 5) {
      finalTipo = 2;
      isMultiRespuesta = true;
    }

    const fieldGroupConfig: any = {
      id: [idNuevo, Validators.required],
      orden: [orden, Validators.required],
      tipo: [finalTipo, Validators.required], // Changed from tipoCampo to tipo
      etiqueta: ['', Validators.required],
      descripcion: [''],
      requerido: [false],
      multiRespuesta: [isMultiRespuesta],
      restriccion: [0],
      estado: [true],
    };

    // Para select / checkbox / lista múltiple
    if (tipoCampo === 2 || tipoCampo === 4 || tipoCampo === 5) {
      // OPCIONES como FormArray
      fieldGroupConfig.opciones = this.fb.array([]);

      if (tipoCampo === 5) {
        // Checkbox logic handled by finalTipo=2 and isMultiRespuesta=true
      }
    }

    // Crear el FormGroup dinámicamente basado en el tipo
    const fieldGroup = this.fb.group(fieldGroupConfig);

    // Guardado en arrays de UI y FormArray
    this.campos.push({
      id: idNuevo,
      orden,
      etiqueta: '',
      descripcion: '',
      tipo: finalTipo,
      requerido: false,
      multirespuesta: isMultiRespuesta,
      restriccion: 0,
      estado: true,
      opciones: [],
    });

    //this.campos.push(fieldConfig);
    this.camposArray.push(fieldGroup);
    // forzar detección si es necesario
    this.cdf.detectChanges();
    // console.log(this.camposArray)
  }
  agregarOpcion(campoIndex: number) {
    const opcionesArray = this.camposArray.at(campoIndex).get('opciones') as FormArray;
    const nuevaOpcion = this.fb.group({
      id: [this.preguntaService.generarIdNuevo()],
      etiqueta: ['', Validators.required],
      estado: [true],
      campos: this.fb.array([]),
    });
    opcionesArray.push(nuevaOpcion);
    this.cdf.detectChanges();
  }

  eliminarOpcion(campoIndex: number, opcionIndex: number) {
    const opcionesArray = this.camposArray.at(campoIndex).get('opciones') as FormArray;
    if (opcionesArray && opcionesArray.length > opcionIndex) {
      opcionesArray.removeAt(opcionIndex);
    }
    this.cdf.detectChanges();
  }
  eliminarCampos(): void {
    try {
      this.camposArray.controls.forEach((campo, index) => {
        campo.get('estado')?.setValue(false);
        this.eliminarCampo(index);
      });
      this.cdf.detectChanges();
      this.toastService.showSuccess('Ramificación eliminada');
    } catch (error) {
      this.toastService.showError('Error al eliminar la ramificación');
    }
  }
}
