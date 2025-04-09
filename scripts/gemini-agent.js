// tslint:disable


const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Verificar que la API key está disponible
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY no está definida en las variables de entorno');
  process.exit(1);
}

console.log('Inicializando Gemini API con la clave proporcionada');
const apiKey = process.env.GEMINI_API_KEY.trim(); // Eliminar posibles espacios en blanco
const genAI = new GoogleGenerativeAI(apiKey);

async function generateSummary() {
  try {
    console.log('Iniciando generación de resumen con Gemini...');
    // Usar el modelo más reciente (2.0 Pro)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log('Modelo seleccionado: gemini-2.0-flash');
  
    const prompt = `Genera un resumen profesional en español de los cambios realizados en el repositorio.
    Incluye:
    1. Cambios principales
    2. Impacto esperado
    3. Próximos pasos recomendados
    
    Resumen:`;
  
    console.log('Enviando prompt a Gemini API...');
    const result = await model.generateContent(prompt);
    console.log('Respuesta recibida de Gemini API');
    const response = await result.response;
    const summary = response.text();
    
    // Actualizar README
    console.log('Actualizando README con el resumen generado');
    const readmePath = './README.md';
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    if (readmeContent.includes('## Resumen de Cambios')) {
      readmeContent = readmeContent.replace(
        /## Resumen de Cambios[\s\S]*?(?=##|$)/,
        `## Resumen de Cambios\n\n${summary}\n\n`
      );
    } else {
      readmeContent += `\n\n## Resumen de Cambios\n\n${summary}\n`;
    }
    
    fs.writeFileSync(readmePath, readmeContent);
    console.log('README actualizado exitosamente');
  } catch (error) {
    console.error('Error al generar el resumen con Gemini:');
    console.error(`Tipo de error: ${error.constructor.name}`);
    console.error(`Mensaje: ${error.message}`);
    
    if (error.status) {
      console.error(`Código de estado HTTP: ${error.status} (${error.statusText})`);
      console.error('Este error 403 Forbidden generalmente indica problemas con la autenticación de la API key.');
      console.error('Asegúrate de que:');
      console.error('1. La API key está correctamente configurada en los secretos de GitHub');
      console.error('2. La API key es válida y está activa');
      console.error('3. La API key tiene permisos para acceder al modelo gemini-2.0-pro');
      console.error('4. Has registrado y activado la API en Google AI Studio');
    }
    
    process.exit(1);
  }
}
generateSummary().catch(console.error);