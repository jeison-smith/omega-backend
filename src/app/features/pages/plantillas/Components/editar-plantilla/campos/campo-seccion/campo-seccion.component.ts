import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'campo-seccion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './campo-seccion.component.html',
})
export class CampoSeccionComponent {
  @Input() formSeccion!: FormGroup;
  @Input() posicionCampo!: number;
  @Input() totalCampos!: number;
  @Output() eliminar = new EventEmitter<void>();
  @Output() moverArriba = new EventEmitter<void>();
  @Output() moverAbajo = new EventEmitter<void>();

  eliminarCampo() {
    this.eliminar.emit();
  }

  moverCampoArriba() {
    this.moverArriba.emit();
  }

  moverCampoAbajo() {
    this.moverAbajo.emit();
  }
}
