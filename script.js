// Initialize Stripe with test publishable key
const stripe = Stripe('pk_test_51R9M0oCDW4AKvXlFrfe09uOlQk6mNNF33JiinoCWu2XISFZZPv6z3mUcZ8hDmK84EgBzsutEIaMyhdwuVNa6fivK00Q16zB0UN');

// Create payment request for Apple Pay
const paymentRequest = stripe.paymentRequest({
    country: 'US',
    currency: 'usd',
    total: {
        label: 'Sample Product',
        amount: 1999, // $19.99 in cents
    },
    requestPayerName: true,
    requestPayerEmail: true,
});

// Check if device supports Apple Pay
async function checkApplePaySupport() {
    const result = await paymentRequest.canMakePayment();
    if (!result || !result.applePay) {
        document.getElementById('payment-status').textContent = 'Apple Pay is not available on this device';
        document.getElementById('payment-request-button').style.display = 'none';
        return false;
    }
    return true;
}

// Initialize payment request button
async function initialize() {
    const canUseApplePay = await checkApplePaySupport();
    
    if (canUseApplePay) {
        const elements = stripe.elements();
        const prButton = elements.create('paymentRequestButton', {
            paymentRequest: paymentRequest,
            style: {
                paymentRequestButton: {
                    type: 'buy',
                    theme: 'dark'
                }
            }
        });

        prButton.mount('#payment-request-button');
    }
}

// Handle successful payment
function handlePaymentSuccess() {
    const statusElement = document.getElementById('payment-status');
    statusElement.textContent = 'Payment successful! Thank you for your purchase.';
    statusElement.className = 'payment-status success';
}

// Handle payment error
function handlePaymentError(error) {
    const statusElement = document.getElementById('payment-status');
    statusElement.textContent = `Payment failed: ${error.message}`;
    statusElement.className = 'payment-status error';
}

// Handle payment request completion
paymentRequest.on('paymentmethod', async (event) => {
    try {
        // In a real application, you would create a payment intent on your server
        // For demo purposes, we're simulating a successful payment
        handlePaymentSuccess();
        event.complete('success');
    } catch (error) {
        handlePaymentError(error);
        event.complete('fail');
    }
});

// Start the payment flow
initialize().catch(error => {
    console.error('Initialization error:', error);
    handlePaymentError(error);
});