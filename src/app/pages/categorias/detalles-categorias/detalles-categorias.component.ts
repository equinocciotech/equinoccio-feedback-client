import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { ClasificacionesService } from '../../../services/clasificaciones.service';
import { CategoriasService } from '../../../services/categorias.service';
import { EtiquetasService } from '../../../services/etiquetas.service';
import { EtiquetasAparicionService } from '../../../services/etiquetas-aparicion.service';
import { AlertService } from '../../../services/alert.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-detalles-categorias',
  templateUrl: './detalles-categorias.component.html',
  imports: [CommonModule, FormsModule, TarjetaListaComponent, RouterLink, ModalComponent],
  styleUrls: ['./detalles-categorias.component.css']
})
export default class DetallesCategoriasComponent implements OnInit {

  public clasificaciones: any[] = [];
  public categoria: any = null;
  public etiquetas: any[] = [];
  public etiquetasPorClasificacion: { [key: string]: any[] } = {};
  public clasificacionSeleccionada: any = null;
  public modalVisible: boolean = false;
  public filtroEtiqueta: string = '';

  constructor(
    private authService: AuthService,
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
            this.listarClasificaciones();
            this.listarEtiquetas();
          }
        });
      }
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
      next: ({ clasificaciones }) => {
        this.clasificaciones = clasificaciones;
        this.clasificaciones.forEach(clasificacion => {
          this.etiquetasAparicionService.getEtiquetasAparicionByClasificacionAndCategoria(clasificacion.id, this.categoria.id).subscribe({
            next: ({ etiquetasAparicion }) => {
              this.etiquetasPorClasificacion[clasificacion.id] = etiquetasAparicion.map(e => e.etiqueta);
            }
          });
        });
      }
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

  getEtiquetasPorClasificacion(clasificacionId: string): any[] {
    return this.etiquetasPorClasificacion[clasificacionId] || [];
  }

  get etiquetasFiltradas(): any[] {
    return this.etiquetas.filter(e =>
      e.descripcion.toLowerCase().includes(this.filtroEtiqueta.toLowerCase())
    );
  }

  abrirModal(clasificacion: any): void {
    this.clasificacionSeleccionada = clasificacion;
    this.filtroEtiqueta = '';
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.clasificacionSeleccionada = null;
    this.filtroEtiqueta = '';
  }

  agregarEtiqueta(etiqueta: any): void {
    if (!this.clasificacionSeleccionada) {
      this.alertService.info('Por favor seleccione una clasificación');
      return;
    }

    const data = {
      etiquetaId: etiqueta.id,
      categoriaId: this.categoria.id,
      clasificacionId: this.clasificacionSeleccionada.id,
      creatorUserId: this.authService.usuario.userId
    };

    console.log(data);

      this.etiquetasAparicionService.nuevaEtiquetaAparicion(data).subscribe({
        next: () => {
          this.alertService.success('Etiqueta agregada correctamente');
          this.etiquetasAparicionService.getEtiquetasAparicionByClasificacionAndCategoria(this.clasificacionSeleccionada.id, this.categoria.id).subscribe({
            next: ({ etiquetasAparicion }) => {
              this.etiquetasPorClasificacion[this.clasificacionSeleccionada.id] = etiquetasAparicion.map(e => e.etiqueta);
            }
          });
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
