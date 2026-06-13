import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-parent-documents',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Documents</h2><p>Documents partagés avec le parent : factures, bulletins, devoirs, preuves et documents administratifs.</p></div></div>
    <section class="card"><div class="table-wrap"><table><thead><tr><th>Titre</th><th>Catégorie</th><th>Propriétaire</th><th>Élève lié</th><th>Fichier</th><th>Visibilité</th></tr></thead><tbody><tr *ngFor="let doc of documents"><td>{{ doc.title }}</td><td>{{ doc.category }}</td><td>{{ data.getDisplayName(doc.ownerId) }}</td><td>{{ doc.relatedStudentId ? data.getDisplayName(doc.relatedStudentId) : '-' }}</td>
    
      <td>
    <a
      class="btn soft"
      [href]="data.getDocumentDownloadUrl(doc.id)"
      target="_blank"
      rel="noopener"
    >
      Ouvrir
    </a>

    <a
      class="btn ghost"
      [href]="data.getDocumentDownloadUrl(doc.id)"
      download
    >
      Télécharger
    </a>
  </td>
    
    <td><app-status-badge [value]="doc.visibility" /></td></tr></tbody></table></div><div class="empty-state" *ngIf="!documents.length">Aucun document disponible.</div></section>
  `
})
export class ParentDocumentsComponent {
  parent = this.data.getParent();
  documents = this.data.getDocumentsForParent(this.parent.id);
  constructor(public readonly data: AppDataService) {}
}
