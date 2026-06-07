export interface Contrato {

    id?: number;

    titulo: string;

    propiedadId: number;

    clienteId: number;

    empleadoId: number;

    montoTotal: number;

    observaciones?: string;

    fechaInicio?: string;

    fechaFin?: string;

    estadoContrato?: string;

}