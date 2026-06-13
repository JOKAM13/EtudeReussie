import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { BillingDocument, BillingPreview } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { BillingPdfService } from '../../core/billing-pdf.service';

@Component({
  selector: 'app-admin-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Facturation</h2>
        <p>
          Affichez d’abord les deux documents, puis générez les versions consultables.
          Vous pouvez ensuite les modifier, les soumettre ou les supprimer.
        </p>
      </div>
    </div>

    <div class="grid grid-2">
      <section class="card">
        <h3>Paramètres de facturation</h3>

        <form [formGroup]="form" class="form-grid">
          <label>
            Tuteur
            <select formControlName="tutorId" (change)="refreshStudents()">
              <option *ngFor="let tutor of tutors" [value]="tutor.id">
                {{ tutor.firstName }} {{ tutor.lastName }}
              </option>
            </select>
          </label>

          <label>
            Élève
            <select formControlName="studentId" (change)="syncRatesFromSelection()">
              <option value="all">Tous les élèves du tuteur</option>

              <option *ngFor="let student of students" [value]="student.id">
                {{ student.firstName }} {{ student.lastName }}
              </option>
            </select>
          </label>

          <label>
            Date de début
            <input type="date" formControlName="start" />
          </label>

          <label>
            Date de fin
            <input type="date" formControlName="end" />
          </label>

          <label>
            Tarif tuteur ($/h)
            <input type="number" formControlName="tutorRate" />
          </label>

          <label>
            Tarif parent ($/h)
            <input type="number" formControlName="parentRate" />
          </label>

          <label class="full">
            Gabarit prédéfini
            <select formControlName="template">
              <option>Facture standard Étude Réussie</option>
              <option>Facture détaillée avec notes</option>
              <option>Relevé tuteur mensuel</option>
            </select>
          </label>

          <p class="helper full">
            Les tarifs sont préremplis depuis le dossier élève/tuteur quand un élève précis est sélectionné.
            Le backend utilisera ensuite le gabarit choisi pour produire le PDF final.
          </p>

          <p class="error full" *ngIf="errorMessage">
            {{ errorMessage }}
          </p>

          <p class="success-message full" *ngIf="message">
            {{ message }}
          </p>

          <div class="actions full">
            <button class="btn primary" type="button" (click)="displayPreview()">
              Afficher les 2 factures
            </button>

            <button class="btn success" type="button" [disabled]="!preview" (click)="generateDocuments()">
              Générer les documents
            </button>
          </div>
        </form>
      </section>

      <section class="card">
        <h3>Fonctionnement final</h3>

        <div class="detail-panel">
          <strong>1. Afficher</strong><br>
          Prévisualise la facture parent et le relevé tuteur avec les données des séances terminées.
        </div>

        <div class="detail-panel" style="margin-top:12px">
          <strong>2. Générer</strong><br>
          Crée deux documents consultables dans l’historique.
        </div>

        <div class="detail-panel" style="margin-top:12px">
          <strong>3. Modifier / Soumettre</strong><br>
          L’admin peut corriger un document généré, même après soumission, puis le rendre visible au parent ou au tuteur.
        </div>
      </section>
    </div>

    <div class="grid grid-2" style="margin-top:18px" *ngIf="preview; else empty">
      <section class="invoice-preview">
        <h3>Facture destinée au parent</h3>

        <p><strong>Parent :</strong> {{ preview.parentInvoice.parentName }}</p>
        <p><strong>Élève :</strong> {{ preview.parentInvoice.studentName }}</p>
        <p><strong>Tuteur :</strong> {{ preview.parentInvoice.tutorName }}</p>
        <p><strong>Période :</strong> {{ preview.parentInvoice.period }}</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Matière</th>
              <th>Durée</th>
              <th>Tarif</th>
              <th>Montant</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let line of preview.parentInvoice.sessions">
              <td>{{ line.date }}</td>
              <td>{{ line.subject }}</td>
              <td>{{ line.durationHours }} h</td>
              <td>{{ line.parentRate | currency:'CAD':'symbol':'1.2-2' }}</td>
              <td>{{ line.parentAmount | currency:'CAD':'symbol':'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>

        <h3>Total à payer : {{ preview.parentInvoice.total | currency:'CAD':'symbol':'1.2-2' }}</h3>
      </section>

      <section class="invoice-preview">
        <h3>Relevé de paiement tuteur</h3>

        <p><strong>Tuteur :</strong> {{ preview.tutorStatement.tutorName }}</p>
        <p><strong>Période :</strong> {{ preview.tutorStatement.period }}</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Élève</th>
              <th>Matière</th>
              <th>Durée</th>
              <th>Montant</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let line of preview.tutorStatement.sessions">
              <td>{{ line.date }}</td>
              <td>{{ line.studentName }}</td>
              <td>{{ line.subject }}</td>
              <td>{{ line.durationHours }} h</td>
              <td>{{ line.tutorAmount | currency:'CAD':'symbol':'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>

        <p><strong>Total heures :</strong> {{ preview.tutorStatement.totalHours }} h</p>
        <h3>Total à payer au tuteur : {{ preview.tutorStatement.total | currency:'CAD':'symbol':'1.2-2' }}</h3>
      </section>
    </div>

    <ng-template #empty>
      <div class="empty-state" style="margin-top:18px">
        Aucune facture affichée pour l’instant. Cliquez sur “Afficher les 2 factures”.
      </div>
    </ng-template>

    <section class="card" style="margin-top:18px">
      <h3>Documents générés et consultables</h3>

      <div class="table-wrap" *ngIf="documents.length; else noDocuments">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Titre</th>
              <th>Destinataire</th>
              <th>Période</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let doc of documents">
              <td>{{ doc.kind }}</td>

              <td>{{ doc.title }}</td>

              <td>{{ doc.recipientEmail }}</td>

              <td>{{ doc.period }}</td>

              <td>{{ doc.total | currency:'CAD':'symbol':'1.2-2' }}</td>

              <td>
                <app-status-badge [value]="doc.status" />
              </td>

              <td class="actions">
                <button class="btn soft" type="button" (click)="selectedDocument = doc">
                  Consulter
                </button>

                <button class="btn warning" type="button" (click)="openEditDocument(doc)">
                  Modifier
                </button>

                <button
                  class="btn primary"
                  type="button"
                  (click)="submitDocument(doc)"
                  [disabled]="doc.status === 'Soumis'"
                >
                  Soumettre {{ doc.kind === 'Facture parent' ? 'au parent' : 'au tuteur' }}
                </button>

                <button class="btn danger" type="button" (click)="deleteDocument(doc)">
                  Supprimer
                </button>

                <button class="btn success" type="button" (click)="downloadPdf(doc)">
                Télécharger PDF
              </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #noDocuments>
        <div class="empty-state">
          Aucun document généré.
        </div>
      </ng-template>
    </section>

    <div class="modal-backdrop" *ngIf="selectedDocument" (click)="selectedDocument = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div>
            <h2>{{ selectedDocument.title }}</h2>
            <p>{{ selectedDocument.kind }} · {{ selectedDocument.period }}</p>
          </div>

          <button class="btn ghost" type="button" (click)="selectedDocument = undefined">
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
              <th>Montant parent</th>
              <th>Montant tuteur</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let line of selectedDocument.lines">
              <td>{{ line.date }}</td>
              <td>{{ line.studentName }}</td>
              <td>{{ line.subject }}</td>
              <td>{{ line.durationHours }} h</td>
              <td>{{ line.parentAmount | currency:'CAD':'symbol':'1.2-2' }}</td>
              <td>{{ line.tutorAmount | currency:'CAD':'symbol':'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>

        <h3>Total : {{ selectedDocument.total | currency:'CAD':'symbol':'1.2-2' }}</h3>

        <div class="actions" style="margin-top:16px">
        <button class="btn success" type="button" (click)="downloadPdf(selectedDocument)">
          Télécharger PDF
        </button>
</div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="editingDocument" (click)="closeEditDocument()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div>
            <h2>Modifier le document</h2>
            <p>
              Vous pouvez corriger une facture ou un relevé généré, même si le document est déjà soumis.
            </p>
          </div>

          <button class="btn ghost" type="button" (click)="closeEditDocument()">
            Fermer
          </button>
        </div>

        <form [formGroup]="editForm" (ngSubmit)="saveEdit()" class="form-grid">
          <label class="full">
            Titre
            <input formControlName="title" />
          </label>

          <label>
            Destinataire
            <input formControlName="recipientEmail" />
          </label>

          <label>
            Période
            <input formControlName="period" />
          </label>

          <label>
            Total
            <input type="number" step="0.01" formControlName="total" />
          </label>

          <label>
            Statut
            <select formControlName="status">
              <option>Brouillon</option>
              <option>Généré</option>
              <option>Soumis</option>
              <option>Corrigé</option>
              <option>Payé</option>
              <option>Annulé</option>
            </select>
          </label>

          <label class="full">
            Note admin
            <textarea
              rows="3"
              formControlName="note"
              placeholder="Ex : correction demandée par le tuteur, erreur de tarif, séance retirée..."
            ></textarea>
          </label>

          <div class="full">
            <h3>Détail des lignes</h3>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Élève</th>
                    <th>Matière</th>
                    <th>Durée</th>
                    <th>Parent</th>
                    <th>Tuteur</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr *ngFor="let line of editingLines; let i = index">
                    <td>
                      <input [(ngModel)]="line.date" [ngModelOptions]="{ standalone: true }" />
                    </td>

                    <td>
                      <input [(ngModel)]="line.studentName" [ngModelOptions]="{ standalone: true }" />
                    </td>

                    <td>
                      <input [(ngModel)]="line.subject" [ngModelOptions]="{ standalone: true }" />
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.25"
                        [(ngModel)]="line.durationHours"
                        [ngModelOptions]="{ standalone: true }"
                        (ngModelChange)="recalculateEditTotal()"
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.01"
                        [(ngModel)]="line.parentAmount"
                        [ngModelOptions]="{ standalone: true }"
                        (ngModelChange)="recalculateEditTotal()"
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.01"
                        [(ngModel)]="line.tutorAmount"
                        [ngModelOptions]="{ standalone: true }"
                        (ngModelChange)="recalculateEditTotal()"
                      />
                    </td>

                    <td>
                      <button class="btn danger" type="button" (click)="removeEditLine(i)">
                        Retirer
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="actions" style="margin-top:12px">
              <button class="btn soft" type="button" (click)="addEditLine()">
                Ajouter une ligne
              </button>

              <button class="btn ghost" type="button" (click)="recalculateEditTotal()">
                Recalculer le total
              </button>
            </div>
          </div>

          <p class="error full" *ngIf="editError">
            {{ editError }}
          </p>

          <p class="success-message full" *ngIf="editMessage">
            {{ editMessage }}
          </p>

          <div class="actions full">
            <button class="btn primary" type="submit">
              Enregistrer les modifications
            </button>

            <button class="btn danger" type="button" (click)="deleteDocument(editingDocument)">
              Supprimer ce document
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AdminBillingComponent {
  tutors = this.data.getUsersByRole('tuteur');
  students = this.tutors[0] ? this.data.getStudentsForTutor(this.tutors[0].id) : [];
  preview?: BillingPreview;
  selectedDocument?: BillingDocument;
  editingDocument?: BillingDocument;
  editingLines: any[] = [];

  errorMessage = '';
  message = '';
  editMessage = '';
  editError = '';

  form = this.fb.nonNullable.group({
    tutorId: [this.tutors[0]?.id ?? '', Validators.required],
    studentId: ['all', Validators.required],
    start: ['2026-05-01', Validators.required],
    end: ['2026-06-30', Validators.required],
    tutorRate: [30, Validators.required],
    parentRate: [45, Validators.required],
    template: ['Facture standard Étude Réussie', Validators.required]
  });

  editForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    recipientEmail: ['', Validators.required],
    period: ['', Validators.required],
    total: [0, Validators.required],
    status: ['Brouillon', Validators.required],
    note: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    public readonly data: AppDataService,
    private readonly billingPdf: BillingPdfService
  ) {}

  get documents(): BillingDocument[] {
    return this.data.billingDocuments;
  }

downloadPdf(doc: BillingDocument): void {
  this.billingPdf.downloadBillingDocument(doc);
}
  refreshStudents(): void {
    this.students = this.data.getStudentsForTutor(this.form.getRawValue().tutorId);
    this.form.patchValue({ studentId: 'all' });
    this.syncRatesFromSelection();
  }

  syncRatesFromSelection(): void {
    const raw = this.form.getRawValue();
    const tutor = this.data.getUser(raw.tutorId);
    const student = raw.studentId !== 'all' ? this.data.getUser(raw.studentId) : undefined;

    this.form.patchValue(
      {
        tutorRate: student?.tutorHourlyRate ?? tutor?.hourlyRate ?? 30,
        parentRate: student?.parentHourlyRate ?? 45
      },
      { emitEvent: false }
    );
  }

  displayPreview(): void {
    this.errorMessage = '';
    this.message = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const raw = this.form.getRawValue();

    const preview = this.data.generateBillingPreview(
      raw.tutorId,
      raw.studentId,
      raw.start,
      raw.end,
      raw.tutorRate,
      raw.parentRate
    );

    if (!preview) {
      this.preview = undefined;
      this.errorMessage = 'Aucune séance terminée trouvée pour cette période.';
      return;
    }

    this.preview = preview;
    this.message = 'Les deux documents sont affichés. Vous pouvez maintenant les générer.';
  }

  async generateDocuments(): Promise<void> {
  if (!this.preview) {
    return;
  }

  const created = await this.data.generateBillingDocuments(
    this.preview,
    this.form.getRawValue().studentId
  );

  this.message = `${created.length} document(s) généré(s). Ils sont maintenant consultables dans l’historique.`;
}

  submitDocument(doc: BillingDocument): void {
    this.data.submitBillingDocument(doc.id);

    this.message = doc.kind === 'Facture parent'
      ? 'La facture a été soumise au parent.'
      : 'Le relevé a été soumis au tuteur.';
  }

  openEditDocument(doc: BillingDocument): void {
    this.editingDocument = doc;
    this.editMessage = '';
    this.editError = '';

    this.editingLines = (doc.lines ?? []).map((line: any) => ({
      ...line
    }));

    this.editForm.patchValue({
      title: doc.title,
      recipientEmail: doc.recipientEmail,
      period: doc.period,
      total: Number(doc.total ?? 0),
      status: doc.status,
      note: (doc as any).note ?? ''
    });
  }

  saveEdit(): void {
    this.editMessage = '';
    this.editError = '';

    if (!this.editingDocument) {
      this.editError = 'Aucun document sélectionné.';
      return;
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.editError = 'Veuillez remplir les champs obligatoires.';
      return;
    }

    const raw = this.editForm.getRawValue();

    this.data.updateBillingDocument(this.editingDocument.id, {
      title: raw.title,
      recipientEmail: raw.recipientEmail,
      period: raw.period,
      total: Number(raw.total),
      status: raw.status as BillingDocument['status'],
      note: raw.note,
      lines: this.editingLines.map((line) => ({
        ...line,
        durationHours: Number(line.durationHours ?? 0),
        parentAmount: Number(line.parentAmount ?? 0),
        tutorAmount: Number(line.tutorAmount ?? 0)
      }))
    });

    this.editMessage = 'Le document a été modifié avec succès.';

    const refreshed = this.documents.find((doc) => doc.id === this.editingDocument?.id);

    if (refreshed) {
      this.editingDocument = refreshed;
      this.selectedDocument = refreshed;
    }
  }

  deleteDocument(doc?: BillingDocument): void {
    if (!doc) {
      return;
    }

    const confirmed = confirm(
      `Voulez-vous vraiment supprimer "${doc.title}" ? Cette action est définitive.`
    );

    if (!confirmed) {
      return;
    }

    this.data.deleteBillingDocument(doc.id);

    if (this.selectedDocument?.id === doc.id) {
      this.selectedDocument = undefined;
    }

    if (this.editingDocument?.id === doc.id) {
      this.editingDocument = undefined;
    }

    this.message = 'Document supprimé avec succès.';
  }

  closeEditDocument(): void {
    this.editingDocument = undefined;
    this.editingLines = [];
    this.editMessage = '';
    this.editError = '';
  }

  recalculateEditTotal(): void {
    if (!this.editingDocument) {
      return;
    }

    const total = this.editingLines.reduce((sum, line) => {
      if (this.editingDocument?.kind === 'Facture parent') {
        return sum + Number(line.parentAmount ?? 0);
      }

      return sum + Number(line.tutorAmount ?? 0);
    }, 0);

    this.editForm.patchValue({
      total
    });
  }

  addEditLine(): void {
    this.editingLines.push({
      date: '',
      studentName: '',
      subject: '',
      durationHours: 0,
      parentAmount: 0,
      tutorAmount: 0
    });
  }

  removeEditLine(index: number): void {
    this.editingLines.splice(index, 1);
    this.recalculateEditTotal();
  }
}