import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Header } from '../../components/Header';
import { ProductsGrid } from './ProductsGrid';
import './HomePage.css';
import { readWishlist, writeWishlist } from '../../utils/wishlist';

export function HomePage({ cart, loadCart }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [wishlistIds, setWishlistIds] = useState([]);
  const location = useLocation();

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return (params.get('search') || '').trim().toLowerCase();
  }, [location.search]);

  useEffect(() => {
    const getHomeData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        setErrorMessage('We could not load products right now. Please refresh and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    getHomeData();
  }, []);

  useEffect(() => {
    const syncWishlist = () => setWishlistIds(readWishlist());

    syncWishlist();

    window.addEventListener('storage', syncWishlist);
    window.addEventListener('wishlist-change', syncWishlist);

    return () => {
      window.removeEventListener('storage', syncWishlist);
      window.removeEventListener('wishlist-change', syncWishlist);
    };
  }, []);

  const toggleWishlist = (productId) => {
    const nextWishlist = wishlistIds.includes(productId)
      ? wishlistIds.filter((savedProductId) => savedProductId !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(nextWishlist);
    writeWishlist(nextWishlist);
  };

  const displayedProducts = useMemo(() => {
    if (!searchQuery) {
      return products;
    }

    return products.filter((product) => product.name.toLowerCase().includes(searchQuery));
  }, [products, searchQuery]);

  return (
    <>
      <title>Northstar Market</title>

      <Header cart={cart} />

      <main className="home-page">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Northstar market</p>
            <h1>Clean, modern products for everyday shopping.</h1>
            <p className="hero-description">
              Browse the full catalog directly from the backend with instant search across product names.
            </p>
            <div className="hero-actions">
              <Link className="button-primary hero-button" to="/checkout">Shop cart</Link>
              <Link className="button-secondary hero-button-secondary" to="/wishlist">Wishlist</Link>
            </div>
          </div>
        </section>

        <section className="products-section">
          {isLoading && (
            <div className="products-grid products-grid--skeleton">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="product-card--skeleton">
                  <div className="skeleton-image" />
                  <div className="skeleton-line skeleton-line--wide" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line--short" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="empty-state empty-state--error">
              <h2>Could not load products</h2>
              <p>{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && products.length === 0 && (
            <div className="empty-state">
              <h2>No products available</h2>
              <p>There are no products in the catalog yet.</p>
            </div>
          )}

          {!isLoading && !errorMessage && products.length > 0 && displayedProducts.length === 0 && searchQuery && (
            <div className="empty-state">
              <h2>No products found</h2>
              <p>Try a different search term or clear the search box to see everything.</p>
            </div>
          )}

          {!isLoading && !errorMessage && displayedProducts.length > 0 && (
            <ProductsGrid
              products={displayedProducts}
              loadCart={loadCart}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
            />
          )}
        </section>
      </main>
    </>
  );
}