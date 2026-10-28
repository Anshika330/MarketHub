import { users } from '../data/users.js';
import { verifyToken } from '../services/authService.js';

function authenticate(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : '';
  const payload = verifyToken(token);
  const user = payload && users.find((entry) => entry.id === payload.sub);
  if (!user || user.role !== payload.role) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  req.user = user;
  return next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission for this action.' });
    }
    return next();
  };
}

function requireVerifiedVendor(req, res, next) {
  if (req.user.role !== 'Vendor' || req.user.status !== 'Verified') {
    return res.status(403).json({ success: false, message: 'A verified vendor account is required.' });
  }
  return next();
}

export { authenticate, authorize, requireVerifiedVendor };
