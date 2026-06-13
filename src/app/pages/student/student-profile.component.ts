import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-intro">
      <div>
        <h2>Mon profil</h2>
        <p>Complétez vos informations personnelles et scolaires. Le parent associé et le tuteur assigné sont affichés en lecture seule.</p>
      </div>
    </div>

    <form [formGroup]="form" (ngSubmit)="saveProfile()" class="grid grid-2">
      <section class="card">
        <h3>Photo de profil</h3>
        <div class="detail-panel">
          <div class="logo-mark" style="width:74px;height:74px;font-size:1.6rem">{{ initials }}</div>
          <label style="margin-top:16px">
            Ajouter une photo optionnelle
            <input type="file" accept="image/*" (change)="onPhotoSelected($event)" />
          </label>
          <p class="helper" *ngIf="photoName">Photo sélectionnée : {{ photoName }}</p>
        </div>
      </section>

      <section class="card">
        <h3>Relations</h3>
        <div class="grid">
          <div class="detail-panel">
            <strong>Parent associé</strong>
            <p class="meta">{{ parentName }}<br>{{ parent?.email }} · {{ parent?.phone }}</p>
          </div>
          <div class="detail-panel">
            <strong>Tuteur assigné</strong>
            <p class="meta">{{ tutorName }}<br>{{ tutor?.email }} · {{ tutor?.subjects?.join(', ') }}</p>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>Informations personnelles</h3>
        <div class="form-grid">
          <label>Prénom<input formControlName="firstName" /></label>
          <label>Nom<input formControlName="lastName" /></label>
          <label>Courriel<input formControlName="email" type="email" /></label>
          <label>Téléphone<input formControlName="phone" /></label>
          <label>Ville<input formControlName="city" /></label>
          <label>Niveau scolaire<select formControlName="level"><option>Primaire</option><option>Secondaire</option><option>Cégep</option><option>Université</option></select></label>
          <label>Année / classe<input formControlName="grade" /></label>
          <label>École / établissement<input formControlName="school" /></label>
        </div>
      </section>

      <section class="card">
        <h3>Informations scolaires</h3>
        <div class="form-grid">
          <label class="full">Matières suivies<input formControlName="subjectsText" placeholder="Mathématiques, Français" /></label>
          <label class="full">Matières où j’ai besoin d’aide<input formControlName="needsText" placeholder="Mathématiques" /></label>
          <label class="full">Objectif de l’accompagnement<textarea formControlName="objective"></textarea></label>
          <label>Mode préféré<select formControlName="preferredMode"><option>En ligne</option><option>Présentiel</option><option>Les deux</option></select></label>
          <label class="full">Difficultés principales<textarea formControlName="difficulties"></textarea></label>
          <label class="full">Disponibilités générales<textarea formControlName="availability"></textarea></label>
        </div>
      </section>

      <section class="card" style="grid-column:1/-1">
        <div class="actions">
          <button class="btn primary" type="submit">Enregistrer le profil</button>
          <span class="success-message" *ngIf="message">{{ message }}</span>
          <span class="error" *ngIf="errorMessage">{{ errorMessage }}</span>
        </div>
      </section>
    </form>
  `
})
export class StudentProfileComponent {
  student = this.data.getStudent();
  parent = this.data.getParentForStudent(this.student.id);
  tutor = this.data.getTutorForStudent(this.student.id);
  photoName = '';
  message = '';
  errorMessage = '';

  form = this.fb.nonNullable.group({
    firstName: [this.student.firstName, Validators.required],
    lastName: [this.student.lastName, Validators.required],
    email: [this.student.email, [Validators.required, Validators.email]],
    phone: [this.student.phone ?? ''],
    city: [this.student.city ?? ''],
    level: [this.student.level ?? 'Secondaire', Validators.required],
    grade: [this.student.grade ?? '', Validators.required],
    school: [this.student.school ?? ''],
    subjectsText: [(this.student.subjects ?? []).join(', ')],
    needsText: [(this.student.needs ?? []).join(', ')],
    objective: [this.student.objective ?? ''],
    preferredMode: [this.student.preferredMode ?? 'En ligne'],
    difficulties: [this.student.difficulties ?? ''],
    availability: [this.student.availability ?? '']
  });

  constructor(private readonly fb: FormBuilder, private readonly data: AppDataService) {}

  get initials(): string { return `${this.student.firstName[0] ?? ''}${this.student.lastName[0] ?? ''}`; }
  get parentName(): string { return this.parent ? `${this.parent.firstName} ${this.parent.lastName}` : 'Aucun parent associé'; }
  get tutorName(): string { return this.tutor ? `${this.tutor.firstName} ${this.tutor.lastName}` : 'Aucun tuteur assigné'; }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.photoName = input.files?.[0]?.name ?? '';
  }

  saveProfile(): void {
    this.message = '';
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir les champs obligatoires du profil.';
      return;
    }
    const raw = this.form.getRawValue();
    this.data.updateUser({
      ...this.student,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      city: raw.city,
      level: raw.level,
      grade: raw.grade,
      school: raw.school,
      subjects: this.toList(raw.subjectsText),
      needs: this.toList(raw.needsText),
      objective: raw.objective,
      preferredMode: raw.preferredMode,
      difficulties: raw.difficulties,
      availability: raw.availability
    });
    this.message = 'Votre profil a été mis à jour avec succès.';
  }

  private toList(value: string): string[] {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}
