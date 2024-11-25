const express = require('express');
const multer = require('multer');
const upload = multer();

const createPaymentIntent = require('../controllers/paymentController.js');

const router = express.Router();


router.post('/create-payment', upload.none(), createPaymentIntent.postPayment);

module.exports = router;
