import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { ToastService } from '../../../../Core/Service/Toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastMessage = inject(ToastService);

  readonly loginForm = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly loading = signal(false);
  readonly preproduccion = signal(
    window.location.hostname === 'falconpreprod.atlanticqi.com'
  );

  private readonly formStatus = toSignal(this.loginForm.statusChanges, {
    initialValue: this.loginForm.status,
  });
  readonly canSubmit = computed(
    () => this.formStatus() === 'VALID' && !this.loading()
  );

  private redireccionRol(infoUser: any): void {
    const rol = infoUser.rol?.toLowerCase();
    //console.log(rol);
    if (rol === 'administrativo') {
      this.router.navigate(['home/usuarios']);
    } else if (rol === 'operativo') {
      this.router.navigate(['home/gestion']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true); //activamos el loading...
      this.loginForm.disable();

      const { usuario, password } = this.loginForm.getRawValue();

      this.authService
        .autenticar({ usuario, password })
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            if (response) {
              this.redireccionRol(response.infoUser);
            }
          },
          error: (error) => {
            this.toastMessage.showError(error.message); // Mostrar mensaje en el toast
            this.loginForm.reset();
            this.loginForm.enable();
            this.loading.set(false);
          },
        });
    }
  }
}
