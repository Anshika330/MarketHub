import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { products } from '../data/products.js';
import { writeJsonFile } from '../utils/jsonStorage.js';
import { authenticate, authorize, requireVerifiedVendor } from '../middleware/authMiddleware.js';

const productRoutes = Router();
const sortableFields = new Set(['price-asc', 'price-desc', 'name']);
const requiredFields = ['name', 'description', 'category', 'price', 'stock', 'image'];

function validateProductInput(body) {
  const errors = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { form: 'Request body must be a JSON object.' };
  }

  for (const field of requiredFields) {
    if (field !== 'image' && (body[field] === undefined || body[field] === null || body[field] === '')) {
      errors[field] = `${field} is required.`;
    }
  }

  if (typeof body.name !== 'string' || !body.name.trim()) {
    errors.name = 'Name must be a non-empty string.';
  }
  if (typeof body.description !== 'string' || !body.description.trim()) {
    errors.description = 'Description must be a non-empty string.';
  }
  if (typeof body.category !== 'string' || !body.category.trim()) {
    errors.category = 'Category must be a non-empty string.';
  }
  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0) {
    errors.price = 'Price must be a number greater than zero.';
  }
  if (!Number.isInteger(body.stock) || body.stock < 0) {
    errors.stock = 'Stock must be a non-negative integer.';
  }
  if (typeof body.image !== 'string' || !body.image.trim()) {
    errors.image = 'Image must be a non-empty URL.';
  } else {
    try {
      const imageUrl = new URL(body.image);
      if (!['http:', 'https:'].includes(imageUrl.protocol)) {
        errors.image = 'Image must use an http or https URL.';
      }
    } catch {
      errors.image = 'Image must be a valid URL.';
    }
  }
  if (typeof body.vendorId !== 'string' || !body.vendorId.trim()) {
    errors.vendorId = 'Vendor ID is required.';
  }
  if (typeof body.vendor !== 'string' || !body.vendor.trim()) {
    errors.vendor = 'Vendor name is required.';
  }

  return errors;
}

function productPayload(body) {
  return {
    name: body.name.trim(),
    description: body.description.trim(),
    category: body.category.trim(),
    price: body.price,
    image: body.image.trim(),
    stock: body.stock,
    vendorId: body.vendorId.trim(),
    vendor: body.vendor.trim(),
  };
}

productRoutes.get('/', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim().toLowerCase() : '';
  const sort = typeof req.query.sort === 'string' ? req.query.sort : '';

  let result = products.filter((product) => {
    const matchesSearch =
      !search ||
      [product.name, product.category, product.vendor].some((value) =>
        value.toLowerCase().includes(search),
      );
    const matchesCategory = !category || product.category.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });

  if (sort === 'price-asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (sort === 'name') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort && !sortableFields.has(sort)) {
    return res.status(400).json({
      success: false,
      message: 'Unsupported sort. Use price-asc, price-desc, or name.',
    });
  }

  return res.json({ success: true, data: result, count: result.length });
});

productRoutes.get('/:id', (req, res) => {
  const product = products.find((entry) => entry.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  return res.json({ success: true, data: product });
});

productRoutes.post('/', authenticate, authorize('Vendor'), requireVerifiedVendor, (req, res) => {
  const errors = validateProductInput(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  const product = { id: randomUUID(), ...productPayload({ ...req.body, vendorId: req.user.id, vendor: req.user.name }) };
  products.push(product);
  writeJsonFile('products.json', products);
  return res.status(201).json({ success: true, data: product });
});

productRoutes.put('/:id', authenticate, authorize('Vendor'), requireVerifiedVendor, (req, res) => {
  const productIndex = products.findIndex((entry) => entry.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  if (products[productIndex].vendorId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only modify your own products.' });
  }

  const errors = validateProductInput(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  const product = { id: req.params.id, ...productPayload({ ...req.body, vendorId: req.user.id, vendor: req.user.name }) };
  products[productIndex] = product;
  writeJsonFile('products.json', products);
  return res.json({ success: true, data: product });
});

productRoutes.delete('/:id', authenticate, authorize('Vendor'), requireVerifiedVendor, (req, res) => {
  const productIndex = products.findIndex((entry) => entry.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  if (products[productIndex].vendorId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only delete your own products.' });
  }

  const [deletedProduct] = products.splice(productIndex, 1);
  writeJsonFile('products.json', products);
  return res.json({
    success: true,
    message: 'Product deleted successfully.',
    data: deletedProduct,
  });
});

export default productRoutes;
