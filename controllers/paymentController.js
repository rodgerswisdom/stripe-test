const Model = require('../models/paymentModel');
const stripeService = require('../services/stripeService');
const customerService = require('../services/customerService');

/**
 * Class representing the Payment Controller
 */
class PaymentController {
  /**
   * Method to handle posting a payment
   * @param {Object} req - The request object
   * @param {Object} req.body - The request body containing payment details
   * @param {number} req.body.amount - The amount to be paid
   * @param {string} req.body.currency - The currency for the payment
   * @param {string} req.body.user_id - The user making the payment
   * @param {Object} res - The response object
   * @returns {Promise<void>} - Sends a response to the client
   */
  static async postPayment(req, res) {
    
    const { user_id, amount, currency } = req.body;
    console.log('Request body:', req.body);

    if (!user_id || !amount || !currency) {
      return res.status(400).json({
        message: 'Invalid request. Please provide user_id, amount, and currency.',
      });
    }

    try {
      const { stripe_customer, ephemeralKey } = await customerService.createStripeCustomer(user_id);
      if (!stripe_customer) {
        return res.status(500).json({
          message: 'Failed to create or retrieve Stripe customer.',
        });
      }

      const paymentIntent = await stripeService.createPaymentIntent(amount, currency, stripe_customer.id);

      await Model.create({
        user: user_id,
        amount,
        currency,
        payment_intent: paymentIntent.id,
        stripe_customer: stripe_customer.id,
      });

      res.status(200).json({
        message: 'Payment successful',
        user_id: user_id,
        stripe_customer: stripe_customer.id,
        amount: amount,
        paymentIntent: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        publishableKey: 'pk_test_51PZEUqKPaNhA3HGzI7QUUGrsUlALsLx1riJBk8RN0hajKV3oSYR4onsK0f1WV4TDWXKdE7mvPUT1YHpVdK0IUcqM00fSCtUngp',
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({
        message: 'Payment failed',
        error: error.message || 'Internal server error',
      });
    }
  }
}

module.exports = PaymentController;
