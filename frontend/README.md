# Frontend Banco (Lab 1 - Arquitectura de Software)

React + Vite + Axios. Consume el backend Spring Boot en http://localhost:8080.

## Vistas
- Clientes: lista de clientes (GET /api/customers) y formulario para crear (POST /api/customers)
- Transferir: transferencia entre cuentas (POST /api/transactions)
- Historial: transacciones de un cliente (GET /api/transactions/{accountNumber})

## Ejecutar
1. Backend: agregar CorsConfig.java y correr `./mvnw spring-boot:run`
2. Frontend:
   npm install
   npm run dev
3. Abrir http://localhost:5173
