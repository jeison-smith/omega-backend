import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [ButtonModule], // Importando un componente de PrimeNG para ejemplo
  templateUrl: './home.page.html',
})
export class HomePage {
  onClick() {
    alert('Hello World!');
  }
}
