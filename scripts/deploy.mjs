#!/usr/bin/env node

/**
 * Script de Deployment Completo para SR-PREVENCION
 * 
 * Este script automatiza el proceso completo de deployment:
 * 1. Validación de código (typecheck + lint)
 * 2. Build de Worker y Frontend
 * 3. Deploy del Worker a Cloudflare Workers
 * 4. Deploy del Frontend a Cloudflare Pages
 * 5. Verificación de health checks
 * 6. Resumen del deployment
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colores para la terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}→ ${msg}${colors.reset}\n`),
  title: (msg) => console.log(`\n${colors.bright}${colors.green}${'='.repeat(60)}${colors.reset}`),
};

/**
 * Ejecuta un comando y devuelve una promesa
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: options.cwd || rootDir,
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      ...options,
    });

    let stdout = '';
    let stderr = '';

    if (options.silent) {
      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${command} ${args.join(' ')}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extrae información del output del Worker deployment
 */
function extractWorkerInfo(output) {
  const versionMatch = output.match(/(?:Version ID|Current Version ID):\s*([a-f0-9-]+)/i);
  const urlMatch = output.match(/https:\/\/[^\s]+\.workers\.dev/);
  const sizeMatch = output.match(/Total Upload:\s*([\d.]+\s*[KM]iB)/i);
  const startupMatch = output.match(/Worker Startup Time:\s*(\d+\s*ms)/i);
  
  return {
    version: versionMatch ? versionMatch[1] : 'unknown',
    url: urlMatch ? urlMatch[0] : 'https://sr-prevencion.electrocicla.workers.dev',
    size: sizeMatch ? sizeMatch[1] : 'unknown',
    startup: startupMatch ? startupMatch[1] : 'unknown',
  };
}

/**
 * Extrae información del output del Pages deployment
 */
function extractPagesInfo(output) {
  const urlMatch = output.match(/https:\/\/[a-f0-9]+\.sr-prevencion\.pages\.dev/);
  
  return {
    url: urlMatch ? urlMatch[0] : 'https://sr-prevencion.pages.dev',
    mainUrl: 'https://sr-prevencion.pages.dev',
  };
}

/**
 * Verifica que el Worker esté respondiendo
 */
async function verifyWorker(url) {
  try {
    const response = await fetch(`${url}/health`);
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    }
    return { success: false, error: `HTTP ${response.status}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Proceso principal de deployment
 */
async function deploy() {
  const startTime = Date.now();
  let workerInfo = {};
  let pagesInfo = {};

  try {
    log.title();
    console.log(`${colors.bright}${colors.green}   🚀 SR-PREVENCION DEPLOYMENT${colors.reset}`);
    log.title();

    // Paso 1: Validación de código
    log.step('1/6 Validando código (TypeScript)...');
    try {
      await runCommand('pnpm', ['run', 'typecheck']);
      log.success('TypeCheck completado sin errores');
    } catch (error) {
      log.error('TypeCheck falló');
      throw error;
    }

    // Paso 2: Lint
    log.step('2/6 Ejecutando linter...');
    try {
      await runCommand('pnpm', ['--filter', 'web', 'lint']);
      log.success('Lint completado sin errores');
    } catch (error) {
      log.warning('Lint del frontend mostró advertencias (continuando...)');
    }

    // Paso 3: Build
    log.step('3/6 Construyendo aplicación...');
    try {
      await runCommand('pnpm', ['run', 'build']);
      log.success('Build completado exitosamente');
    } catch (error) {
      log.error('Build falló');
      throw error;
    }

    // Paso 4: Deploy Worker
    log.step('4/6 Desplegando Worker a Cloudflare...');
    try {
      const result = await runCommand('wrangler', ['deploy'], { silent: false });
      workerInfo = extractWorkerInfo(result.stdout + result.stderr);
      log.success(`Worker desplegado: ${workerInfo.url}`);
    } catch (error) {
      log.error('Deploy del Worker falló');
      throw error;
    }

    // Paso 5: Deploy Pages
    log.step('5/6 Desplegando Frontend a Cloudflare Pages...');
    try {
      const result = await runCommand('wrangler', [
        'pages',
        'deploy',
        'web/dist',
        '--project-name=sr-prevencion',
      ], { silent: false });
      pagesInfo = extractPagesInfo(result.stdout + result.stderr);
      log.success(`Pages desplegado: ${pagesInfo.mainUrl}`);
    } catch (error) {
      log.error('Deploy de Pages falló');
      throw error;
    }

    // Paso 6: Verificación
    log.step('6/6 Verificando servicios...');
    const healthCheck = await verifyWorker(workerInfo.url);
    if (healthCheck.success) {
      log.success('Worker respondiendo correctamente');
    } else {
      log.warning(`Worker health check falló: ${healthCheck.error}`);
    }

    // Resumen final
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log.title();
    console.log(`${colors.bright}${colors.green}   ✓ DEPLOYMENT COMPLETADO${colors.reset}`);
    log.title();
    
    console.log(`\n${colors.bright}Worker (Backend):${colors.reset}`);
    console.log(`  ${colors.cyan}URL:${colors.reset}     ${workerInfo.url}`);
    console.log(`  ${colors.cyan}Version:${colors.reset} ${workerInfo.version}`);
    console.log(`  ${colors.cyan}Size:${colors.reset}    ${workerInfo.size}`);
    console.log(`  ${colors.cyan}Startup:${colors.reset} ${workerInfo.startup}`);
    console.log(`  ${colors.cyan}Health:${colors.reset}  ${workerInfo.url}/health`);
    
    console.log(`\n${colors.bright}Pages (Frontend):${colors.reset}`);
    console.log(`  ${colors.cyan}URL:${colors.reset}     ${pagesInfo.mainUrl}`);
    console.log(`  ${colors.cyan}Latest:${colors.reset}  ${pagesInfo.url}`);
    
    console.log(`\n${colors.bright}Quick Links:${colors.reset}`);
    console.log(`  ${colors.cyan}App:${colors.reset}      ${pagesInfo.mainUrl}`);
    console.log(`  ${colors.cyan}Registro:${colors.reset} ${pagesInfo.mainUrl}/registro`);
    console.log(`  ${colors.cyan}Login:${colors.reset}    ${pagesInfo.mainUrl}/login`);
    
    console.log(`\n${colors.green}Tiempo total: ${duration}s${colors.reset}\n`);

  } catch (error) {
    log.error(`\nDeployment falló: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar deployment
deploy();
