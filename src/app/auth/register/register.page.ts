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

  // Mensaje genérico — nunca revela si el email ya existe
  readonly SUCCESS_MSG = 'Si el email es válido, recibirás un correo de confirmación.';
  feedback: { message: string; isError: boolean } | null = null;

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
    this.feedback = null;

    const { email, password } = this.form.value;

    this.auth.register(email, password).subscribe({
      next:  () => this.onSuccess(),
      error: () => this.onError(),
    });
  }

  private onSuccess(): void {
    this.loading  = false;
    this.feedback = { message: this.SUCCESS_MSG, isError: false };
    this.form.reset();
  }

  private onError(): void {
    this.loading  = false;
    // Error genérico — no se expone el detalle técnico al usuario
    this.feedback = { message: 'No se pudo completar el registro. Inténtalo de nuevo.', isError: true };
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
