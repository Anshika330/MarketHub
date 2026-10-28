import { Router } from 'express';
import { users, createUser, saveUsers } from '../data/users.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { hashPassword, publicUser, signToken, verifyPassword } from '../services/authService.js';

const authRoutes = Router();

function email(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

authRoutes.post('/signup', (req, res) => {
  const { name, password } = req.body || {};
  const normalizedEmail = email(req.body?.email);
  if (typeof name !== 'string' || name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Name, valid email, and a password of at least 8 characters are required.' });
  }
  if (users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }
  if (!['Customer', 'Vendor'].includes(req.body.role)) {
    return res.status(400).json({ success: false, message: 'Only Customer or Vendor accounts can be registered.' });
  }
  const user = createUser({ name: name.trim(), email: normalizedEmail, role: req.body.role, passwordHash: hashPassword(password) });
  return res.status(201).json({ success: true, data: publicUser(user) });
});

authRoutes.post('/login', (req, res) => {
  const normalizedEmail = email(req.body?.email);
  const user = users.find((entry) => entry.email === normalizedEmail);
  if (!user || typeof req.body?.password !== 'string' || !verifyPassword(req.body.password, user.passwordHash)) {
    return res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
  }
  return res.json({ success: true, data: { user: publicUser(user), token: signToken(user) } });
});

authRoutes.get('/me', authenticate, (req, res) => res.json({ success: true, data: publicUser(req.user) }));

authRoutes.get('/users', authenticate, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Admin access required.' });
  return res.json({ success: true, data: users.map(publicUser) });
});

authRoutes.patch('/users/:id/status', authenticate, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Admin access required.' });
  if (!['Pending', 'Verified', 'Rejected', 'Suspended'].includes(req.body?.status)) {
    return res.status(400).json({ success: false, message: 'Invalid vendor status.' });
  }
  const user = users.find((entry) => entry.id === req.params.id && entry.role === 'Vendor');
  if (!user) return res.status(404).json({ success: false, message: 'Vendor not found.' });
  user.status = req.body.status;
  saveUsers();
  return res.json({ success: true, data: publicUser(user) });
});

export default authRoutes;
