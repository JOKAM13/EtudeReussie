import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-tutor-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Mon profil tuteur</h2><p>Complétez votre profil pour faciliter l’assignation aux demandes qui correspondent à vos matières, niveaux et disponibilités.</p></div></div>

    <form [formGroup]="form" (ngSubmit)="saveProfile()" class="grid grid-2">
      <section class="card">
        <h3>Informations personnelles</h3>
        <div class="form-grid">
          <label>Prénom<input formControlName="firstName" /></label>
          <label>Nom<input formControlName="lastName" /></label>
          <label>Courriel<input type="email" formControlName="email" /></label>
          <label>Téléphone<input formControlName="phone" /></label>
          <label>Ville<input formControlName="city" /></label>
          <label>Adresse<input formControlName="address" /></label>
          <label class="full">Photo de profil<input type="file" accept="image/*" (change)="onPhotoSelected($event)" /></label>
          <p class="helper full" *ngIf="photoName">Photo sélectionnée : {{ photoName }}</p>
        </div>
      </section>

      <section class="card">
        <h3>Conseils pour améliorer le profil</h3>
        <div class="list">
          <div class="detail-panel">Écrivez une biographie courte, claire et professionnelle.</div>
          <div class="detail-panel">Ajoutez vos matières, niveaux maîtrisés, disponibilités et expérience.</div>
          <div class="detail-panel">Indiquez un tarif cohérent avec votre expérience et le niveau enseigné.</div>
          <div class="detail-panel">Mettez à jour votre profil lorsque vos disponibilités changent.</div>
        </div>
      </section>

      <section class="card">
        <h3>Informations professionnelles</h3>
        <div class="form-grid">
          <label class="full">Biographie courte<textarea formControlName="biography"></textarea></label>
          <label class="full">Matières enseignées<input formControlName="subjectsText" /></label>
          <label>Langues parlées<input formControlName="languagesText" /></label>
          <label>Tarif horaire ($ CAD)<input type="number" formControlName="hourlyRate" /></label>
          <label>Mode de cours<select formControlName="preferredMode"><option>En ligne</option><option>Présentiel</option><option>Les deux</option></select></label>
          <label>Programme / diplôme<input formControlName="diploma" /></label>
          <label class="full">Expérience<textarea formControlName="experience"></textarea></label>
          <label class="full">Niveaux enseignés<input formControlName="teachingLevelsText" /></label>
          <label class="full">Disponibilités générales<textarea formControlName="availability"></textarea></label>
        </div>
      </section>

      <section class="card">
        <h3>Vérification des documents</h3>
        <div class="list">
          <div class="list-item" *ngFor="let doc of documents">
            <div><strong>{{ doc.title }}</strong><p class="meta">{{ doc.category }} · {{ doc.fileName }}</p></div>
            <app-status-badge [value]="doc.verificationStatus || 'En attente'" />
          </div>
          <div class="empty-state" *ngIf="documents.length === 0">Aucun document vérifié pour l’instant.</div>
        </div>
        <p class="helper">Statut du profil visible par l’administrateur : <strong>{{ tutor.profileStatus || 'Actif' }}</strong></p>
      </section>

      <section class="card" style="grid-column:1/-1">
        <div class="actions"><button class="btn primary" type="submit">Enregistrer le profil</button><span class="success-message" *ngIf="message">{{ message }}</span><span class="error" *ngIf="errorMessage">{{ errorMessage }}</span></div>
      </section>
    </form>
  `
})
export class TutorProfileComponent {
  tutor = this.data.getTutor();
  documents = this.data.getDocumentsForOwner(this.tutor.id);
  photoName = '';
  message = '';
  errorMessage = '';

  form = this.fb.nonNullable.group({
    firstName: [this.tutor.firstName, Validators.required],
    lastName: [this.tutor.lastName, Validators.required],
    email: [this.tutor.email, [Validators.required, Validators.email]],
    phone: [this.tutor.phone ?? '', Validators.required],
    city: [this.tutor.city ?? ''],
    address: [this.tutor.address ?? ''],
    biography: [this.tutor.biography ?? ''],
    subjectsText: [(this.tutor.subjects ?? []).join(', '), Validators.required],
    languagesText: [(this.tutor.languages ?? []).join(', ')],
    hourlyRate: [this.tutor.hourlyRate ?? 25, Validators.required],
    preferredMode: [this.tutor.preferredMode ?? 'En ligne', Validators.required],
    diploma: [this.tutor.diploma ?? ''],
    experience: [this.tutor.experience ?? ''],
    teachingLevelsText: [(this.tutor.teachingLevels ?? []).join(', '), Validators.required],
    availability: [this.tutor.availability ?? '']
  });

  constructor(private readonly fb: FormBuilder, private readonly data: AppDataService) {}

  onPhotoSelected(event: Event): void { this.photoName = (event.target as HTMLInputElement).files?.[0]?.name ?? ''; }

  saveProfile(): void {
    this.errorMessage = '';
    this.message = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); this.errorMessage = 'Veuillez remplir les champs obligatoires.'; return; }
    const raw = this.form.getRawValue();
    this.data.updateUser({
      ...this.tutor,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      city: raw.city,
      address: raw.address,
      biography: raw.biography,
      subjects: this.toList(raw.subjectsText),
      languages: this.toList(raw.languagesText),
      hourlyRate: raw.hourlyRate,
      preferredMode: raw.preferredMode,
      diploma: raw.diploma,
      experience: raw.experience,
      teachingLevels: this.toList(raw.teachingLevelsText),
      availability: raw.availability
    });
    this.message = 'Votre profil a été mis à jour avec succès.';
  }

  private toList(value: string): string[] { return value.split(',').map((item) => item.trim()).filter(Boolean); }
}
