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
        
        // Verificar si la rama remota existe
        try {
          execSync(`git ls-remote --heads origin ${baseBranch}`).toString();
          prChanges = execSync(`git diff origin/${baseBranch}...HEAD`).toString();
        } catch (remoteError) {
          console.log(`La rama remota origin/${baseBranch} no existe, usando rama local...`);
          prChanges = execSync(`git diff ${baseBranch}...HEAD`).toString();
        }
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
  
    const prompt = `Eres un revisor senior de TypeScript con 10+ años de experiencia. Analiza estos cambios de PR enfocándote SOLO en el código modificado:

1. **Título conciso**:
   - Genera un título breve (máx 10 palabras) que describa el propósito principal de la PR

2. **Análisis de cambios**:
   - Revisa SOLO el código modificado en la PR
   - Sugiere mejoras de tipado SOLO para el código presente
   - Si no hay tipos, sugiere cómo tipar correctamente
   - Evita asumir funcionalidades no presentes

3. **Mejoras específicas**:
   - Tipado avanzado (solo si aplica al código modificado)
   - Principios SOLID (solo si hay violaciones evidentes)
   - Estructura (solo si hay problemas claros)

Cambios de la PR:
\`\`\`diff
${prChanges}
\`\`\`

Formato requerido:
1. **Título**: Breve y descriptivo
2. **Resumen**: Máx 3 líneas explicando el cambio principal
3. **Mejoras de tipado**: SOLO para código modificado (si aplica)
4. **Optimizaciones**: SOLO si son evidentes en el código presente

Ejemplo de título: "Mejora tipado en función de autenticación"

Sé conciso y evita suposiciones sobre código no presente.`;
  
    console.log('Enviando prompt a Gemini API...');
    const result = await model.generateContent(prompt);
    console.log('Respuesta recibida de Gemini API');
    const response = await result.response;
    const review = response.text();
    
    // Generar contenido para el comentario en la PR
    console.log('Generando contenido para el comentario en la PR');
    const readmePath = './README.md';
    let readmeContent;
    try {
      readmeContent = fs.readFileSync(readmePath, 'utf8');
    } catch (readError) {
      console.error('Error al leer README.md:', readError);
      readmeContent = '# Resumen de Cambios\n\n' + review;
    }
    
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