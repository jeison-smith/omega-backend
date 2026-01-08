import { CamposPlantilla } from "./campos-plantilla"

export interface Seccion {
    id: number,
    nombre: string,
    descripcion: string
    campos: CamposPlantilla[]
}