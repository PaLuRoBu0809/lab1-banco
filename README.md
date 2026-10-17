# Banco — API bancaria con CI/CD y despliegue en la nube

Proyecto de **Arquitectura de Software** (Universidad de Antioquia, semestre 2026-2). Es una API REST bancaria (clientes, cuentas y transferencias) con un frontend en React, y un pipeline de **CI/CD en GitHub Actions** que prueba, analiza, empaqueta, publica en Docker Hub y despliega automáticamente en **Render**.

- Laboratorio 1: aplicación (backend + frontend).
- Laboratorio 2: pipeline de CI/CD y despliegue en la nube.

---

## Tabla de contenido

1. [Arquitectura](#arquitectura)
2. [Tecnologías](#tecnologías)
3. [Estructura del repositorio](#estructura-del-repositorio)
4. [Ejecución local](#ejecución-local)
5. [Variables de entorno](#variables-de-entorno)
6. [Pruebas y cobertura](#pruebas-y-cobertura)
7. [Endpoints principales](#endpoints-principales)
8. [Pipeline de CI/CD](#pipeline-de-cicd)
9. [Secretos de GitHub requeridos](#secretos-de-github-requeridos)
10. [Despliegue en Render](#despliegue-en-render)
11. [Flujo de trabajo (trunk-based)](#flujo-de-trabajo-trunk-based)
12. [Limitaciones conocidas](#limitaciones-conocidas)
13. [Autores](#autores)

---

## Arquitectura

```
Desarrollo ──► GitHub (main) ──► GitHub Actions ──► SonarCloud
                                      │
                                      ├──► Docker Hub (banco-api:latest y :<sha>)
                                      │
                                      └──► Render deploy hook ──► Render (contenedor) ──► PostgreSQL
```

El backend sigue una arquitectura por capas: controlador → servicio → repositorio → entidad (JPA).

## Tecnologías

| Componente | Herramienta |
| --- | --- |
| Backend | Spring Boot 3.5.11, Java 17, Maven |
| Persistencia | JPA / Hibernate 6.6 |
| BD local | MySQL |
| BD de pruebas | H2 en memoria |
| BD en la nube | PostgreSQL (Render) |
| Pruebas y cobertura | JUnit 5, MockMvc, JaCoCo 0.8.12 |
| Calidad | SonarCloud |
| CI/CD | GitHub Actions |
| Contenedores | Docker (`eclipse-temurin:17-jre-alpine`), Docker Hub |
| Despliegue | Render (plan gratuito) |
| Frontend | React |

## Estructura del repositorio

```
.
├── .github/workflows/build.yml   # Pipeline de CI/CD
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/                 # Código y application.properties
│       └── test/                 # Pruebas (H2) y application.properties de test
└── frontend/                     # Aplicación React
```

## Ejecución local

### Requisitos

- Java 17
- Maven 3.9+
- MySQL 8 en ejecución (o apuntar `DB_URL` a otra base compatible)
- Node.js 18+ (solo para el frontend)

### Backend

```bash
cd backend
# Opcional: si tu contraseña de MySQL no es "root"
export DB_PASSWORD=tu_contraseña      # Windows (cmd): set DB_PASSWORD=tu_contraseña
mvn spring-boot:run
```

La API queda en `http://localhost:8080`. Con `createDatabaseIfNotExist=true` en la URL por defecto, la base `lab12026p` se crea sola y Hibernate genera las tablas (`ddl-auto=update`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Ajusta la URL base de la API en el archivo de configuración del frontend si el backend no corre en `localhost:8080`.

## Variables de entorno

El backend no contiene credenciales: las lee del entorno, con valores por defecto pensados para desarrollo local.

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `PORT` | `8080` | Puerto del servidor (Render lo inyecta) |
| `DB_URL` | `jdbc:mysql://localhost:3306/lab12026p?...` | URL JDBC. En la nube: `jdbc:postgresql://<host>:5432/<base>` |
| `DB_USER` | `root` | Usuario de la base de datos |
| `DB_PASSWORD` | `root` | Contraseña de la base de datos |

**Importante:** `DB_URL` debe empezar por `jdbc:`; de lo contrario Spring falla con `'url' must start with "jdbc"`. No subas contraseñas reales al repositorio.

## Pruebas y cobertura

```bash
cd backend
mvn verify
```

- Las pruebas usan **H2 en memoria** (`src/test/resources/application.properties`), por lo que no requieren MySQL.
- JaCoCo genera el informe en `backend/target/site/jacoco/` y SonarCloud lo consume.
- Actualmente: 3 pruebas en verde. La cobertura es baja (~35 %); el servicio de transacciones tiene pocas pruebas unitarias.

## Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/customers` | Lista los clientes |
| `POST` | `/api/customers` | Crea un cliente |
| `GET` | `/api/transactions/{accountId}` | Historial de transacciones de una cuenta |

> La ruta raíz `/` no está definida: responde la *Whitelabel Error Page* (404), lo cual es normal.

Ejemplo:

```bash
curl https://<tu-servicio>.onrender.com/api/customers
```

## Pipeline de CI/CD

Definido en `.github/workflows/build.yml`. Cinco trabajos encadenados con `needs`:

| Trabajo | Qué hace | Cuándo corre |
| --- | --- | --- |
| `tests` | `mvn verify` con H2 y reporte JaCoCo | push a `main` y pull requests |
| `sonar` | Análisis y cobertura en SonarCloud | push a `main` y pull requests |
| `build` | Empaqueta `banco-api.jar` como artefacto | push a `main` y pull requests |
| `docker` | Construye y publica la imagen (`latest` y SHA del commit) | solo push a `main` |
| `deploy` | Llama al *deploy hook* de Render con la imagen del commit | solo push a `main` |

Si un trabajo falla, los siguientes no se ejecutan: un cambio roto nunca llega a producción. Un pull request solo valida; el despliegue ocurre al integrar en `main`.

## Secretos de GitHub requeridos

Configúralos en *Settings → Secrets and variables → Actions*:

| Secreto | Descripción |
| --- | --- |
| `SONAR_TOKEN` | Token de SonarCloud |
| `DOCKERHUB_USERNAME` | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Access token de Docker Hub (permisos Read & Write) |
| `RENDER_DEPLOY_HOOK_URL` | URL del *Deploy Hook* de Render (`https://api.render.com/deploy/srv-...?key=...`) |

Nunca publiques estos valores en issues, chats ni capturas de pantalla.

## Despliegue en Render

1. Crear una base **PostgreSQL** en Render y copiar la *Internal Database URL*.
2. Crear un **Web Service** con la opción **Existing Image** apuntando a `docker.io/<usuario>/banco-api:latest` (no desde el repositorio, o Render lo tomará como Node.js).
3. Definir las variables `DB_URL`, `DB_USER`, `DB_PASSWORD` (`PORT` lo inyecta Render).
4. Copiar el **Deploy Hook** del servicio y guardarlo como secreto `RENDER_DEPLOY_HOOK_URL`.
5. Cada push a `main` publica la imagen y Render despliega la etiqueta exacta del commit mediante el parámetro `imgURL` del hook.

## Flujo de trabajo (trunk-based)

Se usa *trunk-based development*: `main` siempre debe estar desplegable y los cambios llegan por ramas cortas con pull request.

```bash
git checkout main && git pull origin main
git checkout -b feat/descripcion-corta
# ... cambios ...
git add . && git commit -m "feat: descripción"
git push -u origin feat/descripcion-corta
# abrir PR, esperar checks en verde, integrar y borrar la rama
```

Integra cada PR antes de abrir el siguiente para evitar que arrastren cambios entre sí.

## Limitaciones conocidas

- **Plan gratuito de Render:** el servicio se suspende tras ~15 min sin tráfico y la primera petición tarda ~1 minuto; la base PostgreSQL gratuita caduca a los 30 días.
- **Cobertura de pruebas baja:** faltan pruebas de transferencias (incluido saldo insuficiente).
- **SonarCloud:** conviene desactivar el *Automatic Analysis* para que solo analice el pipeline.

## Autores

- Pablo Luis Rodríguez Burgos
- Isaac Cano Orozco

Profesor: Diego José Luis Botía Valderrama — Universidad de Antioquia, Facultad de Ingeniería, Ingeniería de Sistemas.
