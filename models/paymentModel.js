const { Sequelize, Model, DataTypes } = require('sequelize');

/**
 * Initialize Sequelize with SQLite
 * @type {Sequelize}
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

/**
 * Define the StripePayments model
 * @extends Model
 */
class StripePayment extends Model {}

/**
 * @typedef {Object} StripePaymentAttributes
 * @property {string} payment_intent_id - Unique identifier for the payment intent
 * @property {string} currency - Currency for the payment
 * @property {number} amount - Amount for the payment in smallest currency unit (e.g., cents)
 */

/**
 * Initialize StripePayment model with attributes and options
 */
StripePayment.init(
  {
    payment_intent_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'StripePayment', // Table name will be `StripePayments`
    tableName: 'stripe_payments', // Explicit table name
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Sync models with the database
 * @returns {Promise<void>} - A promise that resolves when the sync is complete
 */
const syncDatabase = async () => {
  await sequelize.sync();
};

syncDatabase();

module.exports = StripePayment;
