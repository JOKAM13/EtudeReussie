import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AppDataService } from '../core/app-data.service';
import { User, UserRole } from '../core/models';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="portal-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="logo-mark">ÉR</div>
          <div>
            <strong>Étude Réussie</strong>
            <span>Espace {{ roleLabel }}</span>
          </div>
        </div>

        <div class="nav-section-title">Navigation</div>

        <a
          class="nav-link"
          *ngFor="let item of links"
          [routerLink]="item.path"
          routerLinkActive="active"
        >
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a>

        <button class="nav-link" style="width:100%; border:0" (click)="resetDemo()">
          <span class="icon">🔄</span>
          <span>Réinitialiser</span>
        </button>
      </aside>

      <main class="main-area">
        <div
          *ngIf="data.isImpersonating()"
          style="background:#fee2e2;color:#991b1b;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #fecaca"
        >
          <div>
            <strong>Mode admin :</strong>
            vous consultez l’espace de
            {{ data.getImpersonatedUser()?.firstName }}
            {{ data.getImpersonatedUser()?.lastName }}.
          </div>

          <button class="btn danger" type="button" (click)="stopImpersonation()">
            Retour admin
          </button>
        </div>

        <header class="topbar">
          <h1>{{ title }}</h1>

          <div class="topbar-user">
            <button class="notification-dot" title="Notifications">🔔</button>

            <div class="profile-chip">
              <img
                *ngIf="currentUser.avatarUrl"
                [src]="currentUser.avatarUrl"
                [alt]="currentUserName"
              />

              <span *ngIf="!currentUser.avatarUrl" class="avatar-fallback">
                {{ initials }}
              </span>

              <div>
                <strong>{{ currentUserName }}</strong>
                <span>{{ roleLabel }}</span>
              </div>
            </div>
          </div>
        </header>

        <section class="content">
          <router-outlet />
        </section>
      </main>
    </div>
  `
})
export class PortalLayoutComponent implements OnInit, OnDestroy {
  title = 'Tableau de bord';
  role: UserRole = 'eleve';
 currentUser!: User;
  private subscription?: Subscription;

  readonly navItems: Record<UserRole, NavItem[]> = {
    superuser: [
      { label: 'Utilisateurs gestionnaires', icon: '🛡️', path: '/super-user/utilisateurs' }
    ],
    eleve: [
      { label: 'Tableau de bord', icon: '🏠', path: '/eleve/tableau-de-bord' },
      { label: 'Mes séances', icon: '📅', path: '/eleve/seances' },
      { label: 'Mes devoirs', icon: '📘', path: '/eleve/devoirs' },
      { label: 'Soumettre un devoir', icon: '📤', path: '/eleve/soumettre-devoir' },
      { label: 'Documents', icon: '📁', path: '/eleve/documents' },
      { label: 'Suivis du tuteur', icon: '📝', path: '/eleve/suivis' },
      { label: 'Factures', icon: '🧾', path: '/eleve/factures' },
      { label: 'Mon profil', icon: '👤', path: '/eleve/profil' }
    ],
    tuteur: [
      { label: 'Tableau de bord', icon: '🏠', path: '/tuteur/tableau-de-bord' },
      { label: 'Demandes disponibles', icon: '📌', path: '/tuteur/demandes' },
      { label: 'Mes élèves', icon: '🎓', path: '/tuteur/eleves' },
      { label: 'Calendrier', icon: '📅', path: '/tuteur/calendrier' },
      { label: 'Devoirs soumis', icon: '📚', path: '/tuteur/devoirs' },
      { label: 'Suivis aux parents', icon: '✉️', path: '/tuteur/suivis-parents' },
      { label: 'Documents', icon: '📁', path: '/tuteur/documents' },
      { label: 'Factures', icon: '🧾', path: '/tuteur/factures' },
      { label: 'Mon profil', icon: '👤', path: '/tuteur/profil' }
    ],
    admin: [
      { label: 'Tableau de bord', icon: '🏠', path: '/admin/tableau-de-bord' },
      { label: 'Utilisateurs', icon: '👥', path: '/admin/utilisateurs' },
      { label: 'Demandes', icon: '📌', path: '/admin/demandes' },
      { label: 'Assignations', icon: '🔗', path: '/admin/assignations' },
      { label: 'Facturation', icon: '🧾', path: '/admin/facturation' },
      { label: 'Séances', icon: '📅', path: '/admin/seances' },
      { label: 'Suivis', icon: '📝', path: '/admin/suivis' },
      { label: 'Documents', icon: '📁', path: '/admin/documents' },
      { label: 'Paiements', icon: '💳', path: '/admin/paiements' },
      { label: 'Journal d’activité', icon: '📜', path: '/admin/journal' }
    ],
    parent: [
      { label: 'Tableau de bord', icon: '🏠', path: '/parent/tableau-de-bord' },
      { label: 'Mes enfants', icon: '👨‍👧', path: '/parent/enfants' },
      { label: 'Séances', icon: '📅', path: '/parent/seances' },
      { label: 'Suivis du tuteur', icon: '📝', path: '/parent/suivis' },
      { label: 'Devoirs', icon: '📘', path: '/parent/devoirs' },
      { label: 'Documents', icon: '📁', path: '/parent/documents' },
      { label: 'Factures', icon: '🧾', path: '/parent/factures' },
      { label: 'Mon profil', icon: '👤', path: '/parent/profil' }
    ]
  };

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    public readonly data: AppDataService
  ) {}

ngOnInit(): void {
  this.refreshCurrentUser();
  this.updateTitle();

  this.subscription = this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe(() => {
      this.refreshCurrentUser();
      this.updateTitle();
    });
}

private refreshCurrentUser(): void {
  this.role = this.route.snapshot.data['role'] as UserRole;

  const connectedUser = this.data.getCurrentUser();

  if (connectedUser && connectedUser.role === this.role) {
    this.currentUser = connectedUser;
    return;
  }

  this.currentUser = this.data.getDefaultUserForRole(this.role);
}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get links(): NavItem[] {
    return this.navItems[this.role];
  }

  get roleLabel(): string {
    if (this.role === 'superuser') return 'super user';
    if (this.role === 'eleve') return 'élève';
    if (this.role === 'tuteur') return 'tuteur';
    if (this.role === 'parent') return 'parent';
    return 'administrateur';
  }

  get currentUserName(): string {
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  get initials(): string {
    return `${this.currentUser.firstName[0] ?? ''}${this.currentUser.lastName[0] ?? ''}`.toUpperCase();
  }

  stopImpersonation(): void {
    const returnUrl = this.data.getImpersonationReturnUrl();

    this.data.stopImpersonation();

    void this.router.navigateByUrl(returnUrl);
  }

  resetDemo(): void {
    this.data.resetDemo();
    window.location.reload();
  }

  private updateTitle(): void {
    let child = this.route.firstChild;

    while (child?.firstChild) {
      child = child.firstChild;
    }

    this.title = child?.snapshot.data['title'] ?? 'Tableau de bord';
  }
}