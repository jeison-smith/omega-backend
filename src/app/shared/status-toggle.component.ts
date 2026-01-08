import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'default' | 'ghost' | 'outline';
type ButtonSize = 'default' | 'sm' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button type="button" [ngClass]="buttonClass">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'default';
  @Input() className = '';

  get buttonClass(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none';
    const variants: Record<ButtonVariant, string> = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'bg-transparent hover:bg-muted text-foreground',
      outline: 'border border-border bg-background hover:bg-muted',
    };
    const sizes: Record<ButtonSize, string> = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      icon: 'h-9 w-9',
    };
    return [base, variants[this.variant], sizes[this.size], this.className].join(' ');
  }
}
