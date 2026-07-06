/**
 * Monetization configuration.
 *
 * To go live: create two Stripe Payment Links (monthly + yearly) in your
 * Stripe dashboard and paste the URLs below. The paywall buttons open these
 * links directly — no backend required to start charging.
 */
export const MONETIZATION = {
  monthlyPrice: '$9.99',
  yearlyPrice: '$59.99',
  yearlySavings: 'Save 50%',
  stripeMonthlyLink: '', // e.g. https://buy.stripe.com/xxxx
  stripeYearlyLink: '', // e.g. https://buy.stripe.com/yyyy
  /** Unlock code you can hand out to founders / promo winners */
  founderCode: 'FORGED',
}

export const APP_NAME = 'FORGE'
export const APP_TAGLINE = 'Build the body you chose.'
