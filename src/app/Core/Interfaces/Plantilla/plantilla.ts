import { CamposPlantilla } from "./campos-plantilla";
import { Seccion } from "./seccion-plantilla"

export interface Plantilla {
    id: number,
    qFlowID: string,
    nombrePlantilla: string,
    idCampana: number,
    campana: string,
    idProyecto: number,
    nombreProyecto: string,
    proyecto: string,
    fechaCreacion: string,
    fechaModificacion: string,
    nombreCreador: string,
    nombreCategoria: string;
    idCategoria?: number;
    estado: boolean,
    gestiones: number
    campos: CamposPlantilla[]
}
