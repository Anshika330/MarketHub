import { randomUUID } from 'node:crypto';
import { readJsonFile, writeJsonFile } from '../utils/jsonStorage.js';
import { hashPassword } from '../services/authService.js';

const storedUsers = readJsonFile('users.json', []);
const users = Array.isArray(storedUsers) ? storedUsers : [];

function saveUsers() {
  writeJsonFile('users.json', users);
}

function initializeAdminAccount() {
  const existingAdmin = users.find((user) => user.role === 'Admin');
  if (existingAdmin) {
    return existingAdmin;
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword || adminPassword.length < 12) {
    return null;
  }

  const adminUser = {
    id: 'demo-admin',
    name: 'MarketHub Admin',
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    role: 'Admin',
    status: 'Active',
    registeredAt: '2026-01-01T00:00:00.000Z',
    storeName: '',
  };

  users.push(adminUser);
  saveUsers();
  return adminUser;
}

initializeAdminAccount();

function createUser(input) {
  const user = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    role: input.role,
    status: input.role === 'Vendor' ? 'Pending' : 'Active',
    registeredAt: new Date().toISOString(),
    storeName: input.role === 'Vendor' ? `${input.name}'s Store` : '',
  };
  users.push(user);
  saveUsers();
  return user;
}

export { createUser, initializeAdminAccount, saveUsers, users };
