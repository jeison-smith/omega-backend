import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';

import { take } from 'rxjs';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { UsuarioService } from '../../../../../Core/Service/Usuario/usuario.service';

@Component({
  selector: 'eliminar-usuario',
  standalone: true,
  imports: [CommonModule, Dialog],
  templateUrl: './eliminar-usuario.component.html',
  styleUrl: './eliminar-usuario.component.css',
})
export class EliminarUsuarioComponent {
  visible: boolean = false;
  loading: boolean = false;
  id: number = -1;

  constructor(private toastMessage: ToastService, private usuarioService: UsuarioService) {}

  mostrarDialogo(id: number) {
    this.visible = true;
    this.id = id;
  }

  cancelar() {
    this.visible = false;
  }

  eliminarUsuario() {
    this.loading = true;
    this.usuarioService
      .eliminarUsuario(this.id)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          //console.log(response)
          if (response) {
            this.toastMessage.showSuccess('Usuario eliminado correctamente');
            this.visible = false;
            this.id = -1;
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.toastMessage.showError(
            error || 'Ocurrio un error inesperado, comunicate con soporte de aplicaciones'
          );
        },
      });
  }
}
