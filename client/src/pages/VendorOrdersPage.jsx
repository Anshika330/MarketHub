import { useCallback, useEffect, useState } from 'react';
import VendorShell from '../components/vendor/VendorShell';
import { useAuth } from '../context/AuthContext';
import { fetchVendorOrders, updateOrderStatus } from '../services/orderApi';

const orderStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered'];

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function VendorOrdersPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [savingOrderId, setSavingOrderId] = useState('');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      setOrders(await fetchVendorOrders(currentUser.id));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, status) => {
    setSavingOrderId(orderId);
    setErrorMessage('');
    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === updatedOrder.orderId
            ? { ...order, status: updatedOrder.status }
            : order,
        ),
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSavingOrderId('');
    }
  };

  return (
    <VendorShell title="Vendor orders" description="Review and fulfil orders that contain your products.">
      {errorMessage && (
        <div className="save-error" role="alert">
          <p>{errorMessage}</p>
          <button className="outline-button" type="button" onClick={loadOrders}>Retry</button>
        </div>
      )}
      {isLoading ? (
        <div className="shop-status" role="status"><span className="loading-spinner" /><p>Loading vendor orders...</p></div>
      ) : orders.length === 0 ? (
        <div className="vendor-empty-state"><h2>No vendor orders yet</h2><p>Orders containing your products will appear here.</p></div>
      ) : (
        <div className="vendor-orders-list">
          {orders.map((order) => (
            <article className="vendor-order-card" key={order.orderId}>
              <div className="vendor-order-header">
                <div><span>Order ID</span><strong>{order.orderId}</strong></div>
                <div><span>Date</span><strong>{new Date(order.date).toLocaleDateString('en-IN')}</strong></div>
                <div><span>Vendor total</span><strong>{formatPrice(order.vendorSubtotal)}</strong></div>
                <label>
                  <span>Status</span>
                  <select value={order.status} disabled={savingOrderId === order.orderId} onChange={(event) => handleStatusChange(order.orderId, event.target.value)}>
                    {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
              </div>
              <div className="vendor-order-items">
                {order.items.map((item) => (
                  <div key={item.productId}><strong>{item.name}</strong><span>Qty {item.quantity} · {item.vendor}</span><b>{formatPrice(item.subtotal)}</b></div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </VendorShell>
  );
}

export default VendorOrdersPage;
