import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, payOrder } from '../services/orderApi';

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pinCode: '',
};

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function validateForm(form) {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit Indian phone number.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.address.trim()) errors.address = 'Enter your delivery address.';
  if (!form.city.trim()) errors.city = 'Enter your city.';
  if (!form.state.trim()) errors.state = 'Enter your state.';
  if (!/^\d{6}$/.test(form.pinCode.trim())) {
    errors.pinCode = 'Enter a valid six-digit PIN code.';
  }

  return errors;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartProducts, cartSubtotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  if (cartProducts.length === 0) {
    return (
      <section className="empty-cart-page section-space">
        <div className="container empty-cart-content">
          <span className="empty-cart-icon" aria-hidden="true">♡</span>
          <p className="eyebrow">Checkout</p>
          <h1>Your cart is empty.</h1>
          <p>Add something special before heading to checkout.</p>
          <Link className="primary-button" to="/shop">
            Explore Products <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    );
  }

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setSaveError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSaveError('');

    try {
      let order = createdOrder;
      if (!order) {
        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }

        order = await createOrder({
          customerId: currentUser.id,
          deliveryDetails: { ...form },
          items: cartProducts.map((product) => ({
            productId: product.id,
            quantity: product.quantity,
          })),
        });
        setCreatedOrder(order);
      }

      order = await payOrder(order.orderId);
      clearCart();
      navigate(`/orders/${order.orderId}/confirmation`);
    } catch (error) {
      setSaveError(
        createdOrder
          ? `Your order was saved, but demo payment could not be completed. ${error.message}`
          : error.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: 'fullName', label: 'Full name', type: 'text', placeholder: 'Aarav Sharma' },
    { name: 'phone', label: 'Phone number', type: 'tel', placeholder: '9876543210' },
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'House number, street and area', wide: true },
    { name: 'city', label: 'City', type: 'text', placeholder: 'Mumbai' },
    { name: 'state', label: 'State', type: 'text', placeholder: 'Maharashtra' },
    { name: 'pinCode', label: 'PIN code', type: 'text', placeholder: '400001' },
  ];

  return (
    <section className="checkout-page section-space">
      <div className="container">
        <div className="checkout-heading">
          <p className="eyebrow">Almost yours</p>
          <h1>Complete your order</h1>
          <p>Tell us where to send your MarketHub finds.</p>
        </div>
        <div className="checkout-layout">
          <form className="delivery-form" onSubmit={handleSubmit} noValidate>
            <div className="form-section-heading">
              <span>01</span>
              <div>
                <h2>Delivery information</h2>
                <p>We&apos;ll use these details for delivery updates.</p>
              </div>
            </div>
            <div className="form-grid">
              {fields.map((field) => (
                <label className={field.wide ? 'form-field form-field--wide' : 'form-field'} key={field.name}>
                  <span>{field.label}</span>
                  <input
                    type={field.type}
                    value={form[field.name]}
                    placeholder={field.placeholder}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    aria-invalid={Boolean(errors[field.name])}
                  />
                  {errors[field.name] && <small className="field-error">{errors[field.name]}</small>}
                </label>
              ))}
            </div>
            <p className="demo-notice">
              Demo payment only — no real money is charged.
            </p>
            {saveError && <p className="save-error">{saveError}</p>}
            <button className="primary-button place-order-button" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Processing demo payment...'
                : createdOrder
                  ? 'Retry Demo Payment'
                  : 'Place Demo Order'} <span aria-hidden="true">→</span>
            </button>
          </form>

          <aside className="checkout-summary">
            <div className="form-section-heading">
              <span>02</span>
              <div>
                <h2>Order summary</h2>
                <p>{cartProducts.length} {cartProducts.length === 1 ? 'product' : 'products'}</p>
              </div>
            </div>
            <div className="checkout-items">
              {cartProducts.map((product) => (
                <div className="checkout-item" key={product.id}>
                  <img src={product.image} alt="" />
                  <div>
                    <strong>{product.name}</strong>
                    <span>Qty {product.quantity}</span>
                  </div>
                  <b>{formatPrice(product.price * product.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="checkout-totals">
              <div><span>Subtotal</span><strong>{formatPrice(cartSubtotal)}</strong></div>
              <div><span>Delivery</span><strong>₹0</strong></div>
              <div className="checkout-final-total"><span>Total</span><strong>{formatPrice(cartSubtotal)}</strong></div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default CheckoutPage;
