# PrepWise - Plataforma de Entrevistas con IA

<div align="center">
  <img src="/public/logo.svg" alt="PrepWise Logo" width="120" />
  <h3>Simula entrevistas y recibe feedback inteligente</h3>
</div>

## 📋 Descripción

PrepWise es una plataforma avanzada de simulación de entrevistas potenciada por Inteligencia Artificial. Diseñada para ayudar a los candidatos a prepararse para entrevistas laborales reales, ofrece un entorno interactivo donde los usuarios pueden practicar entrevistas personalizadas según el rol, nivel y stack tecnológico deseado, recibiendo feedback detallado y análisis de rendimiento.

## ✨ Características Principales

- **Simulación de Entrevistas Personalizadas**: Configura entrevistas según rol, nivel y tecnologías específicas.
- **Entrevistador IA Avanzado**: Interactúa con un entrevistador virtual que adapta las preguntas según tus respuestas.
- **Feedback Inteligente**: Recibe evaluaciones detalladas con puntuaciones por categoría, fortalezas y áreas de mejora.
- **Múltiples Tipos de Entrevista**: Soporta diferentes formatos (técnicas, comportamentales, mixtas).
- **Interfaz Intuitiva**: Diseño moderno y responsive optimizado para todas las plataformas.
- **Autenticación Segura**: Sistema de registro y login integrado con Firebase.

## 🛠️ Tecnologías

### Frontend
- **Next.js 15**: Framework React con renderizado híbrido y App Router.
- **React 19**: Biblioteca UI con los últimos hooks y patrones.
- **TypeScript**: Tipado estático para desarrollo robusto.
- **Tailwind CSS**: Utilidades CSS para estilizado rápido y consistente.
- **Radix UI**: Componentes accesibles y personalizables.

### Backend & Servicios
- **Firebase**: Autenticación, base de datos y almacenamiento.
- **Google Generative AI**: Integración con modelos de IA avanzados.

### Herramientas de Desarrollo
- **ESLint**: Linting de código.
- **Turbopack**: Compilación rápida durante desarrollo.

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18.x o superior
- npm o bun

### Configuración

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/plataforma-entrevistas.git
   cd plataforma-entrevistas
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   bun install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
   ```
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
   
   # Google AI
   GOOGLE_AI_API_KEY=tu-google-ai-api-key
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   bun dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
├── app/                    # Rutas y layouts de Next.js
│   ├── (auth)/             # Rutas de autenticación
│   ├── (root)/             # Página principal y layout
│   └── layout.tsx          # Layout principal
├── components/             # Componentes reutilizables
│   ├── ui/                 # Componentes de interfaz básicos
│   └── ...                 # Otros componentes
├── constants/              # Constantes y datos estáticos
├── firebase/               # Configuración de Firebase
├── lib/                    # Utilidades y funciones auxiliares
├── public/                 # Archivos estáticos
│   └── covers/             # Imágenes para tarjetas de entrevista
└── types/                  # Definiciones de tipos TypeScript
```

## 🧪 Desarrollo

### Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con Turbopack.
- `npm run build`: Construye la aplicación para producción.
- `npm run start`: Inicia la aplicación en modo producción.
- `npm run lint`: Ejecuta el linter para verificar el código.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

<div align="center">
  <p>Desarrollado con ❤️ por el equipo de PrepWise</p>
</div>
