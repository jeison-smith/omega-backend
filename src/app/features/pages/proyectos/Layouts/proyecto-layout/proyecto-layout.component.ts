import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CrearProyectoComponent } from '../../Components/crear-proyecto/crear-proyecto.component';
import { ListarProyectoComponent } from '../../Components/listar-proyecto/listar-proyecto.component';
import { ModalCrearPlantillaComponent } from '../../../plantillas/Components/modal-crear-plantilla/modal-crear-plantilla.component';

@Component({
  selector: 'app-proyecto-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CrearProyectoComponent,
    ListarProyectoComponent,
    ModalCrearPlantillaComponent,
  ],
  templateUrl: './proyecto-layout.component.html',
  styleUrl: './proyecto-layout.component.css',
})
export class ProyectoLayoutComponent {}
