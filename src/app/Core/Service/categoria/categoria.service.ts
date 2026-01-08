import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../Environments/environments';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private baseUrl = environment.apiUrl + 'api/Categorias/';
  private projectUrl = environment.apiUrl + 'Project/';

  constructor(private http: HttpClient) {}

  // Crear categoría
  crearCategoria(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}crear`, body);
  }

  // Listar categorías (paginado + búsqueda)
  listarCategorias(
    pagina: number = 1,
    tamanoPagina: number = 20,
    entrada: string = ''
  ): Observable<any> {

    const params = new HttpParams()
      .set('page', pagina)
      .set('pageSize', tamanoPagina)
      .set('search', entrada);

    return this.http.get(`${this.baseUrl}listar`, { params });
  }

  // Obtener una categoría por ID
  obtenerCategoria(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${id}`);
  }

  // Cambiar estado
  cambiarEstado(id: number, estado: boolean, usuario: number): Observable<any> {
    const params = new HttpParams()
      .set('estado', estado)
      .set('usuario', usuario);

    return this.http.put(`${this.baseUrl}estado/${id}`, null, { params });
  }

  // Listado de proyectos
  
   obtenerProyectos(paginacion: any): Observable<any> {

    const params = new HttpParams()
      .set('pagina', paginacion.pagina.toString())
      .set('tamanoPagina', paginacion.tamanoPagina.toString())
      .set('entrada', paginacion.entrada);

    return this.http.get(`${this.projectUrl}list`, { params });
  }


}

  

