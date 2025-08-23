import { Component, OnInit } from '@angular/core';
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
  ) { }

  ngOnInit() {}

}
