import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { categories } from '../../constants/homeData';
import { fetchProducts } from '../../services/productApi';

const benefits = [
  {
    number: '01',
    title: 'One place, more choice',
    text: 'Discover thoughtfully selected products from a growing community of sellers.',
  },
  {
    number: '02',
    title: 'Independent sellers',
    text: 'Shop small and support the makers, creatives, and businesses behind every find.',
  },
  {
    number: '03',
    title: 'Shopping made easy',
    text: 'Browse, compare, and find your next favorite thing without the endless scrolling.',
  },
];

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  useEffect(() => {
    let isCurrentRequest = true;

    fetchProducts()
      .then((products) => {
        if (isCurrentRequest) {
          setFeaturedProducts(products.slice(0, 6));
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setFeaturedProducts([]);
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoadingFeatured(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">A better way to discover</p>
            <h1>Good things, from <em>everywhere.</em></h1>
            <p className="hero-description">
              Shop a world of independent sellers and find products with a
              story, all in one beautifully simple place.
            </p>
            <Link className="primary-button" to="/shop">
              Explore Products <span aria-hidden="true">→</span>
            </Link>
            <div className="hero-note">
              <span className="hero-note-avatars" aria-hidden="true">
                <span>J</span>
                <span>M</span>
                <span>A</span>
              </span>
              <span>Loved by 12,000+ curious shoppers</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
                alt="A curated selection of products ready for shopping"
              />
            </div>
            <div className="hero-floating-card">
              <span className="floating-card-icon">✦</span>
              <span>
                <strong>Curated for you</strong>
                <small>Fresh finds, daily</small>
              </span>
            </div>
            <span className="hero-sun" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="categories-section section-space">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Start exploring</p>
              <h2>Shop by category</h2>
            </div>
            <Link className="text-link" to="/shop">
              View all <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link className="category-card" to="/shop" key={category.name}>
                <span className="category-icon" aria-hidden="true">
                  {category.icon}
                </span>
                <span>
                  <strong>{category.name}</strong>
                  <small>{category.detail}</small>
                </span>
                <span className="category-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-section section-space">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Handpicked for you</p>
              <h2>Featured finds</h2>
            </div>
            <p className="section-intro">
              A few things we think you&apos;ll love.
            </p>
          </div>
          {isLoadingFeatured ? (
            <div className="home-featured-status" role="status">
              <span className="loading-spinner" aria-hidden="true" />
              <p>Loading featured finds...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="home-featured-status">
              <p>Featured products are temporarily unavailable. Explore the shop to try again.</p>
            </div>
          )}
          <div className="centered-action">
            <Link className="outline-button" to="/shop">
              Explore All Products <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="benefits-section section-space">
        <div className="container">
          <div className="section-heading benefits-heading">
            <div>
              <p className="eyebrow">The MarketHub difference</p>
              <h2>Shopping should feel this good.</h2>
            </div>
          </div>
          <div className="benefits-grid">
            {benefits.map((benefit) => (
              <article className="benefit-card" key={benefit.number}>
                <span className="benefit-number">{benefit.number}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vendor-section section-space">
        <div className="container">
          <div className="vendor-banner">
            <div className="vendor-copy">
              <p className="eyebrow">Your shop, your story</p>
              <h2>Have something special to share?</h2>
              <p>
                Join a community of independent sellers building their
                businesses on MarketHub.
              </p>
              <Link className="light-button" to="/login">
                Start Selling <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="vendor-art" aria-hidden="true">
              <span className="vendor-ring vendor-ring--large" />
              <span className="vendor-ring vendor-ring--small" />
              <span className="vendor-sparkle">✦</span>
              <span className="vendor-label">Make<br />your mark.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
