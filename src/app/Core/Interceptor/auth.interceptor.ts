import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router); 
  
  //excluimos la ruta de login
  const authRoutes = ['auth/login'];

  if(authRoutes.some(route => req.url.includes(route))){
    return next(req);
  }

  // Obtener token de localStorage
  const token = localStorage.getItem('FalconToken');

  // Si existe token, clonar request y añadir cabecera
  const clonedReq = token ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }) : req;

  return next(clonedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('FalconToken'); // Eliminar token inválido
        router.navigate(['/auth/login']); // Redirigir al inicio
      }
      return throwError(() => error);
    })
  );
};



 // Manejo de errores HTTP
//  return next(clonedReq).pipe(
//   catchError((error) => {
//     if (error.status === 401) {
//       // Token no autorizado
//       localStorage.removeItem('FalconToken'); // Limpia el token
//       router.navigate(['/login']); // Redirige al login
//     }
//     return throwError(() => error); // Reemite el error
//   })
// );
