import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  //excluimos la ruta de login
  const authRoutes = ['/login'];

  if (authRoutes.some((route) => req.url.includes(route))) {
    return next(req);
  }

  // Obtener token de localStorage
  const token = localStorage.getItem('FalconToken');

  // Si existe token, clonar request y añadir cabecera
  const clonedReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    : req;

  return next(clonedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('FalconToken'); // Eliminar token inválido
        router.navigate(['/login']); // Redirigir al inicio
      }
      return throwError(() => error);
    })
  );
};
