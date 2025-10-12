/**
 * Configuración de la aplicación
 * Centraliza las URLs y configuraciones según el entorno
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const config = {
  apiUrl: isProduction 
    ? 'https://sr-prevencion.electrocicla.workers.dev/api'
    : '/api',
  
  environment: isDevelopment ? 'development' : 'production',
  
  // Configuraciones adicionales
  maxFileSize: 200 * 1024 * 1024, // 200MB
  allowedFileTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
  ],
} as const;
