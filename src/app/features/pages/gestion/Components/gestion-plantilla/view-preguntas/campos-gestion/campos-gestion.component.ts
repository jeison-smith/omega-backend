import { Component, input, Input } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'campos-gestion',
  templateUrl: './campos-gestion.component.html',
  styleUrl: './campos-gestion.component.css'
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
      return opcion.get('campos') as FormArray || new FormArray([]);
    }
}
