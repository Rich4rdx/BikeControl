import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MovimientoResponseDto, TipoMovimiento } from '../../core/models/models';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css']
})
export class MovimientosComponent implements OnInit {
  movimientos: MovimientoResponseDto[] = [];
  movimientosFiltrados: MovimientoResponseDto[] = [];
  filtro: 'TODOS' | TipoMovimiento = 'TODOS';
  loading = false;

  constructor(private http: HttpClient, public router: Router) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading = true;
    this.http.get<Record<string, unknown>[]>('/api/movimientos').subscribe({
      next: raw => {
        this.movimientos = (raw || []).map(r => this.normalizarMovimiento(r));
        this.aplicarFiltro();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private normalizarMovimiento(r: Record<string, unknown>): MovimientoResponseDto {
    const g = (a: string, b: string): string => {
      const v = r[a] ?? r[b];
      return v == null ? '' : String(v).trim();
    };
    const n = (a: string, b: string): number => {
      const v = r[a] ?? r[b];
      const x = Number(v);
      return Number.isFinite(x) ? x : 0;
    };

    // Si el backend devuelve bicicleta como objeto anidado, lo extraemos
    const bici = r['bicicleta'] as Record<string, unknown> | null;

    const tipoRaw = String(r['tipoMovimiento'] ?? r['TipoMovimiento'] ?? 'ENTRADA').toUpperCase();
    const tipoMovimiento: TipoMovimiento = tipoRaw === 'SALIDA' ? 'SALIDA' : 'ENTRADA';

    return {
      idMovimiento:    n('idMovimiento', 'IdMovimiento'),
      tipoMovimiento,
      cantidad:        n('cantidad', 'Cantidad'),
      fecha:           g('fecha', 'Fecha') || new Date().toISOString(),
      bicicletaId:     r['bicicletaId']     ? n('bicicletaId', 'BicicletaId')         : bici ? Number(bici['codigo'])  : 0,
      marcaBicicleta:  r['marcaBicicleta']  ? g('marcaBicicleta', 'MarcaBicicleta')   : bici ? String(bici['marca'] ?? '')  : '',
      modeloBicicleta: r['modeloBicicleta'] ? g('modeloBicicleta', 'ModeloBicicleta') : bici ? String(bici['modelo'] ?? '') : '',
    };
  }

  descripcionBici(m: MovimientoResponseDto): string {
    const marca  = (m.marcaBicicleta  || '').trim();
    const modelo = (m.modeloBicicleta || '').trim();
    if (marca && modelo) return `${marca} ${modelo}`;
    if (marca)  return marca;
    if (modelo) return modelo;
    if (m.bicicletaId > 0) return `Bicicleta #${m.bicicletaId}`;
    return 'Sin referencia';
  }

  aplicarFiltro() {
    this.movimientosFiltrados = this.filtro === 'TODOS'
      ? this.movimientos
      : this.movimientos.filter(m => m.tipoMovimiento === this.filtro);
  }

  cambiarFiltro(f: 'TODOS' | TipoMovimiento) {
    this.filtro = f;
    this.aplicarFiltro();
  }

  get totalEntradas(): number {
    return this.movimientos
      .filter(m => m.tipoMovimiento === 'ENTRADA')
      .reduce((s, m) => s + m.cantidad, 0);
  }

  get totalSalidas(): number {
    return this.movimientos
      .filter(m => m.tipoMovimiento === 'SALIDA')
      .reduce((s, m) => s + m.cantidad, 0);
  }

  get balance(): number { return this.totalEntradas - this.totalSalidas; }

  formatFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  irA(r: string) { this.router.navigate([r]); }
}