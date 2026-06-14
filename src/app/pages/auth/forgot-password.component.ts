import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppDataService } from '../../core/app-data.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-card">
        <div class="brand" style="margin-bottom: 20px">
          <div class="logo-mark">ÉR</div>
          <div>
            <strong>Étude Réussie</strong>
            <span>Réinitialisation du mot de passe</span>
          </div>
        </div>

        <h1>Mot de passe oublié</h1>

        <p class="muted">
          Entrez votre adresse courriel. Si un compte existe avec ce courriel,
          un lien de réinitialisation vous sera envoyé.
        </p>

        <form (ngSubmit)="submit()" #form="ngForm">
          <label>
            Courriel
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              placeholder="exemple@email.com"
            />
          </label>

          <button class="btn primary" type="submit" [disabled]="loading || !form.valid">
            {{ loading ? 'Envoi en cours...' : 'Envoyer le lien' }}
          </button>
        </form>

        <div class="empty-state" *ngIf="message" style="margin-top: 16px">
          {{ message }}
        </div>

        <p style="margin-top: 18px">
          <a routerLink="/login">Retour à la connexion</a>
        </p>
      </section>
    </main>
  `
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  message = '';

  constructor(private readonly data: AppDataService) {}

  async submit(): Promise<void> {
    this.loading = true;
    this.message = '';

    await this.data.forgotPassword(this.email);

    this.message =
      'Si un compte existe avec ce courriel, un lien de réinitialisation a été envoyé.';

    this.loading = false;
  }
}