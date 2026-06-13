import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppDataService } from './app-data.service';

@Injectable({
  providedIn: 'root'
})
export class BillingPdfService {
  constructor(private readonly data: AppDataService) {}

  downloadBillingDocument(document: any): void {
    const pdf = new jsPDF();

    const documentTitle = document.title || 'Document de facturation';
    const documentKind = document.kind || document.type || document.documentType || 'Facture';
    const period = document.period || this.periodText(document);
    const total = Number(document.total ?? document.totalAmount ?? document.amount ?? 0);

    pdf.setFontSize(18);
    pdf.text('Étude Réussie', 14, 18);

    pdf.setFontSize(13);
    pdf.text(documentKind, 14, 28);

    pdf.setFontSize(11);
    pdf.text(`Titre : ${documentTitle}`, 14, 40);
    pdf.text(`Période : ${period}`, 14, 48);
    pdf.text(`Statut : ${document.status || 'Généré'}`, 14, 56);

    const recipientName = this.getRecipientName(document);
    const recipientEmail = document.recipientEmail || '-';

    pdf.text(`Destinataire : ${recipientName}`, 14, 66);
    pdf.text(`Courriel : ${recipientEmail}`, 14, 74);

    if (document.studentId) {
      pdf.text(`Élève : ${this.data.getDisplayName(document.studentId)}`, 14, 82);
    }

    if (document.tutorId) {
      pdf.text(`Tuteur : ${this.data.getDisplayName(document.tutorId)}`, 14, 90);
    }

    const lines = document.lines ?? [];

    const tableBody = lines.map((line: any) => {
      const amount = this.lineAmount(document, line);

      return [
        line.date || '-',
        line.studentName || this.displayName(line.studentId) || '-',
        line.subject || '-',
        `${Number(line.durationHours ?? line.hours ?? 0).toFixed(2)} h`,
        `${this.lineRate(document, line).toFixed(2)} $/h`,
        `${amount.toFixed(2)} $`
      ];
    });

    autoTable(pdf, {
      startY: document.tutorId && document.studentId ? 100 : 92,
      head: [['Date', 'Élève', 'Matière', 'Durée', 'Tarif', 'Montant']],
      body: tableBody.length ? tableBody : [['-', '-', '-', '-', '-', 'Aucune ligne']],
      styles: {
        fontSize: 9
      },
      headStyles: {
        fillColor: [30, 64, 175]
      }
    });

    const finalY = (pdf as any).lastAutoTable?.finalY ?? 120;

    pdf.setFontSize(12);
    pdf.text(`Total : ${total.toFixed(2)} $ CAD`, 14, finalY + 14);

    if (document.note) {
      pdf.setFontSize(10);
      pdf.text(`Note : ${document.note}`, 14, finalY + 24, {
        maxWidth: 180
      });
    }

    pdf.setFontSize(9);
    pdf.text(
      `Document généré le ${new Date().toLocaleDateString('fr-CA')}`,
      14,
      285
    );

    const fileName = this.cleanFileName(`${documentKind}-${documentTitle}.pdf`);
    pdf.save(fileName);
  }

  private getRecipientName(document: any): string {
    if (document.recipientId) {
      return this.data.getDisplayName(document.recipientId);
    }

    return document.recipientName || document.parentName || document.tutorName || '-';
  }

  private periodText(document: any): string {
    const start =
      document.periodStart ??
      document.startDate ??
      document.from ??
      '-';

    const end =
      document.periodEnd ??
      document.endDate ??
      document.to ??
      '-';

    return `${start} au ${end}`;
  }

  private displayName(id?: string): string {
    if (!id) {
      return '-';
    }

    return this.data.getDisplayName(id);
  }

  private lineRate(document: any, line: any): number {
    if (document.kind === 'Relevé tuteur') {
      return Number(
        line.tutorHourlyRate ??
        line.tutorRate ??
        line.hourlyRate ??
        line.rate ??
        0
      );
    }

    return Number(
      line.parentHourlyRate ??
      line.parentRate ??
      line.hourlyRate ??
      line.rate ??
      0
    );
  }

  private lineAmount(document: any, line: any): number {
    if (document.kind === 'Relevé tuteur') {
      const amount = line.tutorAmount ?? line.amountTutor ?? line.amount;

      if (amount !== undefined && amount !== null) {
        return Number(amount);
      }
    } else {
      const amount = line.parentAmount ?? line.amountParent ?? line.amount;

      if (amount !== undefined && amount !== null) {
        return Number(amount);
      }
    }

    const hours = Number(line.durationHours ?? line.hours ?? 0);
    const rate = this.lineRate(document, line);

    return hours * rate;
  }

  private cleanFileName(value: string): string {
    return value
      .replace(/[<>:"/\\|?*]+/g, '-')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
}