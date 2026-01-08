import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type StatusType = 'active' | 'inactive' | 'pending' | 'open';

const statusConfig: Record<StatusType, { className: string; defaultLabel: string }> = {
  active: { className: 'badge-active', defaultLabel: 'Activo' },
  inactive: { className: 'badge-inactive', defaultLabel: 'Inactivo' },
  pending: { className: 'badge-pending', defaultLabel: 'Pendiente' },
  open: { className: 'badge-info', defaultLabel: 'Abierto' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: ` <span [ngClass]="className">{{ label || defaultLabel }}</span> `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status: StatusType = 'active';
  @Input() label?: string;

  get className() {
    return statusConfig[this.status].className;
  }

  get defaultLabel() {
    return statusConfig[this.status].defaultLabel;
  }
}
