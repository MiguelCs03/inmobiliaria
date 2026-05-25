const fs = require('fs');
const path = require('path');

// Rutas de archivos .env y .env.example
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

let envFileContent = '';

// Leer el archivo .env o usar el .env.example como fallback
if (fs.existsSync(envPath)) {
  envFileContent = fs.readFileSync(envPath, 'utf8');
} else if (fs.existsSync(envExamplePath)) {
  console.warn('[Warning] Archivo .env no encontrado. Usando .env.example como fallback.');
  envFileContent = fs.readFileSync(envExamplePath, 'utf8');
} else {
  console.error('[Error] No se encontró ningún archivo .env o .env.example.');
  process.exit(1);
}

// Analizar y extraer las variables clave del archivo .env
const envVars = {};
envFileContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  // Ignorar líneas vacías y comentarios
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const delimiterIndex = trimmed.indexOf('=');
    const key = trimmed.substring(0, delimiterIndex).trim();
    let value = trimmed.substring(delimiterIndex + 1).trim();
    
    // Remover comillas simples o dobles alrededor del valor si existen
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    
    if (key) {
      envVars[key] = value;
    }
  }
});

// Determinar el valor de la URL de GraphQL (por defecto http://localhost:3001/graphql)
const graphqlUri = envVars['GATEWAY_GRAPHQL_URL'] || 'http://localhost:3001/graphql';

// Asegurar que el directorio de salida exista
const targetDir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Contenido del archivo de entorno TypeScript auto-generado
const environmentFileContent = `// ==============================================================================
// ESTE ARCHIVO FUE GENERADO AUTOMÁTICAMENTE POR set-env.js
// NO EDITAR DIRECTAMENTE. MODIFICAR EL ARCHIVO .env EN LA RAÍZ DEL FRONTEND.
// ==============================================================================

export const environment = {
  production: false,
  graphqlUri: '${graphqlUri}'
};
`;

// Escribir el archivo
const targetPath = path.join(targetDir, 'environment.ts');
fs.writeFileSync(targetPath, environmentFileContent, 'utf8');

console.log(`[Success] Entorno de Angular generado exitosamente en ${targetPath}`);
console.log(`          GATEWAY_GRAPHQL_URL = "${graphqlUri}"`);
