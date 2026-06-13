import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { BillingDocument } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { BillingPdfService } from '../../core/billing-pdf.service';

@Component({
  selector: 'app-parent-invoices',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Factures</h2>
        <p>
          Factures générées et soumises par l’administrateur.
          Le parent peut consulter le détail, télécharger le PDF et suivre le statut.
        </p>
      </div>
    </div>

    <section class="card">
      <div class="list" *ngIf="invoices.length; else empty">
        <div class="list-item" *ngFor="let invoice of invoices">
          <div>
            <strong>{{ invoice.title }}</strong>

            <div class="meta">
              {{ invoice.period }} ·
              {{ invoice.total | currency:'CAD':'symbol':'1.2-2' }} ·
              générée le {{ invoice.generatedAt }}
            </div>
          </div>

          <div class="actions">
            <app-status-badge [value]="invoice.status" />

            <button class="btn soft" type="button" (click)="selected = invoice">
              Consulter
            </button>

            <button class="btn success" type="button" (click)="downloadPdf(invoice)">
              Télécharger PDF
            </button>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty-state">
          Aucune facture soumise pour l’instant.
        </div>
      </ng-template>
    </section>

    <div class="modal-backdrop" *ngIf="selected" (click)="selected = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div>
            <h2>{{ selected.title }}</h2>
            <p>{{ selected.period }}</p>
          </div>

          <button class="btn ghost" type="button" (click)="selected = undefined">
            Fermer
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Élève</th>
              <th>Matière</th>
              <th>Durée</th>
              <th>Tarif parent</th>
              <th>Montant</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let line of selected.lines">
              <td>{{ line.date }}</td>
              <td>{{ line.studentName }}</td>
              <td>{{ line.subject }}</td>
              <td>{{ line.durationHours }} h</td>
              <td>{{ line.parentRate | currency:'CAD':'symbol':'1.2-2' }}</td>
              <td>{{ line.parentAmount | currency:'CAD':'symbol':'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>

        <h3>Total : {{ selected.total | currency:'CAD':'symbol':'1.2-2' }}</h3>

        <div class="actions" style="margin-top:16px">
          <button class="btn success" type="button" (click)="downloadPdf(selected)">
            Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  `
})
export class ParentInvoicesComponent {
  parent = this.data.getParent();
  invoices = this.data.getBillingDocumentsForParent(this.parent.id);
  selected?: BillingDocument;

  constructor(
    public readonly data: AppDataService,
    private readonly billingPdf: BillingPdfService
  ) {}

  downloadPdf(invoice?: BillingDocument): void {
    if (!invoice) {
      return;
    }

    this.billingPdf.downloadBillingDocument(invoice);
  }
}