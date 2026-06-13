import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppDataService } from '../../core/app-data.service';
import { StatCardComponent } from '../../shared/stat-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Tableau de bord administrateur</h2>
        <p>Vue d’ensemble de la plateforme : élèves, tuteurs, demandes, assignations, séances, devoirs, suivis et paiements.</p>
      </div>
    </div>

    <div class="grid grid-4">
      <app-stat-card title="Élèves" [value]="students.length" subtitle="Comptes élèves" icon="🎓" link="/admin/utilisateurs" />
      <app-stat-card title="Tuteurs" [value]="tutors.length" subtitle="Comptes tuteurs" icon="👨‍🏫" link="/admin/utilisateurs" />
      <app-stat-card title="Nouvelles demandes" [value]="newRequests.length" subtitle="À traiter" icon="📌" link="/admin/demandes" />
      <app-stat-card title="Demandes assignées" [value]="assignedRequests.length" subtitle="Avec tuteur" icon="🔗" link="/admin/assignations" />
      <app-stat-card title="Séances programmées" [value]="sessions.length" subtitle="Toutes les séances" icon="📅" link="/admin/seances" />
      <app-stat-card title="Devoirs soumis" [value]="homework.length" subtitle="Travaux reçus" icon="📚" link="/admin/documents" />
      <app-stat-card title="Suivis envoyés" [value]="sentFollowUps.length" subtitle="Rapports parents" icon="📝" link="/admin/suivis" />
      <app-stat-card title="Devoirs non corrigés" [value]="uncorrectedHomework.length" subtitle="À surveiller" icon="⚠️" link="/admin/documents" />
    </div>

    <div class="grid grid-3" style="margin-top:18px">
      <section class="card">
        <h3>Actions rapides</h3>
        <div class="list">
          <a class="btn soft" routerLink="/admin/utilisateurs">Créer un utilisateur</a>
          <a class="btn soft" routerLink="/admin/demandes">Nouvelle demande</a>
          <a class="btn soft" routerLink="/admin/seances">Programmer une séance</a>
          <a class="btn soft" routerLink="/admin/assignations">Assigner un tuteur</a>
          <a class="btn soft" routerLink="/admin/documents">Ajouter un document</a>
          <a class="btn soft" routerLink="/admin/paiements">Voir les paiements</a>
        </div>
      </section>

      <section class="card">
        <h3>Dernières demandes</h3>
        <div class="list">
          <div class="list-item" *ngFor="let request of requests.slice(0, 5)">
            <div><strong>{{ request.studentName }}</strong><p class="meta">{{ request.subject }} · {{ request.level }} · {{ request.createdAt | date:'d MMM yyyy':'':'fr' }}</p></div>
            <app-status-badge [value]="request.status" />
          </div>
        </div>
      </section>

      <section class="card">
        <h3>Prochaines séances</h3>
        <div class="list" *ngIf="upcomingSessions.length; else emptySessions">
          <div class="list-item" *ngFor="let session of upcomingSessions">
            <div><strong>{{ data.getDisplayName(session.studentId) }}</strong><p class="meta">{{ data.getDisplayName(session.tutorId) }} · {{ session.subject }} · {{ session.date }} {{ session.startTime }}</p></div>
            <app-status-badge [value]="session.status" />
          </div>
        </div>
        <ng-template #emptySessions><div class="empty-state">Aucune séance à venir.</div></ng-template>
      </section>
    </div>
  `
})
export class AdminDashboardComponent {
  users = this.data.users;
  students = this.data.getUsersByRole('eleve');
  tutors = this.data.getUsersByRole('tuteur');
  requests = this.data.requests;
  newRequests = this.requests.filter((request) => request.status === 'Nouvelle' || request.status === 'Disponible');
  assignedRequests = this.requests.filter((request) => request.status === 'Assignée');
  sessions = this.data.sessions;
  upcomingSessions = this.data.getUpcomingSessions(this.sessions, 5);
  homework = this.data.homework;
  uncorrectedHomework = this.homework.filter((item) => item.status !== 'Corrigé');
  sentFollowUps = this.data.allFollowUps.filter((follow) => follow.status === 'Envoyé');
  constructor(public readonly data: AppDataService) {}
}
