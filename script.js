// Initialize Stripe with test publishable key
const stripe = Stripe('pk_test_51L1Fn6GlGJzWWZjtLSUOrxi8dWQg6y0P9IVyQYPcMZGzrzWtFEjR6FbnUYp8dSUD6cFMHv4iyetKECGOzG9IMOFI00iCyXqq1t');

// Create payment request for Apple Pay
const paymentRequest = stripe.paymentRequest({
    country: 'US',
    currency: 'CNY',
    total: {
        label: 'Sample Product',
        amount: 1, // $19.99 in cents
    },
    requestPayerName: true,
    requestPayerEmail: true,
});

// Check if device supports Apple Pay
async function checkApplePaySupport() {
    const result = await paymentRequest.canMakePayment();
    if (!result || !result.applePay) {
        document.getElementById('payment-status').textContent = 'This demo requires Apple Pay. Please use a device with Apple Pay enabled.';
        document.getElementById('payment-request-button').style.display = 'none';
        return false;
    }
    document.getElementById('payment-status').textContent = 'Apple Pay is ready. Click the button above to start payment.';
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

// Handle successful payment method creation
function handlePaymentMethodCreated(paymentMethodId) {
    const statusElement = document.getElementById('payment-status');
    statusElement.textContent = `Payment Method ID created: ${paymentMethodId}`;
    statusElement.className = 'payment-status success';
    console.log('Payment Method ID:', paymentMethodId);
}

// Handle payment error
function handlePaymentError(error) {
    const statusElement = document.getElementById('payment-status');
    statusElement.textContent = `Error: ${error.message}`;
    statusElement.className = 'payment-status error';
    console.error('Payment error:', error);
}

// Handle payment request events
paymentRequest.on('paymentmethod', async (event) => {
    try {
        // Ensure it's Apple Pay
        if (event.paymentMethod.type !== 'card' || !event.paymentMethod.card.wallet?.type !== 'apple_pay') {
            throw new Error('Only Apple Pay is accepted');
        }

        // Get the payment method ID
        const paymentMethodId = event.paymentMethod.id;
        
        // Successfully created payment method
        handlePaymentMethodCreated(paymentMethodId);
        event.complete('success');
        
        // You would typically send this paymentMethodId to your server
        // server.processPayment(paymentMethodId);
        
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