import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError} from 'rxjs';
import { tap, catchError, take } from 'rxjs/operators';
import { PlantillaService } from '../Plantilla/plantilla.service';
import { ToastService } from '../Toast/toast.service';
import { OpcionesPlantilla } from '../../Interfaces/Plantilla/opcion-plantilla';
import { CamposPlantilla } from '../../Interfaces/Plantilla/campos-plantilla';
import { actualizarPlantilla } from '../../Interfaces/Plantilla/actualizar-plantilla';
import { Plantilla } from '../../Interfaces/Plantilla/plantilla';

@Injectable({
  providedIn: 'root'
})
export class PreguntaService {

  private plantillaSubject = new BehaviorSubject<any>(null);
  plantilla$ = this.plantillaSubject.asObservable();
  idNuevo: number = -1;
  preguntaActual = 0;


  constructor(private plantillaService: PlantillaService, private toastMessage: ToastService) { }

  setPlantilla(plantilla: Plantilla) {
    this.plantillaSubject.next(plantilla);  // Actualiza el estado de la plantilla
  }

  getPlantilla() {
    return this.plantillaSubject.getValue(); // Devuelve el valor actual de la plantilla

  }

  getVistaPrevia(){

  }

  generarIdNuevo(){
    return --this.idNuevo;
  }



  actualizarCampos(campos: any[], id: number) {
    
    const plantilla = this.getPlantilla();
    if (plantilla) { 
      if (id === 0) {
        plantilla.campos = this.mergeCampos(plantilla.campos, campos);
      } else {
        this.actualizarCamposRecursivo(plantilla.campos, id, campos);
      }
      if (!plantilla) {
    console.error("❌ No existe plantilla cargada en el servicio.");
    return;
  }
      this.setPlantilla(plantilla);
      console.log("plantilla actual");
      console.log(plantilla)
    }
  }

      actualizarSecciones(secciones: any[], id: number) {
        const plantilla = this.getPlantilla();
        if (plantilla) {
          if (id === 0) {
            plantilla.secciones = this.mergeSecciones(plantilla.secciones, secciones);
          }
          
          this.setPlantilla(plantilla);
        }
      }


  private actualizarCamposRecursivo(campos: any[], id: number, nuevosCampos: any[]) {
    for (let campo of campos) {
      if (campo.opciones && Array.isArray(campo.opciones)) {
        for (let opcion of campo.opciones) {
          if (opcion.id === id) {
            
            opcion.campos = this.mergeCampos(opcion.campos, nuevosCampos);
            return;
          }
          
          if (opcion.campos && opcion.campos.length > 0) {
            this.actualizarCamposRecursivo(opcion.campos, id, nuevosCampos);
          }
        }
      }
    }
  }

private mergeSecciones(antiguasSecciones: any[], nuevasSecciones: any[]): any[] {
  return nuevasSecciones.map(nueva => {
    const seccionExistente = antiguasSecciones.find(s => s.id === nueva.id);

    return {
      ...nueva,
      campos: nueva.campos?.map((nuevoCampo: any) => {
        const campoExistente = seccionExistente?.campos?.find((c: any) => c.id === nuevoCampo.id);
        
        return {
          ...nuevoCampo,
          opciones: nuevoCampo.opciones?.map((nuevaOpcion: any) => {
            const opcionExistente = campoExistente?.opciones?.find((o: any) => o.id === nuevaOpcion.id);
            return {
              ...nuevaOpcion,
              campos: opcionExistente?.campos || []
            };
          }) || []
        };
      }) || []
    };
  });
}



  private mergeCampos(antiguosCampos: any[], nuevosCampos: any[]): any[] {
    return nuevosCampos.map(nuevo => {
      
      const campoExistente = antiguosCampos.find(c => c.id === nuevo.id);
      
      return {
        ...nuevo,
        opciones: nuevo.opciones?.map((nuevaOpcion: { id: any; }) => {
          const opcionExistente = campoExistente?.opciones?.find((o: { id: any; }) => o.id === nuevaOpcion.id);
          return {
            ...nuevaOpcion,
            campos: opcionExistente?.campos || []
          };
        }) || []
      };
    });
  }

  agregarOpcion(campoId: number, nuevaOpcion: OpcionesPlantilla) {
    const plantilla = this.getPlantilla();
    if (plantilla) {
      plantilla.campos = plantilla.campos.map((campo: { id: number; opciones: any; }) => 
        campo.id === campoId 
          ? { ...campo, opciones: [...campo.opciones, nuevaOpcion] } 
          : campo
      );
      this.setPlantilla(plantilla);
    }
  }

  getCamposPorId(id: number) {
    const plantilla = this.getPlantilla();
    return plantilla?.campos.find((campo: CamposPlantilla) => campo.id === id);
  }

  agregarOpcionesCampo(idCampo: number, opciones: any[]) {
    const plantilla = this.getPlantilla();
    const campo = plantilla?.campos.find((campo: CamposPlantilla) => campo.id === idCampo);
    if (campo) {
      campo.opciones = [...campo.opciones, ...opciones];  // Añadir las nuevas opciones
      this.setPlantilla(plantilla);  // Vuelve a guardar la plantilla actualizada
    }
  }

  cargarPlantilla(idPlantilla: number): Observable<any> {
    
    if (this.preguntaActual != idPlantilla) {

      this.preguntaActual = idPlantilla;
      return this.plantillaService.obtenerPlantillasId(idPlantilla).pipe(
        tap(response => {
          if (!this.plantillaSubject.value || this.plantillaSubject.value.id !== response.id) {
          
            this.plantillaSubject.next(response);
          }
        }),
        catchError(err => {
          this.toastMessage.showError('Error al cargar la plantilla: ' + err.message);
          return throwError(err);
        })
      );
    } else {
      const plantilla = this.getPlantilla();
    return of(plantilla);
    }
  }
  
  
    navegar(idOpcionCampo: number){
      var cuestionarioNavegacion = this.navegarAbajo(this.getPlantilla(), idOpcionCampo);
      return cuestionarioNavegacion;
    }


    guardarFinal(){
      var plantillaBase = this.getPlantilla();
      var camposConFormato = this.formatearIdCampoPlantilla([...plantillaBase.campos]);
      var plantillaConFormato: actualizarPlantilla = {
        idPlantilla: plantillaBase.id,
        nombrePlantilla: plantillaBase.nombrePlantilla,
        estado: plantillaBase.estado,
        campos: camposConFormato
      }
       
      

      this.plantillaService.actualizarCamposPlantilla(plantillaConFormato).pipe(take(1)).subscribe({
        next: (response) => {
          this.toastMessage.showSuccess('Plantilla guardada exitosamente');
          this.plantillaSubject = new BehaviorSubject<any>(null);
          this.plantilla$ = this.plantillaSubject.asObservable();
          this.idNuevo = -1;
          this.preguntaActual = 0;
        },
        error: (error) => {

          
          this.toastMessage.showError('Errores al actualizar la plantilla '+error.message);
        },
      });
    }

    formatearIdCampoPlantilla(campos: any[]): CamposPlantilla[] {
      return campos.map(campo => ({
        ...campo,
        id: campo.id < -1 ? 0 : campo.id, 
        opciones: campo.opciones
          ? campo.opciones.map((opcion: OpcionesPlantilla) => ({
              ...opcion,
              id: opcion.id < -1 ? 0 : opcion.id,
              campos: opcion.campos
                ? this.formatearIdCampoPlantilla(opcion.campos) 
                : []
            }))
          : []
      }));
    }    
       
    actualizarNombrePlantilla(nombreNuevo: string){
      const plantilla = this.getPlantilla();
      if (plantilla) {
        plantilla.nombre = nombreNuevo;
      }
        this.setPlantilla(plantilla);
    }

    actualizarEstadoPlantilla(estadoNuevo: boolean){
      const plantilla = this.getPlantilla();
      if (plantilla) {
        plantilla.estado = estadoNuevo;
      }
        this.setPlantilla(plantilla);
    }

    
navegarAbajo(data: any, idOpcionCampo: number): any {
  if (idOpcionCampo === 0) {
    return data;
  }

  if (data.secciones && Array.isArray(data.secciones)) {
    for (let seccion of data.secciones) {
      if (seccion.campos && Array.isArray(seccion.campos)) {
        for (let campo of seccion.campos) {
          if (campo.opciones && Array.isArray(campo.opciones)) {
            for (let opcion of campo.opciones) {

              if (opcion.id === idOpcionCampo) {
                return {
                  seccion: seccion.etiqueta,
                  campos: Array.isArray(opcion.campos) ? opcion.campos : [],
                  pregunta: campo.etiqueta,
                  opcion: opcion.etiqueta
                };
              }

              if (opcion.campos) {
                let preguntasSubopcion = this.navegarAbajo(opcion, idOpcionCampo);
                if (preguntasSubopcion) {
                  return {
                    seccion: preguntasSubopcion.seccion ?? seccion.etiqueta,
                    campos: preguntasSubopcion.campos,
                    pregunta: preguntasSubopcion.pregunta,
                    opcion: preguntasSubopcion.opcion
                  };
                }
              }
            }
          }
        }
      }
    }
  }

  if (data.campos && Array.isArray(data.campos)) {
    for (let campo of data.campos) {
      if (campo.opciones && Array.isArray(campo.opciones)) {
        for (let opcion of campo.opciones) {

          if (opcion.id === idOpcionCampo) {
            return {
              campos: Array.isArray(opcion.campos) ? opcion.campos : [],
              pregunta: campo.etiqueta,
              opcion: opcion.etiqueta
            };
          }

          if (opcion.campos) {
            let preguntasSubopcion = this.navegarAbajo(opcion, idOpcionCampo);
            if (preguntasSubopcion) {
              return {
                campos: preguntasSubopcion.campos,
                pregunta: preguntasSubopcion.pregunta,
                opcion: preguntasSubopcion.opcion
              };
            }
          }
        }
      }
    }
  }

  return null;
}
    actualizar(idOpcionCampo: number, campos: any){
      var actualizar = this.actualizarAbajo(this.getPlantilla(), idOpcionCampo, campos);
      return true;
    }

    actualizarAbajo(data: any, idOpcionCampo: number, nuevosCampos: any[]): boolean {
      if (idOpcionCampo === 0) {
        //data.campos = nuevosCampos;
        return true;
      }
      if (data.campos && Array.isArray(data.campos)) {
        for (let campo of data.campos) {
          if (campo.opciones && Array.isArray(campo.opciones)) {
            for (let opcion of campo.opciones) {
              if (opcion.id === idOpcionCampo) {
                opcion.campos = nuevosCampos; 
                return true;
              }
              if (opcion.campos) {
                let actualizado = this.actualizarAbajo(opcion, idOpcionCampo, nuevosCampos);
                if (actualizado) {
                  return true; 
                }
              }
            }
          }
        }
      }
      return false;
    }    
}
