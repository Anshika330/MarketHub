import { useCallback, useEffect, useMemo, useState } from 'react';
import VendorShell from '../components/vendor/VendorShell';
import { categories } from '../constants/homeData';
import { useAuth } from '../context/AuthContext';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../services/productApi';

const emptyForm = {
  name: '',
  description: '',
  category: 'Electronics',
  price: '',
  stock: '',
  image: '',
};

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function VendorProductsPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const catalog = await fetchProducts();
      setProducts(catalog.filter((product) => product.vendorId === currentUser.id));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const visibleProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [products, search],
  );

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setFeedback('');
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
  };

  const openForm = (product = null) => {
    setEditingId(product?.id || null);
    setForm(
      product
        ? {
            name: product.name,
            description: product.description,
            category: product.category,
            price: String(product.price),
            stock: String(product.stock),
            image: product.image,
          }
        : emptyForm,
    );
    setErrors({});
    setErrorMessage('');
    setFeedback('');
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Enter a product name.';
    if (!form.description.trim()) nextErrors.description = 'Enter a description.';
    if (!form.price || Number(form.price) <= 0) {
      nextErrors.price = 'Price must be greater than zero.';
    }
    if (!/^\d+$/.test(form.stock) || Number(form.stock) < 0) {
      nextErrors.stock = 'Stock must be a non-negative integer.';
    }
    if (!form.image.trim()) {
      nextErrors.image = 'Enter an image URL.';
    } else if (!/^https?:\/\/\S+$/i.test(form.image.trim())) {
      nextErrors.image = 'Enter a valid image URL.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setFeedback('');

    const product = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image.trim(),
      vendorId: currentUser.id,
      vendor: currentUser.storeName || currentUser.name,
    };

    try {
      if (editingId) {
        await updateProduct(editingId, product);
        setFeedback('Product updated successfully.');
      } else {
        await createProduct(product);
        setFeedback('Product added successfully.');
      }
      closeForm();
      await loadProducts();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}" from your products?`)) {
      return;
    }

    setErrorMessage('');
    setFeedback('');
    try {
      await deleteProduct(product.id);
      setFeedback('Product deleted successfully.');
      await loadProducts();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <VendorShell
      title="Manage products"
      description="Keep your shop catalogue fresh and ready for customers."
    >
      <div className="vendor-toolbar">
        <label className="search-field">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <span className="sr-only">Search products</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your products"
          />
        </label>
        <button
          className="primary-button vendor-add-button"
          type="button"
          onClick={() => openForm()}
        >
          Add Product <span aria-hidden="true">+</span>
        </button>
      </div>

      {feedback && <p className="save-success" role="status">{feedback}</p>}
      {errorMessage && (
        <div className="save-error" role="alert">
          <p>{errorMessage}</p>
          {!isFormOpen && (
            <button className="outline-button" type="button" onClick={loadProducts}>
              Retry
            </button>
          )}
        </div>
      )}

      {isFormOpen && (
        <form className="vendor-product-form" onSubmit={handleSubmit} noValidate>
          <div className="form-section-heading">
            <span>{editingId ? 'Edit' : 'New'}</span>
            <div>
              <h2>{editingId ? 'Edit product' : 'Add a product'}</h2>
              <p>Products are visible in the customer catalogue after saving.</p>
            </div>
          </div>
          <div className="form-grid">
            {[
              ['name', 'Product name', 'text'],
              ['price', 'Price (₹)', 'number'],
              ['stock', 'Stock quantity', 'number'],
              ['image', 'Product image URL', 'url'],
            ].map(([field, label, type]) => (
              <label className="form-field" key={field}>
                <span>{label}</span>
                <input
                  type={type}
                  value={form[field]}
                  min={type === 'number' ? '0' : undefined}
                  onChange={(event) => updateField(field, event.target.value)}
                />
                {errors[field] && <small className="field-error">{errors[field]}</small>}
              </label>
            ))}
            <label className="form-field">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.name}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="form-field form-field--wide">
              <span>Description</span>
              <textarea
                value={form.description}
                rows="3"
                onChange={(event) => updateField('description', event.target.value)}
              />
              {errors.description && (
                <small className="field-error">{errors.description}</small>
              )}
            </label>
          </div>
          <div className="vendor-form-actions">
            <button className="primary-button" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
            </button>
            <button className="outline-button" type="button" onClick={closeForm} disabled={isSaving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="shop-status" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <p>Loading your products...</p>
        </div>
      ) : errorMessage && products.length === 0 ? null : visibleProducts.length === 0 ? (
        <div className="vendor-empty-state">
          <h2>No products found</h2>
          <p>Add your first product or try a different search.</p>
        </div>
      ) : (
        <div className="vendor-product-table-wrap">
          <table className="vendor-product-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="vendor-product-name">
                      <img src={product.image} alt="" />
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button className="table-action" type="button" onClick={() => openForm(product)}>
                      Edit
                    </button>
                    <button className="table-action table-action--danger" type="button" onClick={() => handleDelete(product)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </VendorShell>
  );
}

export default VendorProductsPage;
