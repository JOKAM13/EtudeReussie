import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { TutorRequest } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-tutor-requests',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Demandes disponibles</h2>
        <p>Consultez les demandes ouvertes et assignez-vous seulement aux demandes encore disponibles.</p>
      </div>
    </div>

    <div class="grid grid-3" *ngIf="requests.length; else empty">
      <article class="card" *ngFor="let request of requests">
        <div class="actions" style="justify-content:space-between">
          <h3>{{ request.subject }}</h3>
          <app-status-badge [value]="request.status" />
        </div>

        <p><strong>{{ request.studentName }}</strong></p>
        <p class="meta">{{ request.level }} · {{ request.city }} · {{ request.mode }}</p>
        <p>{{ request.objective }}</p>

        <div class="detail-panel">
          <strong>Tarif</strong><br>
          {{ request.hourlyRate }} $/h · {{ request.hoursPerWeek }} h/semaine<br>
          <span class="meta">
            Estimation : {{ request.hourlyRate * request.hoursPerWeek }} $/semaine
          </span>
        </div>

        <div class="actions" style="margin-top:14px">
          <button class="btn soft" type="button" (click)="selectedRequest = request">
            Détail
          </button>

          <button class="btn primary" type="button" (click)="assign(request)">
            M’assigner
          </button>
        </div>
      </article>
    </div>

    <ng-template #empty>
      <div class="empty-state">Aucune demande disponible pour le moment.</div>
    </ng-template>

    <div class="modal-backdrop" *ngIf="selectedRequest" (click)="selectedRequest = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div>
            <h2>Détail de la demande</h2>
            <p>{{ selectedRequest.studentName }} · {{ selectedRequest.subject }}</p>
          </div>

          <button class="btn ghost" type="button" (click)="selectedRequest = undefined">
            Fermer
          </button>
        </div>

        <div class="grid grid-2">
          <div class="detail-panel">
            <strong>Niveau</strong><br>
            {{ selectedRequest.level }} {{ selectedRequest.grade }}
          </div>

          <div class="detail-panel">
            <strong>Ville / mode</strong><br>
            {{ selectedRequest.city }} · {{ selectedRequest.mode }}
          </div>

          <div class="detail-panel">
            <strong>Disponibilités</strong><br>
            {{ selectedRequest.availability }}
          </div>

          <div class="detail-panel">
            <strong>Date souhaitée</strong><br>
            {{ selectedRequest.desiredStartDate | date:'d MMM yyyy':'':'fr' }}
          </div>

          <div class="detail-panel">
            <strong>Objectif</strong><br>
            {{ selectedRequest.objective }}
          </div>

          <div class="detail-panel">
            <strong>Difficultés principales</strong><br>
            {{ selectedRequest.difficulties }}
          </div>

          <div class="detail-panel" *ngIf="selectedRequest.specialNeed">
            <strong>Besoin particulier</strong><br>
            {{ selectedRequest.specialNeed }}
          </div>

          <div class="detail-panel">
            <strong>Commentaire</strong><br>
            {{ selectedRequest.comment || 'Aucun commentaire.' }}
          </div>
        </div>

        <div class="actions" style="margin-top:16px">
          <button class="btn primary" type="button" (click)="assign(selectedRequest)">
            M’assigner
          </button>
        </div>
      </div>
    </div>
  `
})
export class TutorRequestsComponent {
  tutor = this.data.getTutor();
  selectedRequest?: TutorRequest;

  constructor(public readonly data: AppDataService) {}

  get requests(): TutorRequest[] {
    return this.data.getAvailableRequestsForTutor(this.tutor.id);
  }

  async assign(request: TutorRequest): Promise<void> {
    await this.data.assignRequest(request.id, this.tutor.id);

    this.selectedRequest = undefined;
  }
}