# Configuración del Agente Gemini

## Requisitos

- Una API key válida de Google Gemini
- Configuración correcta de los secretos en GitHub Actions

## Configuración de la API Key en GitHub Actions

Para que el agente Gemini funcione correctamente en GitHub Actions, debes seguir estos pasos:

1. Obtén una API key de Google Gemini desde la [consola de Google AI Studio](https://makersuite.google.com/app/apikey)

2. En tu repositorio de GitHub, ve a **Settings** > **Secrets and variables** > **Actions**

3. Haz clic en **New repository secret**

4. Configura un nuevo secreto con:
   - Nombre: `GEMINI_API_KEY`
   - Valor: Tu API key de Gemini (sin espacios adicionales)

5. Haz clic en **Add secret**

## Solución de problemas comunes

### Error 403 Forbidden

Si recibes un error como:

```
GoogleGenerativeAIFetchError: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent: [403 Forbidden] Method doesn't allow unregistered callers
```

Posibles soluciones:

1. **Verifica que la API key sea válida**: Asegúrate de que la API key que estás usando sea válida y esté activa.

2. **Comprueba que la API key esté correctamente configurada en GitHub**: Verifica que el secreto `GEMINI_API_KEY` esté configurado correctamente en GitHub Actions.

3. **Asegúrate de que la API key tenga permisos para el modelo solicitado**: Confirma que tu API key tenga acceso al modelo `gemini-1.5-pro`.

4. **Verifica la región y restricciones**: Algunas API keys pueden tener restricciones regionales o de IP.

## Registro y activación de la API

Si es la primera vez que usas la API de Gemini, es posible que necesites:

1. Registrarte en [Google AI Studio](https://makersuite.google.com/)
2. Activar la facturación (aunque hay un nivel gratuito generoso)
3. Aceptar los términos de servicio

Esto asegurará que tu API key sea reconocida como un "registered caller" por el servicio de Google.