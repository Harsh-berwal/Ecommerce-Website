import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Header } from '../../components/Header';
import './TrackingPage.css';

export function TrackingPage({ cart }) {
  const [searchParams] = useSearchParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const productId = searchParams.get('productId');

  useEffect(() => {
    const loadTrackingData = async () => {
      setLoading(true);

      try {
        let order;

        if (orderId) {
          const response = await axios.get(`/api/orders/${orderId}?expand=products`);
          order = response.data;
        } else {
          const response = await axios.get('/api/orders?expand=products');
          order = response.data?.[0];
        }

        if (!order || !order.products || order.products.length === 0) {
          setTrackingData(null);
          return;
        }

        const selectedProduct = productId
          ? order.products.find((item) => item.productId === productId)
          : order.products[0];

        const orderProduct = selectedProduct || order.products[0];

        setTrackingData({ order, orderProduct });
      } catch {
        setTrackingData(null);
      } finally {
        setLoading(false);
      }
    };

    loadTrackingData();
  }, [orderId, productId]);

  const progress = useMemo(() => {
    if (!trackingData) {
      return { percent: 0, daysPassed: 0, totalDays: 1 };
    }

    const { order, orderProduct } = trackingData;
    const startMs = Number(order.orderTimeMs);
    const endMs = Number(orderProduct.estimatedDeliveryTimeMs);
    const nowMs = Date.now();

    const durationMs = Math.max(1, endMs - startMs);
    const elapsedMs = Math.min(Math.max(0, nowMs - startMs), durationMs);

    const totalDays = Math.max(1, dayjs(endMs).diff(dayjs(startMs), 'day'));
    const daysPassed = Math.min(totalDays, Math.max(0, dayjs(nowMs).diff(dayjs(startMs), 'day')));

    return {
      percent: Math.round((elapsedMs / durationMs) * 100),
      daysPassed,
      totalDays
    };
  }, [trackingData]);

  return (
    <>
      <title>Tracking</title>

      <Header cart={cart} />

      <div className="tracking-page">
        <div className="tracking-card">
          <h1>Track Package</h1>

          {loading && <p>Loading tracking details...</p>}

          {!loading && !trackingData && (
            <>
              <p>No tracking details found yet.</p>
              <p className="tracking-note">Place an order first, then use Track package from the Orders page.</p>
            </>
          )}

          {!loading && trackingData && (
            <>
              <div className="tracking-product-card">
                <img
                  className="tracking-product-image"
                  src={trackingData.orderProduct.product.image}
                  alt={trackingData.orderProduct.product.name}
                />

                <div className="tracking-product-details">
                  <div className="tracking-product-name">{trackingData.orderProduct.product.name}</div>
                  <div>Quantity: {trackingData.orderProduct.quantity}</div>
                  <div>Ordered: {dayjs(trackingData.order.orderTimeMs).format('MMMM D, YYYY')}</div>
                  <div>Estimated delivery: {dayjs(trackingData.orderProduct.estimatedDeliveryTimeMs).format('MMMM D, YYYY')}</div>
                </div>
              </div>

              <div className="tracking-progress-section">
                <div className="tracking-progress-label">
                  Progress: Day {progress.daysPassed} of {progress.totalDays}
                </div>

                <div className="tracking-progress-track">
                  <div
                    className="tracking-progress-fill"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>

                <div className="tracking-progress-meta">
                  <span>Order placed</span>
                  <span>{progress.percent}% complete</span>
                  <span>Estimated arrival</span>
                </div>
              </div>

              <Link className="tracking-back-link" to="/orders">Back to Orders</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
