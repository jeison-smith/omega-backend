import { CamposPlantilla } from "./campos-plantilla";

export interface actualizarPlantilla {
    idPlantilla: number,
    nombrePlantilla: string,
    estado: boolean,
    campos: CamposPlantilla[]

}
