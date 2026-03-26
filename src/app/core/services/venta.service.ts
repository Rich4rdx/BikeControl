import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  VentaRequestDto,
  VentaResponseDto,
  DetalleVentaResponseDto
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly url = '/api/ventas';

  constructor(private http: HttpClient) {}

  listar(): Observable<VentaResponseDto[]> {
    return this.http.get<unknown[]>(this.url).pipe(
      map(rows => (rows || []).map(r => this.normalizarVentaRespuesta(r)))
    );
  }

  obtenerPorId(id: number): Observable<VentaResponseDto> {
    return this.http.get<unknown>(`${this.url}/${id}`).pipe(
      map(r => this.normalizarVentaRespuesta(r))
    );
  }

  registrar(dto: VentaRequestDto): Observable<VentaResponseDto> {
    return this.http.post<unknown>(this.url, dto).pipe(
      map(r => this.normalizarVentaRespuesta(r))
    );
  }

  private normalizarVentaRespuesta(raw: unknown): VentaResponseDto {
    const r =
      raw != null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

    const str = (a: string, b: string) => {
      const v = r[a] ?? r[b];
      return v == null ? '' : String(v).trim();
    };
    const num = (a: string, b: string) => {
      const v = r[a] ?? r[b];
      const x = Number(v);
      return Number.isFinite(x) ? x : 0;
    };

    const detallesRaw = r['detalles'] ?? r['Detalles'];
    const detalles: DetalleVentaResponseDto[] = Array.isArray(detallesRaw)
      ? detallesRaw.map(d =>
          this.normalizarDetalleVenta(
            d && typeof d === 'object' ? (d as Record<string, unknown>) : {}
          )
        )
      : [];

    return {
      idVenta:          num('idVenta', 'id'),
      documentoCliente: str('documentoCliente', 'DocumentoCliente'),
      cliente:          str('cliente', 'nombreCliente'),
      total:            num('total', 'Total'),
      fecha:            str('fecha', 'fechaVenta'),
      detalles
    };
  }

  private normalizarDetalleVenta(d: Record<string, unknown>): DetalleVentaResponseDto {
    const str = (a: string, b: string) => {
      const v = d[a] ?? d[b];
      return v == null ? '' : String(v).trim();
    };
    const num = (a: string, b: string) => {
      const v = d[a] ?? d[b];
      const x = Number(v);
      return Number.isFinite(x) ? x : 0;
    };
    return {
      id:              num('id', 'Id'),
      bicicletaId:     num('bicicletaId', 'BicicletaId'),
      marcaBicicleta:  str('marcaBicicleta', 'MarcaBicicleta'),
      modeloBicicleta: str('modeloBicicleta', 'ModeloBicicleta'),
      cantidad:        num('cantidad', 'Cantidad'),
      precioUnitario:  num('precioUnitario', 'PrecioUnitario'),
      subtotal:        num('subtotal', 'Subtotal')
    };
  }
}