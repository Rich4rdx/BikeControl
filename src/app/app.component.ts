import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="isAdminRoute; else homeLayout">
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </ng-container>
    <ng-template #homeLayout>
      <router-outlet></router-outlet>
    </ng-template>
    <app-toast></app-toast>
  `
})
export class AppComponent {
  isAdminRoute = false;

  private adminRoutes = ['/inventario', '/clientes', '/ventas', '/movimientos'];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAdminRoute = this.adminRoutes.some(r => e.urlAfterRedirects.startsWith(r));
    });
  }
}
