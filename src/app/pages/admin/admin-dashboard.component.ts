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
      <app-stat-card title="Séances ce mois" [value]="monthlySessions.length" subtitle="Ce mois-ci" icon="🗓️" link="/admin/seances" />
      <app-stat-card title="Heures ce mois" [value]="monthlyHours" subtitle="Heures planifiées" icon="⏱️" link="/admin/seances" />
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

      <section class="card">
        <h3>Heures données par tuteur</h3>

        <div class="list" *ngIf="tutorMonthlyHours.length; else emptyTutorHours">
          <div class="list-item" *ngFor="let item of tutorMonthlyHours">
            <div>
              <strong>{{ item.tutorName }}</strong>
              <p class="meta">{{ item.sessionCount }} séance(s) terminée(s) ce mois-ci</p>
            </div>

            <strong>{{ item.hours }} h</strong>
          </div>
        </div>

        <ng-template #emptyTutorHours>
          <div class="empty-state">Aucune séance terminée ce mois-ci.</div>
        </ng-template>
</section>
    </div>
  `
})
export class AdminDashboardComponent {
  users = this.data.users;
  students = this.data.getUsersByRole('eleve');
  tutors = this.data.getUsersByRole('tuteur');
  requests = this.data.requests;

  newRequests = this.requests.filter((request) => {
    return request.status === 'Nouvelle' || request.status === 'Disponible';
  });

  assignedRequests = this.requests.filter((request) => {
    return request.status === 'Assignée';
  });

  sessions = this.data.sessions;
  upcomingSessions = this.data.getUpcomingSessions(this.sessions, 5);

  monthlySessions = this.sessions.filter((session) => {
    return this.isCurrentMonth(session.date) && !this.isCancelled(session.status);
  });

  monthlyHours = this.roundHours(
    this.monthlySessions.reduce((total, session) => {
      return total + this.getSessionDurationInHours(session.startTime, session.endTime);
    }, 0)
  );

  tutorMonthlyHours = this.buildTutorMonthlyHours();

  homework = this.data.homework;

  uncorrectedHomework = this.homework.filter((item) => {
    return item.status !== 'Corrigé';
  });

  sentFollowUps = this.data.allFollowUps.filter((follow) => {
    return follow.status === 'Envoyé';
  });

  constructor(public readonly data: AppDataService) {}

  private buildTutorMonthlyHours(): { tutorId: string; tutorName: string; hours: number; sessionCount: number }[] {
    const totals = new Map<string, { tutorId: string; tutorName: string; hours: number; sessionCount: number }>();

    const completedSessions = this.sessions.filter((session) => {
      return this.isCurrentMonth(session.date) && this.isCompleted(session.status);
    });

    for (const session of completedSessions) {
      const tutorId = session.tutorId;
      const tutorName = this.data.getDisplayName(tutorId);
      const hours = this.getSessionDurationInHours(session.startTime, session.endTime);

      const current = totals.get(tutorId) ?? {
        tutorId,
        tutorName,
        hours: 0,
        sessionCount: 0
      };

      current.hours += hours;
      current.sessionCount += 1;

      totals.set(tutorId, current);
    }

    return Array.from(totals.values())
      .map((item) => ({
        ...item,
        hours: this.roundHours(item.hours)
      }))
      .sort((a, b) => b.hours - a.hours);
  }

  private isCurrentMonth(dateValue: string): boolean {
    const date = new Date(`${dateValue}T00:00:00`);
    const today = new Date();

    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth();
  }

  private getSessionDurationInHours(startTime: string, endTime: string): number {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      return 0;
    }

    return (endMinutes - startMinutes) / 60;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map((value) => Number(value));

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return 0;
    }

    return hours * 60 + minutes;
  }

  private isCompleted(status: string): boolean {
    const normalizedStatus = this.normalizeStatus(status);

    return normalizedStatus === 'terminee' ||
      normalizedStatus === 'terminée' ||
      status.toLowerCase().includes('terminÃ©e'.toLowerCase());
  }

  private isCancelled(status: string): boolean {
    const normalizedStatus = this.normalizeStatus(status);

    return normalizedStatus === 'annulee' ||
      normalizedStatus === 'annulée' ||
      status.toLowerCase().includes('annulÃ©e'.toLowerCase());
  }

  private normalizeStatus(status: string): string {
    return status
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private roundHours(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
