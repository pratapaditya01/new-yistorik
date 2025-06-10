# 🔥 Razorpay Payment Gateway Setup Guide

This guide will help you set up Razorpay payment gateway for your Yistorik e-commerce store.

## 📋 Prerequisites

- Razorpay account (sign up at https://razorpay.com)
- Business documents for KYC verification
- Bank account for settlements

## 🚀 Step 1: Create Razorpay Account

1. **Sign up** at https://razorpay.com
2. **Complete KYC** verification with business documents
3. **Add bank account** for settlements
4. **Get account activated** by Razorpay team

## 🔑 Step 2: Get API Credentials

### Test Mode (Development)
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Generate **Test API Keys**
4. Copy the **Key ID** and **Key Secret**

### Live Mode (Production)
1. Complete business verification
2. Generate **Live API Keys**
3. Copy the **Key ID** and **Key Secret**

## ⚙️ Step 3: Configure Environment Variables

Update your `backend/.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxx
```

### Getting Webhook Secret:
1. Go to **Settings** → **Webhooks**
2. Create new webhook endpoint: `https://your-domain.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`, `order.paid`
4. Copy the **Webhook Secret**

## 🧪 Step 4: Test Integration

Run the test script to verify setup:

```bash
cd backend
node scripts/testRazorpay.js
```

Expected output:
- ✅ Configuration: Valid
- ✅ Currency Conversion: Working
- ✅ Order Creation: Working
- ✅ Order Fetching: Working

## 💳 Step 5: Payment Methods Configuration

### Supported Payment Methods:

#### 🏦 **Cards**
- Visa, Mastercard, RuPay
- American Express, Diners Club
- Credit & Debit Cards

#### 📱 **UPI**
- Google Pay, PhonePe, Paytm
- BHIM, Amazon Pay
- Any UPI app

#### 🏛️ **Net Banking**
- 50+ banks supported
- SBI, HDFC, ICICI, Axis, Kotak
- Real-time bank transfers

#### 💰 **Digital Wallets**
- Paytm, Mobikwik, Freecharge
- Ola Money, JioMoney
- Instant payments

#### 💳 **EMI Options**
- Credit Card EMI (3-24 months)
- Cardless EMI
- Pay Later options

## 🔧 Step 6: Frontend Integration

The frontend is already configured with:
- Razorpay checkout integration
- Payment method selection
- Order success handling
- Error management

## 🎯 Step 7: Webhook Configuration

### Webhook URL:
```
https://your-domain.com/api/payment/webhook
```

### Events to Subscribe:
- `payment.captured` - Payment successful
- `payment.failed` - Payment failed
- `order.paid` - Order fully paid

### Webhook Security:
- Signature verification implemented
- Automatic order status updates
- Secure event handling

## 📊 Step 8: Testing Payments

### Test Card Numbers:
```
# Successful Payment
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

# Failed Payment
Card: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

### Test UPI:
```
UPI ID: success@razorpay
UPI ID: failure@razorpay
```

## 🚀 Step 9: Go Live

### Pre-live Checklist:
- [ ] KYC verification completed
- [ ] Bank account verified
- [ ] Test payments working
- [ ] Webhook endpoints configured
- [ ] SSL certificate installed
- [ ] Live API keys generated

### Switch to Live Mode:
1. Replace test keys with live keys
2. Update webhook URLs
3. Test with small amounts
4. Monitor transactions

## 💰 Step 10: Pricing & Fees

### Razorpay Pricing (India):
- **Cards**: 2% + GST
- **UPI**: 0% (limited time)
- **Net Banking**: 2% + GST
- **Wallets**: 2% + GST
- **International**: 3% + GST

### Settlement:
- **T+2 days** for most payments
- **Instant settlements** available
- **No setup fees**

## 🔒 Security Features

### Built-in Security:
- PCI DSS Level 1 compliant
- 256-bit SSL encryption
- Fraud detection
- Risk scoring
- 3D Secure authentication

### Our Implementation:
- Signature verification
- HTTPS only
- Input validation
- Error handling
- Audit logging

## 📱 Mobile Optimization

### Features:
- Mobile-responsive checkout
- App-based UPI payments
- Touch ID/Face ID support
- One-click payments
- Saved payment methods

## 📈 Analytics & Reporting

### Dashboard Features:
- Real-time transaction monitoring
- Payment analytics
- Success rate tracking
- Settlement reports
- Refund management

## 🆘 Troubleshooting

### Common Issues:

#### Authentication Failed:
- Check API keys are correct
- Ensure keys match environment (test/live)
- Verify account is activated

#### Payment Failed:
- Check test card numbers
- Verify amount limits
- Check network connectivity

#### Webhook Not Working:
- Verify webhook URL is accessible
- Check webhook secret
- Ensure HTTPS is enabled

## 📞 Support

### Razorpay Support:
- Email: support@razorpay.com
- Phone: +91-80-6190-6200
- Documentation: https://razorpay.com/docs

### Integration Support:
- Check logs in browser console
- Review network requests
- Test with different payment methods
- Contact Razorpay technical support

## 🎉 Success!

Once configured, your customers can pay using:
- ✅ All major credit/debit cards
- ✅ UPI (Google Pay, PhonePe, etc.)
- ✅ Net banking (50+ banks)
- ✅ Digital wallets
- ✅ EMI options
- ✅ International cards

Your Yistorik store is now ready to accept payments from Indian customers! 🇮🇳💳✨
