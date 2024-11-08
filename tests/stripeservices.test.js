import { createPaymentIntent } from '../services/stripeService.js';
import stripe from 'stripe';

// Mock the entire stripe module to isolate and control Stripe's behavior in the tests
jest.mock('stripe', () => {
    const stripeMock = {
        paymentIntents: {
            create: jest.fn(),
        },
    };
    return jest.fn(() => stripeMock);
});

describe('Stripe Service - createPaymentIntent', () => {
    let stripeInstance;
    const validAmount = 100;
    const validCurrency = 'usd';

    // Reset the mock and stripeInstance before each test
    beforeEach(() => {
        stripeInstance = stripe();
        jest.clearAllMocks();
    });

    it('should throw an error if Stripe API fails', async () => {
        // Mock Stripe API to simulate a failure
        stripeInstance.paymentIntents.create.mockRejectedValueOnce(new Error('Stripe API error'));

        await expect(createPaymentIntent(validAmount, validCurrency)).rejects.toThrow("Stripe API error");
    });

    it('should create a payment intent with the correct amount and currency', async () => {
        // Mock successful creation of a payment intent
        stripeInstance.paymentIntents.create.mockResolvedValueOnce({
            id: 'pi_123',
            amount: validAmount * 100,
            currency: validCurrency,
            status: 'requires_payment_method',
        });

        const paymentIntent = await createPaymentIntent(validAmount, validCurrency);

        // Verify the returned payment intent has the expected structure and values
        expect(paymentIntent).toHaveProperty('id');
        expect(paymentIntent.amount).toBe(validAmount * 100);
        expect(paymentIntent.currency).toBe(validCurrency);
        expect(['succeeded', 'requires_payment_method']).toContain(paymentIntent.status);
    });

    it('should throw an error if amount is not a valid number', async () => {
        const invalidAmount = "five hundred"; // Non-numeric input

        // Mock Stripe to throw an error for invalid amount
        stripeInstance.paymentIntents.create.mockImplementationOnce(() => {
            throw new Error("Invalid amount: amount must be a number.");
        });

        await expect(createPaymentIntent(invalidAmount, validCurrency)).rejects.toThrow("Invalid amount: amount must be a number.");
    });

    it('should throw an error if currency is invalid', async () => {
        const invalidCurrency = 'invalid-currency'; // Non-standard currency code

        // Mock Stripe to throw an error for invalid currency
        stripeInstance.paymentIntents.create.mockImplementationOnce(() => {
            throw new Error("Invalid currency: currency must be a valid ISO currency code.");
        });

        await expect(createPaymentIntent(validAmount, invalidCurrency)).rejects.toThrow("Invalid currency: currency must be a valid ISO currency code.");
    });

    it('should throw an error if amount is negative', async () => {
        const negativeAmount = -100; // Negative amount for testing

        // Mock Stripe to throw an error for negative amount
        stripeInstance.paymentIntents.create.mockImplementationOnce(() => {
            throw new Error("Invalid amount: amount must be positive.");
        });

        await expect(createPaymentIntent(negativeAmount, validCurrency)).rejects.toThrow("Invalid amount: amount must be positive.");
    });

    it('should throw an error if amount has more than two decimal places', async () => {
        const preciseAmount = 100.123; // Overly precise amount

        // Mock Stripe to throw an error for too many decimal places
        stripeInstance.paymentIntents.create.mockImplementationOnce(() => {
            throw new Error("Invalid amount: amount must have up to two decimal places.");
        });

        await expect(createPaymentIntent(preciseAmount, validCurrency)).rejects.toThrow("Invalid amount: amount must have up to two decimal places.");
    });

    it('should throw an error if amount is excessively large', async () => {
        const largeAmount = 1000000;

        // Mock Stripe to throw an error for an excessively large amount
        stripeInstance.paymentIntents.create.mockImplementationOnce(() => {
            throw new Error("Invalid amount: amount exceeds allowed limit.");
        });

        await expect(createPaymentIntent(largeAmount, validCurrency)).rejects.toThrow("Invalid amount: amount exceeds allowed limit.");
    });
});
