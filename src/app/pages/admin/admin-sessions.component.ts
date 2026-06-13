import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { SessionStatus } from '../../core/models';
import { SimpleCalendarComponent } from '../../shared/simple-calendar.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-admin-sessions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SimpleCalendarComponent, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Séances</h2><p>Programmez et gérez toutes les séances. Les séances terminées servent plus tard au calcul des paiements.</p></div></div>

    <div class="grid grid-2">
      <app-simple-calendar [sessions]="sessions" actorLabel="Élève" [showActions]="true" (statusChange)="changeStatus($event.session.id, $event.status)" />
      <section class="card">
        <h3>Programmer une séance</h3>
        <form [formGroup]="form" (ngSubmit)="addSession()" class="form-grid">
          <label>Élève<select formControlName="studentId"><option *ngFor="let student of students" [value]="student.id">{{ student.firstName }} {{ student.lastName }}</option></select></label>
          <label>Tuteur<select formControlName="tutorId"><option *ngFor="let tutor of tutors" [value]="tutor.id">{{ tutor.firstName }} {{ tutor.lastName }}</option></select></label>
          <label>Matière<input formControlName="subject" /></label>
          <label>Date<input type="date" formControlName="date" /></label>
          <label>Heure début<input type="time" formControlName="startTime" /></label>
          <label>Heure fin<input type="time" formControlName="endTime" /></label>
          <label>Mode<select formControlName="mode"><option>En ligne</option><option>Présentiel</option><option>Hybride</option></select></label>
          <label>Statut<select formControlName="status"><option>Programmée</option><option>Terminée</option><option>Annulée</option></select></label>
          <label>Lien de rencontre<input formControlName="meetingLink" /></label>
          <label>Adresse / lieu<input formControlName="address" /></label>
          <label class="full">Note<textarea formControlName="note"></textarea></label>
          <p class="success-message full" *ngIf="message">{{ message }}</p>
          <div class="actions full"><button class="btn primary" type="submit">Programmer</button></div>
        </form>
      </section>
    </div>

    <section class="card" style="margin-top:18px">
      <h3>Détail des séances</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Élève</th><th>Tuteur</th><th>Matière</th><th>Date</th><th>Heure</th><th>Durée</th><th>Mode</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let session of sessions">
              <td>{{ data.getDisplayName(session.studentId) }}</td>
              <td>{{ data.getDisplayName(session.tutorId) }}</td>
              <td>{{ session.subject }}</td>
              <td>{{ session.date }}</td>
              <td>{{ session.startTime }} – {{ session.endTime }}</td>
              <td>{{ data.calculateDurationHours(session) }} h</td>
              <td>{{ session.mode }}</td>
              <td><app-status-badge [value]="session.status" /></td>
              <td class="actions"><button class="btn primary" (click)="changeStatus(session.id, 'Programmée')">Programmer</button><button class="btn success" (click)="changeStatus(session.id, 'Terminée')">Terminer</button><button class="btn danger" (click)="changeStatus(session.id, 'Annulée')">Annuler</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class AdminSessionsComponent {
  sessions = this.data.sessions;
  students = this.data.getUsersByRole('eleve');
  tutors = this.data.getUsersByRole('tuteur');
  message = '';

  form = this.fb.nonNullable.group({
    studentId: [this.students[0]?.id ?? '', Validators.required],
    tutorId: [this.tutors[0]?.id ?? '', Validators.required],
    subject: ['Mathématiques', Validators.required],
    date: ['', Validators.required],
    startTime: ['18:00', Validators.required],
    endTime: ['19:30', Validators.required],
    mode: ['En ligne' as const, Validators.required],
    status: ['Programmée' as const, Validators.required],
    meetingLink: [''],
    address: [''],
    note: ['']
  });

  constructor(private readonly fb: FormBuilder, public readonly data: AppDataService) {}

  addSession(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.data.addSession(this.form.getRawValue());
    this.sessions = this.data.sessions;
    this.message = 'Séance programmée avec succès.';
  }

  changeStatus(id: string, status: SessionStatus): void {
    this.data.updateSessionStatus(id, status);
    this.sessions = this.data.sessions;
  }
}
