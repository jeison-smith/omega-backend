import { Routes } from '@angular/router';
import { AppShellComponent } from './shared/layout/app-shell.component';
import { falconGuard } from './Core/Guards/falcon.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/Components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [falconGuard],
    canMatch: [falconGuard],
    children: [
      {
        path: 'home',
        redirectTo: 'proyectos',
      },
      {
        path: 'proyectos',
        loadComponent: () =>
          import(
            './features/pages/proyectos/Layouts/proyecto-layout/proyecto-layout.component'
          ).then((m) => m.ProyectoLayoutComponent),
        data: { title: 'Proyectos' },
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import(
            './features/pages/usuarios/Layouts/usuarios-layout/usuarios-layout.component'
          ).then((m) => m.UsuariosLayoutComponent),
        data: { title: 'Usuarios' },
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import(
            './features/pages/categorias/Components/listar-categorias/listar-categorias.component'
          ).then((m) => m.ListarCategoriasComponent),
        data: { title: 'Categorías' },
      },
      {
        path: 'plantillas',
        loadComponent: () =>
          import(
            './features/pages/plantillas/Layouts/plantillas-layout/plantillas-layout.component'
          ).then((m) => m.PlantillasLayoutComponent),
        data: { title: 'Plantillas' },
      },
      {
        path: 'gestion',
        loadComponent: () =>
          import('./features/pages/gestion/Layouts/gestion-layout/gestion-layout.component').then(
            (m) => m.GestionLayoutComponent
          ),
        data: { title: 'Gestión' },
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import(
            './features/pages/reportes/Layouts/reportes-layout/reportes-layout.component'
          ).then((m) => m.ReportesLayoutComponent),
        data: { title: 'Reportes' },
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/pages/not-found/not-found-page.component').then(
            (m) => m.NotFoundPageComponent
          ),
        data: { title: 'No encontrado' },
      },
    ],
  },
];
