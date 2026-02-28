import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
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

  /** True cuando corre en navegador web (no en Capacitor nativo) */
  get isWeb(): boolean {
    return !this.platform.is('capacitor');
  }

  constructor(
    private auth: AuthService,
    private productService: ProductService,
    private router: Router,
    private platform: Platform,
    private alertCtrl: AlertController,
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

  async confirmDelete(product: Product): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => this.deleteProduct(product.id),
        },
      ],
    });
    await alert.present();
  }

  private deleteProduct(id: string): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
      },
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login'], { replaceUrl: true }),
    });
  }
}
