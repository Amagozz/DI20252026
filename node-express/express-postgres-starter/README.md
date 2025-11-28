# Express + Postgres Starter

Este proyecto muestra cómo conectar **Express (Node.js)** con **Postgres** y exponer datos como JSON.

## 1. Preparar la base de datos

En Postgres:

```sql
CREATE DATABASE escuela;

\c escuela;

CREATE TABLE alumnos (
  id SERIAL PRIMARY KEY,
  nombre TEXT,
  edad INT
);

INSERT INTO alumnos (nombre, edad) VALUES
('Ana', 22),
('Luis', 20),
('María', 23);
```

## 2. Configurar variables de entorno

Copia `.env.sample` a `.env` y ajusta credenciales:

```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=tu_password
PGDATABASE=escuela
PGPORT=5432
PORT=5174
```

## 3. Instalar y arrancar

```bash
cd server
npm install
npm run dev
```

Servidor en: [http://localhost:5174/api/alumnos](http://localhost:5174/api/alumnos)
