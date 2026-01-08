import { Component, computed, input } from '@angular/core';

type ButtonVariant = 'default' | 'ghost' | 'outline';
type ButtonSize = 'default' | 'sm' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button type="button" [class]="buttonClass()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('default');
  readonly size = input<ButtonSize>('default');
  readonly className = input('');

  readonly buttonClass = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50';
    const variants: Record<ButtonVariant, string> = {
      default: 'bg-sky-500 text-white hover:bg-sky-600',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
      outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
    };
    const sizes: Record<ButtonSize, string> = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      icon: 'h-9 w-9',
    };
    return [base, variants[this.variant()], sizes[this.size()], this.className()].join(' ');
  });
}
