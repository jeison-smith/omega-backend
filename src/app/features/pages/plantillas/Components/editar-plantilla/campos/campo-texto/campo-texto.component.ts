import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Restriccion } from '../../../../../../Core/Interfaces/Plantilla/restriccion';
import { RestriccionComponent } from './restriccion/restriccion.component';

@Component({
  selector: 'campo-texto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RestriccionComponent],
  templateUrl: './campo-texto.component.html',
})
export class CampoTextoComponent {
  @Input() formTexto!: FormGroup;
  @Input() ramificado: boolean = false;
  @Input() posicionCampo!: number;
  @Input() totalCampos!: number;
  @Output() eliminar = new EventEmitter<void>();
  @Output() moverArriba = new EventEmitter<void>();
  @Output() moverAbajo = new EventEmitter<void>();
  ifRestriccion: any;
  idRestriccion: number = 0;
  modelRestriccion: any;

  ngOnInit(): void {
    var restriccion = this.formTexto.get('restriccion')?.value ?? null;
    this.modelRestriccion = restriccion;
    this.ifRestriccion = restriccion?.estado ?? false;
  }

  eliminarCampo() {
    this.eliminar.emit();
  }

  changeRestriccion() {
    this.ifRestriccion = !this.ifRestriccion;
    if (this.modelRestriccion.idRestriccion) {
      this.formTexto.patchValue({
        restriccion: {
          id: this.modelRestriccion.id ?? 0,
          idRestriccion: this.modelRestriccion.idRestriccion ?? null,
          campo1: this.modelRestriccion.campo1 ?? null,
          campo2: this.modelRestriccion.campo2 ?? null,
          estado: this.ifRestriccion,
        }, // Actualizar el valor en el formGroup
      });
    } else {
      this.formTexto.patchValue({
        restriccion: null,
      });
    }
  }

  onlyInteger(event: any): void {
    let value = event.target.value;
    const negative = value.startsWith('-');

    // Si es negativo, conservamos el signo y limpiamos solo los dígitos del resto
    value = (negative ? '-' : '') + value.replace(/[^0-9]/g, '');

    // Si el valor ha cambiado, actualizamos el campo y disparamos el evento 'input'
    if (value !== event.target.value) {
      event.target.value = value;
      event.target.dispatchEvent(new Event('input'));
    }
  }

  moverCampoArriba() {
    this.moverArriba.emit();
  }

  moverCampoAbajo() {
    this.moverAbajo.emit();
  }

  getFormTexto(): FormGroup {
    return this.formTexto;
  }
}
