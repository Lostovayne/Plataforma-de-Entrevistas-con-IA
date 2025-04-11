// tslint:disable
/**
 * @fileoverview Script para revisar Pull Requests usando la API de Gemini
 * @author PrepWise Team
 */

const fs = require('fs');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * @typedef {Object} DiffResult
 * @property {string} changes - Los cambios en formato diff
 * @property {boolean} truncated - Indica si los cambios fueron truncados
 * @property {number} originalLength - Longitud original de los cambios
 */

// Verificar que la API key está disponible
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY no está definida en las variables de entorno');
  process.exit(1);
}

console.log('Inicializando Gemini API con la clave proporcionada');
const apiKey = process.env.GEMINI_API_KEY.trim(); // Eliminar posibles espacios en blanco
const genAI = new GoogleGenerativeAI(apiKey);

// Constantes de configuración
const MAX_CHANGES_LENGTH = 15000;
const DEFAULT_BASE_BRANCH = 'main';

/**
 * Obtiene los cambios en formato diff entre ramas o de los cambios staged
 * @returns {Promise<DiffResult>} Objeto con los cambios y metadatos
 */
async function getPullRequestChanges() {
  // Intentar obtener cambios staged primero
  console.log('Obteniendo cambios de la PR...');
  const diffOutput = execSync('git diff --staged').toString();

  // Si hay cambios staged, usarlos
  if (diffOutput && diffOutput.trim() !== '') {
    return processDiffOutput(diffOutput);
  }

  // Si no hay cambios staged, obtener diff entre ramas
  console.log('No se encontraron cambios staged, obteniendo diff entre ramas...');
  try {
    return await getDiffBetweenBranches();
  } catch (diffError) {
    console.error('Error al obtener el diff entre ramas:', diffError);
    return {
      changes: 'No se pudieron obtener los cambios de la PR.',
      truncated: false,
      originalLength: 0,
    };
  }
}

/**
 * Obtiene el diff entre la rama actual y la rama base
 * @returns {Promise<DiffResult>} Objeto con los cambios y metadatos
 */
async function getDiffBetweenBranches() {
  const baseBranch = DEFAULT_BASE_BRANCH; // Configurable mediante constante

  try {
    // Verificar si la rama remota existe
    execSync(`git ls-remote --heads origin ${baseBranch}`).toString();
    const diffOutput = execSync(`git diff origin/${baseBranch}...HEAD`).toString();
    return processDiffOutput(diffOutput);
  } catch (remoteError) {
    // Registrar el error específico para mejor diagnóstico
    console.log(`Error al obtener la rama remota: ${remoteError.message}`);
    console.log(`La rama remota origin/${baseBranch} no existe, usando rama local...`);

    try {
      const diffOutput = execSync(`git diff ${baseBranch}...HEAD`).toString();
      return processDiffOutput(diffOutput);
    } catch (localError) {
      throw new Error(`No se pudo obtener diff con rama local: ${localError.message}`);
    }
  }
}

/**
 * Procesa el output del diff y lo trunca si es necesario
 * @param {string} diffOutput - El output del comando diff
 * @returns {DiffResult} Objeto con los cambios procesados y metadatos
 */
function processDiffOutput(diffOutput) {
  if (diffOutput.length > MAX_CHANGES_LENGTH) {
    console.log(
      `Los cambios son muy extensos (${diffOutput.length} caracteres), limitando a ${MAX_CHANGES_LENGTH} caracteres...`
    );
    return {
      changes:
        diffOutput.substring(0, MAX_CHANGES_LENGTH) +
        '\n\n[... Cambios truncados debido al tamaño ...]',
      truncated: true,
      originalLength: diffOutput.length,
    };
  }

  return {
    changes: diffOutput,
    truncated: false,
    originalLength: diffOutput.length,
  };
}

/**
 * Revisa un Pull Request usando la API de Gemini
 * @returns {Promise<void>}
 */
async function reviewPullRequest() {
  try {
    console.log('Iniciando revisión de PR con Gemini...');
    // Usar el modelo más reciente (2.0 Pro)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-preview-03-25' });
    console.log('Modelo seleccionado: gemini-2.5-pro-preview-03-25');

    // Obtener los cambios de la PR
    const { changes: prChanges, truncated } = await getPullRequestChanges();
    if (truncated) {
      console.log('Advertencia: Los cambios fueron truncados para ajustarse al límite de tokens.');
    }

    /**
     * Genera el prompt para la API de Gemini con instrucciones detalladas
     * @param {string} prChanges - Los cambios de la PR en formato diff
     * @returns {string} El prompt completo para enviar a la API
     */
    function generatePrompt(prChanges) {
      return `Eres un revisor senior de TypeScript con 10+ años de experiencia. Analiza estos cambios de PR y proporciona una revisión detallada y útil:

1. **Título conciso**:
   - Genera un título descriptivo (máx 10 palabras) que capture la esencia de los cambios

2. **Análisis de cambios**:
   - Proporciona un resumen detallado (3-5 líneas) explicando los cambios principales
   - Identifica el propósito y el impacto de los cambios

3. **Evaluación de código**:
   - Principios SOLID: ¿Los cambios siguen los principios SOLID? Identifica violaciones específicas
   - Nomenclatura: ¿Los nombres de variables, funciones y clases son descriptivos y siguen un estándar consistente?
   - Estructura: ¿El código está bien organizado? ¿Hay dependencias excesivas entre componentes?

4. **Mejoras de tipado**:
   - Analiza el tipado actual y sugiere mejoras específicas
   - Recomienda uso de tipos avanzados de TypeScript cuando sea apropiado:
     * Interfaces vs Types: ¿Cuál es más adecuado en este contexto?
     * Genéricos: ¿Se podrían usar para mejorar la flexibilidad y reutilización?
     * Type Guards: ¿Se necesitan para manejar diferentes tipos de datos?
     * Utility Types: ¿Podrían usarse Partial, Pick, Omit, etc.?
     * Enums: ¿Hay conjuntos de valores relacionados que podrían modelarse como enums?

5. **Sugerencias de mejora**:
   - Proporciona ejemplos concretos de código mejorado
   - Sugiere refactorizaciones para mejorar la legibilidad, mantenibilidad y rendimiento
   - Recomienda patrones de diseño apropiados cuando sea relevante

Cambios de la PR:
\`\`\`diff
${prChanges}
\`\`\`

Formato de respuesta:
1. **Título**: Un título descriptivo y conciso
2. **Resumen**: Explicación clara de los cambios y su propósito
3. **Análisis de código**: Evaluación de principios SOLID, nomenclatura y estructura
4. **Mejoras de tipado**: Sugerencias específicas con ejemplos de código
5. **Optimizaciones**: Recomendaciones concretas para mejorar el código

Proporciona ejemplos de código en bloques de código markdown para facilitar su copia.
Sé específico y detallado en tus sugerencias, pero mantén un tono constructivo y profesional.`;
    }

    const prompt = generatePrompt(prChanges);

    console.log('Enviando prompt a Gemini API...');
    const result = await model.generateContent(prompt);
    console.log('Respuesta recibida de Gemini API');
    const response = await result.response;
    const review = response.text();

    // Guardar la revisión en el README para que el workflow pueda leerla
    await updateReadmeWithReview(review);
    console.log('Revisión generada exitosamente para la PR');
  } catch (error) {
    console.error(`Error al revisar la PR con Gemini: ${error.message}`);
    process.exit(1);
  }

  /**
   * Actualiza el README con la revisión generada por Gemini
   * @param {string} review - La revisión generada por Gemini
   * @returns {Promise<void>}
   */
  async function updateReadmeWithReview(review) {
    console.log('Actualizando README con la revisión generada');
    const readmePath = '../README.md';

    try {
      // Leer el contenido actual del README
      let readmeContent = fs.readFileSync(readmePath, 'utf8');

      // Crear una copia temporal del README con los cambios
      let updatedContent = readmeContent;

      // Actualizar o añadir la sección de Resumen de Cambios
      if (updatedContent.includes('## Resumen de Cambios')) {
        updatedContent = updatedContent.replace(
          /## Resumen de Cambios[\s\S]*?(?=##|$)/,
          `## Resumen de Cambios\n\n${review}\n\n`
        );
      } else {
        updatedContent += `\n\n## Resumen de Cambios\n\n${review}\n`;
      }

      // Escribir el contenido actualizado en el README
      fs.writeFileSync(readmePath, updatedContent);
      console.log('README actualizado correctamente');
    } catch (readError) {
      console.error(`Error al actualizar README: ${readError.message}`);
      // Crear un nuevo README si no existe
      const basicContent = `# Resumen de Cambios\n\n${review}\n`;
      fs.writeFileSync(readmePath, basicContent);
      console.log('Se creó un nuevo README con la revisión');
    }
  }
}

reviewPullRequest().catch(console.error);
