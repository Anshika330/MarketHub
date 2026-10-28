import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminShell from '../components/admin/AdminShell';
import { useAuth } from '../context/AuthContext';
import { getCatalog } from '../services/productStorage';
import { fetchAdminOrderSummary, fetchAllPayouts, updatePayoutStatus } from '../services/orderApi';

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function AdminDashboardPage() {
  const { getUsers } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [users, setUsers] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(true);
  const [payoutError, setPayoutError] = useState('');
  const [payoutFeedback, setPayoutFeedback] = useState('');
  const [orderSummary, setOrderSummary] = useState(null);
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(true);
  const [orderSummaryError, setOrderSummaryError] = useState('');
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);
  const vendors = users.filter((user) => user.role === 'Vendor');
  const products = getCatalog();

  const loadOrderSummary = useCallback(async () => {
    setOrderSummaryLoading(true);
    setOrderSummaryError('');
    try {
      setOrderSummary(await fetchAdminOrderSummary());
    } catch (error) {
      setOrderSummaryError(error.message);
    } finally {
      setOrderSummaryLoading(false);
    }
  }, []);

  const loadPayouts = useCallback(async () => {
    setPayoutLoading(true);
    setPayoutError('');
    try {
      setPayouts(await fetchAllPayouts());
    } catch (error) {
      setPayoutError(error.message);
    } finally {
      setPayoutLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  useEffect(() => {
    loadOrderSummary();
  }, [loadOrderSummary]);

  const markPayoutPaid = async (payout) => {
    setPayoutError('');
    setPayoutFeedback('');
    try {
      await updatePayoutStatus(payout.orderId, payout.vendorId, 'Paid');
      setPayoutFeedback('Payout marked as paid.');
      await loadPayouts();
    } catch (error) {
      setPayoutError(error.message);
    }
  };

  const stats = [
    ['Registered users', users.length, 'Customers, vendors, and admins'],
    ['Total vendors', vendors.length, 'All vendor applications'],
    ['Pending applications', vendors.filter((vendor) => (vendor.status || 'Pending') === 'Pending').length, 'Awaiting review'],
    ['Approved vendors', vendors.filter((vendor) => vendor.status === 'Verified').length, 'Verified sellers'],
    ['Total products', products.length, 'Customer catalogue'],
    [
      'Total orders',
      orderSummaryLoading ? '—' : orderSummaryError ? 'Unavailable' : orderSummary.totalOrders,
      'Persisted backend orders',
    ],
    [
      'Total order value',
      orderSummaryLoading
        ? '—'
        : orderSummaryError
          ? 'Unavailable'
          : formatPrice(orderSummary.totalOrderValue),
      orderSummary?.includesCancelledOrders
        ? 'Includes cancelled orders'
        : 'Persisted backend order totals',
    ],
  ];

  return (
    <AdminShell
      title="Marketplace overview"
      description="Review marketplace activity and keep vendor applications moving."
    >
      <div className="admin-stats-grid">
        {stats.map(([label, value, note]) => (
          <article className="admin-stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>
      <div className="admin-quick-links">
        <Link className="admin-quick-link" to="/admin/vendors">
          <strong>Review vendors</strong>
          <span>Approve, reject, or suspend sellers →</span>
        </Link>
        <div className="admin-note">
          <strong>Demo admin access</strong>
          <span>Order metrics are calculated from persisted backend data.</span>
        </div>
      </div>
      {orderSummaryError && (
        <div className="save-error" role="alert">
          <p>Order metrics could not be loaded: {orderSummaryError}</p>
          <button className="outline-button" type="button" onClick={loadOrderSummary}>Retry</button>
        </div>
      )}
      <section className="admin-payout-section">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Demo finance controls</p>
            <h2>Vendor payouts</h2>
          </div>
          <span>Paid orders only</span>
        </div>
        {payoutFeedback && <p className="admin-feedback">{payoutFeedback}</p>}
        {payoutError && (
          <div className="save-error" role="alert">
            <p>{payoutError}</p>
            <button className="outline-button" type="button" onClick={loadPayouts}>Retry</button>
          </div>
        )}
        {payoutLoading ? (
          <div className="shop-status" role="status"><span className="loading-spinner" /><p>Loading payout summaries...</p></div>
        ) : payouts.length === 0 ? (
          <div className="admin-empty-state"><h2>No payable payouts yet</h2><p>Paid demo orders will appear here.</p></div>
        ) : (
          <div className="admin-payout-list">
            {payouts.map((summary) => (
              <article className="admin-payout-card" key={summary.vendorId}>
                <div>
                  <strong>{summary.vendorId}</strong>
                  <span>Gross {formatPrice(summary.grossSales)} · Commission {formatPrice(summary.commission)}</span>
                </div>
                <div>
                  <span>Pending</span>
                  <strong>{formatPrice(summary.pendingPayout)}</strong>
                </div>
                <div>
                  <span>Paid</span>
                  <strong>{formatPrice(summary.paidPayout)}</strong>
                </div>
                <div className="admin-payout-actions">
                  {summary.payouts
                    .filter((payout) => payout.status === 'Pending')
                    .map((payout) => (
                      <button type="button" key={payout.orderId} onClick={() => markPayoutPaid(payout)}>
                        Mark {payout.orderId} paid
                      </button>
                    ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <p className="admin-disclaimer">
        This dashboard is for frontend demonstration only. Real authorization
        and marketplace administration must be enforced by the backend. Payout
        controls are a demo simulation and do not transfer real money.
      </p>
    </AdminShell>
  );
}

export default AdminDashboardPage;
