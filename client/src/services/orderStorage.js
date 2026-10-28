const ORDERS_STORAGE_KEY = 'markethub-orders';

function readOrders() {
  try {
    const storedOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY));
    if (!Array.isArray(storedOrders)) {
      return [];
    }

    return storedOrders.filter(
      (order) =>
        order &&
        typeof order.orderId === 'string' &&
        typeof order.date === 'string' &&
        typeof order.status === 'string' &&
        Array.isArray(order.items) &&
        order.deliveryDetails &&
        typeof order.deliveryDetails === 'object' &&
        Number.isFinite(order.total),
    );
  } catch {
    return [];
  }
}

function saveOrder(order) {
  const orders = readOrders();
  const updatedOrders = [order, ...orders];

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    return true;
  } catch {
    return false;
  }
}

function updateOrderStatus(orderId, status) {
  const orders = readOrders();
  const updatedOrders = orders.map((order) =>
    order.orderId === orderId ? { ...order, status } : order,
  );

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    return true;
  } catch {
    return false;
  }
}

function findOrder(orderId) {
  return readOrders().find((order) => order.orderId === orderId) || null;
}

export { findOrder, readOrders, saveOrder, updateOrderStatus };
