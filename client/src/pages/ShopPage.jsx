import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/home/ProductCard';
import { categories } from '../constants/homeData';
import { fetchProducts } from '../services/productApi';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];

function ShopPage() {
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      setCatalog(await fetchProducts());
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchingProducts = catalog.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.category, product.vendor].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );

      return matchesCategory && matchesSearch;
    });

    return [...matchingProducts].sort((firstProduct, secondProduct) => {
      if (sortBy === 'price-asc') {
        return firstProduct.price - secondProduct.price;
      }

      if (sortBy === 'price-desc') {
        return secondProduct.price - firstProduct.price;
      }

      if (sortBy === 'name') {
        return firstProduct.name.localeCompare(secondProduct.name);
      }

      return catalog.indexOf(firstProduct) - catalog.indexOf(secondProduct);
    });
  }, [catalog, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="shop-page">
      <section className="shop-heading">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Shop</span>
          </div>
          <p className="eyebrow">The MarketHub edit</p>
          <h1>Explore Products</h1>
          <p>
            Find considered pieces from independent sellers, all gathered in
            one place.
          </p>
        </div>
      </section>

      <section className="shop-content section-space">
        <div className="container">
          <div className="shop-toolbar">
            <label className="search-field">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <span className="sr-only">Search products</span>
              <input
                type="search"
                placeholder="Search products, categories or stores"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <label className="sort-field">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort products"
              >
                {sortOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="shop-filters" aria-label="Product categories">
            {['All', ...categories.map((category) => category.name)].map(
              (category) => (
                <button
                  className={`filter-button${
                    selectedCategory === category ? ' filter-button--active' : ''
                  }`}
                  type="button"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ),
            )}
          </div>

          {!isLoading && !errorMessage && (
            <div className="shop-results-heading">
              <p>
                Showing <strong>{filteredProducts.length}</strong> of{' '}
                <strong>{catalog.length}</strong> products
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="shop-status" role="status">
              <span className="loading-spinner" aria-hidden="true" />
              <p>Loading products...</p>
            </div>
          ) : errorMessage ? (
            <div className="shop-status shop-status--error" role="alert">
              <h2>We could not load the products</h2>
              <p>{errorMessage}</p>
              <button className="outline-button" type="button" onClick={loadProducts}>
                Retry
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="shop-product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showDetails />
              ))}
            </div>
          ) : (
            <div className="empty-products">
              <span className="empty-products-icon" aria-hidden="true">⌕</span>
              <h2>No products found</h2>
              <p>Try a different search term or clear your category filter.</p>
              <button
                className="outline-button"
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ShopPage;
