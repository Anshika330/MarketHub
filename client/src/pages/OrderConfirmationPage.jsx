import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrder } from '../services/orderApi';

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchOrder(orderId)
      .then(setOrder)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return <div className="shop-status" role="status"><span className="loading-spinner" /><p>Loading order confirmation...</p></div>;
  }
  if (!order) {
    return (
      <section className="product-not-found container">
        <p className="eyebrow">MarketHub</p>
        <h1>Order not found</h1>
        <p>{errorMessage || 'This confirmation may have expired or is no longer available.'}</p>
        <Link className="outline-button" to="/shop">Continue Shopping</Link>
      </section>
    );
  }

  return (
    <section className="confirmation-page section-space">
      <div className="container confirmation-container">
        <div className="confirmation-hero">
          <span className="confirmation-icon" aria-hidden="true">✓</span>
          <p className="eyebrow">Thank you for shopping with MarketHub</p>
          <h1>Your order is on its way.</h1>
          <p>We&apos;ve saved your demo order and will keep it here for you.</p>
        </div>
        <div className="order-meta-grid">
          <div><span>Order ID</span><strong>{order.orderId}</strong></div>
          <div><span>Order date</span><strong>{formatDate(order.date)}</strong></div>
          <div><span>Status</span><strong className="status-badge">{order.status}</strong></div>
          <div><span>Payment</span><strong className="status-badge">{order.payment?.status || 'Pending'}</strong></div>
          <div><span>Payment method</span><strong>{order.payment?.method || 'Demo Payment'}</strong></div>
          {order.payment?.transactionId && (
            <div><span>Demo transaction</span><strong>{order.payment.transactionId}</strong></div>
          )}
        </div>
        <div className="confirmation-details-grid">
          <div className="confirmation-panel">
            <p className="eyebrow">Ordered products</p>
            {order.items.map((item) => (
              <div className="saved-order-item" key={item.productId}>
                <img src={item.image} alt="" />
                <div><strong>{item.name}</strong><span>Qty {item.quantity} · {item.vendor}</span></div>
                <b>{formatPrice(item.subtotal)}</b>
              </div>
            ))}
            <div className="saved-order-total"><span>Total</span><strong>{formatPrice(order.total)}</strong></div>
          </div>
          <div className="confirmation-panel delivery-panel">
            <p className="eyebrow">Delivery address</p>
            <strong>{order.deliveryDetails.fullName}</strong>
            <p>{order.deliveryDetails.address}<br />{order.deliveryDetails.city}, {order.deliveryDetails.state} - {order.deliveryDetails.pinCode}</p>
            <p>{order.deliveryDetails.email}<br />{order.deliveryDetails.phone}</p>
          </div>
        </div>
        <div className="confirmation-actions">
          <Link className="primary-button" to="/shop">Continue Shopping <span aria-hidden="true">→</span></Link>
          <Link className="outline-button" to="/orders">View My Orders</Link>
        </div>
      </div>
    </section>
  );
}

export default OrderConfirmationPage;
