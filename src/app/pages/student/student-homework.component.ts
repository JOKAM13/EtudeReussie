import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppDataService } from '../../core/app-data.service';
import { Homework } from '../../core/models';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-student-homework',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="page-intro">
      <div>
        <h2>Mes devoirs</h2>
        <p>Retrouvez les devoirs envoyés à votre tuteur, les fichiers transmis, les statuts et les documents corrigés.</p>
      </div>
      <a class="btn primary" routerLink="/eleve/soumettre-devoir">Soumettre un devoir</a>
    </div>

    <section class="card">
      <div class="list" *ngIf="homework.length > 0; else empty">
        <article class="list-item" *ngFor="let item of homework">
          <div>
            <strong>{{ item.title }}</strong>
            <div class="meta">{{ item.subject }} · Soumis le {{ item.submittedAt | date:'d MMMM yyyy':'':'fr' }} · Tuteur : {{ data.getDisplayName(item.tutorId) }}</div>
            <p>{{ item.description }}</p>
           

            <div class="actions" style="margin-top:10px">
            <a
              class="btn soft"
              *ngFor="let file of item.fileNames"
              [href]="data.getHomeworkSubmissionDownloadUrl(item.id, file)"
              target="_blank"
              rel="noopener"
            >
              Télécharger devoir
            </a>
            </div>

            <div class="actions" style="margin-top:10px" *ngIf="item.correctedFileNames?.length">
            <a
              class="btn success"
              *ngFor="let file of item.correctedFileNames"
              [href]="data.getHomeworkCorrectionDownloadUrl(item.id, file)"
              target="_blank"
              rel="noopener"
            >
              Télécharger correction
            </a>
            </div>


            <p class="helper" *ngIf="item.tutorComment">Commentaire du tuteur : {{ item.tutorComment }}</p>
          </div>
          <app-status-badge [value]="item.status" />
        </article>
      </div>
      <ng-template #empty>
        <div class="empty-state">Aucun devoir n’a encore été soumis. Cliquez sur “Soumettre un devoir” pour envoyer votre premier document.</div>
      </ng-template>
    </section>
  `
})
export class StudentHomeworkComponent {
  homework: Homework[] = this.data.getHomeworkForStudent(this.data.getStudent().id);
  constructor(public readonly data: AppDataService) {}
}
