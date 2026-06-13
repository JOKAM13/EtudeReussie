import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { SimpleCalendarComponent } from '../../shared/simple-calendar.component';

@Component({
  selector: 'app-parent-sessions',
  standalone: true,
  imports: [CommonModule, SimpleCalendarComponent],
  template: `
    <div class="page-intro"><div><h2>Séances de mes enfants</h2><p>Calendrier des séances programmées ou terminées pour les enfants associés à votre compte.</p></div></div>
    <app-simple-calendar [sessions]="sessions" actorLabel="Tuteur" />
  `
})
export class ParentSessionsComponent {
  parent = this.data.getParent();
  sessions = this.data.getSessionsForParent(this.parent.id);
  constructor(private readonly data: AppDataService) {}
}
