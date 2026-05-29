import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import './header.css';
import { readWishlist } from '../utils/wishlist';

type HeaderProps = {
  cart: {
    productId: string;
    quantity: number;
    deliveryOptionId: string;
  }[];
};

export function Header({ cart }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchText(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    const syncWishlist = () => {
      setWishlistCount(readWishlist().length);
    };

    syncWishlist();
    window.addEventListener('storage', syncWishlist);
    window.addEventListener('wishlist-change', syncWishlist);

    return () => {
      window.removeEventListener('storage', syncWishlist);
      window.removeEventListener('wishlist-change', syncWishlist);
    };
  }, []);

  useEffect(() => {
    const currentSearch = new URLSearchParams(location.search).get('search') || '';
    const trimmedSearch = searchText.trim();

    const timeoutId = window.setTimeout(() => {
      if (trimmedSearch === currentSearch) {
        return;
      }

      if (!trimmedSearch) {
        navigate('/');
        return;
      }

      navigate(`/?search=${encodeURIComponent(trimmedSearch)}`);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [location.search, navigate, searchText]);

  let totalQuantity = 0;

  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmedSearch = searchText.trim();

    if (!trimmedSearch) {
      navigate('/');
      return;
    }

    navigate(`/?search=${encodeURIComponent(trimmedSearch)}`);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand-link">
          <span className="brand-mark">N</span>
          <span className="brand-copy">
            <span className="brand-name">Northstar</span>
            <span className="brand-tag">market</span>
          </span>
        </Link>

        <form className="middle-section" onSubmit={submitSearch}>
          <input
            className="search-bar"
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            autoComplete="off"
          />

          <button className="search-button" type="submit" aria-label="Search">
            <img className="search-icon" src="images/icons/search-icon.png" />
          </button>
        </form>

        <div className="right-section">
          <Link className="nav-link" to="/wishlist">
            <span>Wishlist</span>
            <span className="nav-pill-count">{wishlistCount}</span>
          </Link>

          <Link className="nav-link" to="/orders">
            <span>Orders</span>
          </Link>

          <Link className="cart-link" to="/checkout">
            <span className="cart-icon-shell">Cart</span>
            <span className="cart-quantity">{totalQuantity}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}