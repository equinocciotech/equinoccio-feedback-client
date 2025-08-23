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
  styleUrls: []
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

}
