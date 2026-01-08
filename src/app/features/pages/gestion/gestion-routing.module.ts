import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionLayoutComponent } from './Layouts/gestion-layout/gestion-layout.component';
import { GestionPlantillaComponent } from './Components/gestion-plantilla/gestion-plantilla.component';
import { RespuestaPlantillaComponent } from './Components/respuesta-plantilla/respuesta-plantilla.component';

const routes: Routes = [
  {
    path: '',
    component: GestionLayoutComponent
  },
  {
    path: 'gestion-plantilla/:id',
    component: GestionPlantillaComponent
  },
  {
    path: 'respuesta-plantilla/:id',
    component: RespuestaPlantillaComponent
  },
  {
    path: '', redirectTo: 'gestion', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionRoutingModule { }
