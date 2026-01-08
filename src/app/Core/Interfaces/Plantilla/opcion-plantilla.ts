import { CamposPlantilla } from "./campos-plantilla";

export interface OpcionesPlantilla {

    id: number;
    etiqueta: string;
    estado: boolean;
    campos: CamposPlantilla[];
}
