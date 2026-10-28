import { readJsonFile } from '../utils/jsonStorage.js';

export const orders = readJsonFile('orders.json', []);
