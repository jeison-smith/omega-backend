import { Injectable } from '@angular/core';
import { environment } from '../../../Environments/environments';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrearPlantilla } from '../../Interfaces/Plantilla/crear-plantilla';
import { catchError, Observable, of, throwError } from 'rxjs';
import { Paginacion } from '../../Interfaces/TablaPaginada/paginacion';
import { RespuestaPlantilla } from '../../Interfaces/Plantilla/respuesta-plantilla';
import { actualizarPlantilla } from '../../Interfaces/Plantilla/actualizar-plantilla';

import { Plantilla } from '../../Interfaces/Plantilla/plantilla';

@Injectable({
  providedIn: 'root'
})
export class PlantillaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  crearPlantilla(crearPlantilla: CrearPlantilla): Observable<CrearPlantilla>{
    return this.http.post<CrearPlantilla>(`${this.apiUrl}Template/register`, crearPlantilla).pipe(
      catchError((error) =>{
        const errorMessage = error?.error?.response || error?.message || 'Ocurrió un error desconocido.';
        return throwError(() => new Error (errorMessage))
      })
    ) 
  }

  obtenerPlantillas(paginacion:Paginacion) : Observable<RespuestaPlantilla>{

    const params = new HttpParams()
      .set('pagina', paginacion.pagina.toString())
      .set('tamanoPagina', paginacion.tamanoPagina.toString())
      .set('entrada', paginacion.entrada);

    return this.http.get<RespuestaPlantilla>(`${this.apiUrl}Template/list`, {params}).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }

  obtenerPlantillasGestion(entrada: string) : Observable<RespuestaPlantilla>{

        const params = new HttpParams()
      .set('query', entrada)

    return this.http.get<RespuestaPlantilla>(`${this.apiUrl}Template/listAvailable`, {params}).pipe(
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

    return this.http.get<any>(`${this.apiUrl}Template/duplicateNameValidator`, {params}).pipe(
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
//  LISTAR PROYECTOS PARA EL MODAL DE CREAR PLANTILLA
obtenerProyectos(paginacion: any): Observable<any> {

  const params = new HttpParams()
    .set('pagina', paginacion.pagina.toString())
    .set('tamanoPagina', paginacion.tamanoPagina.toString())
    .set('entrada', paginacion.entrada);

  return this.http.get(`${this.apiUrl}Project/list`, { params });
}



  obtenerPlantillasId(id: number) : Observable<Plantilla>{

    const params = new HttpParams()
      .set('id', id)

    return this.http.get<Plantilla>(`${this.apiUrl}Template/getTemplate`, {params}).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );
  }
  
  actualizarCamposPlantilla(actualizarCamposPlantilla: actualizarPlantilla): Observable<actualizarPlantilla>{
    console.log(JSON.stringify(actualizarCamposPlantilla));
    
    return this.http.post<actualizarPlantilla>(`${this.apiUrl}Template/update`, actualizarCamposPlantilla).pipe(
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
        }
        
        return throwError(() => new Error(error.error?.response || 'Error desconocido'));
      })
    );   
    
  }


}
