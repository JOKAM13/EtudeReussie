import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { SessionStatus } from '../../core/models';
import { SimpleCalendarComponent } from '../../shared/simple-calendar.component';

@Component({
  selector: 'app-tutor-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SimpleCalendarComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Calendrier tuteur</h2>
        <p>
          Visualisez vos séances, ajoutez un cours pour un élève assigné,
          puis marquez la séance comme terminée ou annulée.
        </p>
      </div>
    </div>

    <div class="grid grid-2">
      <app-simple-calendar
        [sessions]="sessions"
        actorLabel="Élève"
        [showActions]="true"
        (statusChange)="changeStatus($event.session.id, $event.status)"
      />

      <section class="card">
        <h3>Ajouter une séance</h3>

        <div class="empty-state" *ngIf="!students.length">
          Aucun élève n’est assigné à ce tuteur.
          L’administrateur doit d’abord assigner un élève au tuteur avant de programmer une séance.
        </div>

        <form
          *ngIf="students.length"
          [formGroup]="form"
          (ngSubmit)="addSession()"
          class="form-grid"
        >
          <label class="full">
            Élève
            <select formControlName="studentId">
              <option value="">Choisir un élève</option>

              <option *ngFor="let student of students" [value]="student.id">
                {{ student.firstName }} {{ student.lastName }}
              </option>
            </select>
          </label>

          <label>
            Matière
            <input formControlName="subject" />
          </label>

          <label>
            Date
            <input type="date" formControlName="date" />
          </label>

          <label>
            Début
            <input type="time" formControlName="startTime" />
          </label>

          <label>
            Fin
            <input type="time" formControlName="endTime" />
          </label>

          <label>
            Mode
            <select formControlName="mode">
              <option>En ligne</option>
              <option>Présentiel</option>
              <option>Hybride</option>
            </select>
          </label>

          <label>
            Lien
            <input formControlName="meetingLink" />
          </label>

          <label>
            Adresse
            <input formControlName="address" />
          </label>

          <label class="full">
            Note
            <textarea formControlName="note"></textarea>
          </label>

          <label>
            Statut
            <select formControlName="status">
              <option>Programmée</option>
              <option>Prévue</option>
              <option>Confirmée</option>
            </select>
          </label>

          <p class="error full" *ngIf="errorMessage">
            {{ errorMessage }}
          </p>

          <p class="success-message full" *ngIf="message">
            {{ message }}
          </p>

          <div class="actions full">
            <button class="btn primary" type="submit">
              Ajouter
            </button>
          </div>
        </form>
      </section>
    </div>
  `
})
export class TutorCalendarComponent {
  tutor = this.data.getTutor();
  students = this.data.getStudentsForTutor(this.tutor.id);
  sessions = this.data.getSessionsForTutor(this.tutor.id);

  message = '';
  errorMessage = '';

  form = this.fb.nonNullable.group({
    studentId: [this.students[0]?.id ?? '', Validators.required],
    subject: ['Mathématiques', Validators.required],
    date: ['', Validators.required],
    startTime: ['18:00', Validators.required],
    endTime: ['19:30', Validators.required],
    mode: ['En ligne' as const, Validators.required],
    meetingLink: [''],
    address: [''],
    note: [''],
    status: ['Programmée' as SessionStatus, Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly data: AppDataService
  ) {}

  async addSession(): Promise<void> {
    this.message = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const raw = this.form.getRawValue();

    if (!raw.studentId) {
      this.errorMessage = 'Veuillez choisir un élève.';
      return;
    }

    const created = await this.data.addSession({
      ...raw,
      tutorId: this.tutor.id
    });

    if (!created) {
      this.errorMessage = 'La séance n’a pas été enregistrée.';
      return;
    }

    this.students = this.data.getStudentsForTutor(this.tutor.id);
    this.sessions = this.data.getSessionsForTutor(this.tutor.id);
    this.message = 'Séance ajoutée avec succès.';
  }

  async changeStatus(sessionId: string, status: SessionStatus): Promise<void> {
    this.message = '';
    this.errorMessage = '';

    await this.data.updateSessionStatus(sessionId, status);

    this.sessions = this.data.getSessionsForTutor(this.tutor.id);
    this.message = 'Statut de la séance modifié.';
  }
}