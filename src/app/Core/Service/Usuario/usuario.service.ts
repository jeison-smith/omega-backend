import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../Environments/environments';
import { RespuestaUsuario } from '../../Interfaces/Usuario/respuesta-usuario';
import { catchError, Observable, throwError } from 'rxjs';
import { Paginacion } from '../../Interfaces/TablaPaginada/paginacion';
import { CrearUsuario } from '../../Interfaces/Usuario/crear-usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  crearUsuario(crearUsuario: CrearUsuario): Observable<CrearUsuario> {
    return this.http
      .post<CrearUsuario>(`${this.apiUrl}User/register`, crearUsuario)
      .pipe(catchError(this.handleError));
  }

  actualizarUsuario(actualizarUsuario: CrearUsuario): Observable<CrearUsuario> {
    return this.http
      .post<CrearUsuario>(`${this.apiUrl}User/update`, actualizarUsuario)
      .pipe(catchError(this.handleError));
  }

  eliminarUsuario(idUsuario: number): Observable<number> {
    const params = new HttpParams().set('idUsuario', idUsuario.toString());

    return this.http
      .patch<any>(`${this.apiUrl}User/delete`, null, { params })
      .pipe(catchError(this.handleError));
  }

  obtenerUsuarios(paginacion: Paginacion): Observable<RespuestaUsuario> {
    const params = new HttpParams()
      .set('pagina', paginacion.pagina.toString())
      .set('tamanoPagina', paginacion.tamanoPagina.toString())
      .set('entrada', paginacion.entrada);

    return this.http
      .get<RespuestaUsuario>(`${this.apiUrl}User/list`, { params })
      .pipe(catchError(this.handleError));
  }

  validarUsuario(id: string): Observable<any> {
    const params = new HttpParams().set('id', id);

    return this.http
      .get<any>(`${this.apiUrl}User/validate`, { params })
      .pipe(catchError(this.handleError));
  }

  detalleUsuario(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);

    return this.http
      .get<any>(`${this.apiUrl}User/detailedInfo`, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // El interceptor ya maneja el 401 redireccionando al login.
    // Aquí solo transformamos el error para que el componente lo muestre si es necesario.
    if (error.status === 401) {
      return throwError(() => new Error('Sesión no autorizada'));
    }
    return throwError(() => new Error(error.error?.response || 'Error desconocido'));
  }
}
