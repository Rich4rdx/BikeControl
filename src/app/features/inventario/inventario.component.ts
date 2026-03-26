import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { ToastService } from '../../core/services/toast.service';
import { BicicletaResponseDto, TipoBicicleta } from '../../core/models/models';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  
  bicicletas: BicicletaResponseDto[] = [];
  bicicletasFiltradas: BicicletaResponseDto[] = [];
  loading = false;
  showModal = false;
  saving = false;
  searchQuery = '';
  filtroTipo = 'TODAS';

  form: FormGroup;
  tipos: TipoBicicleta[] = ['MONTAÑA', 'URBANA', 'RUTA'];

  constructor(
    private bicicletaService: BicicletaService,
    private toast: ToastService,
    private fb: FormBuilder,
    public router: Router
  ) {
    this.form = this.fb.group({
      marca:              ['', [Validators.required, Validators.maxLength(50)]],
      modelo:             ['', [Validators.required, Validators.maxLength(50)]],
      tipo:               ['', Validators.required],
      precio:             [null, [Validators.required, Validators.min(1)]],
      cantidadInventario: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() { 
    this.cargar(); 
  }

  cargar() {
    this.loading = true;
    this.bicicletaService.listar().subscribe({
      next: data => {
    
        this.bicicletas = data || [];
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => { 
        console.error('Error de conexión:', err);
        this.bicicletas = []; 
        this.aplicarFiltros();
        this.loading = false; 
      }
    });
  }

  aplicarFiltros() {
  
    let lista = this.bicicletas || [];

    if (this.filtroTipo !== 'TODAS') {
      lista = lista.filter(b => b && b.tipo === this.filtroTipo);
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      lista = lista.filter(b =>
        b && (
          (b.marca?.toLowerCase().includes(q)) ||
          (b.modelo?.toLowerCase().includes(q)) ||
          (String(b.codigo || '').includes(q))
        )
      );
    }

    
    this.bicicletasFiltradas = [
      ...lista.filter(b => (b.cantidadInventario || 0) > 0),
      ...lista.filter(b => (b.cantidadInventario || 0) === 0)
    ];
  }

  onSearch(q: string) { 
    this.searchQuery = q; 
    this.aplicarFiltros(); 
  }

  onFiltro(v: string) { 
    this.filtroTipo = v; 
    this.aplicarFiltros(); 
  }


  get totalStock(): number {
    return (this.bicicletas || []).reduce((s, b) => s + (b.cantidadInventario || 0), 0);
  }

  get bajosStock(): number {
    return (this.bicicletas || []).filter(b => (b.cantidadInventario || 0) < 3).length;
  }

  getBadgeClass(tipo: TipoBicicleta): string {
    const classes: Record<string, string> = {
      'MONTAÑA': 'badge-montana',
      'URBANA':  'badge-urbana',
      'RUTA':    'badge-ruta'
    };
    return classes[tipo] || '';
  }

  formatPrecio(p: number): string {
    if (p === null || p === undefined) return '$ 0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(p);
  }

  openModal()  { this.showModal = true; }
  
  closeModal() { 
    this.showModal = false; 
    this.form.reset(); 
  }

  guardar() {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.saving = true;
    this.bicicletaService.crear(this.form.value).subscribe({
      next: () => {
        this.toast.success('Bicicleta registrada exitosamente');
        this.closeModal();
        this.cargar();
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.toast.error('Error al registrar la bicicleta. Revisa la consola.');
        this.saving = false;
      }
    });
  }

  irA(r: string) { 
    this.router.navigate([r]); 
  }
}