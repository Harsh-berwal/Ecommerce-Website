import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { formatMoney } from '../../utils/money';

const quantityOptions = [1, 2, 3, 4, 5];

export function Product({
  product,
  loadCart,
  isWishlisted = false,
  onToggleWishlist = () => {},
  onProductViewed = () => {},
  cardMode = 'catalog'
}) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const ratingLabel = `${product.rating.stars.toFixed(1)} stars`;
  const primaryBadge = product.rating.stars >= 4.6 || product.rating.count >= 120
    ? 'Best seller'
    : product.priceCents < 1500
      ? 'Limited offer'
      : 'New arrival';
  const discountLabel = product.priceCents < 1500 ? '10% off' : product.rating.stars >= 4.6 ? '15% off' : 'Hot pick';
  const productTags = product.keywords.slice(0, 3);
  const actionLabel = cardMode === 'wishlist' ? 'Move to cart' : 'Add to cart';

  const addToCart = async () => {
    try {
      setIsAddingToCart(true);

      await axios.post('/api/cart-items', {
        productId: product.id,
        quantity
      });
      await loadCart();
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Unable to add the product to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const selectQuantity = (event) => {
    const quantitySelected = Number(event.target.value);

    if (Number.isInteger(quantitySelected) && quantitySelected > 0) {
      setQuantity(quantitySelected);
    }
  };

  return (
    <article className="product-container"
      data-testid="product-container"
      onClick={() => onProductViewed(product.id)}>
      <div className="product-top-row">
        <span className="product-badge">{primaryBadge}</span>
        <span className="discount-badge">{discountLabel}</span>
      </div>

      <div className="product-image-container">
        <img className="product-image"
          data-testid="product-image"
          src={product.image}
          alt={product.name} />
      </div>

      <div className="product-name limit-text-to-2-lines">
        {product.name}
      </div>

      <div className="product-rating-container">
        <img className="product-rating-stars"
          data-testid="product-rating-stars-image"
          src={`images/ratings/rating-${product.rating.stars * 10}.png`} />
        <div className="product-rating-count link-primary">
          {product.rating.count}
        </div>
      </div>

      <div className="product-meta-row">
        <span className="product-rating-label">{ratingLabel}</span>
        <span className="product-stock">In stock</span>
      </div>

      <div className="product-tags">
        {productTags.map((tag) => (
          <span key={tag} className="product-tag">{tag}</span>
        ))}
      </div>

      <div className="product-price">
        {formatMoney(product.priceCents)}
      </div>

      <div className="product-action-stack">
        <div className="product-quantity-container">
          <label className="quantity-field">
            <span>Qty</span>
            <select value={quantity} onChange={selectQuantity}>
              {quantityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="product-actions">
          <button
            type="button"
            className={`wishlist-button ${isWishlisted ? 'wishlist-button--active' : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
              onToggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWishlisted}
          >
            <span className="wishlist-icon">{isWishlisted ? '♥' : '♡'}</span>
            <span>{isWishlisted ? 'Saved' : 'Save'}</span>
          </button>

          {cardMode === 'wishlist' && (
            <button
              type="button"
              className="wishlist-remove-button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleWishlist(product.id);
              }}
            >
              Remove
            </button>
          )}
        </div>

        <button className="add-to-cart-button button-primary"
          data-testid="add-to-cart-button"
          onClick={(event) => {
            event.stopPropagation();
            addToCart();
          }}
          disabled={isAddingToCart}>
          {isAddingToCart ? 'Adding...' : actionLabel}
        </button>
      </div>
    </article>
  );
}