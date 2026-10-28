import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDirectory = path.join(serverDirectory, 'data');
const backupDirectory = path.join(dataDirectory, 'backups');

function dataPath(fileName) {
  return path.join(dataDirectory, fileName);
}

function backupPath(fileName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(backupDirectory, `${fileName}.${timestamp}.bak`);
}

function ensureDataDirectory() {
  mkdirSync(dataDirectory, { recursive: true });
}

function readJsonFile(fileName, defaultValue) {
  ensureDataDirectory();
  const filePath = dataPath(fileName);

  if (!existsSync(filePath)) {
    writeJsonFile(fileName, defaultValue, { createBackup: false });
    return structuredClone(defaultValue);
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read ${fileName}: ${error.message}`);
  }
}

function writeJsonFile(fileName, value, options = {}) {
  ensureDataDirectory();
  const filePath = dataPath(fileName);

  if (options.createBackup !== false && existsSync(filePath)) {
    mkdirSync(backupDirectory, { recursive: true });
    copyFileSync(filePath, backupPath(fileName));
  }

  const temporaryPath = `${filePath}.tmp`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    renameSync(temporaryPath, filePath);
  } catch (error) {
    throw new Error(`Could not write ${fileName}: ${error.message}`);
  }
}

export { dataPath, readJsonFile, writeJsonFile };
