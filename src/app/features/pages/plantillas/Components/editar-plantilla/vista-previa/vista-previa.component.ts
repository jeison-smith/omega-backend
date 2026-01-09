import { ChangeDetectorRef, Component, WritableSignal, signal } from '@angular/core';
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

import { take } from 'rxjs/operators';
import { Plantilla } from '../../../../../../Core/Interfaces/Plantilla/plantilla';
import { GestionPlantilla } from '../../../../../../Core/Interfaces/Gestion/gestion-plantilla';
import { RespuestaCampo } from '../../../../../../Core/Interfaces/Gestion/respuesta-Campo';
import { ToastService } from '../../../../../../Core/Service/Toast/toast.service';
import { PlantillaService } from '../../../../../../Core/Service/Plantilla/plantilla.service';
import { GestionService } from '../../../../../../Core/Service/Gestion/gestion.service';
import { PreguntaService } from '../../../../../../Core/Service/Preguntas/pregunta.service';
import { CamposVistaPreviaComponent } from './campos-vista-previa/campos-vista-previa.component';

@Component({
  selector: 'vista-previa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CamposVistaPreviaComponent],
  templateUrl: 'vista-previa.component.html',
})
export class VistaPreviaComponent {
  plantillaForm!: WritableSignal<FormGroup>;
  plantilla!: Plantilla;
  guardarGestionPlantilla!: GestionPlantilla;
  respuestaPlantilla!: RespuestaCampo[];

  loading: boolean;

  constructor(
    private toastMessage: ToastService,
    private plantillaService: PlantillaService,
    private gestionService: GestionService,
    private preguntaService: PreguntaService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private location: Location
  ) {
    this.plantillaForm = signal(
      this.fb.group({
        campos: this.fb.array([]),
      })
    );
    this.loading = false;
  }

  ngOnInit() {}

  ngAfterViewInit() {
    const idPlantilla = this.route.snapshot.paramMap.get('id')!;
    if (idPlantilla) {
      this.cargarPlantilla(Number(idPlantilla));
    }
  }

  get camposArray(): FormArray {
    return this.plantillaForm().get('campos') as FormArray;
  }

  castToFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  cargarPlantilla(idPlantilla: number): void {
    // Usas preguntaService.getPlantilla() en tu flujo actual
    this.plantilla = this.preguntaService.getPlantilla();
    if (!this.plantilla) {
      this.toastMessage.showError('No se encontró la plantilla.');
      return;
    }
    this.cargarCampos(this.plantilla.campos || []);
    this.cdRef.detectChanges();
  }

  private crearOpcionesArray(campo: any): FormGroup[] {
    if (!campo.opciones) return [];

    return campo.opciones.map((opcion: any) => {
      return this.fb.group({
        id: [opcion.id],
        etiqueta: [opcion.etiqueta],
        estado: [opcion.estado],
        campos: this.fb.array(
          opcion.campos ? opcion.campos.map((subcampo: any) => this.crearFieldGroup(subcampo)) : []
        ),
        requerido: [campo.requerido],
        // si el campo es multirespuesta, necesitamos control 'seleccionado' para checkboxes
        ...(campo.multirespuesta ? { seleccionado: [false] } : {}),
      });
    });
  }

  private crearFieldGroup(campo: any): FormGroup {
    if (!campo) return this.fb.group({});

    const opcionesArray = this.crearOpcionesArray(campo);

    const fieldGroup = this.fb.group({
      id: [campo.id],
      tipo: [campo.tipo],
      etiqueta: [campo.etiqueta],
      descripcion: [campo.descripcion],
      requerido: [!!campo.requerido],
      multirespuesta: [!!campo.multirespuesta],
      numerico: [campo.restriccion?.idRestriccion <= 8 && campo.restriccion?.idRestriccion > 0],
      valor: [''],
      placeholder: [this.getPlaceholder(campo)],
      opciones: this.fb.array(
        opcionesArray,
        campo.multirespuesta && campo.requerido ? this.atLeastOneCheckedValidator() : null
      ),
    });

    // Validaciones dinámicas
    const valorControl = fieldGroup.get('valor');
    if (campo.requerido && (!campo.opciones || campo.opciones.length === 0)) {
      // si no hay opciones y es requerido, marca valor obligatorio
      valorControl?.setValidators(Validators.required);
    }

    if (campo.tipo === 3 && campo.restriccion !== null) {
      this.aplicarRestriccion(
        valorControl,
        campo.restriccion.idRestriccion,
        campo.restriccion.campo1,
        campo.restriccion.campo2
      );
    }

    return fieldGroup;
  }

  cargarCampos(campos: any[]) {
    this.camposArray.clear();
    campos.forEach((campo) => {
      const fieldGroup = this.crearFieldGroup(campo);
      this.camposArray.push(fieldGroup);
    });
  }

  getSubpreguntas(opcion: AbstractControl): FormArray {
    return opcion.get('subpreguntas') as FormArray;
  }

  aplicarRestriccion(valorControl: any, tipoRestriccion: number, campo1?: any, campo2?: any) {
    valorControl?.clearValidators();

    const commonValidators = [Validators.pattern('^[0-9-]+$')];

    const restrictionValidators: Record<number, any[]> = {
      1: commonValidators,
      2: [...commonValidators, Validators.max(parseInt(campo1) - 1)],
      3: [...commonValidators, Validators.min(parseInt(campo1) + 1)],
      4: [...commonValidators, Validators.pattern(`^${campo1}$`)],
      5: [...commonValidators, Validators.max(parseInt(campo1))],
      6: [...commonValidators, Validators.min(parseInt(campo1)), Validators.max(parseInt(campo2))],
      7: [...commonValidators, Validators.min(parseInt(campo1))],
      8: [...commonValidators, Validators.pattern(`^(?!${campo1}$).*`)],
    };

    const validators = restrictionValidators[tipoRestriccion] || [];
    valorControl?.setValidators(validators);
    valorControl?.updateValueAndValidity();
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

  getPlaceholder(campo: any): string {
    if (campo.restriccion && campo.tipo === 3) {
      const { idRestriccion, campo1, campo2 } = campo.restriccion;
      const baseMessage = 'El valor debe ser un número';
      const messages: Record<number, string> = {
        1: baseMessage,
        2: `${baseMessage} menor que ${campo1}`,
        3: `${baseMessage} mayor que ${campo1}`,
        4: `${baseMessage} igual a ${campo1}`,
        5: `${baseMessage} menor o igual a ${campo1}`,
        6: `${baseMessage} entre ${campo1} y ${campo2}`,
        7: `${baseMessage} mayor o igual a ${campo1}`,
        8: `${baseMessage} diferente de ${campo1}`,
      };
      return messages[idRestriccion] || '';
    }
    return 'Escribe aquí la respuesta';
  }

  getOpciones(campo: AbstractControl): FormArray {
    return campo.get('opciones') as FormArray;
  }

  getSeleccionadoControl(opcion: AbstractControl): FormControl {
    const control = opcion.get('seleccionado');
    if (!(control instanceof FormControl)) {
      throw new Error('Control de seleccionado no es un FormControl');
    }
    return control;
  }

  // construir respuestas recursivas (similar a gestión)
  respuestaRecursiva(controles: AbstractControl[]): RespuestaCampo[] {
    return controles.flatMap((campo: AbstractControl) => {
      const formGroup = campo as FormGroup;
      const idCampoPlantilla = formGroup.get('id')?.value;
      const valor = this.obtenerValor(formGroup);

      let respuestas: RespuestaCampo[] = [];

      if (
        idCampoPlantilla &&
        valor !== null &&
        valor !== undefined &&
        ((Array.isArray(valor) && valor.length > 0) || (!Array.isArray(valor) && valor !== ''))
      ) {
        if (Array.isArray(valor)) {
          respuestas.push(
            ...valor.map((opcion) => ({
              idCampoPlantilla,
              valor: opcion.toString(),
            }))
          );
        } else {
          respuestas.push({
            idCampoPlantilla,
            valor: valor?.toString() || '',
          });
        }
      }

      const opciones = formGroup.get('opciones') as FormArray;
      if (opciones && opciones.length > 0) {
        opciones.controls.forEach((opcionControl) => {
          const opcionGroup = opcionControl as FormGroup;
          const subCampos = opcionGroup.get('campos') as FormArray;
          if (subCampos && subCampos.length > 0) {
            respuestas.push(...this.respuestaRecursiva(subCampos.controls));
          }
        });
      }

      return respuestas;
    });
  }

  obtenerValor(campo: AbstractControl): string | string[] {
    const tipo = campo.get('tipo')?.value;
    const multirespuesta = campo.get('multirespuesta')?.value;

    if ((tipo === 2 || tipo === 5) && multirespuesta) {
      // checkboxes: retornar IDs seleccionados
      const opcionesArray = campo.get('opciones') as FormArray;
      return opcionesArray.controls
        .filter((opcion) => opcion.get('seleccionado')?.value === true)
        .map((opcion) => opcion.get('id')?.value.toString());
    }

    if (tipo === 2 && !multirespuesta) {
      // radio: el valor se guarda en 'valor' (id de la opcion)
      return campo.get('valor')?.value ? campo.get('valor')?.value.toString() : '';
    }

    // select y otros tipos
    return campo.get('valor')?.value || '';
  }

  // Guardar formulario (sin qFlowID/observacion/estado)
  guardarFormulario(): void {
    this.loading = true;
    this.cdRef.detectChanges();

    // opcional: validar manualmente controles inválidos
    if (this.plantillaForm().invalid) {
      this.toastMessage.showError('Por favor completa los campos requeridos.');
      this.loading = false;
      return;
    }

    const todosLosCampos = this.camposArray.controls as AbstractControl[];
    this.respuestaPlantilla = this.respuestaRecursiva(todosLosCampos);

    this.guardarGestionPlantilla = {
      idPlantilla: this.plantilla?.id,
      idQFlow: undefined,
      respuestas: this.respuestaPlantilla,
      observacion: undefined,
    } as any;

    this.gestionService
      .guardarGestionPlantilla(this.guardarGestionPlantilla)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.toastMessage.showSuccess('Gestión guardada correctamente.');
          this.loading = false;
          this.cdRef.detectChanges();
          this.router.navigate(['/home/gestion']);
        },
        error: (err) => {
          this.toastMessage.showError('Error al guardar: ' + (err?.message || err));
          this.loading = false;
          this.cdRef.detectChanges();
        },
      });
  }

  goBack() {
    this.location.back();
  }

  atLeastOneCheckedValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      const hasChecked = (formArray.value || []).some(
        (control: any) => control.seleccionado === true
      );
      return hasChecked ? null : { required: true };
    };
  }

  redirectToGestion() {
    this.router.navigate(['/home/gestion']);
  }
}
