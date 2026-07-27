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

<!-- El usuario agrega aquí el screenshot o tabla de cobertura -->

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
