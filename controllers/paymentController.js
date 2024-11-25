// const Model = require('../models/paymentModel');
// const stripeService = require('../services/stripeService');

// /**
//  * Class representing the Payment Controller
//  */
// class PaymentController {
//   /**
//    * Method to handle posting a payment
//    * @param {Object} req - The request object
//    * @param {Object} req.body - The request body containing payment details
//    * @param {number} req.body.amount - The amount to be paid
//    * @param {string} req.body.currency - The currency for the payment
//    * @param {Object} res - The response object
//    * @returns {Promise<void>} - Sends a response to the client
//    */
//   static async postPayment(req, res) {
//     const { user_id,amount, currency } = req.body;
//     console.log("Received request body:", req.body);

//     try {
//       const paymentIntent = await stripeService.createPaymentIntent(amount, currency);

//       await Model.create({
//         user: user_id,
//         amount,
//         currency,
//         payment_intent: paymentIntent.id,
//       });

//       res.status(200).json({
//         message: 'Payment successful',
//         paymentIntent,
//       });
//     } catch (error) {
//       res.status(400).json({
//         message: 'Payment failed',
//         error: error.message,
//       });
//     }
//   }
// }

// module.exports = PaymentController;


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

    // Validate input
    if (!user_id || !amount || !currency) {
      return res.status(400).json({
        message: 'Invalid request. Please provide user_id, amount, and currency.',
      });
    }

    try {
      // Step 1: Retrieve or create Stripe customer
      const { stripe_customer } = await customerService.createStripeCustomer(user_id);
      if (!stripe_customer) {
        return res.status(500).json({
          message: 'Failed to create or retrieve Stripe customer.',
        });
      }

      // Step 2: Create a payment intent for the customer
      const paymentIntent = await stripeService.createPaymentIntent(amount, currency, stripe_customer.id);

      // Step 3: Save payment details to the database
      await Model.create({
        user: user_id,
        amount,
        currency,
        payment_intent: paymentIntent.id,
        stripe_customer: stripe_customer.id, // Associating the payment with the customer
      });

      // Step 4: Respond to the client
      res.status(200).json({
        message: 'Payment successful',
        paymentIntent,
        stripe_customer,
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
