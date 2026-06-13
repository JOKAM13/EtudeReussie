import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { AppDocument, User, UserRole } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-admin-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Documents administratifs</h2>
        <p>
          Ajoutez, consultez, recherchez et supprimez les documents des élèves,
          tuteurs, parents et administrateurs.
        </p>
      </div>
    </div>

    <div class="grid grid-3" style="margin-bottom:18px">
      <section class="card">
        <h3>Ajouter un document</h3>

        <form [formGroup]="form" (ngSubmit)="addDocument()" class="form-grid">
          <label class="full">
            Destinataire / propriétaire du document
            <select formControlName="ownerId" (change)="onOwnerChanged()">
              <option value="">Choisir un utilisateur</option>

              <option *ngFor="let user of users" [value]="user.id">
                {{ user.firstName }} {{ user.lastName }} · {{ roleLabel(user.role) }} · {{ user.email }}
              </option>
            </select>
          </label>

          <div class="detail-panel full" *ngIf="selectedOwner">
            <strong>Utilisateur sélectionné</strong><br>
            {{ selectedOwner.firstName }} {{ selectedOwner.lastName }}<br>
            <span class="meta">
              {{ roleLabel(selectedOwner.role) }} · {{ selectedOwner.email }}
            </span>
          </div>

          <label class="full" *ngIf="selectedOwner?.role === 'parent'">
            Élève concerné par le document, optionnel
            <select formControlName="relatedStudentId">
              <option value="">Aucun élève précis</option>

              <option *ngFor="let child of childrenOfSelectedParent" [value]="child.id">
                {{ child.firstName }} {{ child.lastName }} · {{ child.email }}
              </option>
            </select>
          </label>

          <label>
            Titre
            <input
              formControlName="title"
              placeholder="Ex : Facture juin 2026"
            />
          </label>

          <label>
            Catégorie
            <select formControlName="category">
              <option>Document administratif</option>
              <option>Facture</option>
              <option>Preuve de paiement</option>
              <option>Contrat</option>
              <option>Bulletin scolaire</option>
              <option>Exercice</option>
              <option>Spécimen de chèque</option>
              <option>CV</option>
              <option>Diplôme</option>
              <option>Autre</option>
            </select>
          </label>

          <label>
            Visibilité
            <select formControlName="visibility">
              <option>Admin seulement</option>
              <option>Tuteur concerné</option>
              <option>Parent concerné</option>
              <option>Élève concerné</option>
              <option>Partagé</option>
            </select>
          </label>

          <label class="full">
            Fichier
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx"
              (change)="onFileSelected($event)"
            />
          </label>

          <div class="detail-panel full" *ngIf="selectedFile">
            <strong>Fichier choisi</strong><br>
            {{ selectedFile.name }} · {{ selectedFile.size / 1024 / 1024 | number:'1.2-2' }} Mo
          </div>

          <p class="error full" *ngIf="errorMessage">
            {{ errorMessage }}
          </p>

          <p class="success-message full" *ngIf="message">
            {{ message }}
          </p>

          <div class="actions full">
            <button class="btn primary" type="submit">
              Ajouter le document
            </button>
          </div>
        </form>
      </section>

      <section class="card" style="grid-column:span 2">
        <h3>Recherche et filtres</h3>

        <div class="actions">
          <input
            [(ngModel)]="search"
            placeholder="Nom fichier, propriétaire, courriel, catégorie"
            style="max-width:420px"
          />

          <button class="tab" [class.active]="roleFilter==='all'" (click)="roleFilter='all'">
            Tous
          </button>

          <button class="tab" [class.active]="roleFilter==='eleve'" (click)="roleFilter='eleve'">
            Élèves
          </button>

          <button class="tab" [class.active]="roleFilter==='tuteur'" (click)="roleFilter='tuteur'">
            Tuteurs
          </button>

          <button class="tab" [class.active]="roleFilter==='parent'" (click)="roleFilter='parent'">
            Parents
          </button>

          <button class="tab" [class.active]="roleFilter==='admin'" (click)="roleFilter='admin'">
            Admins
          </button>
        </div>

        <div class="actions" style="margin-top:18px">
          <button class="btn danger" type="button" (click)="deleteAllDocuments()">
            Supprimer tous les documents
          </button>

          <button class="btn danger" type="button" (click)="deleteAllHomework()">
            Supprimer tous les devoirs et corrections
          </button>
        </div>

        <p class="success-message" *ngIf="message" style="margin-top:12px">
          {{ message }}
        </p>
      </section>
    </div>

    <section class="card">
      <div class="table-wrap" *ngIf="filteredDocuments.length; else empty">
        <table>
          <thead>
            <tr>
              <th>Nom fichier</th>
              <th>Catégorie</th>
              <th>Propriétaire</th>
              <th>Élève lié</th>
              <th>Tuteur lié</th>
              <th>Visibilité</th>
              <th>Lien</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let doc of filteredDocuments">
              <td>
                <strong>{{ doc.fileName }}</strong><br>
                <span class="meta">{{ doc.title }} · {{ doc.sizeKb }} Ko</span>
              </td>

              <td>{{ doc.category }}</td>

              <td>
                {{ ownerName(doc) }}<br>
                <span class="meta">{{ roleLabel(doc.ownerRole) }}</span>
              </td>

              <td>
                {{ doc.relatedStudentId ? data.getDisplayName(doc.relatedStudentId) : '-' }}
              </td>

              <td>
                {{ doc.relatedTutorId ? data.getDisplayName(doc.relatedTutorId) : '-' }}
              </td>

              <td>{{ doc.visibility }}</td>

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

              <td class="actions">
                <button class="btn ghost" type="button" (click)="selectedDocument = doc">
                  Détail
                </button>

                <button class="btn warning" type="button" (click)="archive(doc.id)">
                  Archiver
                </button>

                <button class="btn danger" type="button" (click)="remove(doc.id)">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #empty>
        <div class="empty-state">
          Aucun document trouvé. Ajoutez un document ou changez vos filtres.
        </div>
      </ng-template>
    </section>

    <div class="modal-backdrop" *ngIf="selectedDocument" (click)="selectedDocument = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div>
            <h2>{{ selectedDocument.title }}</h2>
            <p>{{ selectedDocument.fileName }}</p>
          </div>

          <button class="btn ghost" type="button" (click)="selectedDocument=undefined">
            Fermer
          </button>
        </div>

        <div class="grid grid-2">
          <div class="detail-panel">
            <strong>Propriétaire</strong><br>
            {{ ownerName(selectedDocument) }}
          </div>

          <div class="detail-panel">
            <strong>Rôle propriétaire</strong><br>
            {{ roleLabel(selectedDocument.ownerRole) }}
          </div>

          <div class="detail-panel">
            <strong>Catégorie</strong><br>
            {{ selectedDocument.category }}
          </div>

          <div class="detail-panel">
            <strong>Visibilité</strong><br>
            {{ selectedDocument.visibility }}
          </div>

          <div class="detail-panel">
            <strong>Vérification</strong><br>
            <app-status-badge [value]="selectedDocument.verificationStatus || 'En attente'" />
          </div>

          <div class="detail-panel">
            <strong>Date d’ajout</strong><br>
            {{ selectedDocument.addedAt }}
          </div>

          <div class="detail-panel">
            <strong>Élève lié</strong><br>
            {{ selectedDocument.relatedStudentId ? data.getDisplayName(selectedDocument.relatedStudentId) : '-' }}
          </div>

          <div class="detail-panel">
            <strong>Tuteur lié</strong><br>
            {{ selectedDocument.relatedTutorId ? data.getDisplayName(selectedDocument.relatedTutorId) : '-' }}
          </div>
        </div>

        <div class="actions" style="margin-top:16px">
          <a
            class="btn soft"
            [href]="data.getDocumentDownloadUrl(selectedDocument.id)"
            target="_blank"
            rel="noopener"
          >
            Ouvrir
          </a>

          <a
            class="btn ghost"
            [href]="data.getDocumentDownloadUrl(selectedDocument.id)"
            download
          >
            Télécharger
          </a>

          <button class="btn success" type="button" (click)="verify(selectedDocument.id, 'Validé')">
            Valider
          </button>

          <button class="btn danger" type="button" (click)="verify(selectedDocument.id, 'Refusé')">
            Refuser
          </button>

          <button class="btn danger" type="button" (click)="remove(selectedDocument.id)">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminDocumentsComponent {
  search = '';
  roleFilter: UserRole | 'all' = 'all';
  selectedDocument?: AppDocument;
  selectedFile?: File;
  errorMessage = '';
  message = '';

  users = this.data.users;

form = this.fb.nonNullable.group({
  ownerId: [this.users[0]?.id ?? '', Validators.required],
  relatedStudentId: [''],
  title: ['', Validators.required],
  category: ['Document administratif', Validators.required],
  visibility: ['Admin seulement' as AppDocument['visibility'], Validators.required]
});

  constructor(
    private readonly fb: FormBuilder,
    public readonly data: AppDataService
  ) {
    const firstUser = this.users[0];

    if (firstUser) {
      this.form.patchValue({
        ownerId: firstUser.id
      });

      this.applyDefaultVisibility(firstUser);
    }
  }

  get selectedOwner(): User | undefined {
    const ownerId = this.form.controls.ownerId.value;
    return ownerId ? this.data.getUser(ownerId) : undefined;
  }

  get childrenOfSelectedParent(): User[] {
    const owner = this.selectedOwner;

    if (!owner || owner.role !== 'parent') {
      return [];
    }

    return this.data.getChildrenForParent(owner.id);
  }

  get filteredDocuments(): AppDocument[] {
    const term = this.search.toLowerCase().trim();

    return this.data.documents.filter((doc) => {
      const owner = this.data.getUser(doc.ownerId);
      const student = doc.relatedStudentId ? this.data.getUser(doc.relatedStudentId) : undefined;
      const tutor = doc.relatedTutorId ? this.data.getUser(doc.relatedTutorId) : undefined;

      const roleOk = this.roleFilter === 'all' || doc.ownerRole === this.roleFilter;

      const haystack = `
        ${doc.fileName}
        ${doc.title}
        ${doc.category}
        ${owner?.firstName ?? ''}
        ${owner?.lastName ?? ''}
        ${owner?.email ?? ''}
        ${student?.firstName ?? ''}
        ${student?.lastName ?? ''}
        ${student?.email ?? ''}
        ${tutor?.firstName ?? ''}
        ${tutor?.lastName ?? ''}
        ${tutor?.email ?? ''}
      `.toLowerCase();

      return roleOk && (!term || haystack.includes(term));
    });
  }

  onOwnerChanged(): void {
    const owner = this.selectedOwner;

    this.form.patchValue({
      relatedStudentId: ''
    });

    if (owner) {
      this.applyDefaultVisibility(owner);
    }
  }

  applyDefaultVisibility(owner: User): void {
    if (owner.role === 'parent') {
      this.form.patchValue({ visibility: 'Parent concerné' as AppDocument['visibility'] });
      return;
    }

    if (owner.role === 'eleve') {
      this.form.patchValue({
        visibility: 'Élève concerné' as AppDocument['visibility'],
        relatedStudentId: owner.id
      });
      return;
    }

    if (owner.role === 'tuteur') {
      this.form.patchValue({ visibility: 'Tuteur concerné' as AppDocument['visibility'] });
      return;
    }

    this.form.patchValue({ visibility: 'Admin seulement' as AppDocument['visibility'] });
  }

  onFileSelected(event: Event): void {
    this.errorMessage = '';
    this.message = '';

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedFile = undefined;
      return;
    }

    const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'ppt', 'pptx'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      this.errorMessage = `Format non autorisé : ${file.name}`;
      this.selectedFile = undefined;
      input.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = `Fichier trop lourd : ${file.name}. Maximum 10 Mo.`;
      this.selectedFile = undefined;
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  async addDocument(): Promise<void> {
    this.errorMessage = '';
    this.message = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir les champs obligatoires.';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez choisir un fichier.';
      return;
    }

    const raw = this.form.getRawValue();
    const owner = this.data.getUser(raw.ownerId);

    if (!owner) {
      this.errorMessage = 'Utilisateur introuvable.';
      return;
    }

    const relatedStudentId =
      owner.role === 'eleve'
        ? owner.id
        : raw.relatedStudentId || undefined;

    const relatedTutorId =
      owner.role === 'tuteur'
        ? owner.id
        : undefined;

    const created = await this.data.uploadDocumentWithFile({
      title: raw.title,
      category: raw.category,
      ownerId: owner.id,
      ownerRole: owner.role,
      relatedStudentId,
      relatedTutorId,
      visibility: raw.visibility,
      verificationStatus: 'En attente',
      file: this.selectedFile
    });

    if (!created) {
      this.errorMessage = "Le document n'a pas pu être envoyé au backend.";
      return;
    }

    this.message = 'Document ajouté avec succès.';

    this.form.patchValue({
      title: '',
      category: 'Document administratif',
      relatedStudentId: ''
    });

    this.selectedFile = undefined;
  }

  ownerName(doc: AppDocument): string {
    return this.data.getDisplayName(doc.ownerId);
  }

  roleLabel(role: UserRole): string {
    if (role === 'superuser') {
      return 'Super user';
    }

    if (role === 'eleve') {
      return 'Élève';
    }

    if (role === 'tuteur') {
      return 'Tuteur';
    }

    if (role === 'parent') {
      return 'Parent';
    }

    return 'Admin';
  }

  archive(id: string): void {
    this.data.archiveDocument(id);
    this.message = 'Document archivé.';
  }

  remove(id: string): void {
    const confirmed = confirm(
      'Voulez-vous vraiment supprimer ce document ? Cette action supprimera aussi le fichier local.'
    );

    if (!confirmed) {
      return;
    }

    this.data.deleteDocument(id);
    this.selectedDocument = undefined;
    this.message = 'Document supprimé avec succès.';
  }

  deleteAllDocuments(): void {
    const confirmed = confirm(
      'Voulez-vous vraiment supprimer tous les documents ? Cette action supprimera aussi tous les fichiers locaux.'
    );

    if (!confirmed) {
      return;
    }

    this.data.deleteAllDocuments();
    this.selectedDocument = undefined;
    this.message = 'Tous les documents ont été supprimés.';
  }

  deleteAllHomework(): void {
    const confirmed = confirm(
      'Voulez-vous vraiment supprimer tous les devoirs et toutes les corrections ? Cette action supprimera aussi les fichiers locaux.'
    );

    if (!confirmed) {
      return;
    }

    this.data.deleteAllHomework();
    this.message = 'Tous les devoirs et corrections ont été supprimés.';
  }

  verify(id: string, status: AppDocument['verificationStatus']): void {
    this.data.setDocumentVerification(id, status);
    this.selectedDocument = this.data.allDocuments.find((doc) => doc.id === id);
  }
}