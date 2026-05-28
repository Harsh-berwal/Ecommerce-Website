import { Link, useLocation, useNavigate } from 'react-router';
import { FormEvent, useEffect, useState } from 'react';
import './header.css';

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchText(params.get('search') || '');
  }, [location.search]);

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
    <div className="header">
      <div className="left-section">
        <Link to="/" className="header-link">
          <img className="logo"
            src="/images/logo-white.png" />
          <img className="mobile-logo"
            src="/images/logo-white.png" />
        </Link>
      </div>

      <form className="middle-section" onSubmit={submitSearch}>
        <input
          className="search-bar"
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <button className="search-button" type="submit" aria-label="Search">
          <img className="search-icon" src="images/icons/search-icon.png" />
        </button>
      </form>

      <div className="right-section">
        <Link className="orders-link header-link" to="/orders">

          <span className="orders-text">Orders</span>
        </Link>

        <Link className="cart-link header-link" to="/checkout">
          <img className="cart-icon" src="images/icons/cart-icon.png" />
          <div className="cart-quantity">{totalQuantity}</div>
          <div className="cart-text">Cart</div>
        </Link>
      </div>
    </div>
  );
}