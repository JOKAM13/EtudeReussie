import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { BillingPdfService } from '../../core/billing-pdf.service';

@Component({
  selector: 'app-tutor-invoices',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Factures / Relevés</h2>
        <p>
          Consultez les relevés de paiement et documents financiers générés par l’administrateur.
        </p>
      </div>
    </div>

    <section class="card">
      <div class="table-wrap" *ngIf="invoices.length; else empty">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Période</th>
              <th>Tuteur</th>
              <th>Élève</th>
              <th>Heures</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let invoice of invoices">
              <td>
                <strong>{{ documentType(invoice) }}</strong><br>
                <span class="meta">{{ invoice.title || titleFromPeriod(invoice) }}</span>
              </td>

              <td>{{ periodText(invoice) }}</td>

              <td>{{ data.getDisplayName(tutor.id) }}</td>

              <td>{{ invoice.studentId ? data.getDisplayName(invoice.studentId) : 'Tous les élèves' }}</td>

              <td>{{ totalHours(invoice) }} h</td>

              <td>
                <strong>{{ totalAmount(invoice) | number:'1.2-2' }} $</strong>
              </td>

              <td>
                <app-status-badge [value]="invoice.status || 'Soumis'" />
              </td>

              <td>
                <button class="btn soft" type="button" (click)="selectedInvoice = invoice">
                  Voir détail
                </button>

                <button class="btn success" type="button" (click)="downloadPdf(invoice)">
                  Télécharger PDF
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #empty>
        <div class="empty-state">
          Aucun relevé ou facture disponible pour l’instant.
          Les documents soumis par l’administrateur apparaîtront ici.
        </div>
      </ng-template>
    </section>

    <div class="modal-backdrop" *ngIf="selectedInvoice" (click)="selectedInvoice = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div>
            <h2>{{ selectedInvoice.title || titleFromPeriod(selectedInvoice) }}</h2>
            <p>{{ documentType(selectedInvoice) }} · {{ selectedInvoice.status || 'Soumis' }}</p>
          </div>

          <button class="btn ghost" type="button" (click)="selectedInvoice = undefined">
            Fermer
          </button>
        </div>

        <div class="grid grid-2">
          <div class="detail-panel">
            <strong>Tuteur</strong><br>
            {{ data.getDisplayName(tutor.id) }}
          </div>

          <div class="detail-panel">
            <strong>Élève</strong><br>
            {{ selectedInvoice.studentId ? data.getDisplayName(selectedInvoice.studentId) : 'Tous les élèves' }}
          </div>

          <div class="detail-panel">
            <strong>Période</strong><br>
            {{ periodText(selectedInvoice) }}
          </div>

          <div class="detail-panel">
            <strong>Total heures</strong><br>
            {{ totalHours(selectedInvoice) }} h
          </div>

          <div class="detail-panel">
            <strong>Montant total à payer</strong><br>
            {{ totalAmount(selectedInvoice) | number:'1.2-2' }} $
          </div>

          <div class="detail-panel">
            <strong>Date de génération</strong><br>
            {{ generatedDate(selectedInvoice) }}
          </div>
        </div>

        <section class="card" style="margin-top:16px" *ngIf="lines(selectedInvoice).length">
          <h3>Détail des séances</h3>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Élève</th>
                  <th>Matière</th>
                  <th>Durée</th>
                  <th>Tarif tuteur</th>
                  <th>Montant</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let line of lines(selectedInvoice)">
                  <td>{{ lineDate(line) }}</td>
                  <td>{{ lineStudentName(line) }}</td>
                  <td>{{ lineSubject(line) }}</td>
                  <td>{{ lineHours(line) }} h</td>
                  <td>{{ lineRate(line) | number:'1.2-2' }} $/h</td>
                  <td>{{ lineAmount(line) | number:'1.2-2' }} $</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="actions" style="margin-top:16px">
          <button class="btn success" type="button" (click)="downloadPdf(selectedInvoice)">
            Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  `
})
export class TutorInvoicesComponent {
  tutor = this.data.getTutor();
  selectedInvoice?: any;

  constructor(
    public readonly data: AppDataService,
    private readonly billingPdf: BillingPdfService
  ) {}

  get invoices(): any[] {
    return this.data.getBillingDocumentsForTutor(this.tutor.id);
  }

  documentType(invoice: any): string {
    return invoice.type
      ?? invoice.documentType
      ?? invoice.kind
      ?? 'Relevé tuteur';
  }

  downloadPdf(invoice?: any): void {
    if (!invoice) {
      return;
    }

    this.billingPdf.downloadBillingDocument(invoice);
  }

  lines(invoice: any): any[] {
    return invoice.lines ?? invoice.items ?? invoice.sessions ?? [];
  }

  titleFromPeriod(invoice: any): string {
    return `Relevé tuteur · ${this.periodText(invoice)}`;
  }

  periodText(invoice: any): string {
    const start =
      invoice.periodStart
      ?? invoice.startDate
      ?? invoice.from
      ?? invoice.dateStart
      ?? this.extractPeriodFromTitle(invoice.title).start;

    const end =
      invoice.periodEnd
      ?? invoice.endDate
      ?? invoice.to
      ?? invoice.dateEnd
      ?? this.extractPeriodFromTitle(invoice.title).end;

    return `${start || '-'} au ${end || '-'}`;
  }

  extractPeriodFromTitle(title?: string): { start?: string; end?: string } {
    if (!title) {
      return {};
    }

    const match = title.match(/(\d{4}-\d{2}-\d{2})\s+au\s+(\d{4}-\d{2}-\d{2})/);

    if (!match) {
      return {};
    }

    return {
      start: match[1],
      end: match[2]
    };
  }

  generatedDate(invoice: any): string {
    return invoice.generatedAt
      ?? invoice.createdAt
      ?? invoice.date
      ?? '-';
  }

  totalHours(invoice: any): number {
    const existing =
      invoice.totalHours
      ?? invoice.hoursTotal
      ?? invoice.totalDurationHours;

    if (existing !== undefined && existing !== null && existing !== '') {
      return Number(existing);
    }

    return this.lines(invoice)
      .reduce((sum, line) => sum + this.lineHours(line), 0);
  }

  totalAmount(invoice: any): number {
    const existing =
      invoice.totalAmount
      ?? invoice.totalTutorAmount
      ?? invoice.tutorTotal
      ?? invoice.amount
      ?? invoice.amountToPay;

    if (existing !== undefined && existing !== null && existing !== '') {
      return Number(existing);
    }

    return this.lines(invoice)
      .reduce((sum, line) => sum + this.lineAmount(line), 0);
  }

  lineDate(line: any): string {
    return line.date
      ?? line.sessionDate
      ?? line.day
      ?? '-';
  }

  lineStudentName(line: any): string {
    return line.studentName
      ?? line.student
      ?? line.studentFullName
      ?? (line.studentId ? this.data.getDisplayName(line.studentId) : '-');
  }

  lineSubject(line: any): string {
    return line.subject
      ?? line.matiere
      ?? line.course
      ?? '-';
  }

  lineHours(line: any): number {
    const value =
      line.durationHours
      ?? line.hours
      ?? line.duration
      ?? line.totalHours;

    if (value !== undefined && value !== null && value !== '') {
      return Number(value);
    }

    return 0;
  }

  lineRate(line: any): number {
    const value =
      line.tutorHourlyRate
      ?? line.tutorRate
      ?? line.hourlyRate
      ?? line.rate
      ?? line.tarifTuteur;

    if (value !== undefined && value !== null && value !== '') {
      return Number(value);
    }

    return 0;
  }

  lineAmount(line: any): number {
    const value =
      line.tutorAmount
      ?? line.amountTutor
      ?? line.amount
      ?? line.montantTuteur
      ?? line.total;

    if (value !== undefined && value !== null && value !== '') {
      return Number(value);
    }

    return this.lineHours(line) * this.lineRate(line);
  }
}