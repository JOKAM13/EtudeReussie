import { Component, Input } from '@angular/core';
import { statusClass } from '../core/text-utils';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: '<span class="badge" [class]="className">{{ value }}</span>'
})
export class StatusBadgeComponent {
  @Input({ required: true }) value = '';

  get className(): string {
    return `badge ${statusClass(this.value)}`;
  }
}
