// tslint:disable

const fs = require('fs');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Verificar que la API key está disponible
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY no está definida en las variables de entorno');
  process.exit(1);
}

console.log('Inicializando Gemini API con la clave proporcionada');
const apiKey = process.env.GEMINI_API_KEY.trim(); // Eliminar posibles espacios en blanco
const genAI = new GoogleGenerativeAI(apiKey);

async function reviewPullRequest() {
  try {
    console.log('Iniciando revisión de PR con Gemini...');
    // Usar el modelo más reciente (2.0 Pro)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log('Modelo seleccionado: gemini-2.0-flash');
    
    // Obtener los cambios de la PR
    console.log('Obteniendo cambios de la PR...');
    const diffOutput = execSync('git diff --staged').toString();
    
    // Si no hay cambios, intentar obtener los cambios entre la rama actual y la rama base
    let prChanges = diffOutput;
    if (!prChanges || prChanges.trim() === '') {
      try {
        console.log('No se encontraron cambios staged, obteniendo diff entre ramas...');
        // Obtener la rama base (normalmente main o master)
        const baseBranch = 'main'; // Puedes ajustar esto según tu repositorio
        prChanges = execSync(`git diff origin/${baseBranch}...HEAD`).toString();
      } catch (diffError) {
        console.error('Error al obtener el diff entre ramas:', diffError);
        prChanges = 'No se pudieron obtener los cambios de la PR.';
      }
    }
    
    // Limitar el tamaño de los cambios para evitar exceder los límites de tokens
    const maxChangesLength = 15000;
    if (prChanges.length > maxChangesLength) {
      console.log(`Los cambios son muy extensos (${prChanges.length} caracteres), limitando a ${maxChangesLength} caracteres...`);
      prChanges = prChanges.substring(0, maxChangesLength) + '\n\n[... Cambios truncados debido al tamaño ...]';
    }
  
    const prompt = `Eres un revisor senior de TypeScript con 10+ años de experiencia. Analiza exhaustivamente estos cambios de PR enfocándote en:

1. **Tipado avanzado**:
   - Uso óptimo de generics
   - Segregación de interfaces
   - Type guards
   - Utility types
   - Tipos condicionales

2. **Principios SOLID**:
   - Single Responsibility
   - Open/Closed
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion

3. **Arquitectura limpia**:
   - Estructura de carpetas
   - Nombres descriptivos
   - Cohesión/desacoplamiento

Cambios de la PR:
\`\`\`diff
${prChanges}
\`\`\`

Formato requerido:
1. **Resumen técnico** (máx 5 líneas)
2. **Mejoras de tipos** (ejemplos concretos con código optimizado)
3. **Patrones arquitectónicos** (sugerencias basadas en SOLID)
4. **Ejemplos avanzados** (muestra cómo implementar generics/guards cuando aplique)

Ejemplo de sugerencia:
\`\`\`typescript
// Antes:
function process(data: any) { ... }

// Optimizado con generics y type guards:
interface Processable<T extends { id: string }> {
  validate: (data: unknown) => data is T;
  transform: (data: T) => Promise<T>;
}

export function createProcessor<T extends { id: string }>(
  config: Processable<T>
): (data: unknown) => Promise<T | null> {
  return async (data) => {
    if (!config.validate(data)) return null;
    return await config.transform(data);
  };
}
\`\`\`

Sé exhaustivo pero conciso. Prioriza calidad sobre cantidad.`;
  
    console.log('Enviando prompt a Gemini API...');
    const result = await model.generateContent(prompt);
    console.log('Respuesta recibida de Gemini API');
    const response = await result.response;
    const review = response.text();
    
    // Generar contenido para el comentario en la PR
    console.log('Generando contenido para el comentario en la PR');
    const readmePath = './README.md';
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Crear una copia temporal del README con los cambios para que el workflow pueda leerlo
    let updatedContent = readmeContent;
    
    if (updatedContent.includes('## Resumen de Cambios')) {
      updatedContent = updatedContent.replace(
        /## Resumen de Cambios[\s\S]*?(?=##|$)/,
        `## Resumen de Cambios\n\n${review}\n\n`
      );
    } else {
      updatedContent += `\n\n## Resumen de Cambios\n\n${review}\n`;
    }
    
    // Escribir en un archivo temporal que será leído por el workflow
    fs.writeFileSync('./README.md', updatedContent);
    console.log('Revisión generada exitosamente para la PR');
    
  } catch (error) {
    console.error('Error al generar la revisión con Gemini:');
    console.error(`Tipo de error: ${error.constructor.name}`);
    console.error(`Mensaje: ${error.message}`);
    
    if (error.status) {
      console.error(`Código de estado HTTP: ${error.status} (${error.statusText})`);
      console.error('Este error 403 Forbidden generalmente indica problemas con la autenticación de la API key.');
      console.error('Asegúrate de que:');
      console.error('1. La API key está correctamente configurada en los secretos de GitHub');
      console.error('2. La API key es válida y está activa');
      console.error('3. La API key tiene permisos para acceder al modelo gemini-2.0-flash');
      console.error('4. Has registrado y activado la API en Google AI Studio');
    }
    
    process.exit(1);
  }
}

reviewPullRequest().catch(console.error);