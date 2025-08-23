import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { ClasificacionesService } from '../../../services/clasificaciones.service';
import { CategoriasService } from '../../../services/categorias.service';
import { EtiquetasService } from '../../../services/etiquetas.service';
import { EtiquetasAparicionService } from '../../../services/etiquetas-aparicion.service';
import { AlertService } from '../../../services/alert.service';
import { ModalComponent } from '../../../components/modal/modal.component';

@Component({
  standalone: true,
  selector: 'app-detalles-categorias',
    templateUrl: './detalles-categorias.component.html',
    imports: [CommonModule, TarjetaListaComponent, RouterLink, ModalComponent],
    styleUrls: ['./detalles-categorias.component.css']
  })
  export default class DetallesCategoriasComponent implements OnInit {

    public clasificaciones: any[] = [];
    public categoria: any = null;
    public etiquetas: any[] = [];
    public etiquetasAparicion: any[] = [];
    public clasificacionSeleccionada: any = null;
    public modalVisible: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private clasificacionesService: ClasificacionesService,
    private categoriasService: CategoriasService,
    private etiquetasService: EtiquetasService,
    private etiquetasAparicionService: EtiquetasAparicionService,
    private alertService: AlertService,
    private router: Router
  ) { }

    ngOnInit(): void {
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      if(id){
        this.categoriasService.getCategoria(id).subscribe({
          next: ({ categoria }) => {
            this.categoria = categoria;
            this.listarEtiquetasAparicion();
          }
        });
      }
      this.listarClasificaciones();
      this.listarEtiquetas();
    }

  listarClasificaciones(): void {
    const parametros: any = {
      direccion: 'desc',
      columna: 'puntuacion',
      pagina: 1,
      itemsPorPagina: 1000000,
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
    if (!this.categoria) return;
    const parametros = {
      direccion: 'desc',
      columna: 'createdAt',
      categoriaId: this.categoria._id
    };
    this.etiquetasAparicionService.listarEtiquetasAparicion(parametros).subscribe({
      next: ({ etiquetasAparicion }) => this.etiquetasAparicion = etiquetasAparicion
    });
  }

  getEtiquetasPorClasificacion(clasificacionId: string): any[] {
    return this.etiquetasAparicion
      .filter(e => e.clasificacion._id === clasificacionId)
      .map(e => e.etiqueta);
  }

  abrirModal(clasificacion: any): void {
    this.clasificacionSeleccionada = clasificacion;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.clasificacionSeleccionada = null;
  }

  agregarEtiqueta(etiqueta: any): void {
    if (!this.clasificacionSeleccionada) {
      this.alertService.info('Por favor seleccione una clasificación');
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
      error: () => this.alertService.errorApi('Error al agregar la etiqueta')
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/categorias']);
  }

  // Método para generar un array de estrellas basado en la puntuación
  generarEstrellas(puntuacion: number): boolean[] {
    const estrellas = [];
    for (let i = 0; i < 5; i++) {
      estrellas.push(i < puntuacion);
    }
    return estrellas;
  }

  // Método para obtener el color de fondo basado en la puntuación
  getColorFondo(puntuacion: number): string {
    if (puntuacion >= 4) return 'bg-green-50 border-green-200';
    if (puntuacion >= 3) return 'bg-yellow-50 border-yellow-200';
    if (puntuacion >= 2) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  }

  // Método para obtener el color del texto de estado
  getEstadoColor(puntuacion: number): string {
    if (puntuacion >= 4) return 'text-green-700';
    if (puntuacion >= 3) return 'text-yellow-700';
    if (puntuacion >= 2) return 'text-orange-700';
    return 'text-red-700';
  }

}
