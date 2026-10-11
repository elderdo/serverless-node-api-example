const Stripe = require('stripe');

// STRIPE SERVICE (not used by any route yet)
// Wraps the Stripe SDK so routes can call chargeCustomer() later.
// The key is read only from the environment (see docs/configuration.md).
// A hardcoded sk_live_ fallback was removed because GitHub push protection
// blocked it and it was purged from git history.
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to your .env file.');
}
const stripe = new Stripe(stripeKey);

module.exports = {
    stripe,
    // amount is in the smallest currency unit (cents), so 500 = $5.00.
    chargeCustomer: async (customerId, amount) => {
        return stripe.charges.create({
            amount,
            currency: 'usd',
            customer: customerId
        });
    }
};
