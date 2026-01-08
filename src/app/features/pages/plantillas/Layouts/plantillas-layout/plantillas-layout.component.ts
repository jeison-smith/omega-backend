import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CrearPlantillaComponent } from '../../Components/crear-plantilla/crear-plantilla.component';
import { ListarPlantillaComponent } from '../../Components/listar-plantilla/listar-plantilla.component';
import { ModalCrearPlantillaComponent } from '../../Components/modal-crear-plantilla/modal-crear-plantilla.component';

@Component({
  selector: 'app-plantillas-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CrearPlantillaComponent,
    ListarPlantillaComponent,
    ModalCrearPlantillaComponent,
  ],
  templateUrl: './plantillas-layout.component.html',
  styleUrl: './plantillas-layout.component.css',
})
export class PlantillasLayoutComponent {}
