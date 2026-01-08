import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../Environments/environments';
import { RespuestaUsuario } from '../../Interfaces/Usuario/respuesta-usuario';
import { catchError, Observable, throwError } from 'rxjs';
import { Paginacion } from '../../Interfaces/TablaPaginada/paginacion';
import { CrearUsuario } from '../../Interfaces/Usuario/crear-usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  crearUsuario(crearUsuario: CrearUsuario): Observable<CrearUsuario>{
    return this.http.post<CrearUsuario>(`${this.apiUrl}User/register`, crearUsuario).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  actualizarUsuario(actualizarUsuario: CrearUsuario): Observable<CrearUsuario>{
    return this.http.post<CrearUsuario>(`${this.apiUrl}User/update`, actualizarUsuario).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  eliminarUsuario(idUsuario: number): Observable<number> {
    const params = new HttpParams()
      .set('idUsuario', idUsuario.toString()); 
  
    return this.http.patch<any>(`${this.apiUrl}User/delete`, null, { params }).pipe(  
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  obtenerUsuarios(paginacion:Paginacion) : Observable<RespuestaUsuario>{

    const params = new HttpParams()
      .set('pagina', paginacion.pagina.toString())
      .set('tamanoPagina', paginacion.tamanoPagina.toString())
      .set('entrada', paginacion.entrada);

    return this.http.get<RespuestaUsuario>(`${this.apiUrl}User/list`, {params}).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  validarUsuario(id: string) : Observable<any>{

    const params = new HttpParams()
      .set('id', id)

    return this.http.get<any>(`${this.apiUrl}User/validate`, {params}).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  detalleUsuario(id: number) : Observable<any>{

    const params = new HttpParams()
      .set('id', id)

    return this.http.get<any>(`${this.apiUrl}User/detailedInfo`, {params}).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }
}
