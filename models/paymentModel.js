const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
   user:{
	   required: false,
	   type: String
   },
   stripe_customer:{
	   type: String
   },
   payment_intent:{
	   required:true,
           type:String
   },
   amount:{
           required:true,
           type:Number
   },
   currency:{
	   required:'true',
           type:String
   }
});

const StripePayment = mongoose.model('MajiApp_Stripe', dataSchema, 'stripe_payments');
module.exports = StripePayment;
