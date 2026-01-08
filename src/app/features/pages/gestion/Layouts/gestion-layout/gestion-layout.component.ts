import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gestion-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gestion-layout.component.html',
  styleUrl: './gestion-layout.component.css',
})
export class GestionLayoutComponent {}
