import axios from "../../api";
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { OrderSummary } from './OrderSummary';
import { PaymentSummary } from './PaymentSummary';
import './checkout-header.css';
import './CheckoutPage.css';

export function CheckoutPage({ cart, loadCart }) {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);

  let totalItems = 0;

  cart.forEach((cartItem) => {
    totalItems += cartItem.quantity;
  });

  useEffect(() => {
    const fetchCheckoutData = async () => {
      let response = await axios.get(
        '/api/delivery-options?expand=estimatedDeliveryTime'
      );
      setDeliveryOptions(response.data);

      response = await axios.get('/api/payment-summary');
      setPaymentSummary(response.data);
    };

    fetchCheckoutData();
  }, [cart]);

  const emptyCart = cart.length === 0;

  return (
    <>
      <title>Checkout</title>

      <div className="checkout-header">
        <div className="header-content">
          <div className="checkout-header-left-section">
            <Link to="/" className="checkout-brand-link">
              <span className="checkout-brand-mark">N</span>
              <span className="checkout-brand-copy">
                <span className="checkout-brand-name">Northstar</span>
                <span className="checkout-brand-tag">market</span>
              </span>
            </Link>
          </div>

          <div className="checkout-header-middle-section">
            <div className="checkout-header-copy">
              <span className="checkout-header-title">Checkout</span>
              <span className="checkout-header-subtitle">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
              </span>
            </div>
          </div>

          <div className="checkout-header-right-section">
            <div className="checkout-secure-badge">
              <img src="images/icons/checkout-lock-icon.png" alt="Secure checkout" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        {emptyCart ? (
          <section className="checkout-empty-state">
            <div className="checkout-empty-card">
              <p className="checkout-empty-kicker">Your cart is empty</p>
              <h2>Start with a few premium picks.</h2>
              <p>
                Continue shopping to build your order, save items to your wishlist, or browse the recommended products below.
              </p>
              <Link className="button-primary" to="/">Continue shopping</Link>
            </div>
          </section>
        ) : (
          <>
            <div className="checkout-progress">
              <div className="checkout-progress-step checkout-progress-step--active">Bag</div>
              <div className="checkout-progress-step checkout-progress-step--active">Delivery</div>
              <div className="checkout-progress-step">Payment</div>
            </div>

            <div className="checkout-grid">
              <OrderSummary cart={cart} deliveryOptions={deliveryOptions} loadCart={loadCart} />

              <aside className="checkout-sidebar">
                <PaymentSummary paymentSummary={paymentSummary} loadCart={loadCart} />
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  );
}