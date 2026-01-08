import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { GestionService } from '../../../../../Core/Service/Gestion/gestion.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';

@Component({
  selector: 'eliminar-gestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './eliminar-gestion.component.html',
})
export class EliminarGestionComponent {
  eliminarGestionForm!: FormGroup;

  visible: boolean = false;
  loading = signal(false);
  idGestion: number = -1;

  constructor(
    private fb: FormBuilder,
    private gestionService: GestionService,
    private router: Router,
    private toastMessage: ToastService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.eliminarGestionForm = this.fb.group({
      motivo: ['', Validators.required],
    });
  }

  cancelar() {
    this.idGestion = -1;
    this.eliminarGestionForm.reset();
    this.visible = false;
  }

  mostrarDialogo(idGestion: number) {
    this.idGestion = idGestion;
    this.visible = true;
  }

  eliminarGestion() {
    this.loading.set(true);
    this.ref.detectChanges();
    const eliminarGestion = {
      idRespuestaPlantilla: this.idGestion,
      motivo: this.eliminarGestionForm.get('motivo')?.value,
    };
    this.gestionService
      .eliminarGestion(eliminarGestion)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          //console.log(response)
          this.toastMessage.showSuccess('Registro eliminado correctamente');
          this.idGestion = -1;
          this.loading.set(false);
          this.ref.detectChanges();
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          this.visible = false;
        },
        error: (error) => {
          this.loading.set(false);
          this.toastMessage.showError(error);
        },
      });
  }
}
