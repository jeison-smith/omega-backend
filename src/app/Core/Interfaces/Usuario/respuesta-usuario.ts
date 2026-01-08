import { Usuario } from "./usuario";

export interface RespuestaUsuario {
    totalCount: number,
    usuarios: Usuario[],
}
