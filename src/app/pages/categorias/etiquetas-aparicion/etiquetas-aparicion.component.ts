import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { EtiquetasService } from '../../../services/etiquetas.service';
import { EtiquetasAparicionService } from '../../../services/etiquetas-aparicion.service';
import { CategoriasService } from '../../../services/categorias.service';
import { ClasificacionesService } from '../../../services/clasificaciones.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-etiquetas-aparicion',
  standalone: true,
  imports: [CommonModule, RouterLink, TarjetaListaComponent, ModalComponent],
  templateUrl: './etiquetas-aparicion.component.html',
  styleUrl: './etiquetas-aparicion.component.css'
})
export default class EtiquetasAparicionComponent implements OnInit {

  public etiquetas: any[] = [];
  public etiquetasAparicion: any[] = [];
  public categoria: any = null;
  public clasificaciones: any[] = [];
  public clasificacionSeleccionada: any = null;
  public modalVisible: boolean = false;
  public modalPasoActual: 'clasificacion' | 'etiqueta' = 'clasificacion';

  constructor(
    private etiquetasService: EtiquetasService,
    private etiquetasAparicionService: EtiquetasAparicionService,
    private categoriasService: CategoriasService,
    private clasificacionesService: ClasificacionesService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {
        console.log(id)
        this.categoriasService.getCategoria(id).subscribe({
          next: ({ categoria }) => {
            console.log(categoria);
            this.categoria = categoria;
            this.listarEtiquetasAparicion();
            this.listarClasificaciones();
          }
        });
      }
    })

    this.listarEtiquetas();

  }

  listarClasificaciones(): void {
    const parametros = {
      direccion: 'desc',
      columna: 'puntuacion',
      activo: 'true'
    };
    this.clasificacionesService.listarClasificaciones(parametros).subscribe({
      next: ({ clasificaciones }) => this.clasificaciones = clasificaciones
    });
  }

  listarEtiquetas(): void {
    const parametros = {
      direccion: 'asc',
      columna: 'descripcion',
      activo: 'true'
    };
    this.etiquetasService.listarEtiquetas(parametros).subscribe({
      next: ({ etiquetas }) => this.etiquetas = etiquetas
    });
  }

  listarEtiquetasAparicion(): void {
    const parametros = {
      direccion: 'desc',
      columna: 'createdAt',
      categoriaId: this.categoria._id
    };
    this.etiquetasAparicionService.listarEtiquetasAparicion(parametros).subscribe({
      next: ({ etiquetasAparicion }) => this.etiquetasAparicion = etiquetasAparicion
    });
  }

  abrirModal(clasificacion: any): void {
    if (clasificacion) {
      this.clasificacionSeleccionada = clasificacion;
      this.modalPasoActual = 'etiqueta';
    } else {
      this.modalPasoActual = 'clasificacion';
    }
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.clasificacionSeleccionada = null;
    this.modalPasoActual = 'clasificacion';
  }

  seleccionarClasificacion(clasificacion: any): void {
    this.clasificacionSeleccionada = clasificacion;
    this.modalPasoActual = 'etiqueta';
  }

  agregarEtiqueta(etiqueta: any): void {
    if (!this.clasificacionSeleccionada) {
      this.alertService.info('Por favor seleccione una clasificación primero');
      return;
    }

    const data = {
      etiquetaId: etiqueta._id,
      categoriaId: this.categoria._id,
      clasificacionId: this.clasificacionSeleccionada._id
    };

    this.etiquetasAparicionService.nuevaEtiquetaAparicion(data).subscribe({
      next: () => {
        this.alertService.success('Etiqueta agregada correctamente');
        this.listarEtiquetasAparicion();
        this.cerrarModal();
      },
      error: (error) => {
        this.alertService.errorApi('Error al agregar la etiqueta');
        console.error(error);
      }
    });
  }

  volver(): void {
    window.history.back();
  }
}
