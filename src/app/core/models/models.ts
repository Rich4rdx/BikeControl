
export type TipoBicicleta = 'MONTAÑA' | 'URBANA' | 'RUTA';
export type TipoMovimiento = 'ENTRADA' | 'SALIDA';


export interface BicicletaResponseDto {
  codigo: number;
  marca: string;
  modelo: string;
  tipo: TipoBicicleta;
  precio: number;
  cantidadInventario: number;
}

export interface BicicletaRequestDto {
  marca: string;
  modelo: string;
  tipo: TipoBicicleta;
  precio: number;
  cantidadInventario: number;
}


export interface ClienteResponseDto {
  documento: string;
  nombre: string;
  telefono: string;
}

export interface ClienteRequestDto {
  documento: string;
  nombre: string;
  telefono: string;
}


export interface DetalleVentaRequestDto {
  bicicletaId: number;
  cantidad: number;
}

export interface DetalleVentaResponseDto {
  id: number;
  bicicletaId: number;
  marcaBicicleta: string;
  modeloBicicleta: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}


export interface VentaRequestDto {
  documentoCliente: string;
  detalles: DetalleVentaRequestDto[];
}

export interface VentaResponseDto {
  idVenta: number;
  documentoCliente: string;
  cliente: string;
  total: number;
  fecha: string;
  detalles: DetalleVentaResponseDto[];
}


export interface MovimientoResponseDto {
  idMovimiento: number;
  tipoMovimiento: TipoMovimiento;

  cantidad: number;
  fecha: string;
  bicicletaId: number;
  marcaBicicleta: string;
  modeloBicicleta: string;
}
