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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('Modelo seleccionado: gemini-2.0-flash');

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
      // Analizar si hay código suficiente para una revisión detallada
      const hasSubstantialCode = prChanges.length > 500 && 
        (prChanges.includes('.ts') || prChanges.includes('.tsx') || 
         prChanges.includes('.js') || prChanges.includes('.jsx'));
      
      // Detectar el lenguaje principal usado en los cambios
      const isTypeScript = prChanges.includes('.ts') || prChanges.includes('.tsx') ||
                          (prChanges.includes('interface ') && prChanges.includes('type ')) ||
                          (prChanges.includes(': ') && prChanges.includes('=> '));
      const isJavaScript = prChanges.includes('.js') || prChanges.includes('.jsx') ||
                          prChanges.includes('function ') || prChanges.includes('const ') ||
                          prChanges.includes('let ') || prChanges.includes('var ');
      const isReact = prChanges.includes('React') || prChanges.includes('useState') ||
                     prChanges.includes('useEffect') || prChanges.includes('Component') ||
                     prChanges.includes('jsx') || prChanges.includes('tsx');
      
      // Detectar características específicas del código
      const hasTypeDefinitions = prChanges.includes('interface ') || prChanges.includes('type ') ||
                               prChanges.includes('enum ') || prChanges.includes('<') && prChanges.includes('>');
      const hasAdvancedPatterns = prChanges.includes('extends ') || prChanges.includes('implements ') ||
                                prChanges.includes('abstract ') || prChanges.includes('generic') ||
                                prChanges.includes('Partial<') || prChanges.includes('Pick<') ||
                                prChanges.includes('Omit<') || prChanges.includes('ReturnType<');
      const hasAsyncCode = prChanges.includes('async ') || prChanges.includes('await ') ||
                         prChanges.includes('Promise') || prChanges.includes('.then(');
      
      // Detectar si hay cambios que podrían involucrar principios SOLID o patrones de diseño
      const mightInvolveSolid = prChanges.includes('class ') || 
                               prChanges.includes('interface ') || 
                               prChanges.includes('extends ') || 
                               prChanges.includes('implements ') || 
                               prChanges.length > 1000;
      const mightInvolvePatterns = prChanges.includes('Factory') || prChanges.includes('Singleton') ||
                                 prChanges.includes('Observer') || prChanges.includes('Strategy') ||
                                 prChanges.includes('Provider') || prChanges.includes('Context') ||
                                 prChanges.includes('Decorator') || prChanges.includes('HOC');
      
      // Detectar si hay código que podría beneficiarse de tipos avanzados de TypeScript
      const couldUseAdvancedTypes = isTypeScript && (
        prChanges.includes('any') || 
        prChanges.includes('Object') || 
        prChanges.includes('Function') ||
        (prChanges.includes('[]') && !prChanges.includes('<'))
      );
      
      // Determinar el perfil del revisor según el lenguaje detectado
      const reviewerProfile = isTypeScript 
        ? "un revisor senior de TypeScript con 10+ años de experiencia" 
        : isReact 
          ? "un revisor senior de React con amplia experiencia en JavaScript/TypeScript" 
          : isJavaScript 
            ? "un revisor senior de JavaScript con amplia experiencia en desarrollo web" 
            : "un revisor senior de código con amplia experiencia en desarrollo de software";

      return `Eres ${reviewerProfile}. Analiza estos cambios de PR y proporciona una revisión útil y proporcionada al tamaño y tipo de cambios:

1. **Título conciso**:
   - Genera un título descriptivo (máx 10 palabras) que capture la esencia de los cambios

2. **Análisis de cambios**:
   - Proporciona un resumen explicando los cambios principales
   - Identifica el propósito y el impacto de los cambios
   - Adapta la longitud del análisis al tamaño de los cambios (breve para cambios pequeños)

${hasSubstantialCode ? `3. **Evaluación de código**:
   ${mightInvolveSolid ? `- Principios SOLID: Solo si son relevantes para estos cambios específicos. No expliques los principios si no hay código que los requiera.
   ` : ''}${mightInvolvePatterns ? `- Patrones de diseño: Identifica si se están utilizando patrones y si están bien implementados. Sugiere patrones apropiados solo si mejorarían significativamente el código.
   ` : ''}- Nomenclatura: ¿Los nombres de variables, funciones y clases son descriptivos y siguen un estándar consistente?
   - Estructura: ¿El código está bien organizado?
   ${hasAsyncCode ? `- Manejo asíncrono: ¿El código maneja correctamente las operaciones asíncronas y los posibles errores?
   ` : ''}

` : ''}
${isTypeScript ? `4. **Mejoras de tipado**:
   - Analiza el tipado actual y sugiere mejoras específicas si son necesarias
   ${hasTypeDefinitions ? `- Revisa las definiciones de tipos e interfaces para asegurar que sean precisas y reutilizables
   ` : ''}${couldUseAdvancedTypes ? `- Recomienda el uso de tipos avanzados de TypeScript que podrían mejorar el código, como:
     - Utility Types (Partial<T>, Pick<T, K>, Omit<T, K>, ReturnType<T>, Parameters<T>)
     - Tipos condicionales y mapped types
     - Inferencia de tipos (infer)
     - Tipos genéricos
   ` : ''}${hasAdvancedPatterns ? `- Verifica que los patrones genéricos y las abstracciones de tipos estén correctamente implementados
   ` : ''}

` : isJavaScript ? `4. **Mejoras de JavaScript**:
   - Analiza el uso de características modernas de JavaScript (ES6+)
   - Sugiere mejoras en la estructura y organización del código
   ${hasAsyncCode ? `- Verifica el manejo adecuado de Promises y código asíncrono
   ` : ''}

` : ''}
5. **Sugerencias de mejora**:
   - Si hay mejoras posibles, proporciona ejemplos concretos de código mejorado
   - Si el código ya está bien implementado, felicita al autor y menciona los aspectos positivos
   - No sugieras cambios innecesarios si el código ya es adecuado
   ${isJavaScript && !isTypeScript ? `- Si es apropiado, sugiere cómo el código podría beneficiarse de la migración a TypeScript
   ` : ''}

Cambios de la PR:
\`\`\`diff
${prChanges}
\`\`\`

Instrucciones importantes:
- Adapta tu respuesta al tamaño y complejidad de los cambios
- Si los cambios son pequeños o simples, tu revisión debe ser breve y concisa
- No expliques conceptos teóricos (como SOLID o patrones de diseño) si no hay código que lo requiera
- Si no hay código TypeScript para revisar, omite esa sección
- Si el código es excelente, felicita al autor en lugar de buscar problemas inexistentes
- Sé específico en tus sugerencias, pero mantén un tono constructivo y profesional
- Incluye ejemplos de código cuando sea útil para ilustrar mejoras sugeridas`;
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
