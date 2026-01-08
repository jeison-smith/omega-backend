import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-respuesta-campo',
  standalone: true,
  imports: [],
  templateUrl: './respuesta-campo.component.html',
})
export class RespuestaCampoComponent {
  @Input() campo!: any; // plain JS object provided by parent signal
  @Input() idVisualRamificado!: string;
  @Output() onDatosCargados = new EventEmitter<void>();
  isLoading: boolean = false;

  selectedOptions: Set<number> = new Set();

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    const opciones = this.campo?.opciones || [];

    if (opciones && opciones.length > 0) {
      opciones.forEach((opcion: any) => {
        const id = opcion.id;
        const camposHijos = opcion.campos || [];

        if (opcion.seleccionado === true) {
          this.selectedOptions.add(id);
          camposHijos.forEach((c: any) => (c.disabled = false));
        } else {
          if (!this.selectedOptions.has(id)) {
            camposHijos.forEach((c: any) => (c.disabled = true));
          }
        }
      });
    }

    if (this.campo?.tipo === 4) {
      const valorInicial = this.campo.valor;
      if (opciones)
        opciones.forEach((o: any) => (o.campos || []).forEach((c: any) => (c.disabled = true)));

      if (valorInicial) {
        const valId = Number(valorInicial);
        this.selectedOptions.add(valId);
        const opc = opciones.find((c: any) => c.id === valId);
        if (opc) (opc.campos || []).forEach((c: any) => (c.disabled = false));
      }
    }
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  // Helpers to access structure
  get opciones(): any[] {
    return this.campo?.opciones || [];
  }

  get nestedCampos(): any[] {
    return this.campo?.campos || [];
  }

  get camposArray(): any[] {
    return this.campo?.campos || [];
  }

  getCamposArray(opcion: any): any[] {
    return opcion.campos || [];
  }

  getOpciones(campo: any): any[] {
    return campo.opciones || [];
  }

  getSeleccionadoControl(opcion: any): boolean {
    return !!opcion.seleccionado;
  }

  opcionPresionada(opcionId: number, esCheckbox: boolean = false) {
    if (esCheckbox) {
      const updatedSet = new Set(this.selectedOptions);
      updatedSet.has(opcionId) ? updatedSet.delete(opcionId) : updatedSet.add(opcionId);
      this.selectedOptions = updatedSet;
    } else {
      this.selectedOptions = new Set([opcionId]);
    }
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
}
