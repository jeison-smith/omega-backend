import { Injectable } from '@angular/core';
import { environment } from '../../../Environments/environments';
import { HttpClient } from '@angular/common/http';
import { Login } from '../../Interfaces/Auth/login';
import { BehaviorSubject, catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { AuthResponse } from '../../Interfaces/Auth/auth-response';
import { Usuario } from '../../Interfaces/Auth/usuario';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //observable para compartir info del usuario logueado
  private userInfoSubject = new BehaviorSubject<Usuario | null>(null);
  userInfo$ = this.userInfoSubject.asObservable();

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    
    const savedUser = localStorage.getItem('FalconUserInfo');
    const initialUser = savedUser ? JSON.parse(savedUser) : null;
    
    this.userInfoSubject = new BehaviorSubject<Usuario | null>(initialUser);
    this.userInfo$ = this.userInfoSubject.asObservable();
  }

  login(credenciales: Login): Observable<AuthResponse>{
    return this.http.post<AuthResponse>(`${this.apiUrl}auth/login`, credenciales).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  getInfoUsuario(): Observable<Usuario>{
    return this.http.get<Usuario>(`${this.apiUrl}user/info`).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  //metodo para manejar login completo
  autenticar(credenciales : Login): Observable<{token: string, infoUser: Usuario}>{
    return this.login(credenciales).pipe(
      switchMap(authResponse => {

        //guardamos token en localStorage
        localStorage.setItem('FalconToken', authResponse.token)

        return this.getInfoUsuario().pipe(
          map(usuario => {
            this.userInfoSubject.next(usuario);
            localStorage.setItem('FalconUserInfo', JSON.stringify(usuario));
            return{
              token: authResponse.token,
              infoUser: usuario
            }
          })
        )
      })
    )
  }

  logout(): void{
    localStorage.removeItem('FalconToken')
    localStorage.removeItem('FalconUserInfo');
    this.userInfoSubject.next(null);
    this.router.navigate(['auth/login'])
  }
}
