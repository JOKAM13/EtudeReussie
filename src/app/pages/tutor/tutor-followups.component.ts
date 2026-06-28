import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { FollowUp, User } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-tutor-followups',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Suivis aux parents</h2>
        <p>Sélectionnez un élève assigné. Les courriels du parent et de l’élève sont récupérés automatiquement depuis le profil.</p>
      </div>
    </div>

    <div class="grid grid-2">
      <section class="card">
        <h3>Créer un suivi</h3>
        <form [formGroup]="form" class="form-grid">
          <label class="full">Élève concerné<select formControlName="studentId" (change)="refreshSelectedStudent()"><option *ngFor="let student of students" [value]="student.id">{{ student.firstName }} {{ student.lastName }}</option></select></label>
          <label>Email parent<input [value]="parent?.email || 'Aucun parent associé'" disabled /></label>
          <label>Email élève<input [value]="selectedStudent?.email || ''" disabled /></label>
          <label>Date de séance<input type="date" formControlName="sessionDate" /></label>
          <label>Matière<input formControlName="subject" /></label>
          <label class="full">Notions travaillées<textarea formControlName="notions"></textarea></label>
          <label class="full">Progrès observés<textarea formControlName="progress"></textarea></label>
          <label class="full">Difficultés restantes<textarea formControlName="difficulties"></textarea></label>
          <label class="full">Devoirs à faire<textarea formControlName="homework"></textarea></label>
          <label class="full">Commentaire général<textarea formControlName="generalComment"></textarea></label>
          <label>Compréhension (%)<input type="number" min="0" max="100" formControlName="understandingPercent" /></label>
          <label>Devoirs faits (%)<input type="number" min="0" max="100" formControlName="homeworkPercent" /></label>
          <label>Participation<select formControlName="participation"><option>Faible</option><option>Moyenne</option><option>Bonne</option><option>Excellente</option></select></label>
          <p class="error full" *ngIf="errorMessage">{{ errorMessage }}</p>
          <p class="success-message full" *ngIf="message">{{ message }}</p>
         <div class="actions full">
          <button class="btn primary" type="button" (click)="sendFollowUp()">
            Envoyer au parent
          </button>
        </div>
        </form>
      </section>

      <section class="card">
        <h3>Mes suivis consultables</h3>
        <div class="list" *ngIf="followUps.length; else empty">
          <div class="list-item" *ngFor="let follow of followUps">
            <div>
              <strong>{{ data.getDisplayName(follow.studentId) }} · {{ follow.subject }}</strong>
              <div class="meta">{{ follow.sessionDate | date:'d MMM yyyy':'':'fr' }} · {{ follow.generalComment }}</div>
            </div>
            <div class="actions">
              <app-status-badge [value]="follow.status" />
              <button class="btn soft" type="button" (click)="selectedFollowUp = follow">Consulter</button>
            </div>
          </div>
        </div>
        <ng-template #empty><div class="empty-state">Aucun suivi rédigé.</div></ng-template>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="selectedFollowUp" (click)="selectedFollowUp = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div><h2>Détail du suivi</h2><p>{{ selectedFollowUp.subject }} · {{ selectedFollowUp.sessionDate }}</p></div>
          <button type="button" class="btn ghost" (click)="selectedFollowUp = undefined">Fermer</button>
        </div>
        <div class="grid grid-2">
          <div class="detail-panel"><strong>Élève</strong><br>{{ data.getDisplayName(selectedFollowUp.studentId) }}</div>
          <div class="detail-panel"><strong>Parent</strong><br>{{ selectedFollowUp.parentId ? data.getDisplayName(selectedFollowUp.parentId) : 'Aucun parent associé' }}</div>
          <div class="detail-panel"><strong>Statut</strong><br><app-status-badge [value]="selectedFollowUp.status" /></div>
          <div class="detail-panel"><strong>Participation</strong><br>{{ selectedFollowUp.participation }}</div>
          <div class="detail-panel full"><strong>Notions travaillées</strong><br>{{ selectedFollowUp.notions }}</div>
          <div class="detail-panel full"><strong>Progrès observés</strong><br>{{ selectedFollowUp.progress }}</div>
          <div class="detail-panel full"><strong>Difficultés restantes</strong><br>{{ selectedFollowUp.difficulties || '-' }}</div>
          <div class="detail-panel full"><strong>Devoirs à faire</strong><br>{{ selectedFollowUp.homework || '-' }}</div>
          <div class="detail-panel"><strong>Compréhension</strong><br>{{ selectedFollowUp.understandingPercent }} %</div>
          <div class="detail-panel"><strong>Devoirs faits</strong><br>{{ selectedFollowUp.homeworkPercent }} %</div>
        </div>
      </div>
    </div>
  `
})
export class TutorFollowupsComponent {
  tutor = this.data.getTutor();
  students = this.data.getStudentsForTutor(this.tutor.id);
  selectedStudent?: User = this.students[0];
  parent = this.selectedStudent ? this.data.getParentForStudent(this.selectedStudent.id) : undefined;
  followUps = this.data.getFollowUpsForTutor(this.tutor.id);
  selectedFollowUp?: FollowUp;
  errorMessage = '';
  message = '';

  form = this.fb.nonNullable.group({
    studentId: [this.students[0]?.id ?? '', Validators.required],
    sessionDate: [new Date().toISOString().slice(0, 10), Validators.required],
    subject: ['Mathématiques', Validators.required],
    notions: ['', Validators.required],
    progress: ['', Validators.required],
    difficulties: [''],
    homework: [''],
    generalComment: ['', Validators.required],
    understandingPercent: [75, Validators.required],
    homeworkPercent: [70, Validators.required],
    participation: ['Bonne' as const, Validators.required]
  });

  constructor(private readonly fb: FormBuilder, public readonly data: AppDataService) {}

  refreshSelectedStudent(): void {
    this.selectedStudent = this.data.getUser(this.form.getRawValue().studentId);
    this.parent = this.selectedStudent ? this.data.getParentForStudent(this.selectedStudent.id) : undefined;
  }

  sendFollowUp(): void { this.createFollowUp('Envoyé'); }

  private createFollowUp(status: FollowUp['status']): void {
    this.errorMessage = '';
    this.message = '';
    this.refreshSelectedStudent();
    if (!this.selectedStudent) { this.errorMessage = 'Veuillez sélectionner un élève.'; return; }
    if (status === 'Envoyé' && !this.parent) { this.errorMessage = 'Aucun parent n’est associé à cet élève. Veuillez contacter l’administrateur.'; return; }
    if (this.form.invalid) { this.form.markAllAsTouched(); this.errorMessage = 'Veuillez remplir les champs obligatoires du suivi.'; return; }
    const raw = this.form.getRawValue();
    const created = this.data.createFollowUp({
      studentId: raw.studentId,
      tutorId: this.tutor.id,
      parentId: this.parent?.id,
      subject: raw.subject,
      sessionDate: raw.sessionDate,
      notions: raw.notions,
      progress: raw.progress,
      difficulties: raw.difficulties,
      homework: raw.homework,
      generalComment: raw.generalComment,
      understandingPercent: raw.understandingPercent,
      homeworkPercent: raw.homeworkPercent,
      participation: raw.participation,
      status,
      sentAt: status === 'Envoyé' ? new Date().toISOString().slice(0, 10) : undefined
    });
    this.followUps = this.data.getFollowUpsForTutor(this.tutor.id);
    this.selectedFollowUp = created;
    this.message = status === 'Envoyé' ? 'Le suivi a été envoyé au parent et enregistré. Il est maintenant consultable.' : 'Le suivi a été enregistré comme brouillon. Il est maintenant consultable.';
  }
}
