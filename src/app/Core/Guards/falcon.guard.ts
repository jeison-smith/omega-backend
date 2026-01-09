import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  CanMatch,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
} from '@angular/router';
import { AuthService } from '../Service/Auth/auth.service';
import { map, Observable, of, tap } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class falconGuard implements CanActivate, CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  private isAuthorized(route: ActivatedRouteSnapshot | Route): Observable<boolean> {
    const token = localStorage.getItem('FalconToken');
    // Verificar si el token existe y si no está vacío
    if (!token) {
      this.authService.logout();
      return of(false); // Si no hay token, no está autenticado
    }

    return this.authService.userInfo.pipe(
      map((user) => {
        // Primero verificamos si está autenticado
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // Obtenemos los roles permitidos para esta ruta
        const allowedRoles = (route.data?.['roles'] as string[]) || [];

        // Si no hay roles especificados, asumimos que la ruta es accesible para todos
        if (allowedRoles.length === 0) return true;

        // Verificamos si el rol del usuario está en los roles permitidos
        const hasAccess = allowedRoles.includes(user?.rol?.toLowerCase());

        if (!hasAccess) {
          // Si no tiene acceso, redirigimos a una página de no autorizado o al login
          this.router.navigate(['/accesoDenegado']);
        }

        return hasAccess;
      })
    );
  }

  private isAuthenticated(): Observable<boolean> {
    return this.authService.userInfo.pipe(
      map((user) => !!user),
      tap((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']); // Redirige al login si no está autenticado
        }
      })
    );
  }

  // Implementación de canActivate
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAuthorized(route);
  }

  // Implementación de canMatch
  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAuthorized(route);
  }
}
