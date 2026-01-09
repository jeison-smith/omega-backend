import { ChangeDetectorRef, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select'; // Keeping it if they really use it, but template uses <select> logic?

@Component({
  selector: 'app-respuesta-campo',
  standalone: true,
  imports: [CommonModule, FormsModule], // Removed Select if we use native <select>, otherwise keep it. User had it.
  templateUrl: 'respuesta-campo.component.html',
})
export class RespuestaCampoComponent {
  @Input() campo!: any;
  @Input() idVisualRamificado!: string;
  @Output() onDatosCargados = new EventEmitter<void>();
  isLoading: boolean = false;

  selectedOptions: Set<number> = new Set();
  readonly respuesta = signal<string>('');
  @Input()
  set valor(v: string | null | undefined) {
    this.respuesta.set(v ?? '');
  }

  get valor(): string {
    return this.respuesta();
  }
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

  onRadioChange(opcion: any) {
    this.campo.valor = opcion.id;
    opcion.campos?.forEach((c: any) => (c.disabled = false));
    this.campo.opciones?.forEach((o: any) => {
      if (o.id !== opcion.id) (o.campos || []).forEach((c: any) => (c.disabled = true));
    });
  }

  onCheckboxChange(opcion: any) {
    opcion.seleccionado = !opcion.seleccionado;
    opcion.campos?.forEach((c: any) => (c.disabled = !opcion.seleccionado));
  }

  onChangeSelect(event: any) {
    const val = (event.target as HTMLSelectElement).value;
    this.campo.valor = val;
    this.campo.opciones?.forEach((o: any) =>
      (o.campos || []).forEach((c: any) => (c.disabled = true))
    );
    const sel = this.campo.opciones?.find((o: any) => o.id == val);
    if (sel) {
      (sel.campos || []).forEach((c: any) => (c.disabled = false));
    }
  }
}
