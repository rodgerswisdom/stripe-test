import request from 'supertest';
import sinon from 'sinon';
import { app, server } from '../server.js';
import StripePayment from '../models/paymentModel.js';

describe('POST /api/create-payment', () => {
    let dbCreateStub;

    beforeAll(() => {
        // Stub the create method of StripePayment model to prevent actual database insertion
        dbCreateStub = sinon.stub(StripePayment, 'create').resolves({
            id: 'fake_id',
            amount: 500,
            currency: 'usd',
            payment_intent_id: 'fake_payment_intent_id'
        });
    });

    afterEach(() => {
        // Reset stub after each test to avoid interference between tests
        dbCreateStub.reset();
    });

    afterAll((done) => {
        // Restore original create method and close server after tests
        dbCreateStub.restore();
        server.close(() => {
            done();
        });
    });

    it('should create a payment and save details in the database', async () => {
        // Valid request with correct amount and currency
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: 500, currency: 'usd' });

        // Assert that payment was successful and saved in the database
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Payment successful');
        expect(response.body.paymentIntent).toHaveProperty('id');
        sinon.assert.calledOnce(dbCreateStub); // Verify create method was called once
    });

    it('should fail to create a payment if amount or currency is missing', async () => {
        // Request without amount or currency
        const response = await request(app)
            .post('/api/create-payment')
            .send({});

        // Assert that payment failed due to missing fields
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });

    it('should fail if the amount provided is invalid', async () => {
        // Invalid amount (null)
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: null, currency: 'usd' });

        // Assert that payment failed due to invalid amount
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });

    it('should fail if the currency provided is invalid', async () => {
        // Invalid currency value
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: 500, currency: 'invalid-currency' });

        // Assert that payment failed due to invalid currency
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });

    it('should fail if the amount is negative', async () => {
        // Negative amount
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: -500, currency: 'usd' });

        // Assert that payment failed due to negative amount
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });

    it('should fail if the amount is zero', async () => {
        // Amount set to zero
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: 0, currency: 'usd' });

        // Assert that payment failed due to zero amount
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });

    it('should fail if the amount is excessively large', async () => {
        // Exceedingly large amount
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: 1000000000, currency: 'usd' });

        // Assert that payment failed due to excessively large amount
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });

    it('should handle duplicate payment requests gracefully', async () => {
        // Valid payload for duplicate check
        const payload = { amount: 500, currency: 'usd' };

        // First request to simulate the original payment creation
        await request(app).post('/api/create-payment').send(payload);
        
        // Second identical request to simulate duplicate
        const response = await request(app).post('/api/create-payment').send(payload);

        // Assert that duplicate attempt is detected
        expect(response.status).toBe(409);
        expect(response.body.message).toBe('Duplicate payment attempt detected');
    });

    it('should return 400 if no data is sent', async () => {
        // No request data provided
        const response = await request(app).post('/api/create-payment');

        // Assert that payment failed due to missing data
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });

    it('should ignore extra fields in the request body', async () => {
        // Extra fields added to request payload
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: 500, currency: 'usd', extraField: 'should be ignored' });

        // Assert that extra fields are ignored and payment proceeds successfully
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Payment successful');
        expect(response.body.paymentIntent).toHaveProperty('id');
    });

    it('should fail if the amount is a string instead of a number', async () => {
        // Invalid amount type (string)
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: "five hundred", currency: 'usd' });

        // Assert that payment failed due to invalid amount type
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });

    it('should fail if the currency is an object instead of a string', async () => {
        // Invalid currency type (object)
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: 500, currency: { code: 'usd' } });

        // Assert that payment failed due to invalid currency type
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });

    it('should fail if the amount has more than two decimal places', async () => {
        // Amount with too many decimal places
        const response = await request(app)
            .post('/api/create-payment')
            .send({ amount: 500.123, currency: 'usd' });

        // Assert that payment failed due to excessive decimal places in amount
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Payment failed');
    });
});
