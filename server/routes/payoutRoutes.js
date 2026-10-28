import { Router } from 'express';
import { orders } from '../data/orders.js';
import {
  getVendorPayoutRecords,
  getVendorSummary,
  isOrderPayable,
} from '../services/payoutService.js';
import { writeJsonFile } from '../utils/jsonStorage.js';
import { authenticate, requireVerifiedVendor } from '../middleware/authMiddleware.js';

const payoutRoutes = Router();
const validPayoutStatuses = new Set(['Pending', 'Paid']);

payoutRoutes.get('/vendor/:vendorId', authenticate, (req, res, next) => {
  if (req.user.role !== 'Admin' && (req.user.role !== 'Vendor' || req.user.id !== req.params.vendorId)) {
    return res.status(403).json({ success: false, message: 'You can only view your own payouts.' });
  }
  if (req.user.role === 'Vendor') {
    return requireVerifiedVendor(req, res, () =>
      res.json({
        success: true,
        data: getVendorSummary(orders, req.user.id),
      }),
    );
  }
  return res.json({
    success: true,
    data: getVendorSummary(orders, req.params.vendorId),
  });
});

payoutRoutes.get('/', authenticate, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Admin access required.' });
  const vendorIds = new Set(
    orders.flatMap((order) => (order.vendorPayouts || []).map((payout) => payout.vendorId)),
  );
  const summaries = [...vendorIds].map((vendorId) => getVendorSummary(orders, vendorId));

  return res.json({
    success: true,
    data: summaries,
    count: summaries.length,
  });
});

payoutRoutes.patch('/:orderId/:vendorId/status', authenticate, (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Admin access required.' });
  const { status } = req.body || {};
  if (!validPayoutStatuses.has(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payout status.',
      errors: { status: 'Use Pending or Paid.' },
    });
  }

  const order = orders.find((entry) => entry.orderId === req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  if (!isOrderPayable(order)) {
    return res.status(409).json({
      success: false,
      message: 'Payouts require a paid, non-cancelled order.',
    });
  }

  const payout = getVendorPayoutRecords(order, req.params.vendorId)[0];
  if (!payout) {
    return res.status(404).json({ success: false, message: 'Vendor payout not found.' });
  }
  if (payout.status === 'Paid' && status === 'Pending') {
    return res.status(409).json({
      success: false,
      message: 'A paid payout cannot be moved back to pending.',
    });
  }

  payout.status = status;
  payout.paidAt = status === 'Paid' ? payout.paidAt || new Date().toISOString() : null;
  writeJsonFile('orders.json', orders);

  return res.json({
    success: true,
    data: { orderId: order.orderId, payout },
  });
});

export default payoutRoutes;
