# Introducción a TypeScript (3 horas)

Este paquete acompaña una sesión práctica para pasar de **JavaScript moderno** a **TypeScript** sin dolor. Está pensado para alumnado de 2º DAM/DAW que ya ha visto JS. Todos los ejemplos usan **módulos ES** (`import`/`export`) en TypeScript; el compilado genera JS ejecutable con Node.

## Objetivos de aprendizaje
1. Comprender qué aporta el **tipado estático** y el **análisis en compilación**.
2. Manejar **tipos básicos**, **funciones**, **uniones**, **`type`/`interface`**.
3. Usar **clases**, **modificadores de acceso**, **genéricos** básicos.
4. Montar un mini **proyecto** en TS (gestor de tareas en consola).

## Requisitos
- Node 18+
- VS Code (recomendado) con extensión oficial *TypeScript and JavaScript Language Features*.

## Puesta en marcha rápida
```bash
# Clona o descarga este paquete
# (Si es un .zip, descomprímelo y entra en la carpeta)
cd typescript-intro

# Para ejecutar los ejercicios que compilan (p.ej. el proyecto 05):
cd ejercicios/05_proyecto_tareas
npm init -y
npm install typescript --save-dev
npx tsc --init
# Sustituye el tsconfig.json por el incluido en esta carpeta
npx tsc
node dist/index.js
```

> **Nota**: Los ejercicios 01–04 son archivos sueltos con indicaciones; puedes compilar con `tsc` (poniéndolos dentro de `src/`) o copiar el contenido al proyecto 05 para probar.

## Estructura
```
ejercicios/
  01_tipos_basicos.ts
  02_interfaces.ts
  03_clases.ts
  04_genericos.ts
  05_proyecto_tareas/
    src/
      index.ts
      gestor.ts
      tarea.ts
    tsconfig.json
soluciones/
  01_tipos_basicos_solucion.ts
  02_interfaces_solucion.ts
  03_clases_solucion.ts
  04_genericos_solucion.ts
  05_proyecto_tareas_solucion/
    src/
      index.ts
      gestor.ts
      tarea.ts
    tsconfig.json
```

## Sugerencias didácticas (rápidas)
- **Primero** ejecuta el mismo código en JS y en TS para ver el error *antes* de runtime.
- **Después** refactoriza: añade tipos a parámetros y retornos, y muestra cómo el autocompletado mejora.
- **Cierra** con el gestor de tareas: arrays tipados, `interface`, clase `GestorTareas` y un pequeño flujo.

## Ampliaciones
- Añade persistencia con `localStorage` (si lo llevas a navegador) o con un archivo JSON (Node).
- Añade un filtro por estado (`completadas`/`pendientes`) y tests de tipos (usando `never`/exhaustividad).
- Integra el modelo de datos en un proyecto **Svelte**: comparte las `interfaces` y utilidades TS.

## Documentación oficial
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- TSConfig Reference: https://www.typescriptlang.org/tsconfig
