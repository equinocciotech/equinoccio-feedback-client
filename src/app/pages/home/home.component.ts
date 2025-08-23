import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';
import { ModalComponent } from '../../components/modal/modal.component';
import { RouterModule } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    ModalComponent,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrls: []
})
export default class HomeComponent implements OnInit {

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit() {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    gsap.from('.nav-card', { y:30, opacity:0, duration:.5, stagger:.1, delay:.2 });
  }

}
