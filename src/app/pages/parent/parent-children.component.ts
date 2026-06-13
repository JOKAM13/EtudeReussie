import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/app-data.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-parent-children',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="page-intro"><div><h2>Mes enfants</h2><p>Consultez les informations scolaires et les tuteurs associés à vos enfants.</p></div></div>
    <div class="grid grid-2" *ngIf="children.length; else empty">
      <section class="card" *ngFor="let child of children">
        <div class="profile-header"><img *ngIf="child.avatarUrl" [src]="child.avatarUrl" [alt]="child.firstName" /><div><h3>{{ child.firstName }} {{ child.lastName }}</h3><p class="meta">{{ child.email }}</p></div></div>
        <div class="grid grid-2" style="margin-top:16px">
          <div class="detail-panel"><strong>Niveau</strong><br>{{ child.level }} · {{ child.grade }}</div>
          <div class="detail-panel"><strong>École</strong><br>{{ child.school }}</div>
          <div class="detail-panel"><strong>Tuteur assigné</strong><br>{{ data.getDisplayName(child.tutorId || '') }}</div>
          <div class="detail-panel"><strong>Tarif parent</strong><br>{{ child.parentHourlyRate | currency:'CAD':'symbol':'1.2-2' }}/h</div>
          <div class="detail-panel full"><strong>Besoins</strong><br>{{ child.needs?.join(', ') || '-' }}</div>
          <div class="detail-panel full"><strong>Difficultés</strong><br>{{ child.difficulties || '-' }}</div>
        </div>
      </section>
    </div>
    <ng-template #empty><div class="empty-state">Aucun enfant associé pour l’instant. Contactez l’administrateur pour lier votre compte à un élève.</div></ng-template>
  `
})
export class ParentChildrenComponent {
  parent = this.data.getParent();
  children = this.data.getChildrenForParent(this.parent.id);
  constructor(public readonly data: AppDataService) {}
}
