import { ChangeDetectorRef, Component, ViewChild, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { Plantilla } from '../../../../../Core/Interfaces/Plantilla/plantilla';
import { Observacion } from '../../../../../Core/Interfaces/Gestion/observacion';
import { take } from 'rxjs';
import { ObtenerRespuesta } from '../../../../../Core/Interfaces/Gestion/respuesta-obtenida';
import { RespuestaCampo } from '../../../../../Core/Interfaces/Gestion/respuesta-Campo';
import { RespuestaCampoComponent } from './respuesta-campo/respuesta-campo.component';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';
import { PlantillaService } from '../../../../../Core/Service/Plantilla/plantilla.service';
import { GestionService } from '../../../../../Core/Service/Gestion/gestion.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'respuesta-plantilla',
  standalone: true,
  imports: [RespuestaCampoComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './respuesta-plantilla.component.html',
})
export class RespuestaPlantillaComponent {
  // Use signals for form state
  plantilla = signal({
    qFlowID: '',
    idRespuestaPlantilla: 0,
    observaciones: [] as any[],
    estado: true,
    estadoInicial: true,
    observacionAgregar: '',
    secciones: [] as any[],
    id: 0,
    nombrePlantilla: '',
    nombreCreador: '',
    fechaCreacion: '',
    fechaModificacion: '',
    proyecto: '',
  });

  plantillaObj!: Plantilla;
  respuesta!: ObtenerRespuesta;
  guardarObservacion!: Observacion;
  respuestaPlantilla!: RespuestaCampo[];
  seccionColapsada = signal<boolean[]>([]);
  isDisabled: boolean = true;
  loading: boolean = false;
  @ViewChild(RespuestaCampoComponent) respuestaCampoComponent!: RespuestaCampoComponent;

  resumenTexto: string = '';
  mostrarResumen: boolean = false;

  get plantillaRaw() {
    return this.plantilla();
  }

  generarResumen() {
    let resumen = `ID QFlow: ${this.plantilla().qFlowID || ''}\n`;

    this.plantilla().secciones.forEach((seccion: any) => {
      const campos = seccion.campos as any[];
      if (campos) {
        resumen += this.procesarCamposResumen(campos);
      }
    });

    this.resumenTexto = resumen;
    this.mostrarResumen = true;
  }

  procesarCamposResumen(campos: any[]): string {
    let texto = '';
    campos.forEach((campo: any) => {
      // Skip if visually disabled
      if (campo.disabled) return;

      const etiqueta = campo.etiqueta;
      const tipo = campo.tipo;
      let respuesta = '';
      let tieneRespuesta = false;

      if (tipo === 1 || tipo === 3) {
        respuesta = campo.valor;
        if (respuesta) tieneRespuesta = true;
      } else if (tipo === 4 || (tipo === 2 && !campo.multirespuesta)) {
        const val = campo.valor;
        if (val) {
          const opc = (campo.opciones || []).find((c: any) => c.id == val);
          if (opc) {
            respuesta = opc.etiqueta;
            tieneRespuesta = true;
          }
        }
      } else if (tipo === 2 && campo.multirespuesta) {
        const seleccionadas = (campo.opciones || [])
          .filter((c: any) => c.seleccionado)
          .map((c: any) => c.etiqueta);
        if (seleccionadas.length > 0) {
          respuesta = seleccionadas.join(', ');
          tieneRespuesta = true;
        }
      }

      if (tieneRespuesta) {
        texto += `${etiqueta}: ${respuesta}\n`;
      }

      const opciones = campo.opciones || [];
      opciones.forEach((opc: any) => {
        const camposHijos = opc.campos || [];
        if (camposHijos && camposHijos.length > 0 && !opc.disabled) {
          texto += this.procesarCamposResumen(camposHijos);
        }
      });
    });
    return texto;
  }

  copiarResumen() {
    navigator.clipboard.writeText(this.resumenTexto).then(() => {
      this.toastMessage.showSuccess('Resumen copiado al portapapeles');
    });
  }

  constructor(
    private toastMessage: ToastService,
    private plantillaService: PlantillaService,
    private gestionService: GestionService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // initialize signal
    this.plantilla.set({
      qFlowID: '',
      idRespuestaPlantilla: 0,
      observaciones: [],
      estado: true,
      estadoInicial: true,
      observacionAgregar: '',
      secciones: [],
      id: 0,
      nombrePlantilla: '',
      nombreCreador: '',
      fechaCreacion: '',
      fechaModificacion: '',
      proyecto: '',
    });

    const idRespuestaPlantilla = this.route.snapshot.paramMap.get('id')!;
    if (idRespuestaPlantilla) {
      this.cargarRespuestas(Number(idRespuestaPlantilla));
    }
    // Obtener el ID de la plantilla desde la URL
  }

  // Helper getters for signal-based structure
  get seccionesArray() {
    return this.plantilla().secciones;
  }

  get todosLosCamposFlat(): any[] {
    const collect = (controles: any[]): any[] => {
      return controles.flatMap((campo: any) => {
        const current = [campo];
        const opciones = campo.opciones || [];
        if (opciones && opciones.length > 0) {
          const subControles = opciones.flatMap((opcion: any) => {
            const subCampos = opcion.campos || [];
            return subCampos ? collect(subCampos) : [];
          });
          return current.concat(subControles);
        }
        return current;
      });
    };

    return this.seccionesArray.flatMap((seccion: any) => collect(seccion.campos || []));
  }

  cargarEstado(estado: boolean) {
    this.plantilla.update((p) => ({ ...p, estado }));
  }

  regreso(): void {
    this.router.navigate(['/home/gestion']);
  }

  cargarSecciones(data: any[], respuestas: any[]): void {
    const secciones: any[] = [];

    if (!data || data.length === 0) {
      this.plantilla.update((p) => ({ ...p, secciones }));
      return;
    }

    const firstItem = data[0];
    const isSection = firstItem && Array.isArray(firstItem.campos);

    if (isSection) {
      data.forEach((seccion) => {
        const seccionObj: any = {
          id: seccion?.id ?? null,
          descripcion: seccion?.descripcion ?? '',
          nombre: seccion?.nombre ?? '',
          campos: [] as any[],
        };

        if (Array.isArray(seccion?.campos)) {
          for (const campo of seccion.campos) {
            const fieldObj = this.crearFieldObject(campo);
            this.asignarRespuestas(fieldObj, campo, respuestas);
            seccionObj.campos.push(fieldObj);
          }
        }
        secciones.push(seccionObj);
      });
    } else {
      const defaultSection: any = {
        id: null,
        descripcion: '',
        nombre: 'Detalle',
        campos: [] as any[],
      };
      for (const campo of data) {
        if (campo.id || campo.etiqueta) {
          const fieldObj = this.crearFieldObject(campo);
          this.asignarRespuestas(fieldObj, campo, respuestas);
          defaultSection.campos.push(fieldObj);
        }
      }
      secciones.push(defaultSection);
    }

    this.plantilla.update((p) => ({ ...p, secciones }));
    this.seccionColapsada.set(new Array(secciones.length).fill(true));
  }

  cargarPlantilla(respuesta: ObtenerRespuesta): void {
    this.plantillaService
      .obtenerPlantillasId(respuesta.idPlantilla)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.plantillaObj = response;

          this.cargarSecciones(this.plantillaObj?.campos ?? [], respuesta.listaPreguntas);

          this.plantilla.update((p) => ({
            ...p,
            qFlowID: respuesta.qFlowID,
            estadoInicial: respuesta.estado,
            idRespuestaPlantilla: respuesta.id,
            id: response.id,
            nombrePlantilla: response.nombrePlantilla,
            nombreCreador: response.nombreCreador,
            fechaCreacion: response.fechaCreacion,
            fechaModificacion: response.fechaModificacion,
            proyecto: response.proyecto,
          }));

          this.cargarEstado(respuesta.estado);
          // mark qFlowID as read-only by design; we won't provide input binding for it.
          if (!respuesta.estado) {
            this.plantilla.update((p) => ({ ...p, estado: false }));
          }
        },
        error: (error) => {
          this.toastMessage.showError('Error al cargar la plantilla: ' + error.message);
        },
      });
  }

  cargarRespuestas(idRespuestaPlantilla: number): void {
    this.gestionService
      .obtenerRespuesta(idRespuestaPlantilla)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.respuesta = response;
          this.cargarPlantilla(this.respuesta);
          this.cargarObservaciones(this.respuesta.observaciones);
        },
        error: (error) => {
          this.toastMessage.showError('Error al cargar las respuestas: ' + error.message);
        },
      });
  }

  private crearOpcionesArray(campo: any): any[] {
    if (!campo.opciones) return [];

    return campo.opciones.map((opcion: any) => ({
      id: opcion.id,
      etiqueta: opcion.etiqueta,
      estado: opcion.estado,
      campos: opcion.campos
        ? opcion.campos.map((subcampo: any) => this.crearFieldObject(subcampo))
        : [],
      requerido: !!campo.requerido,
      seleccionado: false,
      disabled: false,
    }));
  }

  private asignarRespuestas(fieldObj: any, campo: any, respuestas: any[]) {
    const respuesta = respuestas.find((res) => res.pregunta === campo.id);

    if (respuesta) {
      if (campo.tipo !== 2) {
        fieldObj.valor = respuesta.respuesta[0];
        fieldObj.disabled = true;
      } else {
        (respuesta.respuesta || []).forEach((respuestaOpcion: any) => {
          const opcionIndex = campo.opciones.findIndex(
            (opcion: any) => opcion.id.toString() === respuestaOpcion
          );
          if (opcionIndex > -1) {
            fieldObj.opciones[opcionIndex].seleccionado = true;
          }
        });
        fieldObj.opciones.forEach((o: any) => (o.disabled = true));
        fieldObj.disabled = true;
      }
    }

    // Recurse into option subfields
    const opcionesArray = fieldObj.opciones || [];
    if (campo.opciones && opcionesArray) {
      campo.opciones.forEach((opcion: any, index: number) => {
        const opcionObj = opcionesArray[index];
        const subCamposArray = opcionObj.campos || [];
        if (opcion.campos) {
          opcion.campos.forEach((subcampo: any, subIndex: number) => {
            this.asignarRespuestas(subCamposArray[subIndex], subcampo, respuestas);
          });
        }
      });
    }
  }

  private crearFieldObject(campo: any): any {
    if (!campo) return {};

    const opcionesArray = this.crearOpcionesArray(campo);

    const fieldObj: any = {
      id: campo.id,
      tipo: campo.tipo,
      etiqueta: campo.etiqueta,
      descripcion: campo.descripcion,
      requerido: campo.requerido,
      multirespuesta: campo.multirespuesta,
      valor: '',
      opciones: opcionesArray,
      disabled: false,
    };

    return fieldObj;
  }

  cargarObservaciones(observaciones: any[]) {
    const obs = (observaciones || []).map((o) => ({ observacion: o.observacion, fecha: o.fecha }));
    this.plantilla.update((p) => ({ ...p, observaciones: obs }));
  }

  getOpciones(campo: any): any[] {
    return campo.opciones || [];
  }

  getSeleccionadoControl(opcion: any): boolean {
    return !!opcion.seleccionado;
  }

  // getOpcionesSeleccionadasIds(campo: AbstractControl): number[] {
  //   const opcionesArray = campo.get('opciones') as FormArray;
  //   return opcionesArray.controls
  //     .filter(opcion => opcion.get('seleccionado')?.value === true)
  //     .map(opcion => opcion.get('id')?.value);
  // }

  guardarFormulario(): void {
    this.loading = true;
    this.ref.detectChanges();

    // simple validation: observacionAgregar non-empty
    const observacionAgregar = this.plantilla().observacionAgregar;
    if (observacionAgregar && observacionAgregar.toString().trim().length > 0) {
      this.guardarObservacion = {
        idRespuestaPlantilla: this.plantilla().idRespuestaPlantilla,
        valor: observacionAgregar,
        estadoRespuesta: this.plantilla().estado,
      } as any;

      this.gestionService
        .guardarObservacion(this.guardarObservacion)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            if (response) {
              this.loading = false;
              this.ref.detectChanges();
              this.toastMessage.showSuccess('Observacion guardada');
              this.regreso();
            }
          },
          error: (error) => {
            this.loading = false;
            this.ref.detectChanges();
            this.toastMessage.showError(error);
          },
        });
    } else {
      this.loading = false;
      this.toastMessage.showError('Por favor, completa la observación');
    }
  }

  atLeastOneCheckedValidator(): any {
    // Not used in signal-based approach; kept as placeholder
    return null;
  }

  copiarInfo() {
    const respuestas = this.todosLosCamposFlat
      .map((campo: any) => {
        const etiqueta = campo.etiqueta || '';
        const valor = this.obtenerValorDescriptivo(campo);
        if (!valor) return null;
        return `${etiqueta}: ${valor}`;
      })
      .filter((line: any) => line !== null)
      .join('\n');

    let observacionesText = '';
    const observaciones = this.plantilla().observaciones || [];
    if (observaciones.length > 0) {
      observacionesText =
        '\n\nObservaciones:\n' +
        observaciones.map((obs: any) => `[${obs.fecha}] ${obs.observacion}`).join('\n');
    }

    const total = `${respuestas}${observacionesText}`;

    navigator.clipboard
      .writeText(total)
      .then(() => {
        this.toastMessage.showSuccess('Información copiada al portapapeles');
      })
      .catch((err) => {
        this.toastMessage.showError('Error al copiar: ' + err);
      });
  }

  obtenerValorDescriptivo(campo: any): string | string[] {
    const tipo = campo.tipo;
    const multirespuesta = campo.multirespuesta;

    if (tipo === 2 && multirespuesta) {
      return (campo.opciones || [])
        .filter((op: any) => op.seleccionado)
        .map((op: any) => op.etiqueta?.toString())
        .join(', ');
    } else {
      if (tipo === 2 && !multirespuesta) {
        const opcionesArray = campo.opciones || [];
        const selectedId = campo.valor;
        const selectedOption = opcionesArray.find(
          (op: any) => op.id?.toString() === selectedId?.toString()
        );
        return selectedOption ? selectedOption.etiqueta : '';
      }
      return campo.valor || '';
    }
  }
  isSeccionColapsada(index: number): boolean {
    const arr = this.seccionColapsada();
    return !!arr[index];
  }

  toggleSeccion(index: number): void {
    this.seccionColapsada.update((arr) => {
      const copy = [...arr];
      copy[index] = !copy[index];
      return copy;
    });
  }
}
