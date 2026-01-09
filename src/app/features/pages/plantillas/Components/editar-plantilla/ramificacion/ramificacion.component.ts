import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  WritableSignal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ChildActivationStart, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { EditarCamposPlantillaComponent } from '../editar-campos-plantilla/editar-campos-plantilla.component';
import { PreguntaService } from '../../../../../../Core/Service/Preguntas/pregunta.service';
import { ToastService } from '../../../../../../Core/Service/Toast/toast.service';
import { EliminarRamificacionComponent } from '../eliminar-ramificacion/eliminar-ramificacion.component';

@Component({
  selector: 'ramificacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    EditarCamposPlantillaComponent,
    EliminarRamificacionComponent,
  ],
  templateUrl: 'ramificacion.component.html',
})
export class RamificacionComponent implements OnInit {
  @ViewChild(EditarCamposPlantillaComponent) editarCamposPlantilla!: EditarCamposPlantillaComponent;

  camposForm!: WritableSignal<FormGroup>;
  pregunta: string = 'Pregunta';
  opcion: string = 'Opcion';
  id: number = 0;
  campos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private preguntaService: PreguntaService,
    private toastMessage: ToastService,
    private location: Location,
    private fb: FormBuilder,
    private cdf: ChangeDetectorRef,
    private router: Router
  ) {
    this.camposForm = signal(
      this.fb.group({
        campos: this.fb.array([]),
      })
    );
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      var idOpcionCampo = params.get('id')!;

      this.camposForm.set(
        this.fb.group({
          campos: this.fb.array([]),
        })
      );

      try {
        var navegacion = this.preguntaService.navegar(Number(idOpcionCampo));
        console.log(navegacion);
        this.id = Number(idOpcionCampo);
        this.campos = navegacion.campos;
        this.pregunta = `${navegacion.pregunta}`;
        this.opcion = `${navegacion.opcion}`;
        this.cargarCamposPlantilla(this.campos);

        console.log(this.camposArray);
      } catch (error) {
        console.error('Error al cargar la ramificación:', error);
        this.toastMessage.showError('Error al cargar la ramificación. Redirigiendo a Plantillas');
        this.router.navigate(['/home/plantillas']);
      }
    });
  }

  ngAfterViewInit() {
    this.cargarCamposVisual();
  }

  goBack() {
    if (this.camposForm().valid) {
      this.guardarRamificacion();
      this.location.back();
    } else {
      this.toastMessage.showError('Uno o más campos son inválidos. Por favor valide nuevamente');
    }
  }

  guardarRamificacion() {
    const camposDelFormulario = this.camposForm().get('campos')?.value;

    const camposMapeados = camposDelFormulario.map((campo: any, index: number) => ({
      id: campo.id,
      orden: index + 1,
      etiqueta: campo.etiqueta,
      descripcion: campo.descripcion,
      tipo: campo.tipo,
      requerido: campo.requerido,
      multirespuesta: campo.multiRespuesta,
      restriccion: campo.restriccion === 0 || !campo.restriccion ? null : campo.restriccion,
      estado: campo.estado,
      opciones:
        campo.opciones?.map((opcion: any) => ({
          id: opcion.id,
          etiqueta: opcion.etiqueta,
          estado: opcion.estado,
          campos: opcion.campos || [],
        })) || [],
    }));

    this.preguntaService.actualizarCampos(camposMapeados, this.id);
  }

  cargarCamposVisual() {
    this.route.paramMap.subscribe((params) => {
      if (this.editarCamposPlantilla) {
        this.cargarCamposPlantilla(this.camposArray);
      }

      this.cdf.detectChanges();
    });
  }

  cargarCamposPlantilla(campos: any) {
    campos.forEach((campo: any) => {
      this.camposArray.push(
        this.fb.group({
          id: [campo.id, Validators.required],
          orden: [campo.orden, Validators.required],
          etiqueta: [campo.etiqueta, Validators.required],
          descripcion: [campo.descripcion],
          tipo: [campo.tipo, Validators.required],
          requerido: [campo.requerido],
          multiRespuesta: [campo.multirespuesta],
          restriccion: [campo.restriccion],
          estado: [campo.estado],
          opciones: this.fb.array(
            (campo.opciones || []).map((opcion: any) =>
              this.fb.group({
                id: [opcion.id],
                etiqueta: [opcion.etiqueta, Validators.required],
                estado: [opcion.estado],
                campos: [opcion.campos],
              })
            )
          ),
        })
      );
    });
    this.cdf.detectChanges();
  }

  triggerActualizarCampos() {
    // var camposActualizacion = this.editarCamposPlantilla.guardarCamposPlantilla(this.id);
    this.cargarCamposVisual();
  }

  cargarDatos(idOpcionCampo: number) {
    this.campos = this.preguntaService.navegar(Number(idOpcionCampo));
  }

  eliminarCampos() {
    this.triggerActualizarCampos();
    this.editarCamposPlantilla.eliminarCampos();
    this.triggerActualizarCampos();
    this.location.back();
  }

  get camposArray(): FormArray {
    return this.camposForm().get('campos') as FormArray;
  }

  get opcionesArray(): FormArray {
    return this.camposArray.get('opciones') as FormArray;
  }

  cargarPlantilla() {
    if (this.campos && this.campos.length > 0) {
      this.campos.forEach((campo: any) => {
        const fieldGroup = this.fb.group({
          id: [campo.id, Validators.required],
          orden: [campo.orden, Validators.required],
          etiqueta: [campo.etiqueta, Validators.required],
          descripcion: [campo.descripcion],
          tipo: [campo.tipo, Validators.required],
          requerido: [campo.requerido],
          multiRespuesta: [campo.multirespuesta],
          restriccion: [campo.restriccion],
          estado: [campo.estado],
          opciones: this.fb.array(
            campo.opciones.map((opcion: any) =>
              this.fb.group({
                id: [opcion.id],
                etiqueta: [opcion.etiqueta, Validators.required],
                estado: [opcion.estado],
              })
            )
          ),
        });

        //console.log(campo.restriccion);
        this.camposArray.push(fieldGroup);
      });
    }

    // Log para verificar el estado del formulario
    // console.log('Formulario:', this.camposForm);
    // console.log('Estado del formulario:', this.camposForm.valid);
    // console.log('Errores del FormArray:', this.camposArray.errors);

    this.toastMessage.showSuccess('Datos de la plantilla cargados correctamente.');
  }
}
