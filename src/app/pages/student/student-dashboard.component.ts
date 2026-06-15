import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppDataService } from '../../core/app-data.service';
import { Session } from '../../core/models';
import { StatCardComponent } from '../../shared/stat-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Bonjour {{ student.firstName }} 👋</h2>
        <p>Voici votre espace personnel pour suivre vos séances, vos devoirs, vos documents et les retours de votre tuteur.</p>
      </div>
      <a class="btn primary" routerLink="/eleve/soumettre-devoir">Soumettre un devoir</a>
    </div>

    <div class="grid grid-3">
      <app-stat-card title="Séances à venir" [value]="upcomingSessions.length" subtitle="Cours programmés" icon="📅" link="/eleve/seances" />
      <app-stat-card title="Devoirs soumis" [value]="homework.length" subtitle="Travaux envoyés" icon="📘" link="/eleve/devoirs" />
      <app-stat-card title="Suivis reçus" [value]="followUps.length" subtitle="Rapports du tuteur" icon="📝" link="/eleve/suivis" />
    </div>

    <div class="grid grid-2" style="margin-top:18px">
      <section class="card">
        <h3>Prochaines séances</h3>
        <div class="list" *ngIf="upcomingSessions.length > 0; else noSessions">
          <div class="list-item" *ngFor="let session of upcomingSessions">
            <div>
              <strong>{{ session.subject }} · {{ session.date | date:'d MMMM yyyy':'':'fr' }}</strong>
              <div class="meta">{{ session.startTime }} – {{ session.endTime }} · {{ tutorName(session) }} · {{ session.mode }}</div>
            </div>
            <app-status-badge [value]="session.status" />
          </div>
        </div>
        <ng-template #noSessions><div class="empty-state">Les prochaines séances apparaîtront ici dès qu’elles seront ajoutées.</div></ng-template>
      </section>

      <section class="card">
  <h3>Mon tuteur</h3>

        <div class="list" *ngIf="myTutors.length; else noTutorAssigned">
          <div class="list-item" *ngFor="let tutor of myTutors">
            <div>
              <strong>{{ tutor.firstName }} {{ tutor.lastName }}</strong>
              <p class="meta">{{ tutor.email }}</p>
            </div>

            <span class="status success">Assigné</span>
          </div>
        </div>

        <ng-template #noTutorAssigned>
          <div class="empty-state">
            Aucun tuteur assigné pour l’instant.
          </div>
        </ng-template>
      </section>

      <section class="card">
        <h3>Mes devoirs récents</h3>
        <div class="list" *ngIf="homework.length > 0; else noHomework">
          <div class="list-item" *ngFor="let item of homework.slice(0, 3)">
            <div>
              <strong>{{ item.title }}</strong>
              <div class="meta">{{ item.subject }} · soumis le {{ item.submittedAt | date:'d MMM yyyy':'':'fr' }}</div>
            </div>
            <app-status-badge [value]="item.status" />
          </div>
        </div>
        <ng-template #noHomework><div class="empty-state">Vous pouvez envoyer votre premier devoir.</div></ng-template>
      </section>

      <section class="card">
        <h3>Dernier suivi</h3>
        <div *ngIf="followUps[0]; else noFollow" class="detail-panel">
          <strong>{{ followUps[0].subject }} · {{ followUps[0].sessionDate | date:'d MMM yyyy':'':'fr' }}</strong>
          <p>{{ followUps[0].generalComment }}</p>
          <div class="progress-bar"><span [style.width.%]="followUps[0].understandingPercent"></span></div>
          <p class="meta">Compréhension : {{ followUps[0].understandingPercent }}%</p>
        </div>
        <ng-template #noFollow><div class="empty-state">Aucun suivi disponible pour l’instant.</div></ng-template>
      </section>
    </div>
  `
})
export class StudentDashboardComponent {
  student = this.data.getStudent();
  tutor = this.data.getTutorForStudent(this.student.id);
  sessions = this.data.getSessionsForStudent(this.student.id);
  upcomingSessions = this.data.getUpcomingSessions(this.sessions);
  homework = this.data.getHomeworkForStudent(this.student.id);
  followUps = this.data.getFollowUpsForStudent(this.student.id);

  constructor(private readonly data: AppDataService) {}

  tutorName(session: Session): string { return this.data.getDisplayName(session.tutorId); }

  get myTutors() {
  const currentUser = this.data.getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const tutorIds = new Set(
    this.data.sessions
      .filter((session) => {
        return session.studentId === currentUser.id;
      })
      .map((session) => session.tutorId)
      .filter((tutorId) => !!tutorId)
  );

  return Array.from(tutorIds)
    .map((tutorId) => this.data.getUser(tutorId))
    .filter((user): user is NonNullable<typeof user> => {
      return !!user && user.role === 'tuteur';
    });
}
}
