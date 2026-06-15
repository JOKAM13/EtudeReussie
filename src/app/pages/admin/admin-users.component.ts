import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { AccountStatus, User, UserRole } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Gestion des utilisateurs</h2>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 18px">
          <button class="btn secondary" type="button" (click)="exportUsersByRole('eleve')">
            Exporter les élèves
          </button>

          <button class="btn secondary" type="button" (click)="exportUsersByRole('tuteur')">
            Exporter les tuteurs
          </button>

          <button class="btn secondary" type="button" (click)="exportUsersByRole('parent')">
            Exporter les parents
          </button>
        </div>
        <p>Recherchez, filtrez, créez, consultez et supprimez les comptes admin, tuteurs, élèves et parents.</p>
      </div>

      <button class="btn primary" type="button" (click)="showCreate = true">
        Créer un utilisateur
      </button>
    </div>

    <section class="card">
      <div class="actions" style="margin-bottom:16px">
        <input
          [(ngModel)]="search"
          placeholder="Rechercher par nom, courriel, ville ou téléphone"
          style="max-width:420px"
        />

        <select [(ngModel)]="roleFilter" style="max-width:220px">
          <option value="all">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="tuteur">Tuteur</option>
          <option value="eleve">Élève</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Ville</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let user of filteredUsers">
              <td>
                <strong>{{ user.firstName }} {{ user.lastName }}</strong>
              </td>

              <td>{{ user.email }}</td>
              <td>{{ roleLabel(user.role) }}</td>
              <td>{{ user.city || '-' }}</td>
              <td>{{ user.phone || '-' }}</td>

              <td>
                <app-status-badge [value]="user.status" />
              </td>

              <td class="actions">
                <button class="btn soft" type="button" (click)="openUserDetails(user)">Voir</button>
                <button
                  class="btn warning"
                  type="button"
                  *ngIf="user.role === 'eleve' || user.role === 'parent' || user.role === 'tuteur'"
                  (click)="viewAsUser(user)"
                >
                  Voir comme
                </button>
                <button class="btn warning" type="button" (click)="setStatus(user.id, 'Suspendu')">
                  Suspendre
                </button>

                <button class="btn success" type="button" (click)="setStatus(user.id, 'Actif')">
                  Activer
                </button>

                <button
                  class="btn danger"
                  type="button"
                  *ngIf="user.role !== 'superuser'"
                  (click)="deleteUser(user)"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="modal-backdrop" *ngIf="showCreate" (click)="showCreate = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div>
            <h2>Créer un utilisateur</h2>
            <p>Le rôle choisi détermine l’espace auquel l’utilisateur aura accès.</p>
          </div>

          <button class="btn ghost" type="button" (click)="showCreate=false">
            Annuler
          </button>
        </div>

        <form [formGroup]="createForm" (ngSubmit)="createUser()" class="form-grid">
          <label>
            Prénom
            <input formControlName="firstName" />
          </label>

          <label>
            Nom
            <input formControlName="lastName" />
          </label>

          <label>
            Email
            <input type="email" formControlName="email" />
          </label>

          <label>
            Téléphone
            <input formControlName="phone" />
          </label>

          <label>
            Ville
            <input formControlName="city" />
          </label>

          <label>
            Rôle
            <select formControlName="role">
              <option value="admin">Admin</option>
              <option value="tuteur">Tuteur</option>
              <option value="eleve">Élève</option>
              <option value="parent">Parent</option>
            </select>
          </label>

          <label>
            Mot de passe temporaire
            <input formControlName="temporaryPassword" />
          </label>

          <label>
            Statut
            <select formControlName="status">
              <option>Actif</option>
              <option>En attente</option>
              <option>Suspendu</option>
            </select>
          </label>

          <p class="error full" *ngIf="errorMessage">
            {{ errorMessage }}
          </p>

          <p class="success-message full" *ngIf="message">
            {{ message }}
          </p>

          <div class="actions full">
            <button class="btn primary" type="submit">
              Inviter
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="selectedUser as user" (click)="selectedUser = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div style="display:flex; gap:14px; align-items:center">
            <img
              *ngIf="user.avatarUrl"
              [src]="user.avatarUrl"
              alt="Photo de profil"
              style="width:58px;height:58px;border-radius:999px;object-fit:cover"
            />

            <div class="avatar-fallback" *ngIf="!user.avatarUrl" style="width:58px;height:58px">
              {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
            </div>

            <div>
              <h2>{{ user.firstName }} {{ user.lastName }}</h2>
              <p>{{ roleLabel(user.role) }} · {{ user.email }}</p>
            </div>
          </div>

          <button class="btn ghost" type="button" (click)="selectedUser=undefined">
            Fermer
          </button>
        </div>

        <section class="card" style="margin-bottom:16px">
          <h3>Informations personnelles</h3>

          <div class="grid grid-2">
            <div class="detail-panel">
              <strong>Prénom</strong><br>
              {{ user.firstName || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Nom</strong><br>
              {{ user.lastName || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Email</strong><br>
              {{ user.email || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Téléphone</strong><br>
              {{ user.phone || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Ville</strong><br>
              {{ user.city || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Adresse</strong><br>
              {{ user.address || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Rôle</strong><br>
              {{ roleLabel(user.role) }}
            </div>

            <div class="detail-panel">
              <strong>Statut du compte</strong><br>
              <app-status-badge [value]="user.status" />
            </div>

            <div class="detail-panel">
              <strong>Mode de communication préféré</strong><br>
              {{ user.communicationPreference || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Photo de profil</strong><br>
              {{ user.avatarUrl || '-' }}
            </div>
          </div>
        </section>

        <section class="card" style="margin-bottom:16px" *ngIf="user.role === 'eleve'">
          <h3>Informations élève</h3>

          <div class="grid grid-2">
            <div class="detail-panel">
              <strong>Niveau scolaire</strong><br>
              {{ user.level || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Année / Classe</strong><br>
              {{ user.grade || '-' }}
            </div>

            <div class="detail-panel">
              <strong>École / Établissement</strong><br>
              {{ user.school || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Mode préféré</strong><br>
              {{ user.preferredMode || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Matières suivies</strong><br>
              {{ user.subjects?.join(', ') || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Matières où l'élève a besoin d'aide</strong><br>
              {{ user.needs?.join(', ') || '-' }}
            </div>

            <div class="detail-panel full">
              <strong>Objectif de l'accompagnement</strong><br>
              {{ user.objective || '-' }}
            </div>

            <div class="detail-panel full">
              <strong>Difficultés principales</strong><br>
              {{ user.difficulties || '-' }}
            </div>

            <div class="detail-panel full">
              <strong>Disponibilités générales</strong><br>
              {{ user.availability || '-' }}
            </div>
          </div>
        </section>

        <section class="card" style="margin-bottom:16px" *ngIf="user.role === 'tuteur'">
          <h3>Informations tuteur</h3>

          <div class="grid grid-2">
            <div class="detail-panel">
              <strong>Matières enseignées</strong><br>
              {{ user.subjects?.join(', ') || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Niveaux enseignés</strong><br>
              {{ user.teachingLevels?.join(', ') || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Langues parlées</strong><br>
              {{ user.languages?.join(', ') || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Tarif horaire</strong><br>
              {{ user.hourlyRate ? (user.hourlyRate + ' $/h') : '-' }}
            </div>

            <div class="detail-panel">
              <strong>Mode de cours</strong><br>
              {{ user.preferredMode || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Statut du profil</strong><br>
              {{ user.profileStatus || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Programme / Diplôme</strong><br>
              {{ user.diploma || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Expérience</strong><br>
              {{ user.experience || '-' }}
            </div>

            <div class="detail-panel full">
              <strong>Biographie</strong><br>
              {{ user.biography || '-' }}
            </div>

            <div class="detail-panel full">
              <strong>Disponibilités générales</strong><br>
              {{ user.availability || '-' }}
            </div>
          </div>
        </section>

        <section class="card" style="margin-top:16px" *ngIf="selectedUser.role === 'eleve'">
          <h3>Parent associé</h3>

          <div class="detail-panel" style="margin-bottom:14px">
            <strong>Parent actuel</strong><br>
            {{ parentNameOfStudent(selectedUser) }}
          </div>

          <div class="form-grid">
            <label>
              Courriel du parent
              <input
                type="email"
                [(ngModel)]="parentEmail"
                placeholder="exemple.parent@email.com"
              />
            </label>

            <div class="actions" style="align-items:flex-end">
              <button
                class="btn primary"
                type="button"
                (click)="linkParentToStudent(selectedUser)"
              >
                Associer le parent
              </button>

              <button
                class="btn danger"
                type="button"
                *ngIf="selectedUser.parentId"
                (click)="removeParentFromStudent(selectedUser)"
              >
                Retirer le parent
              </button>
            </div>

            <p class="success-message full" *ngIf="parentLinkMessage">
              {{ parentLinkMessage }}
            </p>

            <p class="error full" *ngIf="parentLinkError">
              {{ parentLinkError }}
            </p>
          </div>
        </section>

        <section class="card" style="margin-bottom:16px" *ngIf="user.role === 'parent'">
          <h3>Informations parent</h3>

          <div class="grid grid-2">
            <div class="detail-panel">
              <strong>Mode de communication préféré</strong><br>
              {{ user.communicationPreference || '-' }}
            </div>

            <div class="detail-panel">
              <strong>Enfants associés</strong><br>
              {{ childrenOfParent(user.id).length || 0 }}
            </div>

            <div class="detail-panel full">
              <strong>Liste des enfants</strong><br>
              <span *ngIf="childrenOfParent(user.id).length === 0">Aucun enfant associé.</span>
              <span *ngFor="let child of childrenOfParent(user.id); let last = last">
                {{ child.firstName }} {{ child.lastName }}<span *ngIf="!last">, </span>
              </span>
            </div>
          </div>
        </section>

        <section class="card" style="margin-bottom:16px">
          <h3>Relations</h3>

          <div class="grid grid-2">
            <div class="detail-panel">
              <strong>Parent associé</strong><br>
              {{ displayName(user.parentId) }}
            </div>

            <div class="detail-panel">
              <strong>Tuteur assigné</strong><br>
              {{ displayName(user.tutorId) }}
            </div>

            <div class="detail-panel">
              <strong>Tarif facturé au parent</strong><br>
              {{ user.parentHourlyRate ? (user.parentHourlyRate + ' $/h') : '-' }}
            </div>

            <div class="detail-panel">
              <strong>Tarif payé au tuteur</strong><br>
              {{ user.tutorHourlyRate ? (user.tutorHourlyRate + ' $/h') : '-' }}
            </div>
          </div>
        </section>

        <section class="card">
          <h3>Actions administrateur</h3>

          <div class="actions">
            <button class="btn warning" type="button" (click)="setStatus(user.id, 'Suspendu')">
              Suspendre
            </button>

            <button
            class="btn warning"
            type="button"
            *ngIf="user.role === 'eleve' || user.role === 'parent' || user.role === 'tuteur'"
            (click)="viewAsUser(user)"
          >
            Voir comme cet utilisateur
          </button>

            <button class="btn success" type="button" (click)="setStatus(user.id, 'Actif')">
              Activer
            </button>

            <button
              class="btn danger"
              type="button"
              *ngIf="user.role !== 'superuser'"
              (click)="deleteUser(user)"
            >
              Supprimer cet utilisateur
            </button>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AdminUsersComponent {
  search = '';
  roleFilter: UserRole | 'all' = 'all';
  showCreate = false;
  selectedUser?: User;
  errorMessage = '';
  message = '';
  parentEmail = '';
  parentLinkMessage = '';
  parentLinkError = '';

  createForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    city: [''],
    role: ['eleve' as UserRole, Validators.required],
    temporaryPassword: ['Temporaire123'],
    status: ['Actif' as AccountStatus, Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly data: AppDataService,
    private readonly router: Router
  ) {}

  get users(): User[] {
    return this.data.users;
  }

  viewAsUser(user: User): void {
  const success = this.data.startImpersonation(user.id, '/admin/utilisateurs');

  if (!success) {
    return;
  }

  void this.router.navigateByUrl(this.data.getPortalUrlForUser(user));
}

  get filteredUsers(): User[] {
    const term = this.search.toLowerCase().trim();

    return this.users.filter((user) => {
      const roleOk = this.roleFilter === 'all' || user.role === this.roleFilter;

      const haystack = `
        ${user.firstName}
        ${user.lastName}
        ${user.email}
        ${user.city ?? ''}
        ${user.phone ?? ''}
      `.toLowerCase();

      return roleOk && (!term || haystack.includes(term));
    });
  }

  createUser(): void {
    this.errorMessage = '';
    this.message = '';

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir les champs obligatoires.';
      return;
    }

    const raw = this.createForm.getRawValue();

    if (this.users.some((user) => user.email.toLowerCase() === raw.email.toLowerCase())) {
      this.errorMessage = 'Ce courriel est déjà utilisé par un autre compte.';
      return;
    }

    this.data.addUser({
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      city: raw.city,
      role: raw.role,
      status: raw.status,
      temporaryPassword: raw.temporaryPassword
    });

    this.message = 'L’utilisateur a été créé avec succès. Une invitation lui sera envoyée par courriel.';

    this.createForm.reset({
      role: 'eleve',
      status: 'Actif',
      temporaryPassword: 'Temporaire123',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: ''
    });
  }

  setStatus(userId: string, status: AccountStatus): void {
    this.data.setUserStatus(userId, status);
  }

  deleteUser(user: User): void {
    const confirmed = confirm(
      `Voulez-vous vraiment supprimer ${user.firstName} ${user.lastName} ? Cette action va aussi retirer ses données liées.`
    );

    if (!confirmed) {
      return;
    }

    this.data.deleteUser(user.id);
    this.selectedUser = undefined;
  }

  openUserDetails(user: User): void {
  this.selectedUser = user;
  this.parentEmail = this.parentEmailOfStudent(user);
  this.parentLinkMessage = '';
  this.parentLinkError = '';
}

parentEmailOfStudent(student: User): string {
  if (!student.parentId) {
    return '';
  }

  const parent = this.data.getUser(student.parentId);
  return parent?.email ?? '';
}

parentNameOfStudent(student: User): string {
  if (!student.parentId) {
    return 'Aucun parent associé';
  }

  const parent = this.data.getUser(student.parentId);

  if (!parent) {
    return 'Parent introuvable';
  }

  return `${parent.firstName} ${parent.lastName} · ${parent.email}`;
}

linkParentToStudent(student: User): void {
  this.parentLinkMessage = '';
  this.parentLinkError = '';

  const success = this.data.linkParentToStudent(student.id, this.parentEmail);

  if (!success) {
    this.parentLinkError = "Impossible d'associer ce parent.";
    return;
  }

  const refreshedStudent = this.data.getUser(student.id);

  if (refreshedStudent) {
    this.selectedUser = refreshedStudent;
    this.parentEmail = this.parentEmailOfStudent(refreshedStudent);
  }

  this.parentLinkMessage = 'Le parent a été associé à cet élève avec succès.';
}

removeParentFromStudent(student: User): void {
  const confirmed = confirm("Voulez-vous vraiment retirer le parent associé à cet élève ?");

  if (!confirmed) {
    return;
  }

  this.parentEmail = '';
  this.linkParentToStudent(student);
}

  roleLabel(role: UserRole): string {
    if (role === 'superuser') {
      return 'Super user';
    }

    if (role === 'eleve') {
      return 'Élève';
    }

    if (role === 'tuteur') {
      return 'Tuteur';
    }

    if (role === 'parent') {
      return 'Parent';
    }

    return 'Admin';
  }

  displayName(id?: string): string {
    if (!id) {
      return 'Non associé';
    }

    return this.data.getDisplayName(id);
  }

  childrenOfParent(parentId: string): User[] {
    return this.data.getChildrenForParent(parentId);
  }

  exportUsersByRole(role: UserRole): void {
  const users = this.data.getUsersByRole(role);

  if (!users.length) {
    alert('Aucun utilisateur à exporter.');
    return;
  }

  const columns = this.getExportColumns(role);

  const header = columns.map((column) => this.escapeCsvValue(column.header)).join(';');

  const rows = users.map((user) => {
    return columns
      .map((column) => this.escapeCsvValue(column.value(user)))
      .join(';');
  });

  const csvContent = '\ufeff' + [header, ...rows].join('\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = this.getExportFileName(role);
  link.click();

  window.URL.revokeObjectURL(url);
}

private getExportColumns(role: UserRole): { header: string; value: (user: User) => string }[] {
  const baseColumns = [
    {
      header: 'Prénom',
      value: (user: User) => user.firstName ?? ''
    },
    {
      header: 'Nom',
      value: (user: User) => user.lastName ?? ''
    },
    {
      header: 'Email',
      value: (user: User) => user.email ?? ''
    },
    {
      header: 'Téléphone',
      value: (user: User) => this.getUserField(user, 'phone')
    },
    {
      header: 'Rôle',
      value: (user: User) => user.role ?? ''
    },
    {
      header: 'Statut',
      value: (user: User) => this.getUserField(user, 'status')
    },
    {
      header: 'Ville',
      value: (user: User) => this.getUserField(user, 'city')
    },
    {
      header: 'Date de création',
      value: (user: User) => this.getUserField(user, 'createdAt')
    }
  ];

  if (role === 'eleve') {
    return [
      ...baseColumns,
      {
        header: 'Niveau',
        value: (user: User) => this.getUserField(user, 'grade') || this.getUserField(user, 'level')
      },
      {
        header: 'École',
        value: (user: User) => this.getUserField(user, 'school')
      },
      {
        header: 'Parent',
        value: (user: User) => {
          const parentId = this.getUserField(user, 'parentId');
          return parentId ? this.data.getDisplayName(parentId) : '';
        }
      }
    ];
  }

  if (role === 'tuteur') {
    return [
      ...baseColumns,
      {
        header: 'Matières',
        value: (user: User) => this.formatListValue(this.getRawUserField(user, 'subjects'))
      },
      {
        header: 'Niveaux enseignés',
        value: (user: User) => this.formatListValue(this.getRawUserField(user, 'levels'))
      },
      {
        header: 'Mode',
        value: (user: User) => this.getUserField(user, 'mode')
      },
      {
        header: 'Disponibilités',
        value: (user: User) => this.formatListValue(this.getRawUserField(user, 'availability'))
      }
    ];
  }

  if (role === 'parent') {
    return [
      ...baseColumns,
      {
        header: 'Nombre d’enfants',
        value: (user: User) => {
          const children = this.data.getUsersByRole('eleve').filter((student) => {
            return this.getUserField(student, 'parentId') === user.id;
          });

          return children.length.toString();
        }
      },
      {
        header: 'Enfants',
        value: (user: User) => {
          const children = this.data.getUsersByRole('eleve').filter((student) => {
            return this.getUserField(student, 'parentId') === user.id;
          });

          return children
            .map((student) => `${student.firstName} ${student.lastName}`)
            .join(', ');
        }
      }
    ];
  }

  return baseColumns;
}

private getExportFileName(role: UserRole): string {
  const today = new Date().toISOString().slice(0, 10);

  if (role === 'eleve') {
    return `etude-reussie-eleves-${today}.csv`;
  }

  if (role === 'tuteur') {
    return `etude-reussie-tuteurs-${today}.csv`;
  }

  if (role === 'parent') {
    return `etude-reussie-parents-${today}.csv`;
  }

  return `etude-reussie-utilisateurs-${today}.csv`;
}

private getUserField(user: User, fieldName: string): string {
  const value = this.getRawUserField(user, fieldName);

  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
}

private getRawUserField(user: User, fieldName: string): unknown {
  return (user as unknown as Record<string, unknown>)[fieldName];
}

private formatListValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

private escapeCsvValue(value: string): string {
  const safeValue = value.replace(/"/g, '""');
  return `"${safeValue}"`;
}
}