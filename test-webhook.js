const { query } = require('./src/db/database');
const paymentRoutes = require('./src/modules/payment/payment.routes');
const express = require('express');
const app = express();
app.use(express.json());
app.use('/payment', paymentRoutes);

async function runTest() {
  const request = require('supertest');
  
  // Fake Razorpay Payload
  const payload = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_simulated_123',
          order_id: 'order_simulated_123',
          amount: 499900,
          contact: '9876543210',
          email: 'test@example.com',
          method: 'upi'
        }
      }
    }
  };

  console.log('Sending fake Razorpay Webhook...');
  const res = await request(app)
    .post('/payment/webhook')
    .send(payload);

  console.log('Webhook Response:', res.status, res.body);

  // Check Database
  const clients = await query("SELECT * FROM clients WHERE mobile_no = '9876543210'");
  console.log('Client Created:', clients.length > 0);
  
  if (clients.length > 0) {
    const subs = await query("SELECT * FROM subscriptions WHERE client_id = $1", [clients[0].id]);
    console.log('Subscription Created:', subs.length > 0);
    if (subs.length > 0) {
      console.log('Activation Key Generated:', subs[0].activation_key);
    }
  }

  process.exit(0);
}

runTest().catch(e => { console.error(e); process.exit(1); });
