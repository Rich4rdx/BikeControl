import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { ClienteService } from '../../core/services/cliente.service';
import { VentaService } from '../../core/services/venta.service';
import { ToastService } from '../../core/services/toast.service';
import { BicicletaResponseDto, ClienteResponseDto, TipoBicicleta } from '../../core/models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  bicicletas: BicicletaResponseDto[] = [];
  bicicletasFiltradas: BicicletaResponseDto[] = [];
  filtroActivo: string = 'TODAS';
  searchQuery = '';
  loading = false;

  
  showModal = false;
  bicicletaSeleccionada: BicicletaResponseDto | null = null;
  cantidad = 1;
  documentoBusqueda = '';
  clienteEncontrado: ClienteResponseDto | null = null;
  errorCliente = '';
  clientesModal: ClienteResponseDto[] = [];
  cargandoClientesModal = false;
  mostrarSugerenciasCliente = false;
  private blurSugerenciasTimer: ReturnType<typeof setTimeout> | null = null;
  procesando = false;
  ventaExitosa = false;

  filtros = [
    { label: 'Todos los tipos', value: 'TODAS' },
    { label: 'Montaña',         value: 'MONTAÑA' },
    { label: 'Urbana',          value: 'URBANA'  },
    { label: 'Ruta',            value: 'RUTA'    },
  ];

  constructor(
    private bicicletaService: BicicletaService,
    private clienteService: ClienteService,
    private ventaService: VentaService,
    private toast: ToastService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loading = true;
    this.bicicletaService.listar().subscribe({
      next: data  => { this.bicicletas = data; this.aplicarFiltros(); this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  aplicarFiltros() {
    let lista = this.bicicletas.filter(b => b.cantidadInventario > 0);
    if (this.filtroActivo !== 'TODAS') {
      lista = lista.filter(b => b.tipo === this.filtroActivo);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      lista = lista.filter(b =>
        b.marca.toLowerCase().includes(q) ||
        b.modelo.toLowerCase().includes(q) ||
        String(b.codigo).includes(q)
      );
    }
    this.bicicletasFiltradas = lista;
  }

  
  get totalVistaCatalogo(): number {
    let lista = this.bicicletas.filter(b => b.cantidadInventario > 0);
    if (this.filtroActivo !== 'TODAS') {
      lista = lista.filter(b => b.tipo === this.filtroActivo);
    }
    return lista.length;
  }

  get todoInventarioAgotado(): boolean {
    return this.bicicletas.length > 0 && this.bicicletas.every(b => b.cantidadInventario <= 0);
  }

  onSearch(q: string) { this.searchQuery = q; this.aplicarFiltros(); }
  onFiltro(v: string) { this.filtroActivo = v; this.aplicarFiltros(); }

  // Modal
  abrirModalCompra(b: BicicletaResponseDto) {
    this.bicicletaSeleccionada = b;
    this.cantidad = 1;
    this.documentoBusqueda = '';
    this.clienteEncontrado = null;
    this.errorCliente = '';
    this.ventaExitosa = false;
    this.mostrarSugerenciasCliente = false;
    this.clientesModal = [];
    this.cargandoClientesModal = true;
    this.showModal = true;
    this.clienteService.listar().subscribe({
      next: list => {
        this.clientesModal = list;
        this.cargandoClientesModal = false;
      },
      error: () => {
        this.clientesModal = [];
        this.cargandoClientesModal = false;
        this.errorCliente = 'No se pudieron cargar los clientes.';
      }
    });
  }

  cerrarModal() {
    this.showModal = false;
    if (this.blurSugerenciasTimer) {
      clearTimeout(this.blurSugerenciasTimer);
      this.blurSugerenciasTimer = null;
    }
  }

  get sugerenciasCliente(): ClienteResponseDto[] {
    const q = this.documentoBusqueda.toLowerCase().trim();
    let list = this.clientesModal;
    if (q) {
      list = list.filter(
        c =>
          c.nombre.toLowerCase().includes(q) ||
          c.documento.toLowerCase().includes(q) ||
          c.telefono.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
      );
    }
    return list.slice(0, 12);
  }

  onClienteInput(_value: string) {
    this.clienteEncontrado = null;
    this.errorCliente = '';
  }

  onClienteFocus() {
    if (this.blurSugerenciasTimer) {
      clearTimeout(this.blurSugerenciasTimer);
      this.blurSugerenciasTimer = null;
    }
    this.mostrarSugerenciasCliente = true;
  }

  onClienteBlurCerrar() {
    this.blurSugerenciasTimer = setTimeout(() => {
      this.mostrarSugerenciasCliente = false;
      this.blurSugerenciasTimer = null;
    }, 200);
  }

  seleccionarClienteSugerido(c: ClienteResponseDto, ev?: Event) {
    ev?.preventDefault();
    if (this.blurSugerenciasTimer) {
      clearTimeout(this.blurSugerenciasTimer);
      this.blurSugerenciasTimer = null;
    }
    this.clienteEncontrado = c;
    this.documentoBusqueda = `${c.nombre} · ${c.documento}`;
    this.errorCliente = '';
    this.mostrarSugerenciasCliente = false;
  }

  onClienteEnter(ev: Event) {
    ev.preventDefault();
    if (this.clienteEncontrado) return;
    const sug = this.sugerenciasCliente;
    if (sug.length === 1) {
      this.seleccionarClienteSugerido(sug[0]);
      return;
    }
    const q = this.documentoBusqueda.trim();
    if (!q) return;
    const docExacto = this.clientesModal.find(
      c => c.documento === q || c.documento.replace(/\D/g, '') === q.replace(/\D/g, '')
    );
    if (docExacto) {
      this.seleccionarClienteSugerido(docExacto);
    }
  }

  get subtotal(): number {
    return (this.bicicletaSeleccionada?.precio || 0) * this.cantidad;
  }

  cambiarCantidad(delta: number) {
    const nueva = this.cantidad + delta;
    if (nueva < 1) return;
    if (nueva > (this.bicicletaSeleccionada?.cantidadInventario || 1)) return;
    this.cantidad = nueva;
  }

  confirmarCompra() {
    if (!this.clienteEncontrado || !this.bicicletaSeleccionada) return;
    this.procesando = true;
    this.ventaService.registrar({
      documentoCliente: this.clienteEncontrado.documento,
      detalles: [{ bicicletaId: this.bicicletaSeleccionada.codigo, cantidad: this.cantidad }]
    }).subscribe({
      next: () => {
        this.ventaExitosa = true;
        this.procesando = false;
        // actualizar stock local
        const b = this.bicicletas.find(x => x.codigo === this.bicicletaSeleccionada!.codigo);
        if (b) b.cantidadInventario -= this.cantidad;
        this.aplicarFiltros();
      },
      error: () => {
        this.toast.error('Error al procesar la compra');
        this.procesando = false;
      }
    });
  }

  formatPrecio(p: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);
  }

  getBadgeClass(tipo: TipoBicicleta): string {
    return { 'MONTAÑA': 'badge-montana', 'URBANA': 'badge-urbana', 'RUTA': 'badge-ruta' }[tipo] || '';
  }

  getDisponibilidadLabel(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock <= 3) return `Solo ${stock} disponibles`;
    return 'En stock';
  }

  getDisponibilidadClass(stock: number): string {
    if (stock === 0) return 'disp-agotado';
    if (stock <= 3) return 'disp-poco';
    return 'disp-ok';
  }

  irA(route: string) { this.router.navigate([route]); }
}
