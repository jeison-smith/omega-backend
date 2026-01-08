import { Component, computed, input } from '@angular/core';

type StatusType = 'active' | 'inactive' | 'pending' | 'open';

const statusConfig: Record<StatusType, { className: string; defaultLabel: string }> = {
  active: { className: 'bg-emerald-100 text-emerald-700', defaultLabel: 'Activo' },
  inactive: { className: 'bg-slate-100 text-slate-600', defaultLabel: 'Inactivo' },
  pending: { className: 'bg-amber-100 text-amber-700', defaultLabel: 'Pendiente' },
  open: { className: 'bg-sky-100 text-sky-700', defaultLabel: 'Abierto' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span [class]="badgeClass()">
      {{ label() || defaultLabel() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<StatusType>();
  readonly label = input<string | undefined>();

  readonly badgeClass = computed(() => {
    const config = statusConfig[this.status()];
    return `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`;
  });

  readonly defaultLabel = computed(() => statusConfig[this.status()].defaultLabel);
}
