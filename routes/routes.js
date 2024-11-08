
const express = require('express');
const createPaymentIntent = require('../controllers/paymentController.js');

const router = express.Router();

/**
 * Route to create a payment intent
 * @route POST /create-payment
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - Returns a JSON response with payment details or an error message
 */
router.post('/create-payment', createPaymentIntent.postPayment);

module.exports = router;
