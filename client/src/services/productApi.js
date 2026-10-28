const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');
const TOKEN_KEY = 'markethub-auth-token';

async function request(endpoint, options = {}) {
  const requestUrl = `${API_BASE_URL}${endpoint}`;
  let response;

  try {
    response = await fetch(requestUrl, {
      ...options,
      headers: {
        ...(localStorage.getItem(TOKEN_KEY) ? { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` } : {}),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    console.error('MarketHub product API request failed:', {
      endpoint,
      message: error instanceof Error ? error.message : 'Network request failed',
    });
    throw new Error(
      `Unable to reach the product service at ${API_BASE_URL}. Please check that the backend is running and CORS allows this frontend.`,
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    console.error('MarketHub product API returned invalid JSON:', {
      endpoint,
      status: response.status,
      message: error instanceof Error ? error.message : 'Invalid JSON response',
    });
    throw new Error('The product service returned an invalid response.');
  }

  if (!response.ok || payload.success !== true) {
    console.error('MarketHub product API returned an unsuccessful response:', {
      endpoint,
      status: response.status,
      message: payload.message || 'Unknown API error',
    });
    throw new Error(payload.message || 'The product service could not complete the request.');
  }

  return payload;
}

async function fetchProducts() {
  const payload = await request('/products');

  if (!Array.isArray(payload.data)) {
    throw new Error('The product service returned an invalid product list.');
  }

  return payload.data;
}

async function fetchProductById(productId) {
  const payload = await request(`/products/${encodeURIComponent(productId)}`);

  if (!payload.data || typeof payload.data !== 'object') {
    throw new Error('The product service returned an invalid product.');
  }

  return payload.data;
}

async function createProduct(product) {
  const payload = await request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
  return payload.data;
}

async function updateProduct(productId, product) {
  const payload = await request(`/products/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
  return payload.data;
}

async function deleteProduct(productId) {
  await request(`/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  updateProduct,
};
