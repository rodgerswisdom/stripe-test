const StripePayment = require('../models/paymentModel');
const stripeService = require('../services/stripeService');

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
   * @param {Object} res - The response object
   * @returns {Promise<void>} - Sends a response to the client
   */
  static async postPayment(req, res) {
    const { amount, currency } = req.body;
    console.log("Received request body:", req.body);

    try {
      const paymentIntent = await stripeService.createPaymentIntent(amount, currency);

      await StripePayment.create({
        amount,
        currency,
        payment_intent_id: paymentIntent.id,
      });

      res.status(200).json({
        message: 'Payment successful',
        paymentIntent,
      });
    } catch (error) {
      res.status(400).json({
        message: 'Payment failed',
        error: error.message,
      });
    }
  }
}

module.exports = PaymentController;
