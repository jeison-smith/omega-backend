import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  imports: [RouterOutlet],
  standalone: true,
})
export class MainLayoutComponent {}
