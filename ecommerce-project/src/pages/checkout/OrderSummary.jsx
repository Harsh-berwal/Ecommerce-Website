import axios from "../../api";
import dayjs from 'dayjs';
import { formatMoney } from '../../utils/money';
import { DeliveryOptions } from './DeliveryOptions';
import toast from 'react-hot-toast';

export function OrderSummary({ cart, deliveryOptions, loadCart }) {
  return (
    <div className="order-summary">
      {deliveryOptions.length > 0 && cart.map((cartItem) => {
        const selectedDeliveryOption = deliveryOptions
          .find((deliveryOption) => {
            return deliveryOption.id === cartItem.deliveryOptionId;
          });

        const updateCartItem = async (event) => {
          const quantity = Number(event.target.value);

          if (!Number.isInteger(quantity) || quantity < 1) {
            return;
          }

          await axios.put(`/api/cart-items/${cartItem.productId}`, {
            quantity
          });
          await loadCart();
          toast.success('Cart updated');
        };

        const deleteCartItem = async () => {
          await axios.delete(`/api/cart-items/${cartItem.productId}`);
          await loadCart();
          toast.success('Item removed from cart');
        };

        return (
          <div key={cartItem.productId} className="cart-item-container">
            <div className="delivery-date">
              Delivery date: {dayjs(selectedDeliveryOption.estimatedDeliveryTimeMs).format('dddd, MMMM D')}
            </div>

            <div className="cart-item-details-grid">
              <img className="product-image"
                src={cartItem.product.image} />

              <div className="cart-item-details">
                <div className="product-name">
                  {cartItem.product.name}
                </div>
                <div className="product-price">
                  {formatMoney(cartItem.product.priceCents)}
                </div>
                <div className="product-quantity">
                  <label className="quantity-field quantity-field--compact">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={cartItem.quantity}
                      onChange={updateCartItem}
                    />
                  </label>
                  <button type="button" className="delete-quantity-link link-primary"
                    onClick={deleteCartItem}>
                    Delete
                  </button>
                </div>
              </div>

              <DeliveryOptions cartItem={cartItem} deliveryOptions={deliveryOptions} loadCart={loadCart} />
            </div>
          </div>
        );
      })}
    </div>
  );
}