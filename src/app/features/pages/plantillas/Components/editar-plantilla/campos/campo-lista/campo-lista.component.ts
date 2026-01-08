import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreguntaService } from '../../../../../../../Core/Service/Preguntas/pregunta.service';

@Component({
  selector: 'campo-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './campo-lista.component.html',
})
export class CampoListaComponent {
  @Input() formlista!: FormGroup;
  @Input() ramificado: boolean = false;
  @Input() posicionCampo!: number;
  @Input() totalCampos!: number;
  @Output() eliminar = new EventEmitter<void>();
  @Output() moverArriba = new EventEmitter<void>();
  @Output() moverAbajo = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private preguntaService: PreguntaService) {}

  get opciones(): FormArray {
    return this.formlista.get('opciones') as FormArray;
  }

  agregarOpcion() {
    var opcionId = this.preguntaService.generarIdNuevo();
    this.opciones.push(
      this.fb.group({
        id: [opcionId],
        etiqueta: ['', Validators.required],
        estado: [true, Validators.required],
        campos: [this.fb.group([])],
      })
    );
  }

  // Eliminar una opción por índice
  eliminarOpcion(index: number) {
    if (index >= 0 && index < this.opciones.length) {
      const opcion = this.opciones.at(index);
      if (opcion) {
        if (opcion.get('id')?.value || opcion.get('id')?.value <= 0) {
          opcion.get('estado')?.setValue(false);
        } else {
          this.opciones.removeAt(index);
        }
      }
    }

    // this.opciones.removeAt(index);
    // const opcion = this.opciones.at(index);
    // console.log(opcion)
    //opcion.get('estado')?.setValue(false);
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

  // // Emitir el evento para eliminar el campo completo
  // onRemove() {
  //   this.eliminar.emit();
  // }
}
