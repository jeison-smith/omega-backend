import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListarGestionComponent } from '../../Components/listar-gestion/listar-gestion.component';

@Component({
  selector: 'app-gestion-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ListarGestionComponent],
  templateUrl: 'gestion-layout.component.html',
})
export class GestionLayoutComponent {}
