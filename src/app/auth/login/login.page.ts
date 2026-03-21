import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
  ) {
    this.form = this.buildForm();
  }

  ionViewWillEnter(): void {
    this.auth.getSession().subscribe((session) => {
      if (session) {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    });
  }

  /** Construye el formulario con sus validaciones */
  private buildForm(): FormGroup {
    return this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  /** Envía el formulario */
  onLogin(): void {
    if (this.form.invalid || this.loading) return;

    this.loading      = true;

    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next:  (result) => result.error ? this.onError() : this.onSuccess(),
      error: ()       => this.onError(),
    });
  }

  private onSuccess(): void {
    this.loading = false;
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  private async onError(): Promise<void> {
    this.loading = false;
    const alert = await this.alertCtrl.create({
      header: 'Acceso denegado',
      message: 'Email o contraseña incorrectos.',
      buttons: ['Entendido'],
    });
    await alert.present();
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
