import { Injectable } from '@angular/core';
import { environment } from '../../../Environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Paginacion } from '../../Interfaces/TablaPaginada/paginacion';
import { catchError, Observable, of, throwError } from 'rxjs';
import { RespuestaProyecto } from '../../Interfaces/Proyecto/respuesta-proyecto';
import { CrearProyecto } from '../../Interfaces/Proyecto/crear-proyecto';
import { Proyecto } from '../../Interfaces/Proyecto/proyecto';
import { ProyectoDisponible } from '../../Interfaces/Proyecto/proyecto-disponible';
import { ActualizarProyecto } from '../../Interfaces/Proyecto/actualizar-proyecto';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  crearProyecto(crearProyecto: CrearProyecto): Observable<CrearProyecto>{
    return this.http.post<CrearProyecto>(`${this.apiUrl}Project/register`, crearProyecto).pipe(
      catchError((error) =>{
        const errorMessage = error?.error?.response || error?.message || 'Ocurrió un error desconocido.';
        return throwError(() => new Error (errorMessage))
      })
    ) 
  }

  obtenerProyectos(paginacion:Paginacion) : Observable<RespuestaProyecto>{

    const params = new HttpParams()
      .set('pagina', paginacion.pagina.toString())
      .set('tamanoPagina', paginacion.tamanoPagina.toString())
      .set('entrada', paginacion.entrada);

    return this.http.get<RespuestaProyecto>(`${this.apiUrl}Project/list`, {params}).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  actualizarProyecto(actualizarProyecto: ActualizarProyecto): Observable<ActualizarProyecto>{
    return this.http.patch<ActualizarProyecto>(`${this.apiUrl}Project/update`, actualizarProyecto).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  validarDuplicado(nombre: string) : Observable<any>{

    if (nombre !== '') {
      const params = new HttpParams()
        .set('nombre', nombre)
  
      return this.http.get<any>(`${this.apiUrl}Project/duplicateNameValidator`, {params}).pipe(
        catchError((error) => {
          if (error.status === 401) {
            return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
          }
          return throwError(() => new Error(error.error?.response || 'Error desconocido'));
        })
      );
    }else{
      return of(false);
    }
  }

  proyectosDisponibles(): Observable<RespuestaProyecto>{
    return this.http.get<RespuestaProyecto>(`${this.apiUrl}Project/availableProjects`).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }
}
