import express from 'express';
import fs from 'fs';
import path from 'path';
import productsRouter from './routes/products.js';
import cartItemsRouter from './routes/cartItems.js';
import deliveryOptionsRouter from './routes/deliveryOptions.js';
import paymentSummaryRouter from './routes/paymentSummary.js';
import ordersRouter from './routes/orders.js';
import { sequelize } from './models/index.js';
import { Product } from './models/Product.js';
import { DeliveryOption } from './models/DeliveryOption.js';
import { CartItem } from './models/CartItem.js';
import { Order } from './models/Order.js';

const app = express();
const PORT = process.env.PORT || 3001;

const PRODUCT_IMAGE_DIR = path.join(process.cwd(), 'images', 'products');

function toProductName(filename) {
  return filename
    .replace(/\.jpg$/i, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildSeedProducts(existingImages = new Set()) {
  if (!fs.existsSync(PRODUCT_IMAGE_DIR)) {
    return [];
  }

  const stars = [4, 4.5, 5];
  const imageFiles = fs
    .readdirSync(PRODUCT_IMAGE_DIR)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

  return imageFiles
    .map((file, index) => ({
      image: `/images/products/${file}`,
      name: toProductName(file),
      rating: {
        stars: stars[index % stars.length],
        count: 25 + index * 3
      },
      priceCents: 1499 + index * 200,
      keywords: file.replace(/\.jpg$/i, '').split('-')
    }))
    .filter((product) => !existingImages.has(product.image));
}

app.use(express.json());
app.use('/images', express.static('images'));

app.use('/api/products', productsRouter);
app.use('/api/cart-items', cartItemsRouter);
app.use('/api/delivery-options', deliveryOptionsRouter);
app.use('/api/payment-summary', paymentSummaryRouter);
app.use('/api/orders', ordersRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

async function initializeDatabase() {
  // Importing the models above registers all tables with Sequelize.
  await sequelize.authenticate();
  await sequelize.sync();

  const products = await Product.findAll();
  const productCount = products.length;
  const deliveryOptionCount = await DeliveryOption.count();

  if (deliveryOptionCount === 0) {
    await DeliveryOption.bulkCreate([
      { id: '1', deliveryDays: 7, priceCents: 0 },
      { id: '2', deliveryDays: 3, priceCents: 499 },
      { id: '3', deliveryDays: 1, priceCents: 999 }
    ]);
  }

  // Normalize any old saved products that use relative image paths.
  for (const product of products) {
    if (!product.image.startsWith('/images/')) {
      product.image = product.image.startsWith('images/')
        ? `/${product.image}`
        : `/images/${product.image}`;
      await product.save();
    }
  }

  // Seed additional products from available images when data is missing.
  if (productCount < 12) {
    const existingImages = new Set(products.map((product) => product.image));
    const seedProducts = buildSeedProducts(existingImages);
    if (seedProducts.length > 0) {
      await Product.bulkCreate(seedProducts);
    }
  }

  // Ensure these models are initialized in sqlite even when empty.
  await CartItem.count();
  await Order.count();
}

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize backend:', error);
    process.exit(1);
  });
