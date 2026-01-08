import { ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../Service/Auth/auth.service';
import { map, Observable, of, switchMap, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class publicGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
   // console.log('PublicGuard: Constructor initialized');
  }


  private isAuthenticated(): Observable<boolean> {


    return this.authService.userInfo$.pipe(
      switchMap((user) => {
        if (user) {
          const role = user.rol?.toLowerCase();
          if (role === 'administrativo') {
            this.router.navigate(['/home/usuarios']);
          } else if (role === 'operativo') {
            this.router.navigate(['/home/gestion']);
          }
          return of(false); // Impide la navegación a rutas públicas si está autenticado
        }
        return of(true); // Permite la navegación si no está autenticado
      })
    );
  }

  // Implementación de canActivate
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAuthenticated();
  }

  // Implementación de canMatch
  canMatch(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAuthenticated();
  }
}
