import { Component, input, Input } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PreguntasGestionComponent } from '../preguntas-gestion/preguntas-gestion.component';

@Component({
  selector: 'campos-gestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PreguntasGestionComponent],
  templateUrl: './campos-gestion.component.html',
})
export class CamposGestionComponent {
  @Input() campo!: FormGroup;
  @Input() opcion!: any;
  @Input() idVisualRamificado!: string;
  selectedOptions: Set<number> = new Set();

  get opciones(): FormArray {
    return this.campo.get('opciones') as FormArray;
  }

  getOpciones(campo: AbstractControl): FormArray {
    return campo.get('opciones') as FormArray;
  }

  trackByFn(index: number, item: any) {
    return item.id; // O usa un identificador único en lugar del índice
  }

  castToFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  getCamposArray(opcion: AbstractControl): FormArray {
    return (opcion.get('campos') as FormArray) || new FormArray([]);
  }
}
