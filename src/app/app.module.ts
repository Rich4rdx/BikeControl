import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule }    from './app-routing.module';
import { AppComponent }        from './app.component';
import { ApiInterceptor }      from './core/interceptors/api.interceptor';

import { ToastComponent }      from './shared/components/sidebar/toast.component';

import { HomeComponent }        from './features/home/home.component';
import { InventarioComponent }  from './features/inventario/inventario.component';
import { ClientesComponent }    from './features/clientes/clientes.component';
import { VentasComponent }      from './features/ventas/ventas.component';
import { MovimientosComponent } from './features/movimientos/movimientos.component';

@NgModule({
  declarations: [
    AppComponent,
    ToastComponent,
    HomeComponent,
    InventarioComponent,
    ClientesComponent,
    VentasComponent,
    MovimientosComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
