import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.buildForm();
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
    this.errorMessage = null;

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

  private onError(): void {
    this.loading      = false;
    // Mensaje genérico — no revela si el email existe o la contraseña es incorrecta
    this.errorMessage = 'Email o contraseña incorrectos.';
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
