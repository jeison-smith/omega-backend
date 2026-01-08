import { OpcionesPlantilla } from "./opcion-plantilla";
import { RestriccionCampoPlantilla } from "./restriccion-campo-plantilla";

export interface CamposPlantilla {

    id: number;
    orden: number;
    etiqueta: string;
    descripcion: string;
    tipo: number;
    requerido: boolean;
    multirespuesta: boolean;
    //idCampoDependiente: number;
    restriccion: RestriccionCampoPlantilla | null;
    estado: boolean;
    opciones: OpcionesPlantilla[];
}
