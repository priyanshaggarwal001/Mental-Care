const express    = require('express');
const Razorpay   = require('razorpay');
const crypto     = require('crypto');
const cors       = require('cors');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); 


const razorpay = new Razorpay({
  key_id    : 'rzp_test_YOUR_KEY_ID',      
  key_secret: 'YOUR_KEY_SECRET',           
});


app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount  : amount,          
      currency: currency,
      receipt : receipt || `receipt_${Date.now()}`,
      payment_capture: 1,        
    };

    const order = await razorpay.orders.create(options);
    console.log('Order created:', order.id);
    res.json(order);             

  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});



app.post('/verify-payment', (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

  
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', 'YOUR_KEY_SECRET') 
      .update(body)
      .digest('hex');

    if (expected === razorpay_signature) {
      console.log('✅ Payment verified:', razorpay_payment_id);

    

      res.json({ success: true, payment_id: razorpay_payment_id });
    } else {
      console.warn('❌ Signature mismatch for payment:', razorpay_payment_id);
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }

  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});



app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const webhookSecret   = 'YOUR_WEBHOOK_SECRET'; 
  const receivedSig     = req.headers['x-razorpay-signature'];
  const expectedSig     = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (receivedSig === expectedSig) {
    const event = JSON.parse(req.body);
    console.log('Webhook event:', event.event);

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      console.log('Payment captured:', payment.id, '| Amount:', payment.amount / 100, 'INR');
    }

    res.json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid webhook signature' });
  }
});



app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log('   Open http://localhost:3000 to see the payment page\n');
});
