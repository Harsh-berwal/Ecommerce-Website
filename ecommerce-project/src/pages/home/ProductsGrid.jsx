import { Product } from './Product';

export function ProductsGrid({
  products,
  loadCart,
  wishlistIds = [],
  onToggleWishlist = () => {},
  onProductViewed = () => {},
  cardMode = 'catalog'
}) {
  return (
    <div className="products-grid">
      {products.map((product) => {
        return (
          <Product
            key={product.id}
            product={product}
            loadCart={loadCart}
            isWishlisted={wishlistIds.includes(product.id)}
            onToggleWishlist={onToggleWishlist}
            onProductViewed={onProductViewed}
            cardMode={cardMode}
          />
        );
      })}
    </div>
  );
}