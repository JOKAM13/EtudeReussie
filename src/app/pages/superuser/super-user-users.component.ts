import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { User } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-super-user-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div><h2>Super user · Utilisateurs gestionnaires</h2><p>Ce rôle sert uniquement à créer et gérer les comptes qui administrent la plateforme. Il n’a pas accès au suivi pédagogique détaillé.</p></div>
    </div>

    <div class="grid grid-2">
      <section class="card">
        <h3>Ajouter un administrateur</h3>
        <form [formGroup]="form" (ngSubmit)="createAdmin()" class="form-grid">
          <label>Prénom<input formControlName="firstName" /></label>
          <label>Nom<input formControlName="lastName" /></label>
          <label class="full">Email<input type="email" formControlName="email" /></label>
          <label>Téléphone<input formControlName="phone" /></label>
          <label>Ville<input formControlName="city" /></label>
          <label class="full">Mot de passe temporaire<input formControlName="temporaryPassword" /></label>
          <p class="error full" *ngIf="errorMessage">{{ errorMessage }}</p>
          <p class="success-message full" *ngIf="message">{{ message }}</p>
          <div class="actions full"><button class="btn primary" type="submit">Créer l’administrateur</button></div>
        </form>
      </section>

      <section class="card">
        <h3>Règles du super user</h3>
        <div class="detail-panel"><strong>Responsabilité</strong><br>Créer les comptes administrateurs ou gestionnaires qui vont gérer Étude Réussie.</div>
        <div class="detail-panel" style="margin-top:12px"><strong>Accès limité</strong><br>Pas de gestion des élèves, séances, factures ou documents pédagogiques.</div>
      </section>
    </div>

    <section class="card" style="margin-top:18px">
      <h3>Administrateurs existants</h3>
      <div class="table-wrap"><table><thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Ville</th><th>Statut</th><th>Action</th></tr></thead><tbody><tr *ngFor="let admin of admins"><td>{{ admin.firstName }} {{ admin.lastName }}</td><td>{{ admin.email }}</td><td>{{ admin.phone || '-' }}</td><td>{{ admin.city || '-' }}</td><td><app-status-badge [value]="admin.status" /></td><td class="actions"><button class="btn warning" (click)="setStatus(admin, 'Suspendu')">Suspendre</button><button class="btn success" (click)="setStatus(admin, 'Actif')">Activer</button></td></tr></tbody></table></div>
    </section>
  `
})
export class SuperUserUsersComponent {
  message = '';
  errorMessage = '';
  form = this.fb.nonNullable.group({ firstName: ['', Validators.required], lastName: ['', Validators.required], email: ['', [Validators.required, Validators.email]], phone: [''], city: [''], temporaryPassword: ['Admin123!', Validators.required] });
  constructor(private readonly fb: FormBuilder, public readonly data: AppDataService) {}
  get admins(): User[] { return this.data.getUsersByRole('admin'); }
  createAdmin(): void {
    this.message = ''; this.errorMessage = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); this.errorMessage = 'Veuillez remplir les champs obligatoires.'; return; }
    const raw = this.form.getRawValue();
    if (this.data.users.some((user) => user.email.toLowerCase() === raw.email.toLowerCase())) { this.errorMessage = 'Ce courriel est déjà utilisé.'; return; }
    this.data.addUser({ ...raw, role: 'admin', status: 'Actif', avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${raw.firstName} ${raw.lastName}`)}&background=2563eb&color=fff&bold=true&size=128` });
    this.form.reset({ firstName: '', lastName: '', email: '', phone: '', city: '', temporaryPassword: 'Admin123!' });
    this.message = 'Le compte administrateur a été créé. Une invitation sera envoyée par le backend.';
  }
  setStatus(user: User, status: User['status']): void { this.data.setUserStatus(user.id, status); }
}
