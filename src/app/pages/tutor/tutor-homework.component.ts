import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { Homework } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-tutor-homework',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Devoirs soumis</h2>
        <p>
          Ouvrez ou téléchargez les devoirs envoyés par vos élèves,
          déposez une correction, ou envoyez un document/devoir à un élève.
        </p>
      </div>
    </div>

    <section class="card">
      <h3>Envoyer un document/devoir à un élève</h3>

      <div class="empty-state" *ngIf="!students.length">
        Aucun élève assigné à ce tuteur.
        L’administrateur doit d’abord assigner un élève au tuteur.
      </div>

      <form class="form-grid" *ngIf="students.length" (ngSubmit)="sendHomeworkToStudent()">
        <label class="full">
          Élève destinataire
          <select [(ngModel)]="selectedStudentId" name="selectedStudentId" required>
            <option value="">Choisir un élève</option>

            <option *ngFor="let student of students" [value]="student.id">
              {{ student.firstName }} {{ student.lastName }} · {{ student.email }}
            </option>
          </select>
        </label>

        <label>
          Titre
          <input
            [(ngModel)]="newHomeworkTitle"
            name="newHomeworkTitle"
            placeholder="Ex : Exercices pour lundi"
            required
          />
        </label>

        <label>
          Matière
          <input
            [(ngModel)]="newHomeworkSubject"
            name="newHomeworkSubject"
            placeholder="Ex : Mathématiques"
            required
          />
        </label>

        <label class="full">
          Description / consigne
          <textarea
            rows="3"
            [(ngModel)]="newHomeworkDescription"
            name="newHomeworkDescription"
            placeholder="Ex : Voici le document à lire ou les exercices à faire."
          ></textarea>
        </label>

        <label class="full">
          Fichier à envoyer
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            (change)="onTutorHomeworkFilesSelected($event)"
          />
        </label>

        <div class="detail-panel full" *ngIf="selectedTutorHomeworkFiles.length">
          <strong>Fichier(s) sélectionné(s)</strong><br>

          <span *ngFor="let file of selectedTutorHomeworkFiles">
            {{ file.name }} — {{ file.size / 1024 / 1024 | number:'1.2-2' }} Mo<br>
          </span>
        </div>

        <p class="error full" *ngIf="sendHomeworkError">
          {{ sendHomeworkError }}
        </p>

        <p class="success-message full" *ngIf="sendHomeworkMessage">
          {{ sendHomeworkMessage }}
        </p>

        <div class="actions full">
          <button class="btn primary" type="submit">
            Envoyer à l’élève
          </button>
        </div>
      </form>
    </section>

    <section class="card" style="margin-top:18px">
      <div class="table-wrap" *ngIf="homework.length; else empty">
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Matière</th>
              <th>Élève</th>
              <th>Date</th>
              <th>Fichier soumis</th>
              <th>Retour du tuteur</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let item of homework" (click)="openHomework(item)">
              <td>
                <strong>{{ item.title }}</strong>
              </td>

              <td>{{ item.subject }}</td>

              <td>{{ data.getDisplayName(item.studentId) }}</td>

              <td>{{ item.submittedAt | date:'d MMM yyyy':'':'fr' }}</td>

              <td>
                <a
                  class="btn soft"
                  *ngFor="let file of item.fileNames"
                  [href]="data.getHomeworkSubmissionDownloadUrl(item.id, file)"
                  target="_blank"
                  rel="noopener"
                  (click)="$event.stopPropagation()"
                >
                  Télécharger
                </a>
              </td>

              <td>
                <span *ngIf="!item.correctedFileNames?.length">
                  Aucun retour
                </span>

                <a
                  class="btn success"
                  *ngFor="let file of item.correctedFileNames"
                  [href]="data.getHomeworkCorrectionDownloadUrl(item.id, file)"
                  target="_blank"
                  rel="noopener"
                  (click)="$event.stopPropagation()"
                >
                  Correction
                </a>
              </td>

              <td>
                <app-status-badge [value]="item.status" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #empty>
        <div class="empty-state">
          Aucun devoir soumis. Les devoirs envoyés par vos élèves ou par vous-même apparaîtront ici.
        </div>
      </ng-template>
    </section>

    <section class="card" *ngIf="selectedHomework" style="margin-top:18px">
      <div class="actions" style="justify-content:space-between">
        <h3>Détail du devoir</h3>

        <button class="btn ghost" type="button" (click)="closeDetails()">
          Fermer
        </button>
      </div>

      <div class="grid grid-2">
        <div class="detail-panel">
          <strong>Élève</strong><br>
          {{ data.getDisplayName(selectedHomework.studentId) }}
        </div>

        <div class="detail-panel">
          <strong>Matière</strong><br>
          {{ selectedHomework.subject }}
        </div>

        <div class="detail-panel">
          <strong>Statut</strong><br>
          <app-status-badge [value]="selectedHomework.status" />
        </div>

        <div class="detail-panel">
          <strong>Date de soumission</strong><br>
          {{ selectedHomework.submittedAt | date:'d MMM yyyy':'':'fr' }}
        </div>

        <div class="detail-panel full">
          <strong>Description</strong><br>
          {{ selectedHomework.description || 'Aucune description.' }}
        </div>

        <div class="detail-panel full">
          <strong>Fichier soumis</strong><br>

          <div class="actions" style="margin-top:10px">
            <a
              class="btn soft"
              *ngFor="let file of selectedHomework.fileNames"
              [href]="data.getHomeworkSubmissionDownloadUrl(selectedHomework.id, file)"
              target="_blank"
              rel="noopener"
            >
              Télécharger {{ file }}
            </a>
          </div>
        </div>
      </div>

      <section class="card" style="margin-top:16px">
        <h3>Retour du tuteur</h3>

        <label>
          Document corrigé
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            (change)="onCorrectionFilesSelected($event)"
          />
        </label>

        <div *ngIf="selectedCorrectionFiles.length > 0" style="margin-top:10px">
          <strong>Fichiers sélectionnés :</strong>

          <ul>
            <li *ngFor="let file of selectedCorrectionFiles">
              {{ file.name }} — {{ file.size / 1024 / 1024 | number:'1.2-2' }} Mo
            </li>
          </ul>
        </div>

        <label style="margin-top:12px">
          Commentaire
          <textarea
            rows="4"
            [(ngModel)]="correctionComment"
            placeholder="Ajoutez un commentaire pour l'élève ou le parent."
          ></textarea>
        </label>

        <p class="error" *ngIf="correctionError">
          {{ correctionError }}
        </p>

        <p class="success-message" *ngIf="correctionMessage">
          {{ correctionMessage }}
        </p>

        <div class="actions" style="margin-top:12px">
          <button class="btn primary" type="button" (click)="submitCorrection()">
            Déposer la correction
          </button>
        </div>

        <div class="actions" style="margin-top:12px" *ngIf="selectedHomework.correctedFileNames?.length">
          <a
            class="btn success"
            *ngFor="let file of selectedHomework.correctedFileNames"
            [href]="data.getHomeworkCorrectionDownloadUrl(selectedHomework.id, file)"
            target="_blank"
            rel="noopener"
          >
            Télécharger correction
          </a>
        </div>

        <p class="meta" *ngIf="selectedHomework.tutorComment" style="margin-top:12px">
          Commentaire actuel : {{ selectedHomework.tutorComment }}
        </p>
      </section>
    </section>
  `
})
export class TutorHomeworkComponent {
  tutor = this.data.getTutor();
  students = this.data.getStudentsForTutor(this.tutor.id);

  selectedHomework?: Homework;

  selectedStudentId = this.students[0]?.id ?? '';
  newHomeworkTitle = '';
  newHomeworkSubject = 'Mathématiques';
  newHomeworkDescription = '';
  selectedTutorHomeworkFiles: File[] = [];
  sendHomeworkMessage = '';
  sendHomeworkError = '';

  selectedCorrectionFiles: File[] = [];
  correctionComment = '';
  correctionMessage = '';
  correctionError = '';

  constructor(public readonly data: AppDataService) {}

  get homework(): Homework[] {
    return this.data.getHomeworkForTutor(this.tutor.id);
  }

  openHomework(homework: Homework): void {
    this.selectedHomework = homework;
    this.selectedCorrectionFiles = [];
    this.correctionComment = homework.tutorComment ?? '';
    this.correctionMessage = '';
    this.correctionError = '';
  }

  closeDetails(): void {
    this.selectedHomework = undefined;
    this.selectedCorrectionFiles = [];
    this.correctionComment = '';
    this.correctionMessage = '';
    this.correctionError = '';
  }

  onTutorHomeworkFilesSelected(event: Event): void {
    this.sendHomeworkError = '';
    this.sendHomeworkMessage = '';

    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    if (!files.length) {
      this.selectedTutorHomeworkFiles = [];
      return;
    }

    const error = this.validateFiles(files);

    if (error) {
      this.sendHomeworkError = error;
      this.selectedTutorHomeworkFiles = [];
      input.value = '';
      return;
    }

    this.selectedTutorHomeworkFiles = files;
  }

  async sendHomeworkToStudent(): Promise<void> {
    this.sendHomeworkMessage = '';
    this.sendHomeworkError = '';

    if (!this.selectedStudentId) {
      this.sendHomeworkError = 'Veuillez choisir un élève.';
      return;
    }

    if (!this.newHomeworkTitle.trim()) {
      this.sendHomeworkError = 'Veuillez entrer un titre.';
      return;
    }

    if (!this.newHomeworkSubject.trim()) {
      this.sendHomeworkError = 'Veuillez entrer une matière.';
      return;
    }

    if (!this.selectedTutorHomeworkFiles.length) {
      this.sendHomeworkError = 'Veuillez choisir au moins un fichier.';
      return;
    }

    const created = await this.data.submitHomeworkWithFiles({
      studentId: this.selectedStudentId,
      tutorId: this.tutor.id,
      title: this.newHomeworkTitle.trim(),
      subject: this.newHomeworkSubject.trim(),
      description: this.newHomeworkDescription.trim() || 'Document envoyé par le tuteur.',
      files: this.selectedTutorHomeworkFiles
    });

    if (!created) {
      this.sendHomeworkError = "Le document n'a pas pu être envoyé.";
      return;
    }

    this.sendHomeworkMessage = 'Document envoyé avec succès. L’élève peut maintenant le voir dans son espace devoirs.';

    this.newHomeworkTitle = '';
    this.newHomeworkSubject = 'Mathématiques';
    this.newHomeworkDescription = '';
    this.selectedTutorHomeworkFiles = [];
  }

  onCorrectionFilesSelected(event: Event): void {
    this.correctionError = '';

    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    if (!files.length) {
      this.selectedCorrectionFiles = [];
      return;
    }

    const error = this.validateFiles(files);

    if (error) {
      this.correctionError = error;
      this.selectedCorrectionFiles = [];
      input.value = '';
      return;
    }

    this.selectedCorrectionFiles = files;
  }

  async submitCorrection(): Promise<void> {
    this.correctionMessage = '';
    this.correctionError = '';

    if (!this.selectedHomework) {
      this.correctionError = 'Aucun devoir sélectionné.';
      return;
    }

    if (this.selectedCorrectionFiles.length === 0) {
      this.correctionError = 'Veuillez ajouter au moins un fichier corrigé.';
      return;
    }

    const updated = await this.data.returnCorrectedHomeworkWithFiles(
      this.selectedHomework.id,
      this.selectedCorrectionFiles,
      this.correctionComment
    );

    if (!updated) {
      this.correctionError = "Le document corrigé n'a pas pu être envoyé.";
      return;
    }

    this.selectedHomework = updated;
    this.selectedCorrectionFiles = [];
    this.correctionMessage = 'Le document corrigé a été déposé avec succès.';
  }

  private validateFiles(files: File[]): string {
    if (files.length > 3) {
      return 'Maximum 3 fichiers autorisés.';
    }

    const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (!extension || !allowedExtensions.includes(extension)) {
        return `Format non autorisé : ${file.name}`;
      }

      if (file.size > 10 * 1024 * 1024) {
        return `Fichier trop lourd : ${file.name}. Maximum 10 Mo.`;
      }
    }

    return '';
  }
}