import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { ClasificacionesService } from '../../../services/clasificaciones.service';
import { CategoriasService } from '../../../services/categorias.service';

@Component({
  standalone: true,
  selector: 'app-detalles-categorias',
  templateUrl: './detalles-categorias.component.html',
  imports: [CommonModule, TarjetaListaComponent, RouterLink],
  styleUrls: ['./detalles-categorias.component.css']
})
export default class DetallesCategoriasComponent implements OnInit {

  public clasificaciones: any[] = [];
  public categoria: any = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private clasificacionesService: ClasificacionesService,
    private categoriasService: CategoriasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id){
      this.categoriasService.getCategoria(id).subscribe({
        next: ({ categoria }) => this.categoria = categoria
      });
    }
    this.listarClasificaciones();
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
