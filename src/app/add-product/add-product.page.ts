import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController, ToastController } from '@ionic/angular';
import { switchMap } from 'rxjs/operators';

import { ProductService } from '../core/services/product.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
  standalone: false,
})
export class AddProductPage {
  form: FormGroup;
  previewUrl: string | null = null;
  productTypes: string[] = [];
  private imageBlob: Blob | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
    });

    this.productService.getProductTypes().subscribe({
      next: (types) => (this.productTypes = types),
    });
  }

  /** Abre la cámara, genera preview y almacena el Blob para el upload */
  async takePhoto(): Promise<void> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 80,
      });

      if (!photo.webPath) return;

      const response = await fetch(photo.webPath);
      this.imageBlob = await response.blob();
      this.previewUrl = photo.webPath;
    } catch {
      // El usuario canceló o denegó permisos — sin acción
    }
  }

  /** Sube la imagen y guarda el producto en Supabase */
  async save(): Promise<void> {
    if (!this.canSave) return;

    const loader = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loader.present();

    this.authService.getSession().pipe(
      switchMap((session) => {
        const fileName = `${session!.user.id}/${Date.now()}.jpg`;
        return this.productService.uploadImage(this.imageBlob!, fileName).pipe(
          switchMap((imageUrl) =>
            this.productService.createProduct({
              name: this.form.value.name,
              type: this.form.value.type,
              price: this.form.value.price,
              image_url: imageUrl,
              created_by: session!.user.id,
            })
          )
        );
      })
    ).subscribe({
      next: async () => {
        await loader.dismiss();
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: async () => {
        await loader.dismiss();
        const toast = await this.toastCtrl.create({
          message: 'No se pudo guardar el producto. Intenta de nuevo.',
          duration: 3000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  get canSave(): boolean {
    return this.form.valid && this.imageBlob !== null;
  }
}
