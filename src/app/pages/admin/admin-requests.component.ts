import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { RequestStatus, TutorRequest } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Demandes de tutorat</h2><p>Consultez, recherchez, créez, assignez et suivez les demandes reçues sur la plateforme.</p></div><button class="btn primary" (click)="showCreate = true">Nouvelle demande</button></div>

    <div class="grid grid-4">
      <button class="card stat-card" *ngFor="let card of statusCards" (click)="statusFilter = card.status"><div><small>{{ card.label }}</small><div class="value">{{ countByStatus(card.status) }}</div><p>{{ card.subtitle }}</p></div><div class="stat-icon">{{ card.icon }}</div></button>
    </div>

    <section class="card" style="margin-top:18px">
      <div class="actions" style="margin-bottom:16px">
        <input [(ngModel)]="search" placeholder="Rechercher par nom, courriel, matière ou niveau" style="max-width:430px" />
        <select [(ngModel)]="statusFilter" style="max-width:220px"><option value="all">Tous les statuts</option><option>Nouvelle</option><option>Disponible</option><option>Assignée</option><option>En cours</option><option>Terminée</option><option>Annulée</option><option>Archivée</option></select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Élève</th><th>Matière</th><th>Niveau</th><th>Mode</th><th>Statut</th><th>Tuteur</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let request of filteredRequests">
              <td><strong>{{ request.studentName }}</strong><br><span class="meta">{{ request.studentEmail }}</span></td>
              <td>{{ request.subject }}</td>
              <td>{{ request.level }} {{ request.grade }}</td>
              <td>{{ request.mode }}</td>
              <td><app-status-badge [value]="request.status" /></td>
              <td>{{ request.assignedTutorId ? data.getDisplayName(request.assignedTutorId) : '-' }}</td>
              <td class="actions"><button class="btn soft" (click)="selectedRequest = request">Détail</button><button class="btn success" (click)="changeStatus(request.id, 'En cours')">En cours</button><button class="btn warning" (click)="changeStatus(request.id, 'Terminée')">Terminer</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="modal-backdrop" *ngIf="showCreate" (click)="showCreate = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro"><div><h2>Nouvelle demande</h2><p>Ajoutez une demande reçue par téléphone, courriel, WhatsApp, Facebook ou en personne.</p></div><button class="btn ghost" (click)="showCreate=false">Fermer</button></div>
        <form [formGroup]="form" (ngSubmit)="createRequest()" class="form-grid">
          <label>Nom de l’élève<input formControlName="studentName" /></label>
          <label>Courriel<input formControlName="studentEmail" /></label>
          <label>Téléphone<input formControlName="phone" /></label>
          <label>Courriel parent<input formControlName="parentEmail" /></label>
          <label>Niveau<select formControlName="level"><option>Primaire</option><option>Secondaire</option><option>Cégep</option><option>Université</option></select></label>
          <label>Année / classe<input formControlName="grade" /></label>
          <label>École<input formControlName="school" /></label>
          <label>Matière<input formControlName="subject" /></label>
          <label>Ville<input formControlName="city" /></label>
          <label>Mode<select formControlName="mode"><option>En ligne</option><option>Présentiel</option><option>Les deux</option></select></label>
          <label class="full">Disponibilités<textarea formControlName="availability"></textarea></label>
          <label class="full">Objectif<textarea formControlName="objective"></textarea></label>
          <label class="full">Difficultés principales<textarea formControlName="difficulties"></textarea></label>
          <label>Tarif prévu<input type="number" formControlName="hourlyRate" /></label>
          <label>Nombre d’heures / semaine<input type="number" formControlName="hoursPerWeek" /></label>
          <label>Date de début souhaitée<input type="date" formControlName="desiredStartDate" /></label>
          <label class="full">Commentaire<textarea formControlName="comment"></textarea></label>
          <div class="actions full"><button class="btn primary" type="submit">Créer la demande</button></div>
        </form>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="selectedRequest" (click)="selectedRequest = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro"><div><h2>Détail de la demande</h2><p>{{ selectedRequest.studentName }} · {{ selectedRequest.subject }}</p></div><button class="btn ghost" (click)="selectedRequest=undefined">Fermer</button></div>
        <div class="grid grid-2">
          <div class="detail-panel"><strong>Contact</strong><br>{{ selectedRequest.studentEmail }}<br>{{ selectedRequest.parentEmail }}<br>{{ selectedRequest.phone }}</div>
          <div class="detail-panel"><strong>Scolarité</strong><br>{{ selectedRequest.level }} {{ selectedRequest.grade }}<br>{{ selectedRequest.school }}</div>
          <div class="detail-panel"><strong>Ville / mode</strong><br>{{ selectedRequest.city }} · {{ selectedRequest.mode }}</div>
          <div class="detail-panel"><strong>Tarif</strong><br>{{ selectedRequest.hourlyRate }} $/h · {{ selectedRequest.hoursPerWeek }} h/semaine</div>
          <div class="detail-panel"><strong>Disponibilités</strong><br>{{ selectedRequest.availability }}</div>
          <div class="detail-panel"><strong>Objectif</strong><br>{{ selectedRequest.objective }}</div>
          <div class="detail-panel"><strong>Difficultés</strong><br>{{ selectedRequest.difficulties }}</div>
          <div class="detail-panel"><strong>Commentaire interne</strong><br>{{ selectedRequest.internalNote || selectedRequest.comment || '-' }}</div>
        </div>
        <div class="actions" style="margin-top:16px">
          <select #tutorSelect><option *ngFor="let tutor of tutors" [value]="tutor.id">{{ tutor.firstName }} {{ tutor.lastName }} · {{ tutor.subjects?.join(', ') }}</option></select>
          <button class="btn primary" (click)="assignSelected(tutorSelect.value)">Assigner</button>
        </div>
      </div>
    </div>
  `
})
export class AdminRequestsComponent {
  search = '';
  statusFilter: RequestStatus | 'all' = 'all';
  showCreate = false;
  selectedRequest?: TutorRequest;
  tutors = this.data.getUsersByRole('tuteur');
  statusCards = [
    { label: 'Nouvelles', status: 'Nouvelle' as RequestStatus, subtitle: 'À analyser', icon: '📌' },
    { label: 'Assignées', status: 'Assignée' as RequestStatus, subtitle: 'Tuteur choisi', icon: '🔗' },
    { label: 'En cours', status: 'En cours' as RequestStatus, subtitle: 'Accompagnement actif', icon: '✅' },
    { label: 'Terminées', status: 'Terminée' as RequestStatus, subtitle: 'Historique', icon: '🏁' }
  ];

  form = this.fb.nonNullable.group({
    studentName: ['', Validators.required], studentEmail: ['', [Validators.required, Validators.email]], phone: [''], parentEmail: [''], level: ['Secondaire', Validators.required], grade: [''], school: [''], subject: ['', Validators.required], city: ['', Validators.required], mode: ['En ligne' as const], availability: ['', Validators.required], objective: ['', Validators.required], difficulties: [''], hourlyRate: [25, Validators.required], hoursPerWeek: [2, Validators.required], desiredStartDate: [''], comment: ['']
  });

  constructor(private readonly fb: FormBuilder, public readonly data: AppDataService) {}

  get requests(): TutorRequest[] { return this.data.requests; }
  get filteredRequests(): TutorRequest[] {
    const term = this.search.toLowerCase().trim();
    return this.requests.filter((request) => {
      const statusOk = this.statusFilter === 'all' || request.status === this.statusFilter;
      const haystack = `${request.studentName} ${request.studentEmail} ${request.subject} ${request.level}`.toLowerCase();
      return statusOk && (!term || haystack.includes(term));
    });
  }

  countByStatus(status: RequestStatus): number { return this.requests.filter((request) => request.status === status).length; }
  changeStatus(id: string, status: RequestStatus): void { this.data.changeRequestStatus(id, status); }
  assignSelected(tutorId: string): void { if (this.selectedRequest) { this.data.assignRequest(this.selectedRequest.id, tutorId); this.selectedRequest = undefined; } }
  createRequest(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = this.form.getRawValue();
    this.data.createRequest({ ...raw, status: 'Nouvelle' });
    this.showCreate = false;
  }
}
