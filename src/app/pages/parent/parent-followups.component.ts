import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { FollowUp } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-parent-followups',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Suivis du tuteur</h2><p>Consultez les rapports de suivi envoyés par les tuteurs après les séances.</p></div></div>
    <section class="card">
      <div class="list" *ngIf="followUps.length; else empty">
        <div class="list-item" *ngFor="let follow of followUps">
          <div><strong>{{ data.getDisplayName(follow.studentId) }} · {{ follow.subject }}</strong><div class="meta">{{ follow.sessionDate }} · {{ follow.generalComment }}</div></div>
          <div class="actions"><app-status-badge [value]="follow.status" /><button class="btn soft" (click)="selected = follow">Consulter</button></div>
        </div>
      </div>
      <ng-template #empty><div class="empty-state">Aucun suivi reçu pour l’instant.</div></ng-template>
    </section>
    <div class="modal-backdrop" *ngIf="selected" (click)="selected = undefined"><div class="modal" (click)="$event.stopPropagation()"><div class="page-intro"><div><h2>Détail du suivi</h2><p>{{ selected.subject }} · {{ selected.sessionDate }}</p></div><button class="btn ghost" (click)="selected = undefined">Fermer</button></div><div class="grid grid-2"><div class="detail-panel"><strong>Élève</strong><br>{{ data.getDisplayName(selected.studentId) }}</div><div class="detail-panel"><strong>Tuteur</strong><br>{{ data.getDisplayName(selected.tutorId) }}</div><div class="detail-panel full"><strong>Notions travaillées</strong><br>{{ selected.notions }}</div><div class="detail-panel full"><strong>Progrès observés</strong><br>{{ selected.progress }}</div><div class="detail-panel full"><strong>Difficultés restantes</strong><br>{{ selected.difficulties || '-' }}</div><div class="detail-panel full"><strong>Devoirs à faire</strong><br>{{ selected.homework || '-' }}</div><div class="detail-panel"><strong>Compréhension</strong><br>{{ selected.understandingPercent }} %</div><div class="detail-panel"><strong>Participation</strong><br>{{ selected.participation }}</div></div></div></div>
  `
})
export class ParentFollowupsComponent {
  parent = this.data.getParent();
  followUps = this.data.getFollowUpsForParent(this.parent.id);
  selected?: FollowUp;
  constructor(public readonly data: AppDataService) {}
}
