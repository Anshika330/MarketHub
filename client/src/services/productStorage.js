import { allProducts } from '../constants/homeData';

const PRODUCTS_STORAGE_KEY = 'markethub-vendor-products';
const DELETED_PRODUCTS_STORAGE_KEY = 'markethub-deleted-products';

function vendorKey(name) {
  return `demo-vendor-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

const seededProducts = allProducts.map((product) => ({
  ...product,
  vendorId: product.vendorId || vendorKey(product.vendor),
  stock: Number.isInteger(product.stock) ? product.stock : 20,
}));

function readStoredProducts() {
  try {
    const storedProducts = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY));

    if (!Array.isArray(storedProducts)) {
      return [];
    }

    return storedProducts.filter(
      (product) =>
        product &&
        typeof product.id === 'string' &&
        typeof product.vendorId === 'string' &&
        typeof product.name === 'string' &&
        typeof product.category === 'string' &&
        typeof product.description === 'string' &&
        typeof product.image === 'string' &&
        typeof product.price === 'number' &&
        product.price > 0 &&
        Number.isInteger(product.stock) &&
        product.stock >= 0,
    );
  } catch {
    return [];
  }
}

function readDeletedProductIds() {
  try {
    const deletedIds = JSON.parse(localStorage.getItem(DELETED_PRODUCTS_STORAGE_KEY));
    return Array.isArray(deletedIds) ? deletedIds.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function getCatalog() {
  const storedProducts = readStoredProducts();
  const storedById = new Map(storedProducts.map((product) => [product.id, product]));
  const deletedIds = new Set(readDeletedProductIds());
  const seededCatalog = seededProducts
    .filter((product) => !deletedIds.has(product.id))
    .map((product) => storedById.get(product.id) || product);
  const seededIds = new Set(seededProducts.map((product) => product.id));

  return [
    ...seededCatalog,
    ...storedProducts.filter((product) => !seededIds.has(product.id)),
  ];
}

function saveVendorProduct(product) {
  const products = readStoredProducts();
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify([...products, product]));
}

function updateVendorProduct(product) {
  const storedProducts = readStoredProducts();
  const hasProduct = storedProducts.some((entry) => entry.id === product.id);
  const products = hasProduct
    ? storedProducts.map((entry) => (entry.id === product.id ? product : entry))
    : [...storedProducts, product];
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function deleteVendorProduct(productId) {
  const products = readStoredProducts().filter((product) => product.id !== productId);
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  const deletedIds = [...new Set([...readDeletedProductIds(), productId])];
  localStorage.setItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(deletedIds));
}

function createProductId(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
}

function belongsToVendor(product, user) {
  return product.vendorId === user.id || product.vendorId === vendorKey(user.name);
}

export {
  belongsToVendor,
  createProductId,
  deleteVendorProduct,
  getCatalog,
  saveVendorProduct,
  updateVendorProduct,
  vendorKey,
};
