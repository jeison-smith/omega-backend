import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { Toast } from 'primeng/toast';

@Component({
  selector: 'campos-vista-previa',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './campos-vista-previa.component.html',
  styleUrl: './campos-vista-previa.component.css',
})
export class CamposVistaPreviaComponent {
  @Input() campo!: FormGroup;
  @Input() idVisualRamificado!: string;
  @Output() onDatosCargados = new EventEmitter<void>();
  isLoading: boolean = false;

  selectedOptions: Set<number> = new Set();

  constructor(private cdRef: ChangeDetectorRef, private fb: FormBuilder) {}

  ngOnInit() {
    const opcionesFormArray = this.campo.get('opciones') as FormArray;

    // 1. Manejo para Checkboxes Múltiples (Tipo 2 Multi)
    if (opcionesFormArray && this.campo.get('multirespuesta')?.value) {
      opcionesFormArray.controls.forEach((opcionControl: AbstractControl) => {
        const opcion = opcionControl as FormGroup;
        const id = opcion.get('id')?.value;

        // Estado inicial
        if (opcion.get('seleccionado')?.value === true) {
          this.selectedOptions.add(id);
        }

        // Escuchar cambios
        opcion.get('seleccionado')?.valueChanges.subscribe((seleccionado) => {
          if (seleccionado) {
            this.selectedOptions.add(id);
          } else {
            this.selectedOptions.delete(id);
          }
        });
      });
    }

    // 2. Manejo para Radio Button / Select (Tipo 2 Single / Tipo 4)
    // Usan 'valor' para almacenar el ID seleccionado
    if (!this.campo.get('multirespuesta')?.value || this.campo.get('tipo')?.value === 4) {
      const updateSelection = (val: any) => {
        this.selectedOptions.clear();
        if (val) {
          this.selectedOptions.add(Number(val));
        }
      };

      // Estado inicial
      const valorInicial = this.campo.get('valor')?.value;
      updateSelection(valorInicial);

      // Escuchar cambios
      this.campo.get('valor')?.valueChanges.subscribe((val) => {
        updateSelection(val);
      });
    }
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  get opciones(): FormArray {
    return this.campo.get('opciones') as FormArray;
  }

  get nestedCampos(): FormArray {
    return this.campo.get('campos') as FormArray;
  }

  get camposArray(): FormArray {
    return this.campo.get('campos') as FormArray;
  }

  castToFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  getCamposArray(opcion: AbstractControl): FormArray {
    return opcion.get('campos') as FormArray;
  }

  getOpciones(campo: FormGroup): FormArray {
    return (campo.get('opciones') as FormArray) ?? new FormArray([]);
  }

  getSeleccionadoControl(opcion: AbstractControl): FormControl {
    const control = opcion.get('seleccionado');
    if (!(control instanceof FormControl)) {
      throw new Error('Control de seleccionado no es un FormControl');
    }
    return control;
  }

  opcionPresionada(opcionId: number, event: any, esCheckbox: boolean = false) {
    if (esCheckbox) {
      const updatedSet = new Set(this.selectedOptions);
      event.target.checked ? updatedSet.add(opcionId) : updatedSet.delete(opcionId);
      this.selectedOptions = new Set(updatedSet);
    } else {
      this.selectedOptions = new Set([opcionId]);
    }

    this.onDatosCargados.emit();
  }

  trackByFn(index: number, item: any) {
    return item.id; // O usa un identificador único en lugar del índice
  }

  onlyInteger(event: any): void {
    let value = event.target.value;
    const negative = value.startsWith('-');

    value = (negative ? '-' : '') + value.replace(/[^0-9]/g, '');

    if (value !== event.target.value) {
      event.target.value = value;
      event.target.dispatchEvent(new Event('input'));
    }
  }
}
