import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'eliminar-ramificacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './eliminar-ramificacion.component.html',
})
export class EliminarRamificacionComponent {
  @Output() eliminarRamificacion = new EventEmitter<void>();

  visible: boolean = false;
  loading: boolean = false;

  constructor(private router: Router, private ref: ChangeDetectorRef) {}

  ngOnInit(): void {}

  cancelar() {
    this.visible = false;
    return false;
  }

  aceptar() {
    this.visible = false;
    return true;
  }

  mostrarDialogo() {
    this.visible = true;
  }

  eliminarCampos() {
    this.visible = true;
  }

  eliminarGestion() {
    this.eliminarRamificacion.emit();
    this.visible = false;
  }
}
