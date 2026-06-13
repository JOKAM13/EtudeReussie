import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-parent-homework',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Devoirs</h2><p>Suivez les devoirs soumis par vos enfants et les documents corrigés par les tuteurs.</p></div></div>
    <section class="card"><div class="table-wrap"><table><thead><tr><th>Élève</th><th>Titre</th><th>Matière</th><th>Date</th><th>Fichiers</th><th>Retour</th><th>Statut</th></tr></thead><tbody><tr *ngFor="let hw of homework"><td>{{ data.getDisplayName(hw.studentId) }}</td><td>{{ hw.title }}</td><td>{{ hw.subject }}</td><td>{{ hw.submittedAt }}</td>
    
      <td>
    <a
      class="btn soft"
      *ngFor="let file of hw.fileNames"
      [href]="data.getHomeworkSubmissionDownloadUrl(hw.id, file)"
      target="_blank"
      rel="noopener"
    >
      Devoir
    </a>
  </td>
    <td>
  <span *ngIf="!hw.correctedFileNames?.length">
    {{ hw.tutorComment || '-' }}
  </span>

  <a
    class="btn success"
    *ngFor="let file of hw.correctedFileNames"
    [href]="data.getHomeworkCorrectionDownloadUrl(hw.id, file)"
    target="_blank"
    rel="noopener"
  >
    Correction
  </a>
</td>
    
    
    <td><app-status-badge [value]="hw.status" /></td></tr></tbody></table></div><div class="empty-state" *ngIf="!homework.length">Aucun devoir soumis.</div></section>
  `
})
export class ParentHomeworkComponent {
  parent = this.data.getParent();
  homework = this.data.getHomeworkForParent(this.parent.id);
  constructor(public readonly data: AppDataService) {}
}
