import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-tutor-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-intro">
      <div>
        <h2>Mes élèves</h2>
        <p>Consultez vos élèves assignés, leurs besoins scolaires, leurs devoirs, documents, séances et suivis.</p>
      </div>
    </div>

    <div class="grid grid-3" *ngIf="students.length; else empty">
      <article class="card" *ngFor="let student of students">
        <h3>{{ student.firstName }} {{ student.lastName }}</h3>
        <p class="meta">{{ student.level }} · {{ student.grade }} · {{ student.city }}</p>
        <p><strong>Matières :</strong> {{ student.subjects?.join(', ') }}</p>
        <p>{{ student.objective }}</p>
        <div class="detail-panel">
          <strong>Prochaine séance</strong><br>{{ nextSessionText(student.id) }}<br>
          <span class="meta">Devoirs en attente : {{ pendingHomeworkCount(student.id) }} · Dernier suivi : {{ lastFollowUp(student.id) }}</span>
        </div>
        <div class="actions" style="margin-top:14px">
          <button class="btn soft" type="button" (click)="selectedStudent = student">Voir le profil</button>
          <button class="btn primary" type="button" (click)="prepareSession(student)">Ajouter une séance</button>
        </div>
      </article>
    </div>
    <ng-template #empty><div class="empty-state">Aucun élève pour l’instant. Les élèves pris en charge apparaîtront ici après assignation.</div></ng-template>

    <section class="card" *ngIf="selectedStudent" style="margin-top:18px">
      <div class="actions" style="justify-content:space-between"><h3>Détail de {{ selectedStudent.firstName }}</h3><button class="btn ghost" (click)="selectedStudent = undefined">Fermer</button></div>
      <div class="grid grid-3">
        <div class="detail-panel"><strong>École</strong><br>{{ selectedStudent.school }}</div>
        <div class="detail-panel"><strong>Mode préféré</strong><br>{{ selectedStudent.preferredMode }}</div>
        <div class="detail-panel"><strong>Disponibilités</strong><br>{{ selectedStudent.availability }}</div>
        <div class="detail-panel"><strong>Difficultés</strong><br>{{ selectedStudent.difficulties }}</div>
        <div class="detail-panel"><strong>Objectif</strong><br>{{ selectedStudent.objective }}</div>
        <div class="detail-panel"><strong>Parent</strong><br>{{ parentInfo(selectedStudent.id) }}</div>
      </div>
    </section>

    <section class="card" *ngIf="sessionStudent" style="margin-top:18px">
      <h3>Ajouter une séance pour {{ sessionStudent.firstName }}</h3>
      <form [formGroup]="sessionForm" (ngSubmit)="addSession()" class="form-grid">
        <label>Élève<input [value]="sessionStudent.firstName + ' ' + sessionStudent.lastName" disabled /></label>
        <label>Matière<input formControlName="subject" /></label>
        <label>Date<input type="date" formControlName="date" /></label>
        <label>Heure de début<input type="time" formControlName="startTime" /></label>
        <label>Heure de fin<input type="time" formControlName="endTime" /></label>
        <label>Mode<select formControlName="mode"><option>En ligne</option><option>Présentiel</option><option>Hybride</option></select></label>
        <label>Lien de rencontre<input formControlName="meetingLink" /></label>
        <label>Adresse / lieu<input formControlName="address" /></label>
        <label class="full">Note<textarea formControlName="note"></textarea></label>
        <label>Statut<select formControlName="status"><option>Programmée</option><option>Prévue</option><option>Confirmée</option></select></label>
        <p class="success-message full" *ngIf="message">{{ message }}</p>
        <div class="actions full"><button class="btn primary" type="submit">Créer la séance</button><button class="btn ghost" type="button" (click)="sessionStudent = undefined">Annuler</button></div>
      </form>
    </section>
  `
})
export class TutorStudentsComponent {
  tutor = this.data.getTutor();
  students = this.data.getStudentsForTutor(this.tutor.id);
  selectedStudent?: User;
  sessionStudent?: User;
  message = '';

  sessionForm = this.fb.nonNullable.group({
    subject: ['', Validators.required],
    date: ['', Validators.required],
    startTime: ['18:00', Validators.required],
    endTime: ['19:30', Validators.required],
    mode: ['En ligne' as const, Validators.required],
    meetingLink: [''],
    address: [''],
    note: [''],
    status: ['Programmée' as const, Validators.required]
  });

  constructor(private readonly fb: FormBuilder, private readonly data: AppDataService) {}

  prepareSession(student: User): void {
    this.sessionStudent = student;
    this.message = '';
    this.sessionForm.patchValue({ subject: student.subjects?.[0] ?? '' });
  }

  addSession(): void {
    if (!this.sessionStudent || this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }
    const raw = this.sessionForm.getRawValue();
    this.data.addSession({ ...raw, studentId: this.sessionStudent.id, tutorId: this.tutor.id });
    this.message = 'La séance a été ajoutée dans le calendrier du tuteur, de l’élève et du parent.';
  }

  nextSessionText(studentId: string): string {
    const next = this.data.getUpcomingSessions(this.data.getSessionsForStudent(studentId), 1)[0];
    return next ? `${next.date} · ${next.startTime}` : 'Aucune séance programmée';
  }

  pendingHomeworkCount(studentId: string): number {
    return this.data.getHomeworkForStudent(studentId).filter((homework) => homework.status !== 'Corrigé').length;
  }

  lastFollowUp(studentId: string): string {
    const follow = this.data.getFollowUpsForStudent(studentId)[0];
    return follow ? follow.sessionDate : 'Aucun';
  }

  parentInfo(studentId: string): string {
    const parent = this.data.getParentForStudent(studentId);
    return parent ? `${parent.firstName} ${parent.lastName} · ${parent.email}` : 'Aucun parent associé';
  }
}
