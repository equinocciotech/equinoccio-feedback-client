import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, map, debounceTime } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnidadesMedidaService } from '../../services/unidades-medida.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  standalone: true,
  selector: 'app-unidades-medida',
  templateUrl: './unidades-medida.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UnidadesMedidaComponent,
    NgxPaginationModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    ModalComponent
  ],
  styleUrls: []
})
export default class UnidadesMedidaComponent implements OnInit {

  @ViewChild('buscadorUnidades') buscadorUnidades: ElementRef;
  @ViewChild('inputUnidad') inputUnidad: ElementRef;

  // Permisos
  public permiso_escritura: string[] = ['UNIDADES_MEDIDA_ALL'];

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

  // Unidades de medida
  public unidades: any[] = [];
  public unidadSeleccionada: any = null;

  public abmForm: any = {
    descripcion: ''
  }

  public loadingUnidades: boolean = false;

  constructor(
    public unidadesMedidaService: UnidadesMedidaService,
    private authService: AuthService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.alertService.loading();
    this.listarUnidades();
  }

  ngAfterViewInit(): void {
    fromEvent<any>(this.buscadorUnidades?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(300),
      ).subscribe(text => {
        this.filtro.parametro = text;
        this.cambiarPagina(1);
      })
  }

  // Listar unidades
  listarUnidades(): void {
    this.loadingUnidades = true;
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      parametro: this.filtro.parametro,
      pagina: this.paginaActual,
      itemsPorPagina: this.cantidadItems,
      activo: this.filtro.activo
    }
    this.unidadesMedidaService.listarUnidadesMedida(parametros).subscribe({
      next: ({ unidadesMedida, totalItems }) => {
        console.log(unidadesMedida);
        this.unidades = unidadesMedida;
        this.totalItems = totalItems;
        this.loadingUnidades = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  abrirAbm(estado: 'crear' | 'editar', unidad: any = null): void {
    setTimeout(() => {
      this.inputUnidad.nativeElement.focus();
    }, 100);
    this.estadoAbm = estado;
    if (estado == 'crear') {
      this.abmForm.descripcion = '';
      this.unidadSeleccionada = null;
    }
    else {
      this.unidadSeleccionada = unidad;
      this.abmForm.descripcion = unidad.descripcion
    };
    this.showModalAbm = true;
  }

  nuevaUnidad(): void {

    if (this.abmForm.descripcion.trim() === '') {
      this.alertService.info('El nombre de la unidad es requerido');
      return;
    }

    this.alertService.question({ msg: 'Creando unidad de medida', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const dataCrear = {
            descripcion: this.abmForm.descripcion,
            creatorUserId: this.authService.usuario.userId
          }
          this.unidadesMedidaService.nuevaUnidadMedida(dataCrear).subscribe({
            next: ({ unidadMedida }) => {
              this.unidades = [unidadMedida, ...this.unidades];
              this.totalItems++;
              this.ordenarUnidades();
              this.showModalAbm = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });

  }

  actualizarUnidad(): void {
    this.alertService.question({ msg: 'Actualizando unidad de medida', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const dataActualizar = { descripcion: this.abmForm.descripcion }
          this.unidadesMedidaService.actualizarUnidadMedida(this.unidadSeleccionada.id, dataActualizar).subscribe({
            next: ({ unidadMedida }) => {
              this.unidades = this.unidades.map(u => u.id == unidadMedida.id ? unidadMedida : u);
              this.ordenarUnidades();
              this.showModalAbm = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(unidad: any): void {

    const { id, activo } = unidad;

    this.alertService.question({ msg: unidad.activo ? 'Baja de unidad de medida' : 'Alta de unidad de medida', buttonText: unidad.activo ? 'Dar de baja' : 'Dar de alta' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.unidadesMedidaService.actualizarUnidadMedida(id, { activo: !activo }).subscribe({
            next: () => {
              this.listarUnidades();
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
    this.listarUnidades();
  }

  // Ordenar unidades por descripcion
  ordenarUnidades(): void {
    this.unidades.sort((a, b) => {
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
    this.listarUnidades();
  }

}
