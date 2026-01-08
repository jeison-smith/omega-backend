import { Observacion } from "./observacion";
import { RespuestaCampo } from "./respuesta-Campo";

export interface GestionPlantilla {
    idPlantilla: number;
    idQFlow: string;
    respuestas: RespuestaCampo[];
    observacion: Observacion;
}

