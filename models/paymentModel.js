const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
   user_id:{
	   required: false,
	   type: String
   },
   payment_intent_id:{
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
