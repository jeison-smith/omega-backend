import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EliminarUsuarioComponent } from '../../Components/eliminar-usuario/eliminar-usuario.component';
import { ListarUsuarioComponent } from '../../Components/listar-usuario/listar-usuario.component';
import { CrearUsuarioComponent } from '../../Components/crear-usuario/crear-usuario.component';

@Component({
  selector: 'usuarios-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EliminarUsuarioComponent,
    ListarUsuarioComponent,
    CrearUsuarioComponent,
  ],
  templateUrl: './usuarios-layout.component.html',
})
export class UsuariosLayoutComponent {}
