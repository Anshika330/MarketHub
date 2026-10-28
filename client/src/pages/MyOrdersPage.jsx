import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCustomerOrders } from '../services/orderApi';

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MyOrdersPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchCustomerOrders(currentUser.id)
      .then(setOrders)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, [currentUser.id]);

  if (isLoading) {
    return <div className="shop-status" role="status"><span className="loading-spinner" /><p>Loading your orders...</p></div>;
  }
  if (errorMessage) {
    return <div className="shop-status shop-status--error" role="alert"><h2>We could not load your orders</h2><p>{errorMessage}</p></div>;
  }
  if (orders.length === 0) {
    return (
      <section className="empty-orders-page section-space">
        <div className="container empty-cart-content">
          <span className="empty-cart-icon" aria-hidden="true">☰</span>
          <p className="eyebrow">Your MarketHub orders</p>
          <h1>Your order history is waiting to begin.</h1>
          <p>Once you place a demo order, it will appear here.</p>
          <Link className="primary-button" to="/shop">Explore Products <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    );
  }

  return (
    <section className="orders-page section-space">
      <div className="container">
        <div className="cart-heading">
          <div><p className="eyebrow">Your MarketHub orders</p><h1>Order history</h1></div>
          <Link className="text-link" to="/shop">Continue shopping <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="orders-list">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.orderId;
            return (
              <article className="order-history-card" key={order.orderId}>
                <div className="order-history-header">
                  <div><span>Order placed</span><strong>{formatDate(order.date)}</strong></div>
                  <div><span>Order ID</span><strong>{order.orderId}</strong></div>
                  <div><span>Total</span><strong>{formatPrice(order.total)}</strong></div>
                  <span className="status-badge">{order.status}</span>
                  <button className="order-toggle" type="button" onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}>
                    {isExpanded ? 'Hide details' : 'View details'} <span aria-hidden="true">{isExpanded ? '↑' : '↓'}</span>
                  </button>
                </div>
                {isExpanded && (
                  <div className="order-history-details">
                    {order.items.map((item) => (
                      <div className="saved-order-item" key={item.productId}>
                        <img src={item.image} alt="" />
                        <div><strong>{item.name}</strong><span>Qty {item.quantity} · {item.vendor}</span></div>
                        <b>{formatPrice(item.subtotal)}</b>
                      </div>
                    ))}
                    <p className="order-address"><strong>Delivering to:</strong> {order.deliveryDetails.address}, {order.deliveryDetails.city}, {order.deliveryDetails.state} - {order.deliveryDetails.pinCode}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MyOrdersPage;
