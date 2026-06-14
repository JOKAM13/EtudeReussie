import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppDataService } from '../../core/app-data.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-card">
        <div class="brand" style="margin-bottom: 20px">
          <div class="logo-mark">ÉR</div>
          <div>
            <strong>Étude Réussie</strong>
            <span>Nouveau mot de passe</span>
          </div>
        </div>

        <h1>Réinitialiser le mot de passe</h1>

        <p class="muted">
          Choisissez un nouveau mot de passe pour votre compte Étude Réussie.
        </p>

        <div class="empty-state" *ngIf="!token">
          Le lien de réinitialisation est invalide.
        </div>

        <form *ngIf="token" (ngSubmit)="submit()" #form="ngForm">
          <label>
            Nouveau mot de passe
            <input
              type="password"
              name="newPassword"
              [(ngModel)]="newPassword"
              required
              minlength="8"
              placeholder="Minimum 8 caractères"
            />
          </label>

          <label>
            Confirmer le mot de passe
            <input
              type="password"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              required
              minlength="8"
              placeholder="Confirmez le mot de passe"
            />
          </label>

          <div class="empty-state" *ngIf="error" style="margin-bottom: 14px">
            {{ error }}
          </div>

          <button class="btn primary" type="submit" [disabled]="loading || !form.valid">
            {{ loading ? 'Réinitialisation...' : 'Changer le mot de passe' }}
          </button>
        </form>

        <p style="margin-top: 18px">
          <a routerLink="/login">Retour à la connexion</a>
        </p>
      </section>
    </main>
  `
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly data: AppDataService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  async submit(): Promise<void> {
    this.error = '';

    if (this.newPassword.length < 8) {
      this.error = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    const success = await this.data.resetPassword(
      this.token,
      this.newPassword,
      this.confirmPassword
    );

    this.loading = false;

    if (success) {
      alert('Votre mot de passe a été réinitialisé avec succès.');
      void this.router.navigateByUrl('/login');
    }
  }
}