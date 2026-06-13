import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { DOCUMENT_FILE_RULES, validateFiles } from '../../core/file-validation';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-tutor-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Documents du tuteur</h2>
        <p>Déposez vos documents administratifs ou professionnels : spécimen de chèque, CV, diplôme, contrat ou formulaire administratif.</p>
      </div>
    </div>

    <div class="grid grid-2">
     <section class="card">
      <h3>Documents administratifs</h3>

      <div class="empty-state">
        Les documents sont ajoutés par l’administration.
        Vous pouvez consulter et télécharger les documents disponibles dans votre espace tuteur.
      </div>
  </section>

      <section class="card">
        <h3>Mes documents déposés</h3>
        <div class="list" *ngIf="documents.length; else empty">
          <div class="list-item" *ngFor="let doc of documents">
            <div>
              <strong>{{ doc.title }}</strong>
              <div class="meta">{{ doc.category }} · {{ doc.addedAt | date:'d MMM yyyy':'':'fr' }} · {{ doc.sizeKb }} Ko</div>
              <p class="meta">{{ doc.fileName }}</p>
              <app-status-badge [value]="doc.verificationStatus || 'En attente'" />
              <p class="error" *ngIf="doc.refusalReason">Raison : {{ doc.refusalReason }}</p>
            </div>
            <div class="actions">
             

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

              <button class="btn danger" type="button" [disabled]="doc.verificationStatus === 'Validé'" (click)="deleteDocument(doc.id)">Supprimer</button>
            </div>
          </div>
        </div>
        <ng-template #empty><div class="empty-state">Aucun document disponible. Vous pouvez ajouter vos documents administratifs.</div></ng-template>
      </section>
    </div>
  `
})
export class TutorDocumentsComponent {
  tutor = this.data.getTutor();
  documents = this.data.getDocumentsForOwner(this.tutor.id);
  fileName = '';
  fileSizeKb = 0;
  errorMessage = '';
  message = '';

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['Spécimen de chèque', Validators.required]
  });

  constructor(private readonly fb: FormBuilder, public readonly data: AppDataService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const result = validateFiles(input.files, { ...DOCUMENT_FILE_RULES, maxFiles: 1, acceptedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'] });
    this.fileName = result.fileNames[0] ?? '';
    this.fileSizeKb = result.totalKb;
    this.errorMessage = result.valid ? '' : result.message;
  }

  addDocument(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.errorMessage = 'Le titre et le type sont obligatoires.'; return; }
    if (!this.fileName) { this.errorMessage = 'Veuillez choisir un fichier valide.'; return; }
    if (this.errorMessage) return;
    const raw = this.form.getRawValue();
    this.data.addDocument({ title: raw.title, category: raw.category, ownerId: this.tutor.id, ownerRole: 'tuteur', relatedTutorId: this.tutor.id, fileName: this.fileName, sizeKb: this.fileSizeKb, visibility: 'Admin seulement', verificationStatus: 'En attente' });
    this.documents = this.data.getDocumentsForOwner(this.tutor.id);
    this.message = 'Document ajouté. Il sera vérifié par l’administrateur.';
  }

  deleteDocument(id: string): void {
    this.data.deleteDocument(id);
    this.documents = this.data.getDocumentsForOwner(this.tutor.id);
  }
}
