import { Proyecto } from "./proyecto";
import { ProyectoDisponible } from "./proyecto-disponible";

export interface RespuestaProyecto {
    totalCount: number,
    proyectos: Proyecto[],
    proyectosDisponibles: ProyectoDisponible[]
}
