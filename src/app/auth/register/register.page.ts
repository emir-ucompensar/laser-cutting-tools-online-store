import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.buildForm();
  }

  /** Construye el formulario con sus validaciones */
  private buildForm(): FormGroup {
    return this.fb.group(
      {
        email:           ['', [Validators.required, Validators.email]],
        password:        ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch }
    );
  }

  /** Validador de grupo: confirma que ambas contraseñas son iguales */
  private passwordsMatch(group: AbstractControl) {
    const pass    = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordsMismatch: true };
  }

  /** Envía el formulario. Una sola responsabilidad: orquestar el flujo */
  onRegister(): void {
    if (this.form.invalid || this.loading) return;

    this.loading  = true;

    const { email, password } = this.form.value;

    this.auth.register(email, password).subscribe({
      next:  () => this.onSuccess(),
      error: () => this.onError(),
    });
  }

  private onSuccess(): void {
    this.loading = false;
    const email  = this.form.get('email')?.value;
    this.form.reset();
    // Navega a /verify pasando el email para que pueda verificar el OTP
    this.router.navigate(['/verify'], { queryParams: { email } });
  }

  private onError(): void {
    this.loading = false;
    // Error genérico — no se expone el detalle técnico al usuario
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
