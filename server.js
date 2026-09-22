import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set your Paystack Secret Key here or via environment variables
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder_key';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Helper to read JSON safely
async function readData(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Helper to write JSON safely
async function writeData(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- API ENDPOINTS ---

// GET /api/products - Get all cosmetics products
app.get('/api/products', async (req, res) => {
  const products = await readData(PRODUCTS_FILE);
  res.json({ success: true, products });
});

// GET /api/products/:id - Get single product detail
app.get('/api/products/:id', async (req, res) => {
  const products = await readData(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

// POST /api/orders/checkout - Initialize Paystack Payment & Save Pending Order
app.post('/api/orders/checkout', async (req, res) => {
  try {
    const { customer, items, subtotal, shippingFee, discount, grandTotal } = req.body;

    if (!items || items.length === 0 || !customer || !customer.email) {
      return res.status(400).json({ success: false, message: 'Invalid checkout payload.' });
    }

    const reference = 'GB-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      orderId: reference,
      reference: reference,
      customer,
      items,
      subtotal,
      shippingFee,
      discount,
      grandTotal,
      status: 'Pending Payment',
      createdAt: new Date().toISOString()
    };

    // Save order locally
    const orders = await readData(ORDERS_FILE);
    orders.push(newOrder);
    await writeData(ORDERS_FILE, orders);

    // Call Paystack API endpoint securely from backend
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: customer.email,
        amount: Math.round(grandTotal * 100), // convert NGN to kobo
        reference: reference,
        callback_url: `http://localhost:${PORT}/#track`,
        metadata: {
          customerName: customer.fullName,
          phone: customer.phone,
          address: customer.address,
          state: customer.state
        }
      })
    });

    const paystackData = await paystackRes.json();

    if (paystackData.status) {
      res.json({
        success: true,
        authorization_url: paystackData.data.authorization_url,
        reference: reference
      });
    } else {
      // Fallback for offline/test mode without valid Paystack API key
      res.json({
        success: true,
        authorization_url: null,
        simulated: true,
        reference: reference,
        message: 'Order created in test mode.'
      });
    }

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/orders/verify/:reference - Verify Payment & Update Status
app.get('/api/orders/verify/:reference', async (req, res) => {
  const { reference } = req.params;
  const orders = await readData(ORDERS_FILE);
  const orderIndex = orders.findIndex(o => o.reference === reference);

  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order reference not found' });
  }

  // Update payment status
  orders[orderIndex].status = 'Paid & Processing';
  orders[orderIndex].paidAt = new Date().toISOString();
  await writeData(ORDERS_FILE, orders);

  res.json({ success: true, order: orders[orderIndex] });
});

// GET /api/orders/:id - Track order by ID or Reference
app.get('/api/orders/track/:query', async (req, res) => {
  const { query } = req.params;
  const orders = await readData(ORDERS_FILE);
  const order = orders.find(o => 
    o.orderId.toLowerCase() === query.toLowerCase() || 
    o.customer.email.toLowerCase() === query.toLowerCase() ||
    o.customer.phone === query
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'No matching order found.' });
  }

  res.json({ success: true, order });
});

app.listen(PORT, () => {
  console.log(`✨ GlowBeauty server running at http://localhost:${PORT}`);
});