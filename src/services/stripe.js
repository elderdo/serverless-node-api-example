const Stripe = require('stripe');

// The key is read only from the environment (see .env.example). A hardcoded
// sk_live_ fallback was removed because GitHub push protection blocked it and
// it was purged from git history.
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to your .env file.');
}
const stripe = new Stripe(stripeKey);

module.exports = {
    stripe,
    chargeCustomer: async (customerId, amount) => {
        return stripe.charges.create({
            amount,
            currency: 'usd',
            customer: customerId
        });
    }
};
