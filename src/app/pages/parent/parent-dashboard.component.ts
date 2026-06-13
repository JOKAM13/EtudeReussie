import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { StatCardComponent } from '../../shared/stat-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Tableau de bord parent</h2><p>Vue rapide sur les enfants associés, les séances, les suivis, les devoirs et les factures soumises.</p></div></div>
    <div class="grid grid-4">
      <app-stat-card title="Enfants" [value]="children.length" subtitle="Comptes associés" icon="👨‍👧" />
      <app-stat-card title="Séances à venir" [value]="upcoming.length" subtitle="Prochains cours" icon="📅" />
      <app-stat-card title="Suivis reçus" [value]="followUps.length" subtitle="Rapports du tuteur" icon="📝" />
      <app-stat-card title="Factures" [value]="submittedInvoices.length" subtitle="Documents soumis" icon="🧾" />
    </div>
    <div class="grid grid-2" style="margin-top:18px">
      <section class="card"><h3>Mes enfants</h3><div class="list" *ngIf="children.length; else emptyChildren"><div class="list-item" *ngFor="let child of children"><div><strong>{{ child.firstName }} {{ child.lastName }}</strong><div class="meta">{{ child.grade }} · {{ child.school }} · Tuteur : {{ data.getDisplayName(child.tutorId || '') }}</div></div><app-status-badge [value]="child.status" /></div></div><ng-template #emptyChildren><div class="empty-state">Aucun enfant associé.</div></ng-template></section>
      <section class="card"><h3>Prochaines séances</h3><div class="list" *ngIf="upcoming.length; else emptySessions"><div class="list-item" *ngFor="let session of upcoming"><div><strong>{{ session.subject }} · {{ data.getDisplayName(session.studentId) }}</strong><div class="meta">{{ session.date }} · {{ session.startTime }} – {{ session.endTime }} · {{ session.mode }}</div></div><app-status-badge [value]="session.status" /></div></div><ng-template #emptySessions><div class="empty-state">Aucune séance à venir.</div></ng-template></section>
    </div>
  `
})
export class ParentDashboardComponent {
  parent = this.data.getParent();
  children = this.data.getChildrenForParent(this.parent.id);
  sessions = this.data.getSessionsForParent(this.parent.id);
  upcoming = this.data.getUpcomingSessions(this.sessions, 5);
  followUps = this.data.getFollowUpsForParent(this.parent.id);
  submittedInvoices = this.data.getBillingDocumentsForParent(this.parent.id).filter((doc) => doc.status === 'Soumis');
  constructor(public readonly data: AppDataService) {}
}
