import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GenerarReporteComponent } from '../../Components/generar-reporte/generar-reporte.component';

@Component({
  selector: 'app-reportes-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, GenerarReporteComponent],
  templateUrl: './reportes-layout.component.html',
  styleUrl: './reportes-layout.component.css',
})
export class ReportesLayoutComponent {}
