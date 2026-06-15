import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppDataService } from '../../core/app-data.service';
import { User, UserRole } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="login-page">
      <div class="login-wrapper">
        <aside class="brand-panel">
          <div class="brand-header">
            <div class="brand-logo">ÉR</div>
            <div>
              <strong>Étude Réussie</strong>
              <span>Plateforme sécurisée</span>
            </div>
          </div>

          <div class="brand-content">
            <p class="eyebrow">Espace privé</p>
            <h1>Bienvenue</h1>
            <p>
              Connectez-vous pour accéder à votre espace Étude Réussie :
              séances, factures, suivis, devoirs et documents.
            </p>
          </div>

          <div class="brand-footer">
            <span>🔒 Connexion sécurisée</span>
            <span>📚 Suivi personnalisé</span>
          </div>
        </aside>

        <main class="login-card">
          <div class="mobile-logo">
            <div class="brand-logo">ÉR</div>
            <div>
              <strong>Étude Réussie</strong>
              <span>Connexion sécurisée</span>
            </div>
          </div>

          <div class="login-title">
            <h2>Connexion</h2>
            <p>Entrez votre courriel et votre mot de passe.</p>
          </div>

          <form (ngSubmit)="login()" #loginForm="ngForm" class="login-form">
            <label>
              Adresse courriel
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                placeholder="exemple@email.com"
                autocomplete="email"
                required
              />
            </label>

            <label>
              Mot de passe
              <input
                type="password"
                name="password"
                [(ngModel)]="password"
                placeholder="Votre mot de passe"
                autocomplete="current-password"
                required
              />
            </label>

            <div class="form-options">
              <a routerLink="/mot-de-passe-oublie">Mot de passe oublié ?</a>
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <button class="login-button" type="submit" [disabled]="isSubmitting || loginForm.invalid">
              <span *ngIf="!isSubmitting">Se connecter</span>
              <span *ngIf="isSubmitting">Connexion...</span>
            </button>
          </form>
        </main>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 34%),
        linear-gradient(135deg, #f8fbff 0%, #eef4ff 42%, #ffffff 100%);
    }

    .login-wrapper {
      width: min(980px, 100%);
      display: grid;
      grid-template-columns: 0.95fr 1.05fr;
      gap: 28px;
      align-items: stretch;
    }

    .brand-panel {
      min-height: 480px;
      border-radius: 30px;
      padding: 34px;
      background:
        linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(29, 78, 216, 0.96)),
        linear-gradient(135deg, #0f172a, #1d4ed8);
      color: #ffffff;
      box-shadow: 0 28px 70px rgba(15, 23, 42, 0.22);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
    }

    .brand-panel::after {
      content: '';
      position: absolute;
      width: 220px;
      height: 220px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      right: -80px;
      bottom: -80px;
    }

    .brand-header,
    .mobile-logo {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-logo {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #22c55e, #06b6d4);
      color: #ffffff;
      font-weight: 900;
      letter-spacing: -0.04em;
      box-shadow: 0 12px 24px rgba(8, 145, 178, 0.25);
    }

    .brand-header strong,
    .mobile-logo strong {
      display: block;
      font-size: 1rem;
      font-weight: 800;
    }

    .brand-header span,
    .mobile-logo span {
      display: block;
      margin-top: 3px;
      font-size: 0.84rem;
      opacity: 0.82;
    }

    .brand-content {
      position: relative;
      z-index: 1;
      max-width: 360px;
    }

    .eyebrow {
      margin: 0 0 12px;
      color: #bfdbfe;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-weight: 800;
    }

    .brand-content h1 {
      margin: 0 0 16px;
      font-size: clamp(2.2rem, 5vw, 3.7rem);
      line-height: 0.95;
      letter-spacing: -0.06em;
    }

    .brand-content p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.75;
      color: rgba(255, 255, 255, 0.88);
    }

    .brand-footer {
      position: relative;
      z-index: 1;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .brand-footer span {
      padding: 10px 13px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.16);
      font-size: 0.82rem;
      font-weight: 700;
    }

    .login-card {
      min-height: 480px;
      border-radius: 30px;
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.22);
      box-shadow: 0 28px 70px rgba(15, 23, 42, 0.14);
      backdrop-filter: blur(18px);
      padding: 42px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .mobile-logo {
      display: none;
      margin-bottom: 30px;
    }

    .login-title {
      margin-bottom: 28px;
    }

    .login-title h2 {
      margin: 0 0 8px;
      color: #0f172a;
      font-size: 2rem;
      letter-spacing: -0.04em;
    }

    .login-title p {
      margin: 0;
      color: #64748b;
      line-height: 1.5;
    }

    .login-form {
      display: grid;
      gap: 16px;
    }

    label {
      display: grid;
      gap: 8px;
      color: #0f172a;
      font-size: 0.9rem;
      font-weight: 800;
    }

    input {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      padding: 15px 16px;
      color: #0f172a;
      background: #ffffff;
      font: inherit;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      box-sizing: border-box;
    }

    input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
    }

    .form-options {
      display: flex;
      justify-content: flex-end;
      margin-top: -2px;
    }

    .form-options a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 800;
      font-size: 0.9rem;
    }

    .form-options a:hover {
      text-decoration: underline;
    }

    .error-message {
      padding: 13px 14px;
      border-radius: 14px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .login-button {
      margin-top: 8px;
      width: 100%;
      border: 0;
      border-radius: 14px;
      padding: 16px 18px;
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      color: #ffffff;
      font-weight: 900;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 16px 30px rgba(37, 99, 235, 0.24);
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .login-button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
      box-shadow: none;
    }

    @media (max-width: 850px) {
      .login-page {
        padding: 18px;
      }

      .login-wrapper {
        grid-template-columns: 1fr;
      }

      .brand-panel {
        display: none;
      }

      .login-card {
        min-height: auto;
        padding: 28px;
      }

      .mobile-logo {
        display: flex;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private readonly data: AppDataService,
    private readonly router: Router
  ) {}

  async login(): Promise<void> {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Veuillez entrer votre courriel et votre mot de passe.';
      return;
    }

    this.isSubmitting = true;

    try {
      const user = await this.data.login(this.email.trim(), this.password);

      if (!user) {
        this.errorMessage = 'Courriel ou mot de passe invalide.';
        return;
      }

      await this.router.navigateByUrl(this.getPortalUrlForUser(user));
    } finally {
      this.isSubmitting = false;
    }
  }

  private getPortalUrlForUser(user: User): string {
    const routes: Record<UserRole, string> = {
      superuser: '/super-user/utilisateurs',
      admin: '/admin/tableau-de-bord',
      tuteur: '/tuteur/tableau-de-bord',
      eleve: '/eleve/tableau-de-bord',
      parent: '/parent/tableau-de-bord'
    };

    return routes[user.role] ?? '/';
  }
}