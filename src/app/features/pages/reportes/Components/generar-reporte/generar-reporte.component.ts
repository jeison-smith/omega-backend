import { ChangeDetectorRef, Component, NgZone, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, Observable, take, timestamp } from 'rxjs';
import { GestionService } from '../../../../../Core/Service/Gestion/gestion.service';
import { PlantillaService } from '../../../../../Core/Service/Plantilla/plantilla.service';
import { ToastService } from '../../../../../Core/Service/Toast/toast.service';

@Component({
  selector: 'app-generar-reporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generar-reporte.component.html',
})
export class GenerarReporteComponent implements OnInit {
  listaPlantilla: { id: number; nombre: string }[] = [];
  crearExcelPlantillaForm!: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private gestionService: GestionService,
    private plantillaService: PlantillaService,
    private toastMessage: ToastService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.crearExcelPlantillaForm = this.fb.group({
      idPlantilla: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      estado: ['', Validators.required],
    });

    this.obtenerPlantillas();
  }

  obtenerPlantillas() {
    const paginacion = { pagina: 1, tamanoPagina: 500, entrada: '' };

    this.plantillaService
      .obtenerPlantillas(paginacion)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.listaPlantilla = response.plantillas.map(
            (plantilla: { id: number; nombrePlantilla: string }) => ({
              id: plantilla.id,
              nombre: plantilla.nombrePlantilla,
            })
          );
        },
        error: (error) => {
          this.toastMessage.showError(error);
        },
      });
  }

  descargarExcel(): void {
    this.loading.set(true);
    this.ref.detectChanges();
    this.gestionService
      .exportarExcel(
        this.crearExcelPlantillaForm.get('idPlantilla')?.value,
        this.crearExcelPlantillaForm.get('fechaInicio')?.value,
        this.crearExcelPlantillaForm.get('fechaFin')?.value,
        this.crearExcelPlantillaForm.get('estado')?.value
      )
      .subscribe(
        (response: Blob) => {
          // Guardamos el archivo Excel de manera inmediata
          setTimeout(() => {
            this.loading.set(false);
            this.ref.detectChanges();
            saveAs(
              response,
              this.nombreReporte(this.crearExcelPlantillaForm.get('idPlantilla')?.value)
            );
          }, 1500);
        },
        (error) => {
          if (error.toString() == 'Error: No hay registros para los filtros empleados') {
            this.toastMessage.showWarning(error);
          } else {
            this.toastMessage.showError(error);
          }
          this.loading.set(false);
          this.ref.detectChanges();
        }
      );
  }

  nombreReporte(id: number) {
    const fechaHoraString = new Date()
      .toLocaleString('en-GB', { timeZoneName: 'short' })
      .replace(/[^\d]/g, '')
      .slice(0, 14);

    return (
      'Reporte_' +
      this.listaPlantilla.find((item) => item.id == id)?.nombre +
      '_' +
      fechaHoraString +
      '.xlsx'
    );
  }
}
