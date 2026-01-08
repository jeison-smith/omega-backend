import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../Core/Service/Toast/toast.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading: boolean = false;
  preproduccion: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastMessage: ToastService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required],
    });

    var dominio = window.location.hostname;
    console.log(dominio);
    if (dominio == 'falconpreprod.atlanticqi.com') {
      this.preproduccion = true;
    }
  }

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
      this.loading = true; //activamos el loading...
      this.loginForm.disable();

      const { usuario, password } = this.loginForm.value;

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
            this.loading = false;
          },
        });
    }
  }
}
