import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { take } from 'rxjs';
import { Plantilla } from '../../../../../Core/Interfaces/Plantilla/plantilla';
import { GestionPlantilla } from '../../../../../Core/Interfaces/Gestion/gestion-plantilla';
import { RespuestaCampo } from '../../../../../Core/Interfaces/Gestion/respuesta-Campo';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { PlantillaService } from '../../../../../Core/Service/Plantilla/plantilla.service';
import { GestionService } from '../../../../../Core/Service/Gestion/gestion.service';

@Component({
  selector: 'gestion-plantilla',
  templateUrl: './gestion-plantilla.component.html',
})
export class GestionPlantillaComponent {
  plantillaForm!: FormGroup;
  plantilla!: Plantilla;
  guardarGestionPlantilla!: GestionPlantilla;
  respuestaPlantilla!: RespuestaCampo[];
  seccionColapsada: boolean[] = [];
  loading: boolean;
  mostrarResumen: boolean = false;
  formListo: boolean = false;

  // Logic for Lateral Options
  opcionesLaterales: { id: number; titulo: string; textoImprimir: string; chequeado: boolean }[] =
    [];
  mostrarModalOpcion: boolean = false;
  nuevoTituloOpcion: string = '';
  nuevoTextoImprimir: string = '';

  constructor(
    private toastMessage: ToastService,
    private plantillaService: PlantillaService,
    private gestionService: GestionService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.loading = false;
  }

  ngOnInit() {
    this.plantillaForm = this.fb.group({
      secciones: this.fb.array([]),
      resumen: [''],
    });
  }

  ngAfterViewInit() {
    const idPlantilla = this.route.snapshot.paramMap.get('id');
    if (idPlantilla) {
      this.cargarPlantilla(Number(idPlantilla));
    }

    if (idPlantilla) {
      this.cargarOpcionesLocalStorage(Number(idPlantilla));
    }
  }

  // get camposArray(): FormArray {
  //   return this.plantillaForm.get('campos') as FormArray;
  // }

  get todosLosCampos(): AbstractControl[] {
    return this.seccionesArray.controls.flatMap(
      (seccion) => ((seccion as FormGroup).get('campos') as FormArray).controls
    );
  }

  get todosLosCamposFlat(): AbstractControl[] {
    const collect = (controles: AbstractControl[]): AbstractControl[] => {
      return controles.flatMap((campo) => {
        const fg = campo as FormGroup;

        // empezar con este campo
        const current: AbstractControl[] = [fg];

        // buscar subcampos en opciones
        const opciones = fg.get('opciones') as FormArray;
        if (opciones && opciones.length > 0) {
          const subControles = opciones.controls.flatMap((opcion) => {
            const subCampos = (opcion as FormGroup).get('campos') as FormArray;
            return subCampos ? collect(subCampos.controls) : [];
          });
          return current.concat(subControles);
        }

        return current;
      });
    };

    return this.seccionesArray.controls.flatMap((seccion) =>
      collect(((seccion as FormGroup).get('campos') as FormArray).controls)
    );
  }

  getCamposArray(i: number): FormArray {
    return (this.seccionesArray.at(i) as FormGroup).get('campos') as FormArray;
  }

  get seccionesArray(): FormArray {
    return this.plantillaForm.get('secciones') as FormArray;
  }

  castToFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  cargarPlantilla(idPlantilla: number): void {
    this.plantillaService
      .obtenerPlantillasId(idPlantilla)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.plantilla = response;

          // limpiar y cargar secciones con campos
          this.cargarSecciones(this.plantilla?.campos ?? []);
          this.seccionColapsada = new Array(this.seccionesArray.length).fill(true);

          // 🔑 activa en el siguiente ciclo de Angular
          setTimeout(() => {
            this.formListo = true;
            this.cdRef.detectChanges();
            console.log(this.plantilla);
          });
        },
        error: (error) => {
          this.toastMessage.showError('Error al cargar la plantilla: ' + error.message);
        },
      });
  }

  private crearOpcionesArray(campo: any, disable: boolean): FormArray {
    if (!campo.opciones) return this.fb.array([]);

    const seleccionadoInicial = false;

    const grupos = campo.opciones.map((opcion: any) => {
      return this.fb.group({
        id: [opcion.id],
        etiqueta: [opcion.etiqueta],
        estado: [opcion.estado],
        campos: this.fb.array(
          opcion.campos
            ? opcion.campos.map((subcampo: any) => this.crearFieldGroup(subcampo, false, false))
            : []
        ),
        requerido: [{ value: false }],
        seleccionado: [{ value: false, disabled: !disable }],
      });
    });

    const validators =
      campo.requerido && campo.multirespuesta ? [this.atLeastOneCheckedValidator()] : [];

    return this.fb.array(grupos, validators);
  }

  private crearSeccionGroup(seccion: any): FormGroup {
    const sectionGroup = this.fb.group({
      id: [seccion.id],
      descripcion: [seccion.descripcion],
      nombre: [seccion.nombre],
      campos: this.fb.array([]),
    });

    return sectionGroup;
  }

  private crearFieldGroup(campo: any, disableExample: boolean, disableOptions: boolean): FormGroup {
    if (!campo) return this.fb.group({});

    const opcionesArray = this.crearOpcionesArray(campo, disableOptions);

    //console.log(opcionesArray);

    const fieldGroup = this.fb.group({
      id: [campo.id],
      tipo: [Number(campo.tipo) === 5 ? 2 : Number(campo.tipo)],
      etiqueta: [campo.etiqueta],
      descripcion: [campo.descripcion],
      requerido: [campo.requerido],
      multirespuesta: [Number(campo.tipo) === 5 ? true : campo.multirespuesta],
      numerico: [campo.restriccion?.idRestriccion <= 8 && campo.restriccion?.idRestriccion > 0],
      valor: { value: '', disabled: !disableExample },
      placeholder: [this.getPlaceholder(campo)],
      opciones: opcionesArray,
    });

    // Aplicar validaciones dinámicas
    const valorControl = fieldGroup.get('valor');
    if (
      campo.requerido &&
      (!campo.opciones || campo.opciones.length === 0 || campo.multirespuesta === false)
    ) {
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

  cargarSecciones(data: any[]): void {
    this.seccionesArray.clear();

    if (!data || data.length === 0) return;

    // Detect if the array contains Sections (objects with 'campos' array) or Fields directly
    const firstItem = data[0];
    const isSection = firstItem && Array.isArray(firstItem.campos);

    if (isSection) {
      // It's a list of sections
      data.forEach((seccion) => {
        const seccionGroup = this.fb.group({
          id: [seccion?.id ?? null],
          descripcion: [seccion?.descripcion ?? ''],
          nombre: [seccion?.nombre ?? ''],
          campos: this.fb.array([]),
        });

        const camposArray = seccionGroup.get('campos') as FormArray;
        if (Array.isArray(seccion?.campos)) {
          for (const campo of seccion.campos) {
            camposArray.push(this.crearFieldGroup(campo, true, true));
          }
        }
        this.seccionesArray.push(seccionGroup);
      });
    } else {
      // It's a flat list of fields, wrap them in a default section
      const defaultSectionGroup = this.fb.group({
        id: [null], // No specific section ID
        descripcion: [''],
        nombre: ['Generales'], // Default title
        campos: this.fb.array([]),
      });

      const camposArray = defaultSectionGroup.get('campos') as FormArray;
      for (const campo of data) {
        // Verify it looks like a field before adding
        if (campo.id || campo.etiqueta) {
          camposArray.push(this.crearFieldGroup(campo, true, true));
        }
      }
      this.seccionesArray.push(defaultSectionGroup);

      // Expand the default section
      this.seccionColapsada = [false];
    }
  }

  cargarCampos(campos: any[], seccionIndex: number): void {
    const nuevosCampos = campos.map((campo) => this.crearFieldGroup(campo, true, true));
    const nuevoFormArray = this.fb.array(nuevosCampos);

    const seccionGroup = this.seccionesArray.at(seccionIndex) as FormGroup;
    seccionGroup.setControl('campos', nuevoFormArray);

    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
  }

  trackByIndex(index: number, item: any): number {
    return index;
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

    // Si es negativo, conservamos el signo y limpiamos solo los dígitos del resto
    value = (negative ? '-' : '') + value.replace(/[^0-9]/g, '');

    // Si el valor ha cambiado, actualizamos el campo y disparamos el evento 'input'
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

  guardarFormulario(): void {
    this.loading = true;
    this.cdRef.detectChanges();

    if (this.plantillaForm.valid) {
      this.respuestaPlantilla = this.respuestaRecursiva(this.todosLosCampos);
      console.log('Respuestas recopiladas:', this.respuestaPlantilla);

      // Construir la estructura final para el backend
      this.guardarGestionPlantilla = {
        idPlantilla: this.plantilla.id,
        idQFlow: '0', // Sometimes IDs need to be "0" if empty string fails validation
        respuestas: this.respuestaPlantilla,
        observacion: {
          idRespuestaPlantilla: 0,
          valor: 'Creación inicial',
          estadoRespuesta: true,
        },
      } as any;

      this.gestionService
        .guardarGestionPlantilla(this.guardarGestionPlantilla)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            if (response) {
              setTimeout(() => {
                this.toastMessage.showSuccess('Gestion guardada correctamente.');
                this.loading = false;
                this.cdRef.detectChanges();
                this.router.navigate(['/home/gestion']);
              }, 900);
            }
          },
          error: (error) => {
            this.toastMessage.showError(error);
            this.loading = false;
            this.cdRef.detectChanges();
          },
        });
    } else {
      this.toastMessage.showError('Por favor, completa todos los campos requeridos.');
      this.loading = false;
      this.cdRef.detectChanges();
    }
  }

  respuestaRecursiva(controles: AbstractControl[]): RespuestaCampo[] {
    return controles.flatMap((campo: AbstractControl) => {
      const formGroup = campo as FormGroup;
      const idCampoPlantilla = formGroup.get('id')?.value;
      const valor = this.obtenerValor(formGroup);

      let respuestas: RespuestaCampo[] = [];

      if (idCampoPlantilla && valor) {
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

  respuestaRecursivaConOpciones(controles: AbstractControl[]): RespuestaCampo[] {
    let respuestas: RespuestaCampo[] = [];

    for (const campo of controles) {
      const formGroup = campo as FormGroup;
      const idCampoPlantilla = formGroup.get('id')?.value;
      const valor = this.obtenerValorDescriptivo(formGroup);

      // respuestas directas
      if (idCampoPlantilla && valor) {
        if (Array.isArray(valor)) {
          respuestas.push(
            ...valor.map((opcion) => ({
              idCampoPlantilla,
              valor: opcion?.toString(),
            }))
          );
        } else {
          respuestas.push({
            idCampoPlantilla,
            valor: valor?.toString() || '',
          });
        }
      }
    }

    return respuestas;
  }

  obtenerValor(campo: AbstractControl): string | string[] {
    const tipo = campo.get('tipo')?.value;
    const multirespuesta = campo.get('multirespuesta')?.value;

    if (tipo === 2 && multirespuesta) {
      // Para checkboxes: retornar solo las opciones seleccionadas
      const opcionesArray = campo.get('opciones') as FormArray;
      return opcionesArray.controls
        .filter((opcion) => opcion.get('seleccionado')?.value === true)
        .map((opcion) => opcion.get('id')?.value.toString());
    } else {
      return campo.get('valor')?.value || '';
    }
  }

  obtenerValorDescriptivo(campo: AbstractControl): string | string[] {
    const tipo = campo.get('tipo')?.value;
    const multirespuesta = campo.get('multirespuesta')?.value;

    if (tipo === 2 && multirespuesta) {
      const opcionesArray = campo.get('opciones') as FormArray;
      return opcionesArray.controls
        .filter((opcion) => opcion.get('seleccionado')?.value === true)
        .map((opcion) => opcion.get('etiqueta')?.value?.toString())
        .join(', ');
    } else {
      if (tipo === 2 && !multirespuesta) {
        const opcionesArray = campo.get('opciones') as FormArray;
        return opcionesArray.controls
          .filter((opcion) => opcion.get('id')?.value === campo.get('valor')?.value)
          .map((opcion) => opcion.get('etiqueta')?.value.toString());
      }
      return campo.get('valor')?.value || '';
    }
  }

  atLeastOneCheckedValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      if (formArray instanceof FormArray) {
        const seleccionados = formArray.controls.map((ctrl, i) => ({
          index: i,
          seleccionado: (ctrl as FormGroup).get('seleccionado')?.value,
        }));
        const hasChecked = seleccionados.some((item) => !!item.seleccionado);
        console.log(hasChecked);
        return hasChecked ? null : { required: true };
      }
      return null;
    };
  }

  private logInvalidControls(control: AbstractControl, path: string = ''): void {
    if (control.invalid) {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach((key) => {
          this.logInvalidControls(control.get(key)!, `${path}${key}.`);
        });
      } else if (control instanceof FormArray) {
        control.controls.forEach((ctrl, index) => {
          this.logInvalidControls(ctrl, `${path}[${index}].`);
        });
      } else {
        console.warn(`Control inválido: ${path}`, control.errors);
      }
    }
  }

  redirectToGestion() {
    this.router.navigate(['/home/gestion']);
  }

  getTodosLosCampos(campos: any[]): any[] {
    return campos.flatMap((campo) => {
      const subCampos =
        campo.opciones?.flatMap((opcion: any) =>
          opcion.campos ? this.getTodosLosCampos(opcion.campos) : []
        ) || [];

      return [campo, ...subCampos];
    });
  }

  resumen() {
    // const qFlowID = this.plantillaForm.get('qFlowID')?.value;
    // const observacion = this.plantillaForm.get('observacion')?.value;
    // const estado = this.plantillaForm.get('estado')?.value ? 'Abierto' : 'Cerrado';

    const respuestas = this.respuestaRecursivaConOpciones(this.todosLosCamposFlat);

    let resumen = respuestas
      .map((element) => {
        const campoForm = this.todosLosCamposFlat.find(
          (c) => (c as FormGroup).get('id')?.value === element.idCampoPlantilla
        ) as FormGroup | undefined;

        const etiqueta = campoForm?.get('etiqueta')?.value || `Campo ${element.idCampoPlantilla}`;
        return `${etiqueta}: ${element.valor}`;
      })
      .join('\n');

    resumen = `${resumen}`;

    // Add lateral options to summary
    const opcionesChequeadas = this.opcionesLaterales.filter((op) => op.chequeado);
    if (opcionesChequeadas.length > 0) {
      resumen += '\n\nOpciones Adicionales:\n';
      resumen += opcionesChequeadas.map((op) => `${op.titulo}: ${op.textoImprimir}`).join('\n');
    }

    this.mostrarResumen = true;
    this.plantillaForm.get('resumen')?.setValue(resumen);

    // Auto-copy to clipboard as per requirement
    this.copiarResumen();
  }

  copiarResumen() {
    const resumenControl = this.plantillaForm.get('resumen');
    if (resumenControl) {
      const resumenText = resumenControl.value;
      navigator.clipboard
        .writeText(resumenText)
        .then(() => {
          this.toastMessage.showSuccess('Resumen copiado al portapapeles.');
        })
        .catch((err) => {
          this.toastMessage.showError('Error al copiar el resumen: ' + err);
        });
    }
  }

  toggleSeccion(index: number): void {
    this.seccionColapsada[index] = !this.seccionColapsada[index];
  }

  // Lateral Options Methods
  toggleModalOpcion() {
    this.mostrarModalOpcion = !this.mostrarModalOpcion;
    if (!this.mostrarModalOpcion) {
      this.nuevoTituloOpcion = '';
      this.nuevoTextoImprimir = '';
    }
  }

  // Método específico para cerrar el modal (usado por p-dialog onHide)
  cerrarModalOpcion() {
    this.mostrarModalOpcion = false;
    this.nuevoTituloOpcion = '';
    this.nuevoTextoImprimir = '';
  }

  agregarOpcionLateral() {
    if (this.nuevoTituloOpcion.trim()) {
      this.opcionesLaterales.push({
        id: Date.now(),
        titulo: this.nuevoTituloOpcion,
        textoImprimir: this.nuevoTextoImprimir,
        chequeado: false,
      });
      this.cerrarModalOpcion(); // Usar cerrarModalOpcion en lugar de toggleModalOpcion
      this.guardarOpcionesLocalStorage();
      this.toastMessage.showSuccess('Opción agregada correctamente');
    } else {
      this.toastMessage.showError('El título de la opción es obligatorio.');
    }
  }

  eliminarOpcionLateral(index: number) {
    this.opcionesLaterales.splice(index, 1);
    this.guardarOpcionesLocalStorage();
  }

  // Track the last focused control to insert text
  lastFocusedControl: AbstractControl | null = null;
  handleInputFocus(control: AbstractControl) {
    this.lastFocusedControl = control;
    console.log('Focused Control updated');
  }

  alternarChequeo(index: number) {
    // Alternar el estado del checkbox
    this.opcionesLaterales[index].chequeado = !this.opcionesLaterales[index].chequeado;

    // Actualizar el campo de texto con TODAS las opciones marcadas
    if (this.lastFocusedControl) {
      let controlToUpdate: AbstractControl | null = this.lastFocusedControl;

      // Si el control enfocado es un FormGroup, obtener el control 'valor'
      if (this.lastFocusedControl instanceof FormGroup) {
        controlToUpdate = this.lastFocusedControl.get('valor');
      }

      if (controlToUpdate) {
        // Recopilar el texto de TODAS las opciones marcadas
        const textosSeleccionados = this.opcionesLaterales
          .filter((opcion) => opcion.chequeado)
          .map((opcion) => opcion.textoImprimir || opcion.titulo)
          .join(','); // Unir con saltos de línea (o puedes usar ', ' para separar por comas)

        // Actualizar el valor del campo con todas las opciones marcadas
        controlToUpdate.setValue(textosSeleccionados);
        controlToUpdate.markAsDirty();
        controlToUpdate.updateValueAndValidity();
      }
    }

    this.guardarOpcionesLocalStorage();
  }

  private getLocalStorageKey(): string {
    return `plantilla_${this.plantilla?.id}_opciones_laterales`;
  }

  guardarOpcionesLocalStorage() {
    if (this.plantilla?.id) {
      // Persist options
      localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(this.opcionesLaterales));
    }
  }

  cargarOpcionesLocalStorage(idPlantilla: number) {
    const key = `plantilla_${idPlantilla}_opciones_laterales`;
    const stored = localStorage.getItem(key);
    if (stored) {
      this.opcionesLaterales = JSON.parse(stored);
    }
  }
}
