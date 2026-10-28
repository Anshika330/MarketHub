const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');
const TOKEN_KEY = 'markethub-auth-token';

async function request(endpoint, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(localStorage.getItem(TOKEN_KEY) ? { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` } : {}),
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    console.error('MarketHub order API request failed:', {
      endpoint,
      message: error instanceof Error ? error.message : 'Network request failed',
    });
    throw new Error('Unable to reach the order service. Please check that the backend is running.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The order service returned an invalid response.');
  }

  if (!response.ok || payload.success !== true) {
    throw new Error(payload.message || 'The order service could not complete the request.');
  }
  return payload;
}

async function createOrder(order) {
  const payload = await request('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
  return payload.data;
}

async function payOrder(orderId) {
  const payload = await request(`/orders/${encodeURIComponent(orderId)}/payment`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return payload.data;
}

async function fetchCustomerOrders(customerId) {
  const payload = await request(`/orders/customer/${encodeURIComponent(customerId)}`);
  return payload.data;
}

async function fetchVendorOrders(vendorId) {
  const payload = await request(`/orders/vendor/${encodeURIComponent(vendorId)}`);
  return payload.data;
}

async function fetchOrder(orderId) {
  const payload = await request(`/orders/${encodeURIComponent(orderId)}`);
  return payload.data;
}

async function updateOrderStatus(orderId, status) {
  const payload = await request(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return payload.data;
}

async function fetchVendorPayouts(vendorId) {
  const payload = await request(`/payouts/vendor/${encodeURIComponent(vendorId)}`);
  return payload.data;
}

async function fetchAllPayouts() {
  const payload = await request('/payouts');
  return payload.data;
}

async function fetchAdminOrderSummary() {
  const payload = await request('/orders/admin/summary');
  return payload.data;
}

async function updatePayoutStatus(orderId, vendorId, status) {
  const payload = await request(
    `/payouts/${encodeURIComponent(orderId)}/${encodeURIComponent(vendorId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );
  return payload.data;
}

export {
  createOrder,
  fetchAllPayouts,
  fetchAdminOrderSummary,
  fetchCustomerOrders,
  fetchOrder,
  fetchVendorPayouts,
  fetchVendorOrders,
  payOrder,
  updatePayoutStatus,
  updateOrderStatus,
};
