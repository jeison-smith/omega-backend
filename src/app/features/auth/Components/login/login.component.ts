import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { ToastService } from '../../../../Core/Service/Toast/toast.service';
import { MessageService } from 'primeng/api';
import { Login } from '../../../../Core/Interfaces/Auth/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  providers: [MessageService],
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);

  private readonly authService = inject(AuthService);
  private readonly toastMessage = inject(ToastService);
  private readonly messageService: MessageService = inject(MessageService);

  readonly loginForm = signal(
    new FormGroup({
      usuario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    })
  );

  readonly loading = signal(false);
  readonly preproduccion = signal(window.location.hostname === 'falconpreprod.atlanticqi.com');

  private readonly formStatus = toSignal(this.loginForm().statusChanges, {
    initialValue: this.loginForm().status,
  });
  readonly canSubmit = computed(() => this.formStatus() === 'VALID' && !this.loading());

  private redireccionRol(infoUser: any): void {
    const rol = infoUser.rol?.toLowerCase();
    //console.log(rol);
    if (rol === 'administrativo') {
      this.router.navigate(['home/usuarios']);
    } else if (rol === 'operativo') {
      this.router.navigate(['home/gestion']);
    }
  }

  // onSubmit(): void {
  //   if (this.loginForm().valid) {
  //     this.loading.set(true); //activamos el loading...
  //     this.loginForm().disable();

  //     const { usuario, password } = this.loginForm().getRawValue();

  //     this.authService
  //       .autenticar({ usuario, password })
  //       .pipe(take(1))
  //       .subscribe({
  //         next: (response) => {
  //           if (response) {
  //             this.redireccionRol(response.infoUser);
  //             console.log(response.infoUser);
  //           }
  //         },
  //         error: (error) => {
  //           this.toastMessage.showError(error.message); // Mostrar mensaje en el toast
  //           this.loginForm().reset();
  //           this.loginForm().enable();
  //           this.loading.set(false);
  //         },
  //       });
  //   }
  // }

  // Método para enviar el formulario
  onSubmit() {
    if (this.loginForm().invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos.',
      });
      return;
    }

    this.loading.set(true);
    this.loginForm().disable();

    const credentials: Login = {
      usuario: this.loginForm().value.usuario!,
      password: this.loginForm().value.password!,
    };

    this.authService
      .autenticar(credentials)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.loginForm().enable();
        }),
        catchError((error) => {
          const msg = error.message || 'Error en el login. Por favor intenta nuevamente.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: msg,
          });
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.token) {
            this.redireccionRol(response.infoUser);
          }
        },
      });
  }
}
