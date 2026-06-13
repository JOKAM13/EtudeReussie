import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppDataService } from '../../core/app-data.service';
import { StatCardComponent } from '../../shared/stat-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-tutor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Bonjour {{ tutor.firstName }} 👋</h2>
        <p>Voici votre espace de gestion : élèves assignés, demandes disponibles, séances, devoirs et suivis aux parents.</p>
      </div>
      <a class="btn primary" routerLink="/tuteur/suivis-parents">Créer un suivi</a>
    </div>

    <div class="grid grid-4">
      <app-stat-card title="Mes élèves" [value]="students.length" subtitle="Élèves assignés" icon="🎓" link="/tuteur/eleves" />
      <app-stat-card title="Demandes disponibles" [value]="requests.length" subtitle="Demandes ouvertes" icon="📌" link="/tuteur/demandes" />
      <app-stat-card title="Séances à venir" [value]="upcomingSessions.length" subtitle="Cours planifiés" icon="📅" link="/tuteur/calendrier" />
      <app-stat-card title="Devoirs à corriger" [value]="pendingHomework.length" subtitle="Travaux en attente" icon="📚" link="/tuteur/devoirs" />
    </div>

    <div class="grid grid-2" style="margin-top:18px">
      <section class="card">
        <h3>Prochaines séances</h3>
        <div class="list" *ngIf="upcomingSessions.length; else noSessions">
          <div class="list-item" *ngFor="let session of upcomingSessions">
            <div>
              <strong>{{ session.subject }} · {{ data.getDisplayName(session.studentId) }}</strong>
              <div class="meta">{{ session.date | date:'d MMM yyyy':'':'fr' }} · {{ session.startTime }} – {{ session.endTime }} · {{ session.mode }}</div>
            </div>
            <app-status-badge [value]="session.status" />
          </div>
        </div>
        <ng-template #noSessions><div class="empty-state">Aucune séance à venir.</div></ng-template>
      </section>

      <section class="card">
        <h3>Devoirs soumis récents</h3>
        <div class="list" *ngIf="homework.length; else noHomework">
          <div class="list-item" *ngFor="let item of homework.slice(0, 4)">
            <div>
              <strong>{{ item.title }}</strong>
              <div class="meta">{{ data.getDisplayName(item.studentId) }} · {{ item.subject }} · {{ item.submittedAt | date:'d MMM yyyy':'':'fr' }}</div>
            </div>
            <app-status-badge [value]="item.status" />
          </div>
        </div>
        <ng-template #noHomework><div class="empty-state">Aucun devoir soumis.</div></ng-template>
      </section>

      <section class="card">
        <h3>Demandes disponibles</h3>
        <div class="list" *ngIf="requests.length; else noRequests">
          <div class="list-item" *ngFor="let request of requests.slice(0, 3)">
            <div>
              <strong>{{ request.studentName }} · {{ request.subject }}</strong>
              <div class="meta">{{ request.level }} · {{ request.city }} · {{ request.mode }} · {{ request.hourlyRate }} $/h</div>
            </div>
            <a class="btn soft" routerLink="/tuteur/demandes">Voir</a>
          </div>
        </div>
        <ng-template #noRequests><div class="empty-state">Aucune demande disponible pour vos matières.</div></ng-template>
      </section>

      <section class="card">
        <h3>Suivis récents</h3>
        <div class="list" *ngIf="followUps.length; else noFollow">
          <div class="list-item" *ngFor="let follow of followUps.slice(0, 3)">
            <div>
              <strong>{{ data.getDisplayName(follow.studentId) }} · {{ follow.subject }}</strong>
              <div class="meta">{{ follow.sessionDate | date:'d MMM yyyy':'':'fr' }} · {{ follow.progress }}</div>
            </div>
            <app-status-badge [value]="follow.status" />
          </div>
        </div>
        <ng-template #noFollow><div class="empty-state">Aucun suivi rédigé pour le moment.</div></ng-template>
      </section>
    </div>
  `
})
export class TutorDashboardComponent {
  tutor = this.data.getTutor();
  students = this.data.getStudentsForTutor(this.tutor.id);
  requests = this.data.getAvailableRequestsForTutor(this.tutor.id);
  sessions = this.data.getSessionsForTutor(this.tutor.id);
  upcomingSessions = this.data.getUpcomingSessions(this.sessions);
  homework = this.data.getHomeworkForTutor(this.tutor.id);
  pendingHomework = this.homework.filter((item) => item.status !== 'Corrigé');
  followUps = this.data.getFollowUpsForTutor(this.tutor.id);

  constructor(public readonly data: AppDataService) {}
}
