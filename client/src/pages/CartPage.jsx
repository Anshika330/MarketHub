import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function CartPage() {
  const {
    cartProducts,
    itemCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (cartProducts.length === 0) {
    return (
      <section className="empty-cart-page section-space">
        <div className="container empty-cart-content">
          <span className="empty-cart-icon" aria-hidden="true">♡</span>
          <p className="eyebrow">Your MarketHub cart</p>
          <h1>Your cart is waiting for something special.</h1>
          <p>Browse independent sellers and find something made for you.</p>
          <Link className="primary-button" to="/shop">
            Explore Products <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page section-space">
      <div className="container">
        <div className="cart-heading">
          <div>
            <p className="eyebrow">Your MarketHub cart</p>
            <h1>Your selected finds</h1>
          </div>
          <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cartProducts.map((product) => (
              <article className="cart-item" key={product.id}>
                <Link className="cart-item-image" to={`/products/${product.id}`}>
                  <img src={product.image} alt={product.name} />
                </Link>
                <div className="cart-item-info">
                  <p>{product.category}</p>
                  <h2>{product.name}</h2>
                  <span>by {product.vendor}</span>
                  <strong>{formatPrice(product.price)}</strong>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${product.name}`}
                      onClick={() => updateQuantity(product.id, product.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{product.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${product.name}`}
                      onClick={() => updateQuantity(product.id, product.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <strong className="cart-item-subtotal">
                    {formatPrice(product.price * product.quantity)}
                  </strong>
                  <button
                    className="remove-item"
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <p className="eyebrow">Order summary</p>
            <div className="cart-summary-row">
              <span>Items ({itemCount})</span>
              <strong>{formatPrice(cartSubtotal)}</strong>
            </div>
            <div className="cart-summary-total">
              <span>Subtotal</span>
              <strong>{formatPrice(cartSubtotal)}</strong>
            </div>
            <Link className="primary-button cart-checkout-button" to="/checkout">
              Proceed to Checkout <span aria-hidden="true">→</span>
            </Link>
            <Link className="continue-shopping" to="/shop">
              ← Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
