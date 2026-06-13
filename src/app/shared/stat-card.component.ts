import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="card stat-card" [routerLink]="link || null">
      <div>
        <small>{{ title }}</small>
        <div class="value">{{ value }}</div>
        <p>{{ subtitle }}</p>
      </div>
      <div class="stat-icon">{{ icon }}</div>
    </a>
  `
})
export class StatCardComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) value: string | number = 0;
  @Input() subtitle = '';
  @Input() icon = '📌';
  @Input() link?: string;
}
