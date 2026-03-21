import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Animation, Platform, createAnimation } from '@ionic/angular';
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
  profileOpen = false;
  userEmail = '';

  readonly profileEnterAnimation = (baseEl: HTMLElement): Animation => {
    const root = baseEl.shadowRoot;
    const backdrop = root?.querySelector('ion-backdrop');
    const wrapper = root?.querySelector('.modal-wrapper');

    const backdropAnimation = createAnimation()
      .addElement(backdrop as HTMLElement)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(wrapper as HTMLElement)
      .keyframes([
        { offset: 0, opacity: '0.99', transform: 'translateX(100%)' },
        { offset: 1, opacity: '0.99', transform: 'translateX(0)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('cubic-bezier(0.32,0.72,0,1)')
      .duration(260)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  readonly profileLeaveAnimation = (baseEl: HTMLElement): Animation =>
    this.profileEnterAnimation(baseEl).direction('reverse');

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
    this.loadUserData();
    this.loadProducts();
  }

  private loadUserData(): void {
    this.auth.getSession().subscribe({
      next: (session) => {
        this.userEmail = session?.user?.email ?? 'Sin correo disponible';
      },
      error: () => {
        this.userEmail = 'Sin correo disponible';
      },
    });
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

  openProfile(): void {
    this.profileOpen = true;
  }

  closeProfile(): void {
    this.profileOpen = false;
  }

  async onDeleteAccountClick(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cuenta',
      message: 'Esta opción estará disponible en una siguiente iteración.',
      buttons: ['Entendido'],
    });
    await alert.present();
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
    this.closeProfile();
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login'], { replaceUrl: true }),
    });
  }
}
