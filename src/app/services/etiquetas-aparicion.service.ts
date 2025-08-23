import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/etiquetas-aparicion';

@Injectable({
  providedIn: 'root'
})
export class EtiquetasAparicionService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getEtiquetaAparicion(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarEtiquetasAparicion({
    direccion = 'desc',
    columna = 'createdAt',
    parametro = '',
    pagina = 1,
    itemsPorPagina = 1000000
  }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        parametro,
        pagina,
        itemsPorPagina
      },
      headers: this.getToken
    })
  }

  nuevaEtiquetaAparicion(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarEtiquetaAparicion(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
