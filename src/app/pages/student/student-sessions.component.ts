import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { SimpleCalendarComponent } from '../../shared/simple-calendar.component';

@Component({
  selector: 'app-student-sessions',
  standalone: true,
  imports: [SimpleCalendarComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Mes séances</h2>
        <p>Consultez vos cours dans un calendrier mensuel. Cliquez sur une séance pour voir la matière, l’horaire, le tuteur, le mode et les notes.</p>
      </div>
    </div>
    <app-simple-calendar [sessions]="sessions" actorLabel="Tuteur" />
  `
})
export class StudentSessionsComponent {
  sessions = this.data.getSessionsForStudent(this.data.getStudent().id);
  constructor(private readonly data: AppDataService) {}
}
