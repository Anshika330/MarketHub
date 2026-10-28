import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDirectory, '..');
const envFilePath = path.join(projectRoot, '.env');

function loadDotEnvFile() {
  if (process.env.AUTH_TOKEN_SECRET) {
    return;
  }

  try {
    const fileContents = fs.readFileSync(envFilePath, 'utf8');
    for (const line of fileContents.split(/\r?\n/)) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmedLine.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing .env files until the app validates required configuration.
  }
}

loadDotEnvFile();

export const PORT = process.env.PORT || 5000;
export const CLIENT_ORIGINS = (
  process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function requireAuthTokenSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET || '';

  if (!secret || secret.length < 32 || secret === 'markethub-ce1-change-this-secret') {
    throw new Error(
      'Missing or weak AUTH_TOKEN_SECRET. Set a strong value in server/.env or your environment before starting MarketHub.',
    );
  }

  return secret;
}

export const AUTH_TOKEN_SECRET = requireAuthTokenSecret();
