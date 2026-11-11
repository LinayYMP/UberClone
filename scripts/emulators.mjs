// AI-assisted: see docs/AI_LOG.md #11
// Inicia los emuladores de Firebase (Auth + Firestore) para desarrollar sin tocar el proyecto real.
// En Windows, si la carpeta del usuario tiene caracteres como "ñ", Java no puede crear sus sockets
// internos y el emulador de Firestore se cierra; por eso se usa una carpeta pública sin tildes.
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const env = { ...process.env };
const isWindows = process.platform === 'win32';
const hasNonAscii = (value) => /[^\x00-\x7F]/.test(value);

if (isWindows && hasNonAscii(os.homedir())) {
  const publicDir = env.PUBLIC || 'C:\\Users\\Public';
  env.FIREBASE_EMULATORS_PATH ??= path.join(publicDir, 'firebase-emulators');
  env.JAVA_TOOL_OPTIONS = [env.JAVA_TOOL_OPTIONS, `-Djdk.net.unixdomain.tmpdir=${publicDir}`].filter(Boolean).join(' ');
}

// firebase-tools 13 es la última versión que acepta Java 17 (la 14+ exige Java 21).
const args = ['--yes', 'firebase-tools@13', 'emulators:start', '--only', 'auth,firestore', '--project', 'demo-uberclone', ...process.argv.slice(2)];
const child = spawn('npx', args, { stdio: 'inherit', env, shell: isWindows });
child.on('exit', (code) => process.exit(code ?? 0));
