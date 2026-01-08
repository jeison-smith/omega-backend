import { Gestion } from "./gestion";

export interface ObservacionRespuesta {
    observacion: string;
    fecha: string;
  }
  
  export interface Respuesta {
    pregunta: number;
    tipoPregunta: number;
    respuesta: string[];
  }
  
  export interface ObtenerRespuesta {
    id: number;
    idPlantilla: number;
    qFlowID: string;
    estado: boolean;
    listaPreguntas: Respuesta[];
    observaciones: ObservacionRespuesta[];
  }
  