import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, map, debounceTime } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClasificacionesService } from '../../services/clasificaciones.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  standalone: true,
  selector: 'app-clasificaciones',
  templateUrl: './clasificaciones.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClasificacionesComponent,
    NgxPaginationModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    ModalComponent
  ],
  styleUrls: []
})
export default class ClasificacionesComponent implements OnInit {

  @ViewChild('buscadorClasificaciones') buscadorClasificaciones: ElementRef;
  @ViewChild('inputClasificacion') inputClasificacion: ElementRef;

  // Permisos
  public permiso_escritura: string[] = ['CLASIFICACIONES_ALL'];

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

  // Clasificaciones
  public clasificaciones: any[] = [];
  public clasificacionSeleccionada: any = null;

  public abmForm: any = {
    descripcion: ''
  }

  public loadingClasificaciones: boolean = false;

  constructor(
    public clasificacionesService: ClasificacionesService,
    private authService: AuthService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.alertService.loading();
    this.listarClasificaciones();
  }

  ngAfterViewInit(): void {
    fromEvent<any>(this.buscadorClasificaciones?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(300),
      ).subscribe(text => {
        this.filtro.parametro = text;
        this.cambiarPagina(1);
      })
  }

  // Listar clasificaciones
  listarClasificaciones(): void {
    this.loadingClasificaciones = true;
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      parametro: this.filtro.parametro,
      pagina: this.paginaActual,
      itemsPorPagina: this.cantidadItems,
      activo: this.filtro.activo
    }
    this.clasificacionesService.listarClasificaciones(parametros).subscribe({
      next: ({ clasificaciones, totalItems }) => {
        this.clasificaciones = clasificaciones;
        this.totalItems = totalItems;
        this.loadingClasificaciones = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  abrirAbm(estado: 'crear' | 'editar', clasificacion: any = null): void {
    setTimeout(() => {
      this.inputClasificacion.nativeElement.focus();
    }, 100);
    this.estadoAbm = estado;
    if (estado == 'crear') {
      this.abmForm.descripcion = '';
      this.clasificacionSeleccionada = null;
    }
    else {
      this.clasificacionSeleccionada = clasificacion;
      this.abmForm.descripcion = clasificacion.descripcion
    };
    this.showModalAbm = true;
  }

  nuevaClasificacion(): void {

    if (this.abmForm.descripcion.trim() === '') {
      this.alertService.info('El nombre de la clasificación es requerido');
      return;
    }

    this.alertService.question({ msg: 'Creando clasificación', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const dataCrear = {
            descripcion: this.abmForm.descripcion,
            creatorUserId: this.authService.usuario.userId
          }
          this.clasificacionesService.nuevaClasificacion(dataCrear).subscribe({
            next: ({ clasificacion }) => {
              this.clasificaciones = [clasificacion, ...this.clasificaciones];
              this.totalItems++;
              this.ordenarClasificaciones();
              this.showModalAbm = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });

  }

  actualizarClasificacion(): void {
    this.alertService.question({ msg: 'Actualizando clasificación', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const dataActualizar = { descripcion: this.abmForm.descripcion }
          this.clasificacionesService.actualizarClasificacion(this.clasificacionSeleccionada.id, dataActualizar).subscribe({
            next: ({ clasificacion }) => {
              this.clasificaciones = this.clasificaciones.map(c => c.id == clasificacion.id ? clasificacion : c);
              this.ordenarClasificaciones();
              this.showModalAbm = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(clasificacion: any): void {

    const { id, activo } = clasificacion;

    this.alertService.question({ msg: clasificacion.activo ? 'Baja de clasificación' : 'Alta de clasificación', buttonText: clasificacion.activo ? 'Dar de baja' : 'Dar de alta' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.clasificacionesService.actualizarClasificacion(id, { activo: !activo }).subscribe({
            next: () => {
              this.listarClasificaciones();
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
    this.listarClasificaciones();
  }

  // Ordenar clasificaciones por descripcion
  ordenarClasificaciones(): void {
    this.clasificaciones.sort((a, b) => {
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
    this.listarClasificaciones();
  }

}

