import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
  standalone: false,
})
export class VerifyPage implements OnInit {
  form: FormGroup;
  loading  = false;
  email    = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
  ) {
    this.form = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]]
    });
  }

  ngOnInit(): void {
    // El email llega como query param desde la página de registro
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';

    if (!this.email) {
      this.router.navigate(['/register']);
    }
  }

  onVerify(): void {
    if (this.form.invalid || this.loading) return;

    this.loading      = true;

    const { token } = this.form.value;

    this.auth.verifyOtp(this.email, token).subscribe({
      next:  (result) => result.error ? this.onError(result.error) : this.onSuccess(),
      error: ()       => this.onError(null),
    });
  }

  private onSuccess(): void {
    this.loading = false;
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  private async onError(detail: string | null): Promise<void> {
    this.loading = false;
    const message = detail === 'Token has expired or is invalid'
      ? 'El código es incorrecto o ha expirado.'
      : 'No se pudo verificar el código. Inténtalo de nuevo.';
    const alert = await this.alertCtrl.create({
      header: 'Verificación fallida',
      message,
      buttons: ['Entendido'],
    });
    await alert.present();
  }
}
