import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VendorShell from '../components/vendor/VendorShell';
import { fetchProducts } from '../services/productApi';
import { fetchVendorOrders, fetchVendorPayouts } from '../services/orderApi';

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function VendorDashboardPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchVendorOrders(currentUser.id),
      fetchVendorPayouts(currentUser.id),
    ])
      .then(([catalog, vendorOrders, payoutSummary]) => {
        setProducts(catalog.filter((product) => product.vendorId === currentUser.id));
        setOrders(vendorOrders);
        setPayouts(payoutSummary);
      })
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, [currentUser.id]);

  const vendorItems = orders.flatMap((order) => order.items);
  const grossSales = payouts?.grossSales || 0;
  const commission = payouts?.commission || 0;
  const netEarnings = payouts?.netEarnings || 0;

  return (
    <VendorShell title={`Welcome, ${currentUser.name}.`} description="Keep an eye on your products, orders, and estimated shop performance.">
      {errorMessage && <div className="save-error" role="alert"><p>{errorMessage}</p></div>}
      {isLoading ? (
        <div className="shop-status" role="status"><span className="loading-spinner" /><p>Loading your shop performance...</p></div>
      ) : (
        <>
          <div className="vendor-stats-grid">
            <article className="vendor-stat-card"><span>Products listed</span><strong>{products.length}</strong><small>Owned by your shop</small></article>
            <article className="vendor-stat-card"><span>Orders containing your products</span><strong>{orders.length}</strong><small>Based on backend demo orders</small></article>
            <article className="vendor-stat-card"><span>Total units sold</span><strong>{vendorItems.reduce((total, item) => total + item.quantity, 0)}</strong><small>Across relevant orders</small></article>
            <article className="vendor-stat-card"><span>Estimated gross sales</span><strong>{formatPrice(grossSales)}</strong><small>Excludes cancelled orders</small></article>
            <article className="vendor-stat-card"><span>Estimated platform commission</span><strong>{formatPrice(commission)}</strong><small>Demo rate: 10%</small></article>
            <article className="vendor-stat-card vendor-stat-card--accent"><span>Estimated net earnings</span><strong>{formatPrice(netEarnings)}</strong><small>Gross sales less commission</small></article>
            <article className="vendor-stat-card"><span>Pending payout</span><strong>{formatPrice(payouts?.pendingPayout || 0)}</strong><small>Paid orders awaiting payout</small></article>
            <article className="vendor-stat-card"><span>Paid payout</span><strong>{formatPrice(payouts?.paidPayout || 0)}</strong><small>Demo payout history</small></article>
          </div>
          <div className="vendor-quick-links">
            <Link className="vendor-quick-link" to="/vendor/products"><strong>Manage Products</strong><span>Add, edit, or remove your listings →</span></Link>
            <Link className="vendor-quick-link" to="/vendor/orders"><strong>Vendor Orders</strong><span>Review fulfilment for your products →</span></Link>
          </div>
          <p className="vendor-disclaimer">Estimates are calculated from backend products and in-memory demo orders. Orders reset when the backend restarts; real authorization, commission, and payout calculations must be enforced by the backend.</p>
        </>
      )}
    </VendorShell>
  );
}

export default VendorDashboardPage;
