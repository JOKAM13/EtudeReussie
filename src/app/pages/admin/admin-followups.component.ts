import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { FollowUp } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-admin-followups',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Suivis parents</h2><p>Consultez tous les rapports envoyés ou rédigés par les tuteurs et vérifiez la qualité du suivi pédagogique.</p></div></div>

    <section class="card">
      <div class="actions" style="margin-bottom:16px">
        <input [(ngModel)]="search" placeholder="Rechercher élève, tuteur, matière ou courriel" style="max-width:420px" />
        <select [(ngModel)]="statusFilter" style="max-width:180px"><option value="all">Tous</option><option>Brouillon</option><option>Envoyé</option><option>Archivé</option></select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Élève</th><th>Tuteur</th><th>Matière</th><th>Date séance</th><th>Progrès observés</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let follow of filteredFollowUps">
              <td>{{ data.getDisplayName(follow.studentId) }}</td>
              <td>{{ data.getDisplayName(follow.tutorId) }}</td>
              <td>{{ follow.subject }}</td>
              <td>{{ follow.sessionDate }}</td>
              <td>{{ follow.progress }}</td>
              <td><app-status-badge [value]="follow.status" /></td>
              <td class="actions"><button class="btn soft" (click)="selectedFollowUp = follow">Consulter</button><button class="btn warning" (click)="archive(follow.id)">Archiver</button><button class="btn danger" (click)="remove(follow.id)">Supprimer</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="modal-backdrop" *ngIf="selectedFollowUp" (click)="selectedFollowUp = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro"><div><h2>Détail du suivi</h2><p>{{ data.getDisplayName(selectedFollowUp.studentId) }} · {{ selectedFollowUp.subject }}</p></div><button class="btn ghost" (click)="selectedFollowUp=undefined">Fermer</button></div>
        <div class="grid grid-2">
          <div class="detail-panel"><strong>Parent</strong><br>{{ parentEmail(selectedFollowUp) }}</div>
          <div class="detail-panel"><strong>Date d’envoi</strong><br>{{ selectedFollowUp.sentAt || '-' }}</div>
          <div class="detail-panel"><strong>Notions</strong><br>{{ selectedFollowUp.notions }}</div>
          <div class="detail-panel"><strong>Progrès</strong><br>{{ selectedFollowUp.progress }}</div>
          <div class="detail-panel"><strong>Difficultés</strong><br>{{ selectedFollowUp.difficulties }}</div>
          <div class="detail-panel"><strong>Devoirs</strong><br>{{ selectedFollowUp.homework }}</div>
          <div class="detail-panel"><strong>Compréhension</strong><br>{{ selectedFollowUp.understandingPercent }}%</div>
          <div class="detail-panel"><strong>Participation</strong><br>{{ selectedFollowUp.participation }}</div>
        </div>
      </div>
    </div>
  `
})
export class AdminFollowupsComponent {
  search = '';
  statusFilter: FollowUp['status'] | 'all' = 'all';
  selectedFollowUp?: FollowUp;
  constructor(public readonly data: AppDataService) {}

  get filteredFollowUps(): FollowUp[] {
    const term = this.search.toLowerCase().trim();
    return this.data.allFollowUps.filter((follow) => {
      const statusOk = this.statusFilter === 'all' || follow.status === this.statusFilter;
      const parent = follow.parentId ? this.data.getUser(follow.parentId)?.email : '';
      const haystack = `${this.data.getDisplayName(follow.studentId)} ${this.data.getDisplayName(follow.tutorId)} ${follow.subject} ${parent}`.toLowerCase();
      return statusOk && (!term || haystack.includes(term));
    });
  }

  archive(id: string): void { this.data.archiveFollowUp(id); }
  remove(id: string): void { if (confirm('Voulez-vous vraiment supprimer ce suivi ? Cette action est définitive.')) this.data.deleteFollowUp(id); }
  parentEmail(follow: FollowUp): string { return follow.parentId ? this.data.getUser(follow.parentId)?.email ?? '-' : '-'; }
}
