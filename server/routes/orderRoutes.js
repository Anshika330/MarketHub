import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { orders } from '../data/orders.js';
import { products } from '../data/products.js';
import { createVendorPayouts, getVendorPayoutRecords } from '../services/payoutService.js';
import { writeJsonFile } from '../utils/jsonStorage.js';
import { authenticate, authorize, requireVerifiedVendor } from '../middleware/authMiddleware.js';

const orderRoutes = Router();
const customerFields = ['fullName', 'phone', 'email', 'address', 'city', 'state', 'pinCode'];
const allowedStatuses = new Set(['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']);

function validationError(errors) {
  return Object.keys(errors).length > 0
    ? { success: false, message: 'Validation failed.', errors }
    : null;
}

function validateCreateOrder(body) {
  const errors = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { form: 'Request body must be a JSON object.' };
  }
  if (!body.deliveryDetails || typeof body.deliveryDetails !== 'object') {
    errors.deliveryDetails = 'Delivery details are required.';
  } else {
    customerFields.forEach((field) => {
      if (typeof body.deliveryDetails[field] !== 'string' || !body.deliveryDetails[field].trim()) {
        errors[field] = `${field} is required.`;
      }
    });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.items = 'At least one order item is required.';
  } else {
    body.items.forEach((item, index) => {
      if (!item || typeof item.productId !== 'string' || !item.productId.trim()) {
        errors[`items.${index}.productId`] = 'A valid product ID is required.';
      }
      if (!Number.isInteger(item?.quantity) || item.quantity < 1) {
        errors[`items.${index}.quantity`] = 'Quantity must be a positive integer.';
      }
    });
  }

  return errors;
}

function orderForVendor(order, vendorId) {
  const items = order.items.filter((item) => item.vendorId === vendorId);
  return {
    orderId: order.orderId,
    date: order.date,
    status: order.status,
    items,
    vendorSubtotal: items.reduce((total, item) => total + item.subtotal, 0),
  };
}

orderRoutes.post('/', authenticate, authorize('Customer'), (req, res) => {
  const errors = validateCreateOrder(req.body);
  const errorResponse = validationError(errors);
  if (errorResponse) {
    return res.status(400).json(errorResponse);
  }

  const orderItems = [];
  for (const requestedItem of req.body.items) {
    const product = products.find((entry) => entry.id === requestedItem.productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: `Product ${requestedItem.productId} is no longer available.`,
      });
    }

    orderItems.push({
      productId: product.id,
      vendorId: product.vendorId,
      name: product.name,
      vendor: product.vendor,
      image: product.image,
      price: product.price,
      quantity: requestedItem.quantity,
      subtotal: product.price * requestedItem.quantity,
    });
  }

  const subtotal = orderItems.reduce((total, item) => total + item.subtotal, 0);
  const order = {
    orderId: `MH-${Date.now().toString(36).toUpperCase()}-${randomUUID()
      .slice(0, 4)
      .toUpperCase()}`,
    customerId: req.user.id,
    date: new Date().toISOString(),
    deliveryDetails: req.body.deliveryDetails,
    items: orderItems,
    subtotal,
    deliveryCharges: 0,
    total: subtotal,
    status: 'Placed',
    payment: {
      status: 'Pending',
      method: 'Demo Payment',
      transactionId: null,
      paidAt: null,
    },
    vendorPayouts: createVendorPayouts(orderItems),
  };

  orders.unshift(order);
  writeJsonFile('orders.json', orders);
  return res.status(201).json({ success: true, data: order });
});

orderRoutes.post('/:orderId/payment', authenticate, authorize('Customer'), (req, res) => {
  const order = orders.find((entry) => entry.orderId === req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  if (order.customerId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only pay for your own orders.' });
  }
  if (order.status === 'Cancelled') {
    return res.status(409).json({
      success: false,
      message: 'Cancelled orders cannot be paid.',
    });
  }
  if (order.payment?.status === 'Paid') {
    return res.json({
      success: true,
      message: 'Demo payment was already completed.',
      data: order,
    });
  }

  order.payment = {
    status: 'Paid',
    method: 'Demo Payment',
    transactionId: `DEMO-TXN-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`,
    paidAt: new Date().toISOString(),
  };
  writeJsonFile('orders.json', orders);

  return res.json({
    success: true,
    message: 'Demo payment completed. No real money was charged.',
    data: order,
  });
});

orderRoutes.get('/admin/summary', authenticate, authorize('Admin'), (req, res) => {
  const totalOrderValue = orders.reduce(
    (total, order) => total + (Number.isFinite(order.total) ? order.total : 0),
    0,
  );

  return res.json({
    success: true,
    data: {
      totalOrders: orders.length,
      totalOrderValue,
      includesCancelledOrders: true,
    },
  });
});

orderRoutes.get('/customer/:customerId', authenticate, (req, res) => {
  if (req.user.role !== 'Admin' && req.user.id !== req.params.customerId) {
    return res.status(403).json({ success: false, message: 'You can only view your own orders.' });
  }
  const customerOrders = orders.filter((order) => order.customerId === req.params.customerId);
  return res.json({ success: true, data: customerOrders, count: customerOrders.length });
});

orderRoutes.get('/vendor/:vendorId', authenticate, (req, res, next) => {
  if (req.user.role !== 'Admin' && (req.user.role !== 'Vendor' || req.user.id !== req.params.vendorId)) {
    return res.status(403).json({ success: false, message: 'You can only view your own vendor orders.' });
  }
  if (req.user.role === 'Vendor') {
    return requireVerifiedVendor(req, res, () => {
      const vendorOrders = orders
        .map((order) => orderForVendor(order, req.user.id))
        .filter((order) => order.items.length > 0);
      return res.json({ success: true, data: vendorOrders, count: vendorOrders.length });
    });
  }
  const vendorOrders = orders
    .map((order) => orderForVendor(order, req.params.vendorId))
    .filter((order) => order.items.length > 0);
  return res.json({ success: true, data: vendorOrders, count: vendorOrders.length });
});

orderRoutes.get('/:orderId', authenticate, (req, res) => {
  const order = orders.find((entry) => entry.orderId === req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  if (req.user.role === 'Customer') {
    if (order.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only view your own orders.' });
    }
    return res.json({ success: true, data: order });
  }
  if (req.user.role === 'Vendor') {
    if (!order.items.some((item) => item.vendorId === req.user.id)) {
      return res.status(403).json({ success: false, message: 'You can only view your vendor orders.' });
    }
    return res.json({ success: true, data: orderForVendor(order, req.user.id) });
  }
  if (req.user.role === 'Admin') {
    return res.json({ success: true, data: order });
  }
  return res.status(403).json({ success: false, message: 'You do not have permission to view this order.' });
});

orderRoutes.patch(
  '/:orderId/status',
  authenticate,
  authorize('Vendor', 'Admin'),
  (req, res, next) => (req.user.role === 'Vendor' ? requireVerifiedVendor(req, res, next) : next()),
  (req, res) => {
  const { status } = req.body || {};
  if (!allowedStatuses.has(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order status.',
      errors: { status: 'Use Placed, Processing, Shipped, Delivered, or Cancelled.' },
    });
  }

  const order = orders.find((entry) => entry.orderId === req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  if (req.user.role === 'Vendor') {
    if (!order.items.some((item) => item.vendorId === req.user.id)) {
      return res.status(403).json({ success: false, message: 'You can only update your vendor orders.' });
    }
    if (order.items.some((item) => item.vendorId !== req.user.id)) {
      return res.status(409).json({
        success: false,
        message: 'Orders containing items from multiple vendors cannot be updated by a vendor.',
      });
    }
  }

  order.status = status;
  if (status === 'Cancelled') {
    order.vendorPayouts = (order.vendorPayouts || []).map((payout) => ({
      ...payout,
      status: payout.status === 'Paid' ? 'Paid' : 'Cancelled',
    }));
  }
  writeJsonFile('orders.json', orders);
    return res.json({
      success: true,
      data: req.user.role === 'Vendor' ? orderForVendor(order, req.user.id) : order,
    });
  },
);

export default orderRoutes;
