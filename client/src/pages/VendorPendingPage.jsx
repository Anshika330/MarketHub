import { Link } from 'react-router-dom';

function VendorPendingPage() {
  return (
    <section className="vendor-pending-page">
      <div className="vendor-pending-card">
        <div className="vendor-pending-status">
          <span className="vendor-pending-clock" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          <span className="vendor-pending-badge">Pending approval</span>
        </div>
        <p className="eyebrow">Vendor application</p>
        <h1>Your seller access is being reviewed.</h1>
        <p className="vendor-pending-description">
          An admin needs to approve your vendor application before you can manage
          products or orders. You can continue browsing the marketplace meanwhile.
        </p>
        <Link className="primary-button vendor-pending-button" to="/shop">
          Browse MarketHub
        </Link>
      </div>
    </section>
  );
}

export default VendorPendingPage;
