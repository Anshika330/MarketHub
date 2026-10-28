import { NavLink } from 'react-router-dom';

function VendorShell({ children, title, description }) {
  return (
    <div className="vendor-area">
      <aside className="vendor-sidebar">
        <p className="eyebrow">Vendor workspace</p>
        <nav className="vendor-nav" aria-label="Vendor navigation">
          <NavLink to="/vendor/dashboard">Overview</NavLink>
          <NavLink to="/vendor/products">Manage Products</NavLink>
          <NavLink to="/vendor/orders">Vendor Orders</NavLink>
        </nav>
      </aside>
      <main className="vendor-main">
        <div className="vendor-page-heading">
          <p className="eyebrow">MarketHub vendor tools</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

export default VendorShell;
