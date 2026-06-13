import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-student-followups',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Suivis du tuteur</h2>
        <p>Consultez les rapports de suivi rédigés après les séances : notions travaillées, difficultés, recommandations et travail à faire.</p>
      </div>
    </div>

    <section class="card">
      <div class="list" *ngIf="followUps.length; else empty">
        <article class="list-item" *ngFor="let follow of followUps">
          <div style="width:100%">
            <div class="actions" style="justify-content:space-between">
              <strong>{{ follow.subject }} · {{ follow.sessionDate | date:'d MMMM yyyy':'':'fr' }}</strong>
              <app-status-badge [value]="follow.status" />
            </div>
            <p class="meta">Tuteur : {{ data.getDisplayName(follow.tutorId) }}</p>
            <div class="grid grid-2">
              <div class="detail-panel"><strong>Notions travaillées</strong><br>{{ follow.notions }}</div>
              <div class="detail-panel"><strong>Progrès observés</strong><br>{{ follow.progress }}</div>
              <div class="detail-panel"><strong>Difficultés</strong><br>{{ follow.difficulties }}</div>
              <div class="detail-panel"><strong>Travail à faire</strong><br>{{ follow.homework }}</div>
            </div>
            <p>{{ follow.generalComment }}</p>
            <div class="grid grid-3">
              <div><strong>Compréhension</strong><div class="progress-bar"><span [style.width.%]="follow.understandingPercent"></span></div><p class="meta">{{ follow.understandingPercent }}%</p></div>
              <div><strong>Devoirs faits</strong><div class="progress-bar"><span [style.width.%]="follow.homeworkPercent"></span></div><p class="meta">{{ follow.homeworkPercent }}%</p></div>
              <div><strong>Participation</strong><p class="meta">{{ follow.participation }}</p></div>
            </div>
          </div>
        </article>
      </div>
      <ng-template #empty><div class="empty-state">Aucun suivi disponible pour l’instant. Les rapports de votre tuteur apparaîtront ici après vos séances.</div></ng-template>
    </section>
  `
})
export class StudentFollowupsComponent {
  followUps = this.data.getFollowUpsForStudent(this.data.getStudent().id);
  constructor(public readonly data: AppDataService) {}
}
