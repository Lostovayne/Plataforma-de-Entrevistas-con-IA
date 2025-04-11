# Configuración de Prettier

Este proyecto utiliza Prettier para mantener un estilo de código consistente en todo el repositorio.

## Configuración

La configuración de Prettier se encuentra en el archivo `.prettierrc` en la raíz del proyecto con las siguientes reglas:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "auto"
}
```

## Archivos ignorados

Algunos archivos y directorios son ignorados por Prettier. La configuración se encuentra en `.prettierignore`.

## Scripts disponibles

- `npm run format`: Formatea automáticamente todos los archivos del proyecto según las reglas definidas.
- `npm run format:check`: Verifica si todos los archivos cumplen con el formato definido sin modificarlos.

## Integración con CI

El pipeline de CI incluye verificaciones de formato:

1. Verifica que todos los archivos cumplan con el formato definido.
2. Si hay errores de formato en un Pull Request, intenta corregirlos automáticamente.

## Integración con ESLint

Prettier está configurado para trabajar junto con ESLint mediante `eslint-config-prettier`, lo que evita conflictos entre las reglas de ambas herramientas.