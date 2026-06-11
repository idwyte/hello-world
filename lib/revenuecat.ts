import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';

import { env } from './env';

export const ENTITLEMENT_ID = 'pro';

let configured = false;

async function safeIsConfigured(): Promise<boolean> {
  if (configured) return true;
  try {
    // Purchases.isConfigured exists in v8 but is sometimes a method, sometimes
    // a property depending on minor version. Probe both shapes defensively.
    const maybe = (Purchases as unknown as { isConfigured?: unknown }).isConfigured;
    if (typeof maybe === 'function') {
      return Boolean(await (maybe as () => Promise<boolean>)());
    }
    if (typeof maybe === 'boolean') return maybe;
  } catch {
    // ignore
  }
  return false;
}

export function hasRevenueCatConfig(): boolean {
  if (Platform.OS === 'ios') return env.revenuecatIosKey.length > 0;
  if (Platform.OS === 'android') return env.revenuecatAndroidKey.length > 0;
  return false;
}

/**
 * Configure RevenueCat once. Subsequent calls log-in the appUserID without
 * reconfiguring. Safe to call from React effects.
 */
export async function configureRevenueCat(appUserId: string | null): Promise<void> {
  if (!hasRevenueCatConfig()) return;
  const apiKey =
    Platform.OS === 'ios' ? env.revenuecatIosKey : env.revenuecatAndroidKey;
  if (!configured) {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.WARN);
    }
    Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });
    configured = true;
    return;
  }
  if (appUserId) {
    await Purchases.logIn(appUserId);
  } else {
    await Purchases.logOut();
  }
}

export type Entitlement = {
  isPro: boolean;
  isInTrial: boolean;
  expiresAt: Date | null;
  willRenew: boolean;
};

export function entitlementFrom(info: CustomerInfo | null): Entitlement {
  const e = info?.entitlements.active[ENTITLEMENT_ID];
  if (!e) {
    return { isPro: false, isInTrial: false, expiresAt: null, willRenew: false };
  }
  return {
    isPro: true,
    isInTrial: e.periodType === 'TRIAL',
    expiresAt: e.expirationDate ? new Date(e.expirationDate) : null,
    willRenew: e.willRenew,
  };
}

/**
 * Subscribe to RC entitlement state. Returns `{ loading, entitlement }`.
 * When RC isn't configured, defaults to `isPro: false` (no entitlement);
 * any UI gating on this will direct the user to the paywall — which itself
 * gracefully degrades when RC isn't configured.
 */
export function useEntitlement(): {
  loading: boolean;
  entitlement: Entitlement;
} {
  const [entitlement, setEntitlement] = useState<Entitlement>(() =>
    entitlementFrom(null),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRevenueCatConfig()) {
      setLoading(false);
      return;
    }
    let mounted = true;

    // Wait until configure has been called by the root layout. RC v8 throws
    // UninitializedPurchasesError if getCustomerInfo runs before configure.
    (async () => {
      try {
        let attempts = 0;
        // configured flips synchronously inside configureRevenueCat; this
        // backoff handles the rare case where the consumer mounts in the
        // same tick as configure.
        while (attempts < 5 && !(await safeIsConfigured())) {
          await new Promise((r) => setTimeout(r, 50));
          attempts += 1;
        }
        const info = await Purchases.getCustomerInfo();
        if (!mounted) return;
        setEntitlement(entitlementFrom(info));
      } catch {
        if (!mounted) return;
        setEntitlement(entitlementFrom(null));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const listener = (info: CustomerInfo) => {
      setEntitlement(entitlementFrom(info));
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      mounted = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  return { loading, entitlement };
}

export async function restorePurchases(): Promise<Entitlement> {
  if (!hasRevenueCatConfig()) {
    return entitlementFrom(null);
  }
  const info = await Purchases.restorePurchases();
  return entitlementFrom(info);
}
