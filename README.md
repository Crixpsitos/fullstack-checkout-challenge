# Fullstack Checkout Challenge

Aplicación fullstack de checkout de productos con pago mediante tarjeta de crédito, integrada con una pasarela de pagos externa (sandbox).

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | NestJS 11 · TypeScript · TypeORM · PostgreSQL |
| Frontend | React 19 · Vite · Redux Toolkit · RTK Query · Tailwind v4 |
| Testing | Jest 30 |
| Infraestructura | Docker · Docker Compose |

---

## Arquitectura del backend

El backend sigue **arquitectura hexagonal** por módulo con **Railway-Oriented Programming (ROP)** para el manejo de errores:

```
src/
├── config/               # database.config, payment-gateway.config
├── shared/               # Result<T,E>, DTOs compartidos, Storage port
└── modules/
    ├── categories/       # CRUD categorías
    ├── products/         # CRUD productos + imágenes
    ├── customers/        # Upsert por email + historial de entregas
    ├── delivery/         # Registros de entrega (inmutables, auditables)
    └── transaction/      # Procesamiento de pagos
        ├── domain/       # Entidades, errores, ports
        ├── application/  # ProcessPaymentUseCase, TransactionApplicationService
        └── infrastructure/
            ├── gateway/  # HttpPaymentGateway (SHA-256, polling de estado)
            ├── http/     # TransactionController + DTOs
            └── persistence/ # TypeORM repository
```

Cada módulo respeta las capas: `domain → application → infrastructure`, sin dependencias inversas.

---

## Flujo de pago

```
Frontend                          Backend                       Pasarela
   │                                 │                              │
   ├─ Obtiene acceptance_token ──────┤──────────────────────────────►
   ├─ Tokeniza tarjeta ──────────────┤──────────────────────────────►
   │                                 │
   ├─ POST /api/transactions ────────►
   │                                 ├─ Verifica idempotencia
   │                                 ├─ Valida stock
   │                                 ├─ Crea Delivery + Transaction(PENDING)
   │                                 ├─ Llama pasarela ─────────────►
   │                                 ├─ Polling hasta estado terminal
   │                                 ├─ APPROVED → descuenta stock
   │                                 │
   ◄─ { status, transactionId } ─────┤
   │
   ├─ APPROVED → PaymentSuccess
   └─ DECLINED/ERROR → PaymentError
```

---

## Instalación y ejecución

### Prerrequisitos

- Node.js ≥ 20
- pnpm
- Docker + Docker Compose

### Desarrollo (modo rápido)

```bash
# Clonar el repositorio
git clone <repo-url>
cd fullstack-checkout-challenge

# Configurar variables de entorno
cp backend/.env.example backend/.env   # completar con las llaves de la pasarela
cp frontend/.env.example frontend/.env # completar con la llave pública

# Levantar todo (Docker + backend + frontend)
chmod +x start.sh && ./start.sh
```

### Instalación manual

```bash
# Base de datos
docker compose -f docker/docker-compose.yml up -d

# Backend
cd backend
pnpm install
pnpm run start:dev   # http://localhost:3000

# Frontend
cd frontend
pnpm install
pnpm run dev         # http://localhost:5173
```

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default: 3000) |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Conexión PostgreSQL |
| `DB_SSL` | `true` para SSL con RDS (requiere `globa-rds.pem` en raíz) |
| `CORS_ORIGINS` | URLs permitidas separadas por coma |
| `PAYMENT_GATEWAY_UAT_URL` | URL sandbox de la pasarela |
| `PAYMENT_PRIVATE_KEY` | Llave privada de la pasarela (`prv_stagtest_...`) |
| `PAYMENT_INTEGRITY_SECRET` | Secret para firma SHA-256 |
| `PAYMENT_EVENTS_SECRET` | Secret para webhooks |
| `PAYMENT_API_TIMEOUT` | Timeout HTTP en ms (default: 30000) |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL del backend con prefijo `/api` |
| `VITE_PAYMENT_GATEWAY_SANDBOX_URL` | URL sandbox de la pasarela |
| `VITE_PAYMENT_PUBLIC_KEY` | Llave pública de la pasarela (`pub_stagtest_...`) |

---

## Tests

```bash
cd backend

# Ejecutar todos los tests
pnpm test

# Con cobertura
pnpm test:cov
```

Cobertura objetivo: **≥ 80% en todas las métricas**.

---

## Resultado test coverage

--------------------------------------|---------|----------|---------|---------|-------------------
File                                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------------------|---------|----------|---------|---------|-------------------
All files                             |   92.36 |    82.08 |    86.2 |   92.71 |                   
 config                               |       0 |        0 |       0 |       0 |                   
  payment-gateway.config.ts           |       0 |        0 |       0 |       0 | 1-3               
 database/seeds                       |       0 |        0 |       0 |       0 |                   
  seed.ts                             |       0 |        0 |       0 |       0 | 1-191             
 modules/categories/application       |   95.12 |    81.81 |     100 |     100 |                   
  category.application.service.ts     |   95.12 |    81.81 |     100 |     100 | 56-59,61-62       
 modules/categories/domain/entities   |     100 |      100 |     100 |     100 |                   
  category.entity.ts                  |     100 |      100 |     100 |     100 |                   
 modules/categories/domain/errors     |     100 |      100 |     100 |     100 |                   
  category.errors.ts                  |     100 |      100 |     100 |     100 |                   
 modules/categories/domain/ports      |     100 |      100 |     100 |     100 |                   
  category.repository.port.ts         |     100 |      100 |     100 |     100 |                   
 ...es/categories/infrastructure/http |     100 |    80.95 |     100 |     100 |                   
  category.controller.ts              |     100 |    80.95 |     100 |     100 | 25-38,53,69-70,92 
 ...ategories/infrastructure/http/dto |     100 |       75 |     100 |     100 |                   
  category-response.dto.ts            |     100 |       75 |     100 |     100 | 20-23             
  create-category.dto.ts              |     100 |      100 |     100 |     100 |                   
  update-category.dto.ts              |     100 |      100 |     100 |     100 |                   
 ...re/persistence/typeorm/repository |     100 |     87.5 |     100 |     100 |                   
  category.typeorm.repository.ts      |     100 |     87.5 |     100 |     100 | 12                
 ...ucture/persistence/typeorm/schema |   86.66 |       75 |       0 |   91.66 |                   
  category.orm-entity.ts              |   86.66 |       75 |       0 |   91.66 | 34                
 modules/customers/application        |     100 |      100 |     100 |     100 |                   
  customer.application.service.ts     |     100 |      100 |     100 |     100 |                   
 modules/customers/domain/entities    |     100 |      100 |     100 |     100 |                   
  customer.entity.ts                  |     100 |      100 |     100 |     100 |                   
 modules/customers/domain/errors      |     100 |      100 |     100 |     100 |                   
  customer.errors.ts                  |     100 |      100 |     100 |     100 |                   
 modules/customers/domain/ports       |     100 |      100 |     100 |     100 |                   
  customer.repository.port.ts         |     100 |      100 |     100 |     100 |                   
 ...les/customers/infrastructure/http |      90 |       75 |   83.33 |   89.18 |                   
  customer.controller.ts              |      90 |       75 |   83.33 |   89.18 | 97-104            
 ...customers/infrastructure/http/dto |     100 |       75 |     100 |     100 |                   
  create-customer.dto.ts              |     100 |      100 |     100 |     100 |                   
  customer-response.dto.ts            |     100 |       75 |     100 |     100 | 8-17              
  update-customer.dto.ts              |     100 |      100 |     100 |     100 |                   
 ...frastructure/persistence/http/dto |       0 |      100 |     100 |       0 |                   
  create-customer.dto.ts              |       0 |      100 |     100 |       0 | 1-14              
  update-customer.dto.ts              |       0 |      100 |     100 |       0 | 1-14              
 ...re/persistence/typeorm/repository |     100 |       90 |     100 |     100 |                   
  customer.typeorm.repository.ts      |     100 |       90 |     100 |     100 | 12                
 ...ucture/persistence/typeorm/schema |   85.71 |       75 |       0 |    90.9 |                   
  customer.orm-entity.ts              |   85.71 |       75 |       0 |    90.9 | 31                
 modules/delivery/application         |     100 |      100 |     100 |     100 |                   
  delivery.application.service.ts     |     100 |      100 |     100 |     100 |                   
 modules/delivery/domain/entities     |     100 |      100 |     100 |     100 |                   
  delivery.entity.ts                  |     100 |      100 |     100 |     100 |                   
 modules/delivery/domain/errors       |     100 |      100 |     100 |     100 |                   
  delivery.errors.ts                  |     100 |      100 |     100 |     100 |                   
 modules/delivery/domain/ports        |     100 |      100 |     100 |     100 |                   
  delivery.repository.port.ts         |     100 |      100 |     100 |     100 |                   
 .../delivery/infrastructure/http/dto |     100 |      100 |     100 |     100 |                   
  create-delivery.dto.ts              |     100 |      100 |     100 |     100 |                   
 ...re/persistence/typeorm/repository |     100 |       90 |     100 |     100 |                   
  delivery.typeorm.repository.ts      |     100 |       90 |     100 |     100 | 12                
 ...ucture/persistence/typeorm/schema |   86.66 |    83.33 |       0 |   91.66 |                   
  delivery.orm-entity.ts              |   86.66 |    83.33 |       0 |   91.66 | 35                
 modules/products/application         |     100 |      100 |     100 |     100 |                   
  product.application.service.ts      |     100 |      100 |     100 |     100 |                   
 modules/products/domain/entities     |     100 |      100 |     100 |     100 |                   
  product.entity.ts                   |     100 |      100 |     100 |     100 |                   
 modules/products/domain/errors       |   72.72 |      100 |   66.66 |   72.72 |                   
  product.errors.ts                   |   72.72 |      100 |   66.66 |   72.72 | 15-18             
 modules/products/domain/ports        |     100 |      100 |     100 |     100 |                   
  product.repository.port.ts          |     100 |      100 |     100 |     100 |                   
 ...les/products/domain/value-objects |     100 |      100 |     100 |     100 |                   
  money.vo.ts                         |     100 |      100 |     100 |     100 |                   
 modules/products/infrastructure/http |      88 |       75 |   85.71 |    87.5 |                   
  product.controller.ts               |      88 |       75 |   85.71 |    87.5 | 82-85,109-112     
 .../products/infrastructure/http/dto |    98.3 |       75 |    90.9 |   98.14 |                   
  category-summary.dto.ts             |     100 |      100 |     100 |     100 |                   
  create-product.dto.ts               |     100 |      100 |     100 |     100 |                   
  product-filter.dto.ts               |     100 |      100 |     100 |     100 |                   
  product-response.dto.ts             |     100 |       75 |     100 |     100 | 26-32             
  update-product.dto.ts               |   91.66 |      100 |   66.66 |   91.66 | 39                
 ...re/persistence/typeorm/repository |     100 |       95 |     100 |     100 |                   
  product.typeorm.repository.ts       |     100 |       95 |     100 |     100 | 15                
 ...ucture/persistence/typeorm/schema |   77.77 |    71.42 |       0 |      80 |                   
  product.orm-entity.ts               |   77.77 |    71.42 |       0 |      80 | 28-29,40          
 ...s/products/infrastructure/storage |     100 |      100 |     100 |     100 |                   
  local-storage.service.ts            |     100 |      100 |     100 |     100 |                   
 modules/transaction/application      |     100 |      100 |     100 |     100 |                   
  transaction.application.service.ts  |     100 |      100 |     100 |     100 |                   
 ...transaction/application/use-cases |     100 |    94.44 |     100 |     100 |                   
  process-payment.use-case.ts         |     100 |    94.44 |     100 |     100 | 130               
 modules/transaction/domain/entities  |   97.91 |    93.75 |     100 |   97.91 |                   
  transaction-status.vo.ts            |     100 |      100 |     100 |     100 |                   
  transaction.entity.ts               |   97.61 |    92.85 |     100 |   97.61 | 113               
 modules/transaction/domain/errors    |     100 |      100 |     100 |     100 |                   
  payment-gateway.errors.ts           |     100 |      100 |     100 |     100 |                   
  transaction.errors.ts               |     100 |      100 |     100 |     100 |                   
 modules/transaction/domain/ports     |     100 |      100 |     100 |     100 |                   
  payment-gateway.port.ts             |     100 |      100 |     100 |     100 |                   
  transaction.repository.port.ts      |     100 |      100 |     100 |     100 |                   
 ...ransaction/infrastructure/gateway |     100 |    82.92 |     100 |     100 |                   
  http-payment.gateway.ts             |     100 |    82.92 |     100 |     100 | 25-66,82-85       
 ...s/transaction/infrastructure/http |     100 |    83.33 |     100 |     100 |                   
  transaction.controller.ts           |     100 |    83.33 |     100 |     100 | 24-30,51,70       
 ...ansaction/infrastructure/http/dto |   96.15 |       75 |       0 |   96.15 |                   
  create-transaction.dto.ts           |   94.44 |      100 |       0 |   94.44 | 65                
  transaction-response.dto.ts         |     100 |       75 |     100 |     100 | 9                 
 ...re/persistence/typeorm/repository |     100 |     87.5 |     100 |     100 |                   
  transaction.typeorm.repository.ts   |     100 |     87.5 |     100 |     100 | 12                
 ...ucture/persistence/typeorm/schema |    87.5 |       75 |       0 |   86.36 |                   
  transaction.orm-entity.ts           |    87.5 |       75 |       0 |   86.36 | 35,39,43          
 shared/dto                           |     100 |       50 |     100 |     100 |                   
  paginated-response.dto.ts           |     100 |       50 |     100 |     100 | 25-28             
  pagination.dto.ts                   |     100 |      100 |     100 |     100 |                   
 shared/result                        |     100 |      100 |     100 |     100 |                   
  result.ts                           |     100 |      100 |     100 |     100 |                   
 shared/storage                       |      50 |      100 |       0 |      50 |                   
  storage.service.port.ts             |      50 |      100 |       0 |      50 | 5-7               
--------------------------------------|---------|----------|---------|---------|-------------------

Test Suites: 29 passed, 29 total
Tests:       341 passed, 341 total
Snapshots:   0 total
Time:        19.302 s
Ran all test suites.

---

## Estructura del frontend

```
src/
├── pages/          # Home, Products, ProductDetail, Checkout
├── components/
│   ├── checkout/   # StepPayment, StepSummary, PaymentProcessing,
│   │               # PaymentSuccess, PaymentError
│   └── ...         # Navbar, ProductCard, HeroSection, etc.
├── services/       # RTK Query APIs (products, categories, customers,
│                   # transactions, gateway)
├── store/          # Redux store + checkoutSlice
└── router/         # React Router con lazy loading
```

### Características UX

- Auto-relleno de datos del cliente al ingresar el email
- Auto-inserción del `/` en el campo de vencimiento de tarjeta
- Loading con datos curiosos rotatorios mientras se procesa el pago
- Selector de cantidad con validación de stock en tiempo real
- Invalidación de caché de productos al completar una compra
