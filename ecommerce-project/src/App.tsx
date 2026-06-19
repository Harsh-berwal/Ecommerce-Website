import axios from "./api";
import { Routes, Route } from 'react-router';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { HomePage } from './pages/home/HomePage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { TrackingPage } from './pages/tracking/TrackingPage';
import { WishlistPage } from './pages/wishlist/WishlistPage';
import './App.css'

function App() {
  const [cart, setCart] = useState([]);

  const loadCart = async () => {
    const response = await axios.get('/api/cart-items?expand=product');
    setCart(response.data);
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2200,
          style: {
            borderRadius: '14px',
            background: '#0f172a',
            color: '#fff'
          }
        }}
      />

      <Routes>
        <Route index element={<HomePage cart={cart} loadCart={loadCart} />} />
        <Route path="checkout" element={<CheckoutPage cart={cart} loadCart={loadCart} />} />
        <Route path="orders" element={<OrdersPage cart={cart} loadCart={loadCart} />} />
        <Route path="tracking" element={<TrackingPage cart={cart} />} />
        <Route path="wishlist" element={<WishlistPage cart={cart} loadCart={loadCart} />} />
      </Routes>
    </>
  )
}

export default App
