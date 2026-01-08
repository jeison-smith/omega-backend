import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Restriccion } from '../../../../../../Core/Interfaces/Plantilla/restriccion';

@Component({
  selector: 'restriccion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restriccion.component.html',
  styleUrls: ['./restriccion.component.css'],
})
export class RestriccionComponent implements OnInit {
  @Input() formTexto!: FormGroup;

  restricciones: Restriccion[] = [
    { Id: 1, IdTipoRestriccion: 1, Descripcion: 'es un número', Campos: 0 },
    { Id: 2, IdTipoRestriccion: 1, Descripcion: 'menor que', Campos: 1 },
    { Id: 3, IdTipoRestriccion: 1, Descripcion: 'mayor que', Campos: 1 },
    { Id: 4, IdTipoRestriccion: 1, Descripcion: 'igual a', Campos: 1 },
    { Id: 5, IdTipoRestriccion: 1, Descripcion: 'menor o igual a', Campos: 1 },
    { Id: 6, IdTipoRestriccion: 1, Descripcion: 'entre', Campos: 2 },
    { Id: 7, IdTipoRestriccion: 1, Descripcion: 'mayor o igual a', Campos: 1 },
    { Id: 8, IdTipoRestriccion: 1, Descripcion: 'diferente de', Campos: 1 },
  ];

  restriccionForm!: FormGroup;
  BaseId: number = 0;
  estadoRestriccion: boolean = true;
  camposDisponibles: number = 0;
  listaRestricciones: any[] = [];

  constructor(private fb: FormBuilder) {
    this.restriccionForm = this.fb.group({
      tipoRestriccion: [0],
      idRestriccion: [0],
      campo1: [''],
      campo2: [''],
    });
  }

  ngOnInit(): void {
    var restriccionId = this.formTexto.get('restriccion')?.value ?? null;
    this.BaseId = restriccionId.id;
    this.estadoRestriccion = restriccionId.estado;
    if (restriccionId) {
      var restriccionInfo =
        this.restricciones.find((rest) => rest.Id == restriccionId.idRestriccion) || null;

      if (restriccionInfo) {
        this.restriccionForm.patchValue({
          tipoRestriccion: restriccionInfo.IdTipoRestriccion ?? 0,
        });

        this.listaRestricciones = this.listarRestricciones();

        this.restriccionForm.patchValue({
          idRestriccion: restriccionInfo.Id ?? 0,
        });

        this.activarCampos();
        this.llenarCampos(restriccionId);
      }
    }
  }

  getOpcionesRestriccion(): void {
    this.listaRestricciones = this.listarRestricciones();
  }

  listarRestricciones(): any[] {
    return [
      { Id: 0, IdTipoRestriccion: 0, Descripcion: 'Selecciona', Campos: 0 },
      ...this.restricciones.filter(
        (r) => r.IdTipoRestriccion == this.restriccionForm.get('tipoRestriccion')?.value
      ),
    ];
  }

  activarCampos(): void {
    var campos = this.restriccionForm.get('idRestriccion')?.value;
    var campo = this.restricciones.find((rest) => rest.Id === Number(campos));

    if (campo) {
      this.camposDisponibles = campo.Campos;
    } else {
      this.camposDisponibles = 0;
    }
  }

  llenarCampos(restriccion: any) {
    this.restriccionForm.patchValue({
      campo1: restriccion.campo1,
      campo2: restriccion.campo2,
    });
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

  guardarActualizacion() {
    var restriccionControl = this.formTexto.get('restriccion') as FormGroup;

    if (restriccionControl) {
      // Obtener los valores de campo1 y campo2
      var campo1 = this.restriccionForm.get('campo1')?.value;
      var campo2 = this.restriccionForm.get('campo2')?.value;

      // Solo ordenamos cuando BaseId es 6
      if (this.BaseId == 6) {
        [campo1, campo2] = [campo1, campo2].sort((a, b) => (a < b ? -1 : 1));
      }
      /*
if ((this.BaseId !== 1 && campo1 === '') || (this.BaseId === 6 && (campo1 === '' || campo2 === ''))) {
  this.estadoRestriccion = false;
} else {
  this.estadoRestriccion = true;
}
*/
      restriccionControl.patchValue({
        id: this.BaseId,
        idRestriccion: parseInt(this.restriccionForm.get('idRestriccion')?.value),
        campo1: campo1?.toString() || '',
        campo2: campo2?.toString() || '',
        estado: this.estadoRestriccion,
      });
    }
  }
}
