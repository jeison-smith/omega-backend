import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
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
import { ObligatorioGestionComponent } from '../obligatorio-gestion/obligatorio-gestion.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'preguntas-gestion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ObligatorioGestionComponent,
    PreguntasGestionComponent,
  ],
  templateUrl: './preguntas-gestion.component.html',
})
export class PreguntasGestionComponent {
  @Input() campo!: FormGroup;
  @Input() idVisualRamificado!: string;
  @Input() visible!: boolean;
  @Output() onDatosCargados = new EventEmitter<void>();
  @Output() inputFocused = new EventEmitter<AbstractControl>();
  isLoading: boolean = false;

  selectedOptions: Set<number> = new Set();

  constructor(private cdRef: ChangeDetectorRef, private fb: FormBuilder) {}

  ngOnInit() {
    this.campo.setValidators(this.campo.get('requerido')?.value ? [Validators.required] : null);
    this.cdRef.detectChanges();
  }

  ngAfterViewInit() {}

  // Método auxiliar para obtener el FormArray de opciones (si existe)
  get opciones(): FormArray {
    return this.campo.get('opciones') as FormArray;
  }

  // Método auxiliar para obtener el FormArray de campos anidados (si existe)
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

    const opcionesArray = this.campo.get('opciones') as FormArray;

    const actualizarSubcampos = (
      camposArray: FormArray,
      enabled: boolean,
      resetValue: any = ''
    ) => {
      camposArray.controls.forEach((subcampo: AbstractControl) => {
        const valorControl = subcampo.get('valor');
        if (valorControl) {
          valorControl.setValue(resetValue);
          enabled ? valorControl.enable() : valorControl.disable();
        }
      });
    };

    opcionesArray.controls.forEach((opcion: AbstractControl) => {
      const camposArray = opcion.get('campos') as FormArray;
      actualizarSubcampos(camposArray, false);
    });

    const opcionesSeleccionadas = opcionesArray.controls.filter((ctrl) =>
      this.selectedOptions.has((ctrl as FormGroup).get('id')?.value)
    ) as FormGroup[];

    opcionesSeleccionadas.forEach((opcion) => {
      const camposArray = opcion.get('campos') as FormArray;
      actualizarSubcampos(camposArray, true);
    });

    this.onDatosCargados.emit();
  }

  trackByFn(index: number, item: any) {
    return item.id;
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

  actualizarObligatorios() {
    setTimeout(() => {
      this.onDatosCargados.emit();
      this.cdRef.detectChanges();
    });
  }
}
