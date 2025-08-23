import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, map, debounceTime } from 'rxjs';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoriasService } from '../../services/categorias.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  standalone: true,
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CategoriasComponent,
    NgxPaginationModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    ModalComponent
  ],
  styleUrls: []
})
export default class CategoriasComponent implements OnInit {

  @ViewChild('buscadorCategorias') buscadorCategorias: ElementRef;
  @ViewChild('inputCategoria') inputCategoria: ElementRef;

  // Permisos
  public permiso_escritura: string[] = ['CATEGORIAS_ALL'];

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

  // Categorias
  public categorias: any[] = [];
  public categoriaSeleccionada: any = null;

  public abmForm: any = {
    descripcion: ''
  }

  public loadingCategorias: boolean = false;

  constructor(
    public categoriasService: CategoriasService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.alertService.loading();
    this.listarCategorias();
  }

  ngAfterViewInit(): void {
    fromEvent<any>(this.buscadorCategorias?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(300),
      ).subscribe(text => {
        this.filtro.parametro = text;
        this.cambiarPagina(1);
      })
  }

  // Listar categorias
  listarCategorias(): void {
    this.loadingCategorias = true;
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      parametro: this.filtro.parametro,
      pagina: this.paginaActual,
      itemsPorPagina: this.cantidadItems,
      activo: this.filtro.activo
    }
    this.categoriasService.listarCategorias(parametros).subscribe({
      next: ({ categorias, totalItems }) => {
        this.categorias = categorias;
        this.totalItems = totalItems;
        this.loadingCategorias = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  abrirAbm(estado: 'crear' | 'editar', categoria: any = null): void {
    setTimeout(() => {
      this.inputCategoria.nativeElement.focus();
    }, 100);
    this.estadoAbm = estado;
    if (estado == 'crear') {
      this.abmForm.descripcion = '';
      this.categoriaSeleccionada = null;
    }
    else {
      this.categoriaSeleccionada = categoria;
      this.abmForm.descripcion = categoria.descripcion
    };
    this.showModalAbm = true;
  }

  nuevaCategoria(): void {

    if (this.abmForm.descripcion.trim() === '') {
      this.alertService.info('El nombre de la categoría es requerido');
      return;
    }

    this.alertService.question({ msg: 'Creando categoría', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const dataCrear = {
            descripcion: this.abmForm.descripcion,
            creatorUserId: this.authService.usuario.userId
          }
          this.categoriasService.nuevaCategoria(dataCrear).subscribe({
            next: ({ categoria }) => {
              this.categorias = [categoria, ...this.categorias];
              this.totalItems++;
              this.ordenarCategorias();
              this.showModalAbm = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });

  }

  actualizarCategoria(): void {
    this.alertService.question({ msg: 'Actualizando categoría', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const dataActualizar = { descripcion: this.abmForm.descripcion }
          this.categoriasService.actualizarCategoria(this.categoriaSeleccionada.id, dataActualizar).subscribe({
            next: ({ categoria }) => {
              this.categorias = this.categorias.map(c => c.id == categoria.id ? categoria : c);
              this.ordenarCategorias();
              this.showModalAbm = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(categoria: any): void {

    const { id, activo } = categoria;

    this.alertService.question({ msg: categoria.activo ? 'Baja de categoría' : 'Alta de categoría', buttonText: categoria.activo ? 'Dar de baja' : 'Dar de alta' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.categoriasService.actualizarCategoria(id, { activo: !activo }).subscribe({
            next: () => {
              this.listarCategorias();
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
    this.listarCategorias();
  }

  // Ordenar categorias por descripcion
  ordenarCategorias(): void {
    this.categorias.sort((a, b) => {
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
    this.listarCategorias();
  }

  verDetalles(categoriaId: number): void {
    this.router.navigate(['/dashboard/categorias/detalles', categoriaId]);
  }

}

