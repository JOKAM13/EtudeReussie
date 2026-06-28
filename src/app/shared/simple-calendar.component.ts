import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Session, SessionStatus } from '../core/models';
import { AppDataService } from '../core/app-data.service';
import { StatusBadgeComponent } from './status-badge.component';
import { statusClass } from '../core/text-utils';

interface CalendarDay {
  date: Date;
  iso: string;
  inMonth: boolean;
  sessions: Session[];
}

@Component({
  selector: 'app-simple-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe, StatusBadgeComponent],
  template: `
    <div class="card">
      <div class="calendar-toolbar">
        <div class="actions">
          <button type="button" class="btn ghost" (click)="previousMonth()">←</button>
          <button type="button" class="btn ghost" (click)="goToday()">Aujourd’hui</button>
          <button type="button" class="btn ghost" (click)="nextMonth()">→</button>
        </div>
        <div class="calendar-title">{{ currentMonth | date:'MMMM yyyy':'':'fr' }}</div>
        <div class="actions">
          <button type="button" class="tab" [class.active]="viewMode === 'mois'" (click)="viewMode = 'mois'">Mois</button>
          <button type="button" class="tab" [class.active]="viewMode === 'liste'" (click)="viewMode = 'liste'">Liste</button>
        </div>
      </div>

      <div *ngIf="viewMode === 'mois'; else listView" class="calendar-grid">
        <div class="calendar-head" *ngFor="let day of weekDays">{{ day }}</div>
        <div class="calendar-day" *ngFor="let day of days" [class.muted]="!day.inMonth">
          <div class="day-number">{{ day.date.getDate() }}</div>
          <button
            type="button"
            class="event-chip"
            [class]="'event-chip ' + statusCss(session.status)"
            *ngFor="let session of day.sessions"
            (click)="selectedSession = session">
           {{ session.startTime }} {{ session.subject }}<br>

            <span *ngIf="showStudentName">
              Élève : {{ studentName(session) }}<br>
            </span>
            <span>{{ actorLabel }} : {{ actorName(session) }}</span>
          </button>
        </div>
      </div>

      <ng-template #listView>
        <div class="list" *ngIf="sessions.length > 0; else emptyCalendar">
          <div class="list-item" *ngFor="let session of sortedSessions">
            <div>
              <strong>{{ session.subject }} · {{ session.date | date:'d MMMM yyyy':'':'fr' }}</strong>
              <div class="meta">
              <span *ngIf="showStudentName">Élève : {{ studentName(session) }} · </span>
              {{ session.startTime }} – {{ session.endTime }} · {{ actorLabel }} : {{ actorName(session) }} · {{ session.mode }}
            </div>
            </div>
            <div class="actions">
              <app-status-badge [value]="session.status" />
              <button type="button" class="btn soft" (click)="selectedSession = session">Détail</button>
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template #emptyCalendar>
        <div class="empty-state">Aucune séance à afficher pour le moment.</div>
      </ng-template>
    </div>

    <div class="modal-backdrop" *ngIf="selectedSession" (click)="selectedSession = undefined">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="page-intro">
          <div>
            <h2>Détail de la séance</h2>
            <p>{{ selectedSession.subject }} · {{ selectedSession.date | date:'d MMMM yyyy':'':'fr' }}</p>
          </div>
          <button type="button" class="btn ghost" (click)="selectedSession = undefined">Fermer</button>
        </div>
        <div class="grid grid-2">
          <div class="grid grid-2">
          <div class="detail-panel" *ngIf="showStudentName">
            <strong>Élève concerné</strong><br>
            {{ studentName(selectedSession) }}
          </div>

          <div class="detail-panel">
            <strong>{{ actorLabel }}</strong><br>
            {{ actorName(selectedSession) }}
          </div>
          <div class="detail-panel"><strong>Horaire</strong><br>{{ selectedSession.startTime }} – {{ selectedSession.endTime }}</div>
          <div class="detail-panel"><strong>Mode</strong><br>{{ selectedSession.mode }}</div>
          <div class="detail-panel"><strong>Statut</strong><br><app-status-badge [value]="selectedSession.status" /></div>
          <div class="detail-panel full" *ngIf="selectedSession.meetingLink"><strong>Lien de rencontre</strong><br>{{ selectedSession.meetingLink }}</div>
          <div class="detail-panel full" *ngIf="selectedSession.address"><strong>Adresse / lieu</strong><br>{{ selectedSession.address }}</div>
          <div class="detail-panel full" *ngIf="selectedSession.note"><strong>Note</strong><br>{{ selectedSession.note }}</div>
          <div class="detail-panel">
    <strong>Tuteur</strong><br>
    {{ tutorName(selectedSession) }}
  </div>
        </div>
        <div class="actions" *ngIf="showActions" style="margin-top:16px">
          <button type="button" class="btn primary" (click)="emitStatus('Programmée')">Programmer</button>
          <button type="button" class="btn success" (click)="emitStatus('Terminée')">Terminer</button>
          <button type="button" class="btn danger" (click)="emitStatus('Annulée')">Annuler</button>
        </div>
      </div>
    </div>
  `
})
export class SimpleCalendarComponent {
  @Input() sessions: Session[] = [];
  @Input() actorLabel: 'Tuteur' | 'Élève' = 'Tuteur';
  @Input() showActions = false;
  @Input() showStudentName = true;
  @Output() statusChange = new EventEmitter<{ session: Session; status: SessionStatus }>();

  currentMonth = new Date();
  viewMode: 'mois' | 'liste' = 'mois';
  selectedSession?: Session;
  weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  constructor(private readonly data: AppDataService) {}

  get days(): CalendarDay[] {
    const first = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const iso = this.toIso(date);
      days.push({
        date,
        iso,
        inMonth: date.getMonth() === this.currentMonth.getMonth(),
        sessions: this.sessions.filter((session) => session.date === iso)
      });
    }
    return days;
  }

  get sortedSessions(): Session[] {
    return [...this.sessions].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }

  previousMonth(): void { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1); }
  nextMonth(): void { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1); }
  goToday(): void { this.currentMonth = new Date(); }
  statusCss(status: string): string { return statusClass(status); }
  
 tutorName(session: Session): string {
  return this.data.getDisplayName(session.tutorId);
}
studentName(session: Session): string {
  return this.data.getDisplayName(session.studentId);
}
  actorName(session: Session): string {
    return this.actorLabel === 'Tuteur' ? this.data.getDisplayName(session.tutorId) : this.data.getDisplayName(session.studentId);
  }

  emitStatus(status: SessionStatus): void {
    if (!this.selectedSession) return;
    this.statusChange.emit({ session: this.selectedSession, status });
    this.selectedSession = { ...this.selectedSession, status };
  }

  private toIso(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
 
}
