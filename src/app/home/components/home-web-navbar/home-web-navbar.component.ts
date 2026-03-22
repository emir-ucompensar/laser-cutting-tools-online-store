import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-web-navbar',
  templateUrl: './home-web-navbar.component.html',
  styleUrls: ['./home-web-navbar.component.scss'],
  standalone: false,
})
export class HomeWebNavbarComponent {
  @Output() openCart = new EventEmitter<void>();
  @Output() addProduct = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() openProfile = new EventEmitter<void>();
}
