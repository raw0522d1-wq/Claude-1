import { Capacitor } from '@capacitor/core'

/**
 * Billing abstraction.
 *
 * Web: Stripe Payment Links (configured in src/config.ts) — open in a new tab.
 *
 * Native (App Store / Google Play): store policy REQUIRES digital
 * subscriptions to go through In-App Purchase — linking to Stripe from
 * inside the app will get the build rejected. Wire a store-billing SDK here
 * (RevenueCat's `@revenuecat/purchases-capacitor` is the fastest path: it
 * wraps StoreKit + Google Play Billing behind one API and handles receipts,
 * restores and subscription state). See STORE_SUBMISSION.md.
 */

export type PlanId = 'monthly' | 'yearly'

export const isNativeApp = Capacitor.isNativePlatform()

export async function purchaseNative(_plan: PlanId): Promise<boolean> {
  // ---- RevenueCat integration point ----
  // import { Purchases } from '@revenuecat/purchases-capacitor'
  // const offerings = await Purchases.getOfferings()
  // const pkg = offerings.current?.availablePackages.find(...)
  // const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
  // return customerInfo.entitlements.active['premium'] !== undefined
  throw new Error(
    'In-app purchases are not configured yet. Connect a store billing SDK (see STORE_SUBMISSION.md) before submitting.',
  )
}

export async function restoreNative(): Promise<boolean> {
  // const { customerInfo } = await Purchases.restorePurchases()
  // return customerInfo.entitlements.active['premium'] !== undefined
  throw new Error('In-app purchases are not configured yet.')
}
