import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Header } from '../../components/Header';
import { ProductsGrid } from '../home/ProductsGrid';
import { readWishlist, writeWishlist } from '../../utils/wishlist';
import './WishlistPage.css';

export function WishlistPage({ cart, loadCart }) {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    const syncWishlist = () => {
      setWishlistIds(readWishlist());
    };

    syncWishlist();
    window.addEventListener('storage', syncWishlist);

    return () => {
      window.removeEventListener('storage', syncWishlist);
    };
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    };

    loadProducts();
  }, []);

  const wishlistProducts = useMemo(() => {
    return products.filter((product) => wishlistIds.includes(product.id));
  }, [products, wishlistIds]);

  const toggleWishlist = (productId) => {
    const nextWishlist = wishlistIds.filter((savedProductId) => savedProductId !== productId);
    setWishlistIds(nextWishlist);
    writeWishlist(nextWishlist);
  };

  return (
    <>
      <title>Wishlist | Northstar Market</title>
      <Header cart={cart} />

      <main className="wishlist-page">
        <section className="wishlist-hero">
          <div>
            <p className="wishlist-eyebrow">Saved products</p>
            <h1>Your shortlist</h1>
            <p>
              Keep track of products you want to revisit, compare, and move into checkout whenever you're ready.
            </p>
          </div>
          <Link className="button-secondary" to="/">
            Continue shopping
          </Link>
        </section>

        {wishlistProducts.length === 0 ? (
          <section className="wishlist-empty">
            <h2>No saved items yet</h2>
            <p>Save products from the catalog to build a personal shortlist.</p>
          </section>
        ) : (
          <ProductsGrid
            products={wishlistProducts}
            loadCart={loadCart}
            wishlistIds={wishlistIds}
            onToggleWishlist={toggleWishlist}
            cardMode="wishlist"
          />
        )}
      </main>
    </>
  );
}
