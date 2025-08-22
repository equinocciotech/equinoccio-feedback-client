import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, map, debounceTime } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EtiquetasService } from '../../services/etiquetas.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  standalone: true,
  selector: 'app-etiquetas',
  templateUrl: './etiquetas.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EtiquetasComponent,
    NgxPaginationModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    ModalComponent
  ],
  styleUrls: []
})
export default class EtiquetasComponent implements OnInit {

  @ViewChild('buscadorEtiquetas') buscadorEtiquetas: ElementRef;
  @ViewChild('inputEtiqueta') inputEtiqueta: ElementRef;

  // Permisos
  public permiso_escritura: string[] = ['ETIQUETAS_ALL'];

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 'asc',  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  // Flags
  public showModalAbm: boolean = false;
  public estadoAbm: 'crear' | 'editar' = 'crear';

  // Etiquetas
  public etiquetas: any[] = [];
  public etiquetaSeleccionada: any = null;

  public abmForm: any = {
    descripcion: ''
  }

  public loadingEtiquetas: boolean = false;

  constructor(
    public etiquetasService: EtiquetasService,
    private authService: AuthService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.alertService.loading();
    this.listarEtiquetas();
  }

  ngAfterViewInit(): void {
    fromEvent<any>(this.buscadorEtiquetas?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(300),
      ).subscribe(text => {
        this.filtro.parametro = text;
        this.cambiarPagina(1);
      })
  }

  // Listar etiquetas
  listarEtiquetas(): void {
    this.loadingEtiquetas = true;
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      parametro: this.filtro.parametro,
      pagina: this.paginaActual,
      itemsPorPagina: this.cantidadItems,
      activo: this.filtro.activo
    }
    this.etiquetasService.listarEtiquetas(parametros).subscribe({
      next: ({ etiquetas, totalItems }) => {
        this.etiquetas = etiquetas;
        this.totalItems = totalItems;
        this.loadingEtiquetas = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  abrirAbm(estado: 'crear' | 'editar', etiqueta: any = null): void {
    setTimeout(() => {
      this.inputEtiqueta.nativeElement.focus();
    }, 100);
    this.estadoAbm = estado;
    if (estado == 'crear') {
      this.abmForm.descripcion = '';
      this.etiquetaSeleccionada = null;
    }
    else {
      this.etiquetaSeleccionada = etiqueta;
      this.abmForm.descripcion = etiqueta.descripcion
    };
    this.showModalAbm = true;
  }

  nuevaEtiqueta(): void {

    if (this.abmForm.descripcion.trim() === '') {
      this.alertService.info('El nombre de la etiqueta es requerido');
      return;
    }

    this.alertService.question({ msg: 'Creando etiqueta', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const dataCrear = {
            descripcion: this.abmForm.descripcion,
            creatorUserId: this.authService.usuario.userId
          }
          this.etiquetasService.nuevaEtiqueta(dataCrear).subscribe({
            next: ({ etiqueta }) => {
              this.etiquetas = [etiqueta, ...this.etiquetas];
              this.totalItems++;
              this.ordenarEtiquetas();
              this.showModalAbm = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });

  }

  actualizarEtiqueta(): void {
    this.alertService.question({ msg: 'Actualizando etiqueta', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const dataActualizar = { descripcion: this.abmForm.descripcion }
          this.etiquetasService.actualizarEtiqueta(this.etiquetaSeleccionada.id, dataActualizar).subscribe({
            next: ({ etiqueta }) => {
              this.etiquetas = this.etiquetas.map(c => c.id == etiqueta.id ? etiqueta : c);
              this.ordenarEtiquetas();
              this.showModalAbm = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(etiqueta: any): void {

    const { id, activo } = etiqueta;

    this.alertService.question({ msg: etiqueta.activo ? 'Baja de etiqueta' : 'Alta de etiqueta', buttonText: etiqueta.activo ? 'Dar de baja' : 'Dar de alta' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.etiquetasService.actualizarEtiqueta(id, { activo: !activo }).subscribe({
            next: () => {
              this.listarEtiquetas();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void {
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 'asc' ? 'desc' : 'asc';
    this.alertService.loading();
    this.listarEtiquetas();
  }

  // Ordenar etiquetas por descripcion
  ordenarEtiquetas(): void {
    this.etiquetas.sort((a, b) => {
      const descripcionA = a.descripcion.toLowerCase();
      const descripcionB = b.descripcion.toLowerCase();

      if (this.ordenar.direccion === 'asc') {
        return descripcionA < descripcionB ? -1 : descripcionA > descripcionB ? 1 : 0;
      } else {
        return descripcionA > descripcionB ? -1 : descripcionA < descripcionB ? 1 : 0;
      }
    });
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.listarEtiquetas();
  }

}

