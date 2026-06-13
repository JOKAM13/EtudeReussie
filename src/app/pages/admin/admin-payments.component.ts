import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { PaymentStatus } from '../../core/models';
import { StatCardComponent } from '../../shared/stat-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatCardComponent, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Paiements</h2><p>Suivez les paiements reçus, en attente, les montants encaissés et les montants à recevoir.</p></div></div>

    <div class="grid grid-4">
      <app-stat-card title="Payés" [value]="paidPayments.length" [subtitle]="paidTotal + ' $ encaissés'" icon="✅" />
      <app-stat-card title="En attente" [value]="pendingPayments.length" [subtitle]="pendingTotal + ' $ à recevoir'" icon="⏳" />
      <app-stat-card title="Total encaissé" [value]="paidTotal + ' $'" subtitle="Montants payés" icon="💰" />
      <app-stat-card title="Total à recevoir" [value]="pendingTotal + ' $'" subtitle="Montants en attente" icon="📥" />
    </div>

    <div class="grid grid-2" style="margin-top:18px">
      <section class="card">
        <h3>Nouveau paiement</h3>
        <form [formGroup]="form" (ngSubmit)="createPayment()" class="form-grid">
          <label>Email utilisateur<input formControlName="userEmail" /></label>
          <label>Type<input formControlName="type" /></label>
          <label>Montant<input type="number" formControlName="amount" /></label>
          <label>Statut<select formControlName="status"><option>Payé</option><option>En attente</option></select></label>
          <label>Date paiement<input type="date" formControlName="date" /></label>
          <label>Référence<input formControlName="reference" /></label>
          <div class="actions full"><button class="btn primary" type="submit">Créer</button></div>
        </form>
      </section>

      <section class="card">
        <h3>Générer par période</h3>
        <form [formGroup]="periodForm" (ngSubmit)="generateByPeriod()" class="form-grid">
          <label>Du<input type="date" formControlName="start" /></label>
          <label>Au<input type="date" formControlName="end" /></label>
          <p class="helper full">Le tarif est récupéré automatiquement dans le dossier de chaque élève. Aucun tarif manuel n’est demandé ici.</p>
          <div class="actions full"><button class="btn soft" type="submit">Calculer</button></div>
          <p class="success-message full" *ngIf="message">{{ message }}</p>
        </form>
      </section>
    </div>

    <section class="card" style="margin-top:18px">
      <div class="actions" style="margin-bottom:16px">
        <input [(ngModel)]="search" placeholder="Rechercher par courriel, nom ou référence" style="max-width:420px" />
        <select [(ngModel)]="statusFilter" style="max-width:180px"><option value="all">Tous les statuts</option><option>Payé</option><option>En attente</option></select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Payé</th><th>Utilisateur</th><th>Type</th><th>Montant</th><th>Date</th><th>Référence</th><th>Statut</th><th>Action</th></tr></thead>
          <tbody>
            <tr *ngFor="let payment of filteredPayments">
              <td>{{ payment.status === 'Payé' ? 'Oui' : 'Non' }}</td>
              <td>{{ payment.userEmail }}</td>
              <td>{{ payment.type }}</td>
              <td>{{ payment.amount | currency:'CAD':'symbol':'1.2-2' }}</td>
              <td>{{ payment.date }}</td>
              <td>{{ payment.reference || '-' }}</td>
              <td><app-status-badge [value]="payment.status" /></td>
              <td class="actions"><button class="btn success" (click)="setStatus(payment.id, 'Payé')">Payé</button><button class="btn warning" (click)="setStatus(payment.id, 'En attente')">En attente</button><button class="btn danger" (click)="remove(payment.id)">Supprimer</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class AdminPaymentsComponent {
  search = '';
  statusFilter: PaymentStatus | 'all' = 'all';
  message = '';

  form = this.fb.nonNullable.group({ userEmail: ['', [Validators.required, Validators.email]], type: ['Tutorat', Validators.required], amount: [0, Validators.required], status: ['En attente' as PaymentStatus, Validators.required], date: [new Date().toISOString().slice(0, 10), Validators.required], reference: [''] });
  periodForm = this.fb.nonNullable.group({ start: ['2026-05-01', Validators.required], end: ['2026-06-30', Validators.required] });

  constructor(private readonly fb: FormBuilder, public readonly data: AppDataService) {}

  get payments() { return this.data.payments; }
  get paidPayments() { return this.payments.filter((payment) => payment.status === 'Payé'); }
  get pendingPayments() { return this.payments.filter((payment) => payment.status === 'En attente'); }
  get paidTotal() { return this.paidPayments.reduce((sum, payment) => sum + payment.amount, 0); }
  get pendingTotal() { return this.pendingPayments.reduce((sum, payment) => sum + payment.amount, 0); }
  get filteredPayments() {
    const term = this.search.toLowerCase().trim();
    return this.payments.filter((payment) => (this.statusFilter === 'all' || payment.status === this.statusFilter) && (!term || `${payment.userEmail} ${payment.reference ?? ''}`.toLowerCase().includes(term)));
  }

  createPayment(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.data.addPayment(this.form.getRawValue()); }
  generateByPeriod(): void { if (this.periodForm.invalid) return; const raw = this.periodForm.getRawValue(); const created = this.data.generatePaymentsByPeriod(raw.start, raw.end); this.message = `${created.length} paiement(s) généré(s) en attente avec les tarifs enregistrés dans les dossiers élèves.`; }
  setStatus(id: string, status: PaymentStatus): void { this.data.setPaymentStatus(id, status); }
  remove(id: string): void { if (confirm('Voulez-vous vraiment supprimer ce paiement ? Cette action est définitive.')) this.data.deletePayment(id); }
}
