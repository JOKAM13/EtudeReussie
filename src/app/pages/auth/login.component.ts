import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppDataService } from '../../core/app-data.service';
import { UserRole } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="login-page auth-layout">
      <section class="auth-panel">
        <div class="auth-brand">
          <div class="logo-mark">ÉR</div>
          <div>
            <strong>Étude Réussie</strong>
            <span>Connexion sécurisée</span>
          </div>
        </div>
        <h1>Bienvenue</h1>
        <p>Connectez-vous avec votre adresse courriel et votre mot de passe.</p>
        <div class="demo-accounts">
          <button type="button" (click)="fill('parent.nadia@email.com')">Parent</button>
          <button type="button" (click)="fill('admin@etudereussie.ca')">Admin</button>
          <button type="button" (click)="fill('super@etudereussie.ca')">Super user</button>
        </div>
      </section>

      <section class="login-form-card">
        <form [formGroup]="form" (ngSubmit)="signIn()">
          <div class="stacked-fields">
            <input type="email" placeholder="Email Address" formControlName="email" />
            <input type="password" placeholder="Password" formControlName="password" />
          </div>
          <div class="login-help">
            <a routerLink="/login">Reset Password</a>
            <a routerLink="/login">Login Help</a>
          </div>
          <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
          <button class="btn primary auth-submit" type="submit">Sign in with Email</button>
        </form>

        <div class="login-roles compact">
          <button type="button" class="login-role" (click)="quickOpen('eleve')"><strong>Élève</strong><span>ouvrir</span></button>
          <button type="button" class="login-role" (click)="quickOpen('tuteur')"><strong>Tuteur</strong><span>ouvrir</span></button>
          <button type="button" class="login-role" (click)="quickOpen('parent')"><strong>Parent</strong><span>ouvrir</span></button>
          <button type="button" class="login-role" (click)="quickOpen('admin')"><strong>Admin</strong><span>ouvrir</span></button>
        </div>
      </section>
    </main>
  `
})
export class LoginComponent {
  errorMessage = '';
  form = this.fb.nonNullable.group({
    email: ['parent.nadia@email.com', [Validators.required, Validators.email]],
    password: ['Parent123!', Validators.required]
  });

  constructor(private readonly fb: FormBuilder, private readonly router: Router, private readonly data: AppDataService) {}

  async signIn(): Promise<void> {
    this.errorMessage = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); this.errorMessage = 'Veuillez entrer un courriel et un mot de passe.'; return; }
    const { email, password } = this.form.getRawValue();
    const user = await this.data.login(email.toLowerCase().trim(), password);
    if (!user) { this.errorMessage = 'Courriel ou mot de passe invalide.'; return; }
    this.router.navigateByUrl(this.homeForRole(user.role));
  }

  fill(email: string): void {
    const password = email.startsWith('super') ? 'Super123!' : email.startsWith('admin') ? 'Admin123!' : 'Parent123!';
    this.form.patchValue({ email, password });
  }

  quickOpen(role: UserRole): void { this.router.navigateByUrl(this.homeForRole(role)); }

  private homeForRole(role: UserRole): string {
    if (role === 'superuser') return '/super-user/utilisateurs';
    if (role === 'admin') return '/admin/tableau-de-bord';
    if (role === 'tuteur') return '/tuteur/tableau-de-bord';
    if (role === 'parent') return '/parent/tableau-de-bord';
    return '/eleve/tableau-de-bord';
  }

  private aliasForRole(role: UserRole): string {
    return role === 'eleve' ? 'eleve@etudereussie.ca' : role === 'tuteur' ? 'tuteur@etudereussie.ca' : `${role}@etudereussie.ca`;
  }
}
