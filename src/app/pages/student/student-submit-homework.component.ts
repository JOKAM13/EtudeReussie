import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';

@Component({
  selector: 'app-student-submit-homework',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-intro">
      <div>
        <h2>Soumettre un devoir</h2>
        <p>Envoyez un travail, un exercice ou un document à votre tuteur.</p>
      </div>
    </div>

    <section class="card">
      <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
        <label>
          Titre du devoir
          <input formControlName="title" placeholder="Ex : Exercices chapitre 3" />
        </label>

        <label>
          Matière
          <input formControlName="subject" placeholder="Ex : Mathématiques" />
        </label>

        <label class="full">
          Description ou question
          <textarea
            formControlName="description"
            rows="5"
            placeholder="Ajoutez une consigne, une question ou une précision pour le tuteur."
          ></textarea>
        </label>

        <label class="full">
          Fichiers du devoir
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            (change)="onFilesSelected($event)"
          />
        </label>

        <div class="full" *ngIf="selectedFiles.length > 0">
          <h3>Fichiers sélectionnés</h3>

          <ul>
            <li *ngFor="let file of selectedFiles">
              {{ file.name }} — {{ file.size / 1024 / 1024 | number:'1.2-2' }} Mo
            </li>
          </ul>
        </div>

        <p class="error full" *ngIf="errorMessage">
          {{ errorMessage }}
        </p>

        <p class="success-message full" *ngIf="message">
          {{ message }}
        </p>

        <div class="actions full">
          <button class="btn primary" type="submit">
            Envoyer le devoir
          </button>
        </div>
      </form>
    </section>
  `
})
export class StudentSubmitHomeworkComponent {
  selectedFiles: File[] = [];
  message = '';
  errorMessage = '';

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    subject: ['', Validators.required],
    description: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly data: AppDataService
  ) {}

  onFilesSelected(event: Event): void {
    this.errorMessage = '';

    const input = event.target as HTMLInputElement;

    this.selectedFiles = input.files ? Array.from(input.files) : [];

    if (this.selectedFiles.length > 3) {
      this.errorMessage = 'Maximum 3 fichiers autorisés.';
      this.selectedFiles = [];
      input.value = '';
      return;
    }

    const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

    for (const file of this.selectedFiles) {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (!extension || !allowedExtensions.includes(extension)) {
        this.errorMessage = `Format non autorisé : ${file.name}`;
        this.selectedFiles = [];
        input.value = '';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = `Fichier trop lourd : ${file.name}. Maximum 10 Mo par fichier.`;
        this.selectedFiles = [];
        input.value = '';
        return;
      }
    }

    const totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > 25 * 1024 * 1024) {
      this.errorMessage = 'La taille totale dépasse 25 Mo.';
      this.selectedFiles = [];
      input.value = '';
    }
  }

  async submit(): Promise<void> {
    this.message = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir le titre et la matière.';
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'Veuillez ajouter au moins un fichier.';
      return;
    }

    const student = this.data.getStudent();

    if (!student.tutorId) {
      this.errorMessage = "Aucun tuteur n'est associé à votre compte.";
      return;
    }

    const raw = this.form.getRawValue();

    const created = await this.data.submitHomeworkWithFiles({
      studentId: student.id,
      tutorId: student.tutorId,
      title: raw.title,
      subject: raw.subject,
      description: raw.description,
      files: this.selectedFiles
    });

    if (!created) {
      this.errorMessage = "Le devoir n'a pas pu être envoyé.";
      return;
    }

    this.message = 'Votre devoir a été soumis avec succès. Votre tuteur pourra maintenant le consulter.';

    this.form.reset({
      title: '',
      subject: '',
      description: ''
    });

    this.selectedFiles = [];
  }
}