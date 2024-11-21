require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const Model = require('../models/paymentModel');

const create_stripe_customer = async ()=> {
    const customer = await Model.find(stripe_customer);
    const stripe_customer;
/**
 *NOTE TO ZAK
 * This function tries to create a stripe customer.
 *
 * It first checks if the customer exists in the db i.e is there a stripe customer id innthe db. This would mean the customer is registerd in stripe
 * If there's an id, we retrieve the corresponding from stripe to check if they match. If not march, we throw an error.
 *
 * If no customer on db, we create a new customer and save it on db.
 *
 * We use the customer to creaet a ephemeral key that gives temporary access to android to access the customer.
 *
 * This service has to be called first before the patment intent is created.
 *
 * Reference: https://docs.stripe.com/payments/accept-a-payment?platform=android
 *Flow chart: https://drive.google.com/file/d/1oeTcJaGuGgBjzzARsXxU2jTjrZDnIYc-/view?usp=sharing
 * 
 */
    if(customer){
        try{
           stripe_customer =  await stripe.customers.retrieve(customer_id);
        }
        catch(error){
            console.error('Customer not found', error);
        }
    }
    else{
        stripe_customer = await stripe.customers.create();
    }

   //  const customer = await stripe.customers.create();
    

    const ephemeralKey = await stripe.ephemeralKeys.create(
        {customer: customer.id},
        {apiVersion: '2024-06-20'}
    );

    await Model.create({
        customer : customers.id,
    });
}

module.exports = StripeCustomerService;
