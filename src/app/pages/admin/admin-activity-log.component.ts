import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppDataService } from '../../core/app-data.service';
import { ActivityLog } from '../../core/models';

@Component({
  selector: 'app-admin-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-intro">
      <div>
        <h2>Journal d’activité</h2>
        <p>
          Consultez les actions importantes effectuées sur la plateforme :
          utilisateurs, factures, documents, séances, devoirs et suivis.
        </p>
      </div>

      <button class="btn primary" type="button" (click)="loadLogs()">
        Actualiser
      </button>
    </div>

    <section class="card">
      <h3>Filtres</h3>

      <div class="form-grid">
        <label>
          Date début
          <input type="date" [(ngModel)]="filters.startDate" />
        </label>

        <label>
          Date fin
          <input type="date" [(ngModel)]="filters.endDate" />
        </label>

        <label>
          Utilisateur
          <select [(ngModel)]="filters.actorUserId">
            <option value="">Tous les utilisateurs</option>

            <option *ngFor="let user of users" [value]="user.id">
              {{ user.firstName }} {{ user.lastName }} · {{ user.role }}
            </option>
          </select>
        </label>

        <label>
          Type d’action
          <select [(ngModel)]="filters.actionType">
            <option value="">Toutes les actions</option>
            <option value="CREATE">Création</option>
            <option value="UPDATE">Modification</option>
            <option value="DELETE">Suppression</option>
            <option value="VIEW">Consultation</option>
            <option value="SUBMIT">Soumission</option>
            <option value="DOWNLOAD">Téléchargement</option>
            <option value="STATUS_CHANGE">Changement de statut</option>
            <option value="IMPERSONATE">Voir comme utilisateur</option>
          </select>
        </label>

        <label>
          Module
          <select [(ngModel)]="filters.module">
            <option value="">Tous les modules</option>
            <option value="USERS">Utilisateurs</option>
            <option value="BILLING">Facturation</option>
            <option value="DOCUMENTS">Documents</option>
            <option value="SESSIONS">Séances</option>
            <option value="HOMEWORK">Devoirs</option>
            <option value="FOLLOWUPS">Suivis</option>
            <option value="PAYMENTS">Paiements</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        <label>
          Recherche
          <input
            type="search"
            [(ngModel)]="filters.search"
            placeholder="Nom, email, description..."
          />
        </label>
      </div>

      <div class="actions" style="margin-top:16px">
        <button class="btn primary" type="button" (click)="loadLogs()">
          Filtrer
        </button>

        <button class="btn soft" type="button" (click)="resetFilters()">
          Réinitialiser
        </button>
      </div>
    </section>

    <section class="card" style="margin-top:18px">
      <h3>Résultats</h3>

      <div class="empty-state" *ngIf="loading">
        Chargement du journal...
      </div>

      <div class="empty-state" *ngIf="!loading && !logs.length">
        Aucune activité trouvée pour ces filtres.
      </div>

      <div class="table-wrap" *ngIf="!loading && logs.length">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Action</th>
              <th>Module</th>
              <th>Cible</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let log of logs">
              <td>{{ log.createdAt | date:'yyyy-MM-dd HH:mm' }}</td>
              <td>{{ log.actorName || '-' }}</td>
              <td>{{ log.actorRole || '-' }}</td>
              <td>{{ actionLabel(log.actionType) }}</td>
              <td>{{ moduleLabel(log.module) }}</td>
              <td>{{ log.targetName || '-' }}</td>
              <td>{{ log.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class AdminActivityLogComponent implements OnInit {
  logs: ActivityLog[] = [];
  loading = false;

  users = this.data.users;

  filters = {
    startDate: '',
    endDate: '',
    actorUserId: '',
    actionType: '',
    module: '',
    search: ''
  };

  constructor(public readonly data: AppDataService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    void this.loadLogs();
  }

  async loadLogs(): Promise<void> {
    this.loading = true;

    this.logs = await this.data.getActivityLogs({
      startDate: this.filters.startDate || undefined,
      endDate: this.filters.endDate || undefined,
      actorUserId: this.filters.actorUserId || undefined,
      actionType: this.filters.actionType || undefined,
      module: this.filters.module || undefined,
      search: this.filters.search || undefined
    });

    this.loading = false;
  }

  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      actorUserId: '',
      actionType: '',
      module: '',
      search: ''
    };

    void this.loadLogs();
  }

  actionLabel(action: string): string {
    const labels: Record<string, string> = {
      CREATE: 'Création',
      UPDATE: 'Modification',
      DELETE: 'Suppression',
      VIEW: 'Consultation',
      SUBMIT: 'Soumission',
      DOWNLOAD: 'Téléchargement',
      STATUS_CHANGE: 'Changement de statut',
      IMPERSONATE: 'Voir comme'
    };

    return labels[action] ?? action;
  }

  moduleLabel(module: string): string {
    const labels: Record<string, string> = {
      USERS: 'Utilisateurs',
      BILLING: 'Facturation',
      DOCUMENTS: 'Documents',
      SESSIONS: 'Séances',
      HOMEWORK: 'Devoirs',
      FOLLOWUPS: 'Suivis',
      PAYMENTS: 'Paiements',
      ADMIN: 'Admin'
    };

    return labels[module] ?? module;
  }
}