require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const StripePayment = require('../models/paymentModel');

const createStripeCustomer = async (userId) => {
    let stripe_customer;

    try {
        /**
         *
         * Find existing customer in the database for the provided user
         *
         */
        const customerRecord = await StripePayment.findOne({ user: userId });

        if (customerRecord && customerRecord.stripe_customer) {
            try {
                // Retrieve existing Stripe customer
                stripe_customer = await stripe.customers.retrieve(customerRecord.stripe_customer);
            } catch (error) {
                console.error('Error retrieving customer from Stripe:', error);
                return null;
            }
        } else {
            // Create a new Stripe customer
            stripe_customer = await stripe.customers.create();

            // Save the new customer to the database
            const newCustomer = new StripePayment({
                user: userId,
                stripe_customer: stripe_customer.id,
                payment_intent: null, // Can be updated later during payment
                amount: 0, // Can be updated later during payment
                currency: 'usd', // Default or placeholder currency
            });

            await newCustomer.save();
        }

        // Create an ephemeral key for the customer
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: stripe_customer.id },
            { apiVersion: '2024-06-20' }
        );
        console.log({ stripe_customer, ephemeralKey });
        return { stripe_customer, ephemeralKey };
    } catch (error) {
        console.error('Error creating Stripe customer or ephemeral key:', error);
        return null;
    }
};

module.exports =  { createStripeCustomer };

