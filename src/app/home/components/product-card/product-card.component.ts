import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../core/models/product.models';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: false,
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() deleteProduct = new EventEmitter<Product>();
}
