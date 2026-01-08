import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { PreguntaService } from '../../../../../../../Core/Service/Preguntas/pregunta.service';

@Component({
  selector: 'campo-opcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './campo-opcion.component.html',
})
export class CampoOpcionComponent {
  @Input() formOpciones!: FormGroup;
  @Input() ramificado: boolean = false;
  @Input() posicionCampo!: number;
  @Input() totalCampos!: number;
  @Output() eliminar = new EventEmitter<void>();
  @Output() moverArriba = new EventEmitter<void>();
  @Output() moverAbajo = new EventEmitter<void>();
  @Output() actualizarCampos = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private preguntaService: PreguntaService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.opciones.controls.forEach((element) => {
      console.log(element);
    });
  }

  get opciones(): FormArray {
    return this.formOpciones.get('opciones') as FormArray;
  }

  agregarOpcion() {
    var opcionId = this.preguntaService.generarIdNuevo();
    const nuevaOpcion = this.fb.group({
      id: [opcionId],
      etiqueta: ['', Validators.required],
      estado: [true, Validators.required],
      campos: [this.fb.group([])],
    });

    this.opciones.push(nuevaOpcion);

    nuevaOpcion.get('etiqueta')?.updateValueAndValidity();
  }

  ramificar(idOpcionCampo: number) {
    console.log('Ramificar opción con ID:', idOpcionCampo);
    this.triggerActualizacionCampos();
    this.router.navigate(['/home/plantillas/opcion', idOpcionCampo]);
  }

  triggerActualizacionCampos() {
    this.actualizarCampos.emit();
  }

  onBlur(i: number): void {
    const etiquetaControl = this.opciones.at(i).get('etiqueta');
    if (etiquetaControl) {
      console.log(etiquetaControl);
      console.log(this.opciones.valid);
    }
  }

  eliminarOpcion(index: number) {
    if (index >= 0 && index < this.opciones.length) {
      const opcion = this.opciones.at(index);
      if (opcion) {
        if (opcion.get('id')?.value || opcion.get('id')?.value <= 0) {
          opcion.get('estado')?.setValue(false);
          if (opcion.get('etiqueta')?.value == '') {
            opcion.get('etiqueta')?.setValue('ELIMINADOVACIO');
          }
        } else {
          this.opciones.removeAt(index);
        }
      }
    }
    this.cdRef.detectChanges();
  }

  totalSubpreguntas(opcion: AbstractControl | null): number {
    if (!opcion) return 0;

    const campos = opcion.get('campos')?.value;
    if (!Array.isArray(campos)) {
      return 0;
    }

    return campos.filter((c: any) => c.estado).length;
  }

  eliminarCampo() {
    this.eliminar.emit();
  }

  arriba(index: number) {
    if (index > 0) {
      this.swapOpciones(index, index - 1);
    }
  }

  abajo(index: number) {
    if (index < this.opciones.length - 1) {
      this.swapOpciones(index, index + 1);
    }
  }

  private swapOpciones(index1: number, index2: number): void {
    const temp = this.opciones.at(index1).value;
    this.opciones.at(index1).setValue(this.opciones.at(index2).value);
    this.opciones.at(index2).setValue(temp);
  }

  moverCampoArriba() {
    this.moverArriba.emit();
  }

  moverCampoAbajo() {
    this.moverAbajo.emit();
  }
}
