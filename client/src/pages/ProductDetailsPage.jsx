import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchProductById } from '../services/productApi';

function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setErrorMessage('');
    setProduct(null);

    fetchProductById(id)
      .then((loadedProduct) => {
        if (isCurrentRequest) {
          setProduct(loadedProduct);
        }
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setErrorMessage(error.message);
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <section className="product-status container" role="status">
        <span className="loading-spinner" aria-hidden="true" />
        <p>Loading product...</p>
      </section>
    );
  }

  if (errorMessage || !product) {
    return (
      <section className="product-status container" role="alert">
        <p className="eyebrow">MarketHub</p>
        <h1>{errorMessage ? 'Unable to load product' : 'Product not found'}</h1>
        <p>{errorMessage || 'We could not find the product you were looking for.'}</p>
        <Link className="outline-button" to="/shop">
          Back to Shop
        </Link>
      </section>
    );
  }

  return (
    <section className="product-details-page section-space">
      <div className="container">
        <Link className="back-link" to="/shop">
          <span aria-hidden="true">←</span> Back to Shop
        </Link>
        <div className="product-details-grid">
          <div className="product-details-image">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-details-copy">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="product-details-price">
              {`₹${product.price.toLocaleString('en-IN')}`}
            </p>
            <div className="product-details-divider" />
            <p className="product-details-description">{product.description}</p>
            <p className="product-details-vendor">
              Sold by <strong>{product.vendor}</strong>
            </p>
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                addToCart(product);
                setIsAdded(true);
              }}
            >
              {isAdded ? 'Added to Cart' : 'Add to Cart'}
              <span aria-hidden="true">{isAdded ? '✓' : '+'}</span>
            </button>
            <Link className="outline-button" to="/shop">
              Continue Shopping <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
