import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent }        from './features/home/home.component';
import { InventarioComponent }  from './features/inventario/inventario.component';
import { ClientesComponent }    from './features/clientes/clientes.component';
import { VentasComponent }      from './features/ventas/ventas.component';
import { MovimientosComponent } from './features/movimientos/movimientos.component';

const routes: Routes = [
  { path: '',             component: HomeComponent },
  { path: 'inventario',  component: InventarioComponent },
  { path: 'clientes',    component: ClientesComponent },
  { path: 'ventas',      component: VentasComponent },
  { path: 'movimientos', component: MovimientosComponent },
  { path: '**',          redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
