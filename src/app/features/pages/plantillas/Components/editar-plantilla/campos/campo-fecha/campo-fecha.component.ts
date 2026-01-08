import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'campo-fecha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './campo-fecha.component.html',
})
export class CampoFechaComponent {
  @Input() formFecha!: FormGroup;
  @Input() ramificado!: boolean;
  @Input() posicionCampo!: number;
  @Input() totalCampos!: number;
  @Output() moverArriba = new EventEmitter<void>();
  @Output() moverAbajo = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();

  moverCampoArriba() {
    this.moverArriba.emit();
  }

  moverCampoAbajo() {
    this.moverAbajo.emit();
  }

  eliminarCampo() {
    this.eliminar.emit();
  }
}
