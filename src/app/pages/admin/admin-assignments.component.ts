import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-admin-assignments',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Assignations</h2><p>Associez les demandes de tutorat aux tuteurs disponibles selon la matière, le niveau, la ville, le mode et les disponibilités.</p></div></div>

    <section class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Élève</th><th>Matière</th><th>Niveau</th><th>Mode</th><th>Statut</th><th>Tuteur assigné</th><th>Assigner</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let request of requests">
              <td><strong>{{ request.studentName }}</strong><br><span class="meta">{{ request.city }}</span></td>
              <td>{{ request.subject }}</td>
              <td>{{ request.level }} {{ request.grade }}</td>
              <td>{{ request.mode }}</td>
              <td><app-status-badge [value]="request.status" /></td>
              <td>{{ request.assignedTutorId ? data.getDisplayName(request.assignedTutorId) : 'Non assignée' }}</td>
              <td>
                <select #tutorSelect [value]="request.assignedTutorId || ''">
                  <option value="">Choisir un tuteur</option>
                  <option *ngFor="let tutor of compatibleTutors(request.subject)" [value]="tutor.id">{{ tutor.firstName }} {{ tutor.lastName }} · {{ tutor.subjects?.join(', ') }}</option>
                </select>
              </td>
              <td class="actions"><button class="btn primary" (click)="assign(request.id, tutorSelect.value)">Assigner</button><button class="btn danger" (click)="remove(request.id)">Retirer</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class AdminAssignmentsComponent {
  requests = this.data.requests;
  tutors = this.data.getUsersByRole('tuteur');
  constructor(public readonly data: AppDataService) {}

  compatibleTutors(subject: string) {
    return this.tutors.filter((tutor) => tutor.status === 'Actif' && (!tutor.subjects?.length || tutor.subjects.includes(subject)));
  }

  assign(requestId: string, tutorId: string): void {
    if (!tutorId) return;
    this.data.assignRequest(requestId, tutorId);
    this.requests = this.data.requests;
  }

  remove(requestId: string): void {
    this.data.removeAssignment(requestId);
    this.requests = this.data.requests;
  }
}
