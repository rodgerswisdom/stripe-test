require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent with Stripe
 * @param {number} amount - The amount to be charged (in the original currency)
 * @param {string} currency - The currency for the payment (e.g., 'usd')
 * @returns {Promise<Object>} - The created payment intent object
 * @throws {Error} - Throws an error if the amount is invalid or if the payment intent creation fails
 */
const createPaymentIntent = async (amount, currency) => {
    try {
        const paymentAmount = parseInt(amount * 100, 10);
        if (isNaN(paymentAmount)) {
            throw new Error("Invalid amount: amount must be a number.");
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: paymentAmount,
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        return paymentIntent;
    } catch (error) {
        console.error("Error creating payment intent:", error);
        throw error;
    }
};

module.exports = { createPaymentIntent };
