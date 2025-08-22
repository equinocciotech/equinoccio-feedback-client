import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/clasificaciones';

@Injectable({
  providedIn: 'root'
})
export class ClasificacionesService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getClasificacion(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarClasificaciones({
    direccion = 'asc',
    columna = 'descripcion',
    parametro = '',
    pagina = 1,
    itemsPorPagina = 1000000,
    activo = ''
  }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        parametro,
        pagina,
        itemsPorPagina,
        activo
      },
      headers: this.getToken
    })
  }

  nuevaClasificacion(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarClasificacion(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}