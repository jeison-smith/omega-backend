import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditarCamposPlantillaComponent } from '../editar-campos-plantilla/editar-campos-plantilla.component';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Observable } from 'rxjs';
import { ToastService } from '../../../../../../Core/Service/Toast/toast.service';
import { PreguntaService } from '../../../../../../Core/Service/Preguntas/pregunta.service';

@Component({
  selector: 'editar-secciones-plantilla',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EditarCamposPlantillaComponent],
  templateUrl: './editar-secciones-plantilla.component.html',
  styleUrl: './editar-secciones-plantilla.component.css',
})
export class EditarSeccionesPlantillaComponent {
  @ViewChildren(EditarCamposPlantillaComponent)
  editarCamposPlantilla!: QueryList<EditarCamposPlantillaComponent>;

  seccionesForm: FormGroup;
  camposForm: FormGroup;
  seccionColapsada: boolean[] = [];
  @Input() campos$: Observable<any[]> = new Observable();
  @Output() actualizarCampos = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private preguntaService: PreguntaService,
    private cdf: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    this.seccionesForm = this.fb.group({
      campos: this.fb.array([]),
    });
    this.camposForm = this.fb.group({
      campos: this.fb.array([]),
    });
  }

  get seccionesArray(): FormArray {
    return this.seccionesForm.get('campos') as FormArray;
  }

  getCamposArray(i: number): FormArray {
    return (this.seccionesArray.at(i) as FormGroup).get('campos') as FormArray;
  }

  ActualizarCampos() {
    this.actualizarCampos.emit();
  }

  cargarSeccionesPlantilla(secciones: any) {
    this.seccionesArray.clear();

    if (secciones && secciones.length > 0) {
      secciones.forEach((seccion: any) => {
        const camposArray: FormArray<FormGroup> = this.fb.array<FormGroup>([]);

        const seccionGroup = this.fb.group({
          id: [seccion.id, Validators.required],
          nombre: [seccion.nombre, Validators.required],
          descripcion: [seccion.descripcion],
          campos: camposArray,
        });

        if (seccion.campos && seccion.campos.length > 0) {
          seccion.campos.forEach((campo: any) => {
            camposArray.push(
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
        this.seccionColapsada.push(false);
        this.seccionesArray.push(seccionGroup);
      });
    }

    console.log('Secciones cargadas:', this.seccionesArray.value);
  }

  triggerActualizarCampos() {
    // var camposActualizacion = this.editarCamposPlantilla.guardarCamposPlantilla(0);
  }

  toggleSeccion(index: number): void {
    this.seccionColapsada[index] = !this.seccionColapsada[index];
  }
}
