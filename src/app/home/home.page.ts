import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ProductService } from '../core/services/product.service';
import { Product } from '../core/models/product.models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  products: Product[] = [];
  loading = false;

  constructor(
    private auth: AuthService,
    private productService: ProductService,
    private router: Router,
  ) {}

  ionViewWillEnter(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  goToAddProduct(): void {
    this.router.navigate(['/add-product']);
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login'], { replaceUrl: true }),
    });
  }
}
