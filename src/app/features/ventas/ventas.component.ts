import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../core/services/cliente.service';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { VentaService } from '../../core/services/venta.service';
import { ToastService } from '../../core/services/toast.service';
import { ClienteResponseDto, BicicletaResponseDto, DetalleVentaRequestDto } from '../../core/models/models';

interface ItemCarrito {
  bicicleta: BicicletaResponseDto;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
 
  documentoBusqueda = '';
  clienteEncontrado: ClienteResponseDto | null = null;
  buscandoCliente = false;
  errorCliente = '';

 
  bicicletas: BicicletaResponseDto[] = [];
  bicicletasFiltradas: BicicletaResponseDto[] = [];
  searchBici = '';


  carrito: ItemCarrito[] = [];


  procesando = false;

  constructor(
    private clienteService: ClienteService,
    private bicicletaService: BicicletaService,
    private ventaService: VentaService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.bicicletaService.listar().subscribe({
      next: data => { this.bicicletas = data; this.bicicletasFiltradas = data; }
    });
  }

  buscarCliente() {
    if (!this.documentoBusqueda.trim()) return;
    this.buscandoCliente = true;
    this.errorCliente = '';
    this.clienteEncontrado = null;
    this.clienteService.buscarPorDocumento(this.documentoBusqueda.trim()).subscribe({
      next: c  => { this.clienteEncontrado = c; this.buscandoCliente = false; },
      error: () => { this.errorCliente = 'Cliente no encontrado'; this.buscandoCliente = false; }
    });
  }

  filtrarBicicletas(q: string) {
    this.searchBici = q;
    const query = q.toLowerCase();
    this.bicicletasFiltradas = this.bicicletas.filter(b =>
      b.modelo.toLowerCase().includes(query) ||
      b.marca.toLowerCase().includes(query) ||
      String(b.codigo).includes(query)
    );
  }

  agregarAlCarrito(b: BicicletaResponseDto) {
    if (b.cantidadInventario <= 0) { this.toast.warning('Sin stock disponible'); return; }
    const existing = this.carrito.find(i => i.bicicleta.codigo === b.codigo);
    if (existing) {
      if (existing.cantidad >= b.cantidadInventario) { this.toast.warning('No hay más stock'); return; }
      existing.cantidad++;
      existing.subtotal = existing.cantidad * existing.bicicleta.precio;
    } else {
      this.carrito.push({ bicicleta: b, cantidad: 1, subtotal: b.precio });
    }
  }

  cambiarCantidad(item: ItemCarrito, delta: number) {
    const nueva = item.cantidad + delta;
    if (nueva <= 0) { this.quitarItem(item); return; }
    if (nueva > item.bicicleta.cantidadInventario) { this.toast.warning('No hay más stock'); return; }
    item.cantidad = nueva;
    item.subtotal = nueva * item.bicicleta.precio;
  }

  quitarItem(item: ItemCarrito) {
    this.carrito = this.carrito.filter(i => i.bicicleta.codigo !== item.bicicleta.codigo);
  }

  get total(): number {
    return this.carrito.reduce((s, i) => s + i.subtotal, 0);
  }

  get puedeVender(): boolean {
    return !!this.clienteEncontrado && this.carrito.length > 0 && !this.procesando;
  }

  procesarVenta() {
    if (!this.puedeVender) return;
    this.procesando = true;
    const detalles: DetalleVentaRequestDto[] = this.carrito.map(i => ({
      bicicletaId: i.bicicleta.codigo,
      cantidad: i.cantidad
    }));
    this.ventaService.registrar({
      documentoCliente: this.clienteEncontrado!.documento,
      detalles
    }).subscribe({
      next: () => {
        this.toast.success('¡Venta procesada exitosamente!');
        this.carrito = [];
        this.clienteEncontrado = null;
        this.documentoBusqueda = '';
        this.procesando = false;
        this.bicicletaService.listar().subscribe(data => {
          this.bicicletas = data;
          this.bicicletasFiltradas = data;
        });
      },
      error: () => {
        this.toast.error('Error al procesar la venta');
        this.procesando = false;
      }
    });
  }

  formatPrecio(p: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);
  }

  getBadgeClass(tipo: string): string {
    return { 'MONTAÑA': 'badge-montana', 'URBANA': 'badge-urbana', 'RUTA': 'badge-ruta' }[tipo] || '';
  }
}
