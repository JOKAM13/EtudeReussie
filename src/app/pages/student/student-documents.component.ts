import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { DOCUMENT_FILE_RULES, validateFiles } from '../../core/file-validation';

@Component({
  selector: 'app-student-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-intro">
      <div>
        <h2>Documents</h2>
        <p>Cette section contient vos documents personnels : bulletins, notes, exercices, documents administratifs ou fichiers utiles au suivi.</p>
      </div>
    </div>

    <div class="grid grid-2">
<section class="card">
  <h3>Documents</h3>

  <div class="empty-state">
    Les documents sont ajoutés par l’administration.
    Vous pouvez consulter et télécharger les documents disponibles dans votre espace.
  </div>
</section>

      <section class="card">
        <h3>Mes documents</h3>
        <div class="list" *ngIf="documents.length; else empty">
          <div class="list-item" *ngFor="let doc of documents">
            <div>
              <strong>{{ doc.title }}</strong>
              <div class="meta">{{ doc.category }} · {{ doc.addedAt | date:'d MMM yyyy':'':'fr' }} · {{ doc.sizeKb }} Ko</div>
              <p class="meta">{{ doc.fileName }}</p>
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
            
              
              <button class="btn danger" type="button" (click)="deleteDocument(doc.id)">Supprimer</button>
            </div>
          </div>
        </div>
        <ng-template #empty><div class="empty-state">Aucun document disponible. Vous pouvez ajouter vos documents scolaires importants.</div></ng-template>
      </section>
    </div>
  `
})
export class StudentDocumentsComponent {
  documents = this.data.getDocumentsForOwner(this.data.getStudent().id);
  fileName = '';
  fileSizeKb = 0;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['Bulletin', Validators.required]
  });

  constructor(private readonly fb: FormBuilder, public readonly data: AppDataService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const result = validateFiles(input.files, { ...DOCUMENT_FILE_RULES, maxFiles: 1 });
    this.fileName = result.fileNames[0] ?? '';
    this.fileSizeKb = result.totalKb;
    this.errorMessage = result.valid ? '' : result.message;
  }

  addDocument(): void {
    this.successMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Le titre et le type de document sont obligatoires.';
      return;
    }
    if (!this.fileName) {
      this.errorMessage = 'Veuillez choisir un fichier valide.';
      return;
    }
    if (this.errorMessage) return;
    const student = this.data.getStudent();
    const tutor = this.data.getTutorForStudent(student.id);
    const raw = this.form.getRawValue();
    this.data.addDocument({
      title: raw.title,
      category: raw.category,
      ownerId: student.id,
      ownerRole: 'eleve',
      relatedStudentId: student.id,
      relatedTutorId: tutor?.id,
      fileName: this.fileName,
      sizeKb: this.fileSizeKb,
      visibility: 'Partagé'
    });
    this.documents = this.data.getDocumentsForOwner(student.id);
    this.successMessage = 'Document ajouté avec succès.';
    this.form.reset({ title: '', category: 'Bulletin' });
    this.fileName = '';
  }

  deleteDocument(id: string): void {
    this.data.deleteDocument(id);
    this.documents = this.data.getDocumentsForOwner(this.data.getStudent().id);
  }
}
