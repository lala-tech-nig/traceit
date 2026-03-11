/**
 * paystack.js - A reusable helper to trigger Paystack inline payment
 * Dynamically loads the Paystack inline JS popup when called
 */

function loadPaystackScript() {
    return new Promise((resolve) => {
        if (document.getElementById('paystack-script') || window.PaystackPop) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'paystack-script';
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

/**
 * Triggers a Paystack popup payment
 * @param {Object} config
 * @param {string} config.email - User email
 * @param {number} config.amount - Amount in Naira (will be converted to kobo)
 * @param {string} config.description - Payment description
 * @param {string} config.reference - Unique transaction reference
 * @param {function} config.onSuccess - Callback on success: (reference) => void
 * @param {function} config.onClose - Callback when popup closed without payment
 */
export async function payWithPaystack({ email, amount, description, reference, onSuccess, onClose }) {
    const loaded = await loadPaystackScript();
    if (!loaded || !window.PaystackPop) {
        alert('Payment service could not be loaded. Please check your internet connection.');
        return;
    }

    const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        currency: 'NGN',
        ref: reference,
        metadata: {
            custom_fields: [
                {
                    display_name: 'Description',
                    variable_name: 'description',
                    value: description
                }
            ]
        },
        callback: (response) => {
            // response.reference is the paystack reference on success
            onSuccess({ reference: response.reference });
        },
        onClose: () => {
            if (onClose) onClose();
        }
    });

    handler.openIframe();
}
