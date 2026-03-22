import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-home-mobile-footer',
  templateUrl: './home-mobile-footer.component.html',
  styleUrls: ['./home-mobile-footer.component.scss'],
  standalone: false,
})
export class HomeMobileFooterComponent {
  @Output() openProfile = new EventEmitter<void>();
  @Output() addProduct = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
