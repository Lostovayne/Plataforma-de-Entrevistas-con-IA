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
    // Usar el modelo más reciente (1.5 o Pro según disponibilidad)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    console.log('Modelo seleccionado: gemini-1.5-pro');
  
  const prompt = `Genera un resumen profesional en español de los cambios realizados en el repositorio.
  Incluye:
  1. Cambios principales
  2. Impacto esperado
  3. Próximos pasos recomendados
  
  Resumen:`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const summary = response.text();
  
  // Actualizar README
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
}

generateSummary().catch(console.error);