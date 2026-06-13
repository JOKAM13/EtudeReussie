import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { BillingPdfService } from '../../core/billing-pdf.service';

@Component({
  selector: 'app-student-invoices',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Factures</h2>
        <p>
          Consultez les factures générées par l’administrateur pour votre accompagnement.
          Ces factures peuvent aussi être visibles par votre parent associé.
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
              <th>Élève</th>
              <th>Tuteur</th>
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

              <td>{{ data.getDisplayName(student.id) }}</td>

              <td>{{ invoice.tutorId ? data.getDisplayName(invoice.tutorId) : '-' }}</td>

              <td>{{ totalHours(invoice) }} h</td>

              <td>
                <strong>{{ totalAmount(invoice) | number:'1.2-2' }} $</strong>
              </td>

              <td>
                <app-status-badge [value]="invoice.status || 'Soumise'" />
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
          Aucune facture disponible pour l’instant.
          Les factures soumises par l’administrateur apparaîtront ici.
        </div>
      </ng-template>
    </section>

    <div class="modal-backdrop" *ngIf="selectedInvoice" (click)="selectedInvoice = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div>
            <h2>{{ selectedInvoice.title || titleFromPeriod(selectedInvoice) }}</h2>
            <p>{{ documentType(selectedInvoice) }} · {{ selectedInvoice.status || 'Soumise' }}</p>
          </div>

          <button class="btn ghost" type="button" (click)="selectedInvoice = undefined">
            Fermer
          </button>
        </div>

        <div class="grid grid-2">
          <div class="detail-panel">
            <strong>Élève</strong><br>
            {{ data.getDisplayName(student.id) }}
          </div>

          <div class="detail-panel">
            <strong>Parent associé</strong><br>
            {{ student.parentId ? data.getDisplayName(student.parentId) : 'Aucun parent associé' }}
          </div>

          <div class="detail-panel">
            <strong>Tuteur</strong><br>
            {{ selectedInvoice.tutorId ? data.getDisplayName(selectedInvoice.tutorId) : '-' }}
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
            <strong>Montant total facturé</strong><br>
            {{ totalAmount(selectedInvoice) | number:'1.2-2' }} $
          </div>

          <div class="detail-panel">
            <strong>Date de génération</strong><br>
            {{ generatedDate(selectedInvoice) }}
          </div>

          <div class="detail-panel">
            <strong>Statut</strong><br>
            <app-status-badge [value]="selectedInvoice.status || 'Soumise'" />
          </div>
        </div>

        <section class="card" style="margin-top:16px" *ngIf="lines(selectedInvoice).length">
          <h3>Détail des séances facturées</h3>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tuteur</th>
                  <th>Matière</th>
                  <th>Durée</th>
                  <th>Tarif parent</th>
                  <th>Montant</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let line of lines(selectedInvoice)">
                  <td>{{ lineDate(line) }}</td>
                  <td>{{ lineTutorName(line) }}</td>
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
export class StudentInvoicesComponent {
  student = this.data.getStudent();
  selectedInvoice?: any;

  constructor(public readonly data: AppDataService,
     private readonly pdf: BillingPdfService
  ) {}

  get invoices(): any[] {
    return this.data.getBillingDocumentsForStudent(this.student.id);
  }

  documentType(invoice: any): string {
    return invoice.type
      ?? invoice.documentType
      ?? invoice.kind
      ?? 'Facture parent';
  }

 downloadPdf(invoice?: any): void {
  if (!invoice) {
    return;
  }

  this.pdf.downloadBillingDocument(invoice);
}

  lines(invoice: any): any[] {
    return invoice.lines ?? invoice.items ?? invoice.sessions ?? [];
  }

  titleFromPeriod(invoice: any): string {
    return `Facture parent · ${this.periodText(invoice)}`;
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
      ?? invoice.totalParentAmount
      ?? invoice.parentTotal
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

  lineTutorName(line: any): string {
    return line.tutorName
      ?? line.tutor
      ?? line.tutorFullName
      ?? (line.tutorId ? this.data.getDisplayName(line.tutorId) : '-');
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
      line.parentHourlyRate
      ?? line.parentRate
      ?? line.hourlyRate
      ?? line.rate
      ?? line.tarifParent;

    if (value !== undefined && value !== null && value !== '') {
      return Number(value);
    }

    return 0;
  }

  lineAmount(line: any): number {
    const value =
      line.parentAmount
      ?? line.amountParent
      ?? line.amount
      ?? line.montantParent
      ?? line.total;

    if (value !== undefined && value !== null && value !== '') {
      return Number(value);
    }

    return this.lineHours(line) * this.lineRate(line);
  }
}