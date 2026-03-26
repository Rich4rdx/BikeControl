# BikeShop Frontend — Angular 16

Frontend para la tienda de bicicletas, conectado al backend Spring Boot.

## Requisitos previos
- Node.js 18+
- Angular CLI 16: `npm install -g @angular/cli@16`

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
ng serve
```

La app corre en: **http://localhost:4200**

## Configuración del backend

El interceptor `ApiInterceptor` apunta a `http://localhost:8080`.
Si tu backend corre en otro puerto, edita:

```
src/app/core/interceptors/api.interceptor.ts
```

### CORS en Spring Boot
Asegúrate de tener CORS habilitado en tu backend. Agrega esto en tu `@RestController` o en una clase de configuración:

```java
@CrossOrigin(origins = "http://localhost:4200")
```

O bien una configuración global:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/   → ApiInterceptor (base URL)
│   │   ├── models/         → Interfaces TypeScript (DTOs)
│   │   └── services/       → BicicletaService, ClienteService, VentaService, ToastService
│   ├── features/
│   │   ├── inventario/     → Dashboard con tabla y modal agregar bicicleta
│   │   ├── clientes/       → Directorio de clientes + historial de compras
│   │   ├── ventas/         → Terminal POS (seleccionar cliente + carrito)
│   │   └── movimientos/    → Timeline de entradas/salidas
│   └── shared/
│       └── components/
│           ├── sidebar/    → Navegación lateral
│           └── toast/      → Notificaciones toast
└── styles.css              → Variables globales dark mode
```

## Páginas

| Ruta           | Descripción                              |
|----------------|------------------------------------------|
| `/inventario`  | Dashboard de inventario + agregar bici   |
| `/clientes`    | Directorio + historial por cliente       |
| `/ventas`      | POS: buscar cliente, carrito, confirmar  |
| `/movimientos` | Auditoría de entradas y salidas          |

## Notas

- La página de **Movimientos** usa el endpoint `/api/movimientos` — asegúrate de tenerlo en tu backend o ajusta el servicio.
- Los modelos TypeScript están en `src/app/core/models/models.ts` — ajústalos si tus DTOs de respuesta tienen campos diferentes.
