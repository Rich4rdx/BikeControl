import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { VentaService } from '../../core/services/venta.service';
import { ToastService } from '../../core/services/toast.service';
import { ClienteResponseDto, VentaResponseDto } from '../../core/models/models';

type OrdenCliente = 'nombre-asc' | 'nombre-desc' | 'documento';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: ClienteResponseDto[] = [];
  clientesFiltrados: ClienteResponseDto[] = [];
  selectedCliente: ClienteResponseDto | null = null;
  historialVentas: VentaResponseDto[] = [];
  loadingHistorial = false;
  loading = false;
  showModal = false;
  saving = false;
  searchQuery = '';
  ordenActivo: OrdenCliente = 'nombre-asc';

  readonly ordenes: { label: string; value: OrdenCliente }[] = [
    { label: 'Nombre (A-Z)', value: 'nombre-asc' },
    { label: 'Nombre (Z-A)', value: 'nombre-desc' },
    { label: 'Documento', value: 'documento' }
  ];

  form: FormGroup;

  constructor(
    private clienteService: ClienteService,
    private ventaService: VentaService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      documento: ['', [Validators.required, Validators.maxLength(20)]],
      nombre:    ['', [Validators.required, Validators.maxLength(100)]],
      telefono:  ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  ngOnInit() { this.cargarClientes(); }

  cargarClientes() {
    this.loading = true;
    this.clienteService.listar().subscribe({
      next: data  => {
        this.clientes = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: _err => { this.loading = false; }
    });
  }

  buscar(q: string) {
    this.searchQuery = q;
    this.aplicarFiltros();
  }

  onOrden(value: string) {
    this.ordenActivo = value as OrdenCliente;
    this.aplicarFiltros();
  }

  get hayFiltroActivo(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  private aplicarFiltros() {
    const query = this.searchQuery.toLowerCase().trim();
    let list = this.clientes.filter(c =>
      !query ||
      c.nombre.toLowerCase().includes(query) ||
      c.documento.toLowerCase().includes(query) ||
      c.telefono.includes(query)
    );
    list = [...list].sort((a, b) => {
      switch (this.ordenActivo) {
        case 'nombre-desc':
          return b.nombre.localeCompare(a.nombre, 'es', { sensitivity: 'base' });
        case 'documento':
          return a.documento.localeCompare(b.documento, 'es', { numeric: true });
        default:
          return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
      }
    });
    this.clientesFiltrados = list;
  }

  iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  seleccionar(c: ClienteResponseDto) {
  this.selectedCliente = c;
  this.loadingHistorial = true;
  this.ventaService.listar().subscribe({
    next: ventas => {
      this.historialVentas = ventas.filter(v =>
        v.documentoCliente === c.documento  // ← ahora sí funciona
      );
      this.loadingHistorial = false;
    },
    error: () => { this.loadingHistorial = false; }
  });
  }



  private mismoDocumentoCliente(docVenta: string, docCliente: string): boolean {
    const a = (docVenta ?? '').toString().trim();
    const b = (docCliente ?? '').toString().trim();
    if (a === b) return true;
    const soloDigitosA = a.replace(/\D/g, '');
    const soloDigitosB = b.replace(/\D/g, '');
    if (soloDigitosA.length > 0 && soloDigitosA === soloDigitosB) return true;
    return false;
  }

  formatPrecio(p: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);
  }
formatFecha(f: any): string {
  if (!f) return 'Sin fecha';
  
 
  if (Array.isArray(f)) {
    const [year, month, day, hour = 0, min = 0] = f;
    const fecha = new Date(year, month - 1, day, hour, min);
    return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }


  const fecha = new Date(f);
  if (isNaN(fecha.getTime())) return 'Sin fecha';
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

  openModal()  { this.showModal = true; }
  closeModal() { this.showModal = false; this.form.reset(); }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.clienteService.registrar(this.form.value).subscribe({
      next: () => {
        this.toast.success('Cliente registrado exitosamente');
        this.closeModal();
        this.cargarClientes();
        this.saving = false;
      },
      error: () => {
        this.toast.error('Error al registrar el cliente');
        this.saving = false;
      }
    });
  }
}
