import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';

@Component({
  selector: 'app-parent-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-intro"><div><h2>Mon profil</h2><p>Informations personnelles du parent et préférences de communication.</p></div></div>
    <section class="card profile-card">
      <div class="profile-header"><img *ngIf="parent.avatarUrl" [src]="parent.avatarUrl" [alt]="parent.firstName" /><div><h3>{{ parent.firstName }} {{ parent.lastName }}</h3><p class="meta">{{ parent.email }}</p></div></div>
      <form [formGroup]="form" (ngSubmit)="save()" class="form-grid" style="margin-top:18px">
        <label>Prénom<input formControlName="firstName" /></label><label>Nom<input formControlName="lastName" /></label><label>Téléphone<input formControlName="phone" /></label><label>Ville<input formControlName="city" /></label><label class="full">Adresse<input formControlName="address" /></label><label>Mode de communication préféré<select formControlName="communicationPreference"><option>Courriel</option><option>Téléphone</option><option>SMS</option><option>WhatsApp</option></select></label><label>Disponibilités pour être contacté<textarea formControlName="availability"></textarea></label><p class="success-message full" *ngIf="message">{{ message }}</p><div class="actions full"><button class="btn primary" type="submit">Enregistrer le profil</button></div>
      </form>
    </section>
  `
})
export class ParentProfileComponent {
  parent = this.data.getParent();
  message = '';
  form = this.fb.nonNullable.group({ firstName: [this.parent.firstName], lastName: [this.parent.lastName], phone: [this.parent.phone ?? ''], city: [this.parent.city ?? ''], address: [this.parent.address ?? ''], communicationPreference: [this.parent.communicationPreference ?? 'Courriel'], availability: [this.parent.availability ?? ''] });
  constructor(private readonly fb: FormBuilder, private readonly data: AppDataService) {}
  save(): void { this.data.updateUser({ ...this.parent, ...this.form.getRawValue() }); this.message = 'Votre profil a été mis à jour avec succès.'; }
}
