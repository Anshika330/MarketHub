import { useEffect, useState } from 'react';
import AdminShell from '../components/admin/AdminShell';
import { useAuth } from '../context/AuthContext';

const vendorStatuses = ['Pending', 'Verified', 'Rejected', 'Suspended'];

function displayStatus(vendor) {
  return vendor.status || 'Pending';
}

function AdminVendorsPage() {
  const { getUsers, updateVendorStatus } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const loadVendors = async () => {
    setLoading(true);
    const users = await getUsers();
    setVendors(users.filter((user) => user.role === 'Vendor'));
    setLoading(false);
  };

  useEffect(() => { loadVendors(); }, []);

  const changeStatus = async (vendor, status) => {
    const action = status === 'Verified' ? 'approve' : status === 'Rejected' ? 'reject' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} ${vendor.name}'s vendor application?`)) {
      return;
    }

    if (await updateVendorStatus(vendor.id, status)) {
      await loadVendors();
      setFeedback(`${vendor.name} is now ${status.toLowerCase()}.`);
    } else {
      setFeedback('The vendor status could not be saved. Please try again.');
    }
  };

  return (
    <AdminShell
      title="Vendor approvals"
      description="Review seller applications and control access to vendor tools."
    >
      {feedback && <p className="admin-feedback">{feedback}</p>}
      {loading && <p className="shop-status">Loading vendor applications...</p>}
      {vendors.length === 0 ? (
        <div className="admin-empty-state">
          <h2>No vendor applications yet</h2>
          <p>New Vendor signups will appear here for review.</p>
        </div>
      ) : (
        <div className="admin-vendor-table-wrap">
          <table className="admin-vendor-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Store</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>
                    <strong>{vendor.name}</strong>
                    <small>{vendor.email}</small>
                  </td>
                  <td>{vendor.storeName || `${vendor.name}'s Store`}</td>
                  <td>
                    {vendor.registeredAt
                      ? new Date(vendor.registeredAt).toLocaleDateString('en-IN')
                      : 'Not available'}
                  </td>
                  <td>
                    <span className={`admin-status admin-status--${displayStatus(vendor).toLowerCase()}`}>
                      {displayStatus(vendor)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {displayStatus(vendor) === 'Pending' && (
                        <>
                          <button type="button" onClick={() => changeStatus(vendor, 'Verified')}>Approve</button>
                          <button type="button" className="admin-danger" onClick={() => changeStatus(vendor, 'Rejected')}>Reject</button>
                        </>
                      )}
                      {displayStatus(vendor) === 'Verified' && (
                        <button type="button" className="admin-danger" onClick={() => changeStatus(vendor, 'Suspended')}>Suspend</button>
                      )}
                      {(displayStatus(vendor) === 'Suspended' || displayStatus(vendor) === 'Rejected') && (
                        <button type="button" onClick={() => changeStatus(vendor, 'Verified')}>Approve</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="admin-disclaimer">
        Vendor status is persisted in localStorage for this demo. Backend
        authorization must enforce these decisions in production.
      </p>
    </AdminShell>
  );
}

export { vendorStatuses };
export default AdminVendorsPage;
