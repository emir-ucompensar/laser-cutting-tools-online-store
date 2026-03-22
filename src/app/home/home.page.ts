import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';
import { ProductService } from '../core/services/product.service';
import { Product } from '../core/models/product.models';
import { CartService } from '../core/services/cart.service';
import { CartItem } from '../core/models/cart.models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  products: Product[] = [];
  loading = false;
  profileOpen = false;
  cartOpen = false;
  cartLoading = false;
  userEmail = '';
  userId = '';
  cartItems: CartItem[] = [];

  /** True cuando corre en navegador web (no en Capacitor nativo) */
  get isWeb(): boolean {
    return !this.platform.is('capacitor');
  }

  constructor(
    private auth: AuthService,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private platform: Platform,
    private alertCtrl: AlertController,
  ) {}

  ionViewWillEnter(): void {
    this.loadUserData();
    this.loadProducts();
    this.loadCart();
  }

  private loadUserData(): void {
    this.auth.getSession().subscribe({
      next: (session) => {
        this.userEmail = session?.user?.email ?? 'Sin correo disponible';
        this.userId = session?.user?.id ?? '';
      },
      error: () => {
        this.userEmail = 'Sin correo disponible';
        this.userId = '';
      },
    });
  }

  get cartTotal(): number {
    return this.cartItems.reduce((acc, item) => {
      const unit = Number(item.products?.price ?? 0);
      return acc + unit * item.quantity;
    }, 0);
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

  onHardReload(): void {
    this.loadProducts();
    this.loadCart();
  }

  goToAddProduct(): void {
    this.router.navigate(['/add-product']);
  }

  openProfile(): void {
    this.profileOpen = true;
  }

  closeProfile(): void {
    this.profileOpen = false;
  }

  openCart(): void {
    this.cartOpen = true;
    this.loadCart();
  }

  closeCart(): void {
    this.cartOpen = false;
  }

  private loadCart(): void {
    this.cartLoading = true;
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.cartLoading = false;
      },
      error: () => {
        this.cartItems = [];
        this.cartLoading = false;
      },
    });
  }

  async onDeleteAccountClick(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cuenta',
      message: 'Esta acción eliminará tu cuenta y no se puede deshacer. ¿Deseas continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar cuenta',
          cssClass: 'danger',
          handler: () => this.deleteAccount(),
        },
      ],
    });
    await alert.present();
  }

  private deleteAccount(): void {
    this.auth.deleteAccount().subscribe({
      next: async ({ error }) => {
        if (error) {
          const errorAlert = await this.alertCtrl.create({
            header: 'No se pudo eliminar la cuenta',
            message: 'Verifica que la función SQL delete_my_account esté creada en Supabase.',
            buttons: ['Entendido'],
          });
          await errorAlert.present();
          return;
        }

        this.closeProfile();
        const successAlert = await this.alertCtrl.create({
          header: 'Cuenta eliminada',
          message: 'Tu cuenta fue eliminada correctamente.',
          buttons: ['Aceptar'],
        });
        await successAlert.present();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: async () => {
        const errorAlert = await this.alertCtrl.create({
          header: 'No se pudo eliminar la cuenta',
          message: 'Inténtalo de nuevo en unos segundos.',
          buttons: ['Entendido'],
        });
        await errorAlert.present();
      },
    });
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

  async onAddToCartClick(product: Product): Promise<void> {
    if (!this.userId) {
      const alert = await this.alertCtrl.create({
        header: 'Sesión requerida',
        message: 'Debes iniciar sesión para usar el carrito.',
        buttons: ['Entendido'],
      });
      await alert.present();
      return;
    }

    this.cartService.addProduct(product.id, this.userId).subscribe({
      next: () => {
        this.loadCart();
      },
      error: async () => {
        const alert = await this.alertCtrl.create({
          header: 'No se pudo añadir al carrito',
          message: 'Verifica que el schema del carrito esté creado en Supabase.',
          buttons: ['Entendido'],
        });
        await alert.present();
      },
    });
  }

  increaseItem(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe({
      next: () => this.loadCart(),
    });
  }

  decreaseItem(item: CartItem): void {
    if (item.quantity <= 1) {
      this.cartService.removeItem(item.id).subscribe({
        next: () => this.loadCart(),
      });
      return;
    }

    this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe({
      next: () => this.loadCart(),
    });
  }

  async finalizeCheckout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Finalizar compra',
      message: 'Esta acción estará disponible en la siguiente iteración.',
      buttons: ['Entendido'],
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
    this.closeProfile();
    this.closeCart();
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login'], { replaceUrl: true }),
    });
  }
}
