import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

function ProductCard({ product, showDetails = false }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <article className={`product-card product-card--${product.tone || 'sand'}`}>
      <div className="product-image-wrap">
        <img className="product-image" src={product.image} alt={product.name} />
        <span className="product-category">{product.category}</span>
      </div>
      <div className="product-card-content">
        <div>
          <h3>{product.name}</h3>
          <p>by {product.vendor}</p>
        </div>
        <strong>{`₹${product.price.toLocaleString('en-IN')}`}</strong>
      </div>
      {showDetails && (
        <Link className="product-details-link" to={`/products/${product.id}`}>
          View Details <span aria-hidden="true">→</span>
        </Link>
      )}
      <button className="add-to-cart-button" type="button" onClick={handleAddToCart}>
        {isAdded ? 'Added to Cart' : 'Add to Cart'}
      </button>
    </article>
  );
}

export default ProductCard;
