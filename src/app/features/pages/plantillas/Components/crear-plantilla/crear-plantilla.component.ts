import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../../../Core/Service/Modal/modal.service';

@Component({
  selector: 'crear-plantilla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crear-plantilla.component.html',
})
export class CrearPlantillaComponent {
  constructor(private modalService: ModalService) {}

  showDialog(): void {
    this.modalService.abrirModal(); // Envía evento para abrir el modal
  }
}
