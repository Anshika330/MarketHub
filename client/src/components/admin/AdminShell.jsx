import { NavLink } from 'react-router-dom';

function AdminShell({ children, title, description }) {
  return (
    <div className="admin-area">
      <aside className="admin-sidebar">
        <p className="eyebrow">Admin workspace</p>
        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink to="/admin/dashboard">Overview</NavLink>
          <NavLink to="/admin/vendors">Vendor approvals</NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-page-heading">
          <p className="eyebrow">MarketHub administration</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

export default AdminShell;
