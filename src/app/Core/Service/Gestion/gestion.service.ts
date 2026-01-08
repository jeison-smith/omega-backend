import { Injectable } from '@angular/core';
import { Paginacion } from '../../Interfaces/TablaPaginada/paginacion';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../Environments/environments';
import { RespuestaGestion } from '../../Interfaces/Gestion/respuesta-gestion';
import { GestionPlantilla } from '../../Interfaces/Gestion/gestion-plantilla';
import { ObtenerRespuesta } from '../../Interfaces/Gestion/respuesta-obtenida';
import { Observacion } from '../../Interfaces/Gestion/observacion';
import { EliminarGestion } from '../../Interfaces/Gestion/eliminar-gestion';
import { PaginacionPlantillas } from '../../Interfaces/TablaPaginada/paginacionPlantillas';

@Injectable({
  providedIn: 'root'
})
export class GestionService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  obtenerGestiones(paginacion:PaginacionPlantillas) : Observable<RespuestaGestion>{
  
      const params = new HttpParams()
        .set('pagina', paginacion.pagina.toString())
        .set('tamanoPagina', paginacion.tamanoPagina.toString())
        .set('entrada', paginacion.entrada)
        .set('entradaPlantilla', paginacion.entradaPlantilla);
  
      return this.http.get<RespuestaGestion>(`${this.apiUrl}Management/list`, {params}).pipe(
        catchError((error) => {
          if (error.status === 401) {
            return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
          }
          return throwError(() => new Error(error.error?.response || 'Error desconocido'));
        })
      );
    }

    guardarGestionPlantilla(guardarGestionPlantilla: GestionPlantilla): Observable<GestionPlantilla>{
      return this.http.post<GestionPlantilla>(`${this.apiUrl}Management/register`, guardarGestionPlantilla).pipe(
        catchError((error) => {
          if (error.status === 401) {
            return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
          }
          return throwError(() => new Error(error.error?.response || 'Error desconocido'));
        })
      );
    }

    eliminarGestion(eliminarGestion: EliminarGestion): Observable<EliminarGestion>{
      return this.http.post<EliminarGestion>(`${this.apiUrl}Management/deleteAnswer`, eliminarGestion).pipe(
        catchError((error) => {
          if (error.status === 401) {
            return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
          }
          return throwError(() => new Error(error.error?.response || 'Error desconocido'));
        })
      );
    }

    guardarObservacion(observacion: Observacion): Observable<Observacion>{
      return this.http.post<Observacion>(`${this.apiUrl}Management/observations`, observacion).pipe(
        catchError((error) => {
          if (error.status === 401) {
            return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
          }
          return throwError(() => new Error(error.error?.response || 'Error desconocido'));
        })
      );
    }

    obtenerRespuesta(id: number): Observable<ObtenerRespuesta> {
      const params = new HttpParams()
      .set('id', id)

      return this.http.get<ObtenerRespuesta>(`${this.apiUrl}Management/getAnswer/`, {params}).pipe(
        catchError((error) => {
          if (error.status === 401) {
            return throwError(() => new Error('Sesión no autorizada, por favor ingrese nuevamente'));
          }
          return throwError(() => new Error(error.error?.response || 'Error desconocido'));
        })
      );
    }

    exportarExcel(idPlantilla: string, fechaInicio: Date, fechaFin: Date, estado: number): Observable<Blob> {
      const params = new HttpParams()
        .set('IdPlantilla', idPlantilla) 
        .set('fechaInicio', fechaInicio.toString()) 
        .set('fechaFin', fechaFin.toString()) 
        .set('estado', estado.toString()); 
    
        return this.http.get(`${this.apiUrl}Management/exportXLS`, {
          params,
          observe: 'response',  // Para obtener tanto los encabezados como el cuerpo
          responseType: 'blob'  // Queremos recibir un archivo binario (blob)
        }).pipe(
          map(response => {
            const contentType = response.headers.get('Content-Type');
            
            if (contentType && contentType.startsWith('application/')) {
              return response.body!;
            } else {
              throw new Error('Se esperaba un archivo, pero se ha recibido un mensaje de error o respuesta vacía.');
            }
          }),
          catchError((error) => {
            // Si el error proviene de la API y viene en formato Blob
            if (error.error instanceof Blob) {
              return new Observable<Blob>((observer) => {
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const errorData = JSON.parse(reader.result as string);
                    observer.error(new Error(errorData.response || 'Error desconocido'));
                  } catch (parseError) {
                    observer.error(new Error('Error desconocido'));
                  }
                };
                reader.onerror = () => {
                  observer.error(new Error('Error desconocido'));
                };
                reader.readAsText(error.error);
              });
            } else {
              // Si ya es JSON, se usa directamente la propiedad "response"
              return throwError(() => new Error(error.error.response || 'Error desconocido'));
            }
          })
        );
        
        
        
        
    }
    
}
