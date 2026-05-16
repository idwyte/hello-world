jest.mock(
  'expo-constants',
  () => ({ __esModule: true, default: { expoConfig: { extra: {} } } }),
  { virtual: true },
);

jest.mock(
  'react-native-purchases',
  () => ({
    __esModule: true,
    default: {
      configure: jest.fn(),
      setLogLevel: jest.fn(),
      logIn: jest.fn(),
      logOut: jest.fn(),
      getCustomerInfo: jest.fn(),
      restorePurchases: jest.fn(),
      addCustomerInfoUpdateListener: jest.fn(),
      removeCustomerInfoUpdateListener: jest.fn(),
    },
    LOG_LEVEL: { WARN: 'WARN', INFO: 'INFO', DEBUG: 'DEBUG' },
  }),
  { virtual: true },
);

jest.mock(
  'react-native',
  () => ({ Platform: { OS: 'ios' } }),
  { virtual: true },
);

import { entitlementFrom, ENTITLEMENT_ID } from '@/lib/revenuecat';
import type { CustomerInfo } from 'react-native-purchases';

function activeEntitlement(overrides: Partial<{
  periodType: string;
  willRenew: boolean;
  expirationDate: string | null;
}> = {}) {
  return {
    [ENTITLEMENT_ID]: {
      identifier: ENTITLEMENT_ID,
      periodType: overrides.periodType ?? 'NORMAL',
      willRenew: overrides.willRenew ?? true,
      expirationDate: overrides.expirationDate ?? '2030-01-01T00:00:00Z',
      isActive: true,
      latestPurchaseDate: '2024-01-01T00:00:00Z',
      originalPurchaseDate: '2024-01-01T00:00:00Z',
      productIdentifier: 'hone_yearly',
      isSandbox: true,
      unsubscribeDetectedAt: null,
      billingIssueDetectedAt: null,
      store: 'APP_STORE',
    },
  };
}

function customerInfo(active: object): CustomerInfo {
  return { entitlements: { active } } as unknown as CustomerInfo;
}

describe('entitlementFrom', () => {
  it('null info → not pro', () => {
    expect(entitlementFrom(null)).toEqual({
      isPro: false,
      isInTrial: false,
      expiresAt: null,
      willRenew: false,
    });
  });

  it('missing entitlement → not pro', () => {
    expect(entitlementFrom(customerInfo({}))).toMatchObject({ isPro: false });
  });

  it('active normal entitlement → isPro:true, isInTrial:false', () => {
    const e = entitlementFrom(customerInfo(activeEntitlement()));
    expect(e.isPro).toBe(true);
    expect(e.isInTrial).toBe(false);
    expect(e.willRenew).toBe(true);
    expect(e.expiresAt?.toISOString().startsWith('2030-')).toBe(true);
  });

  it('active TRIAL entitlement → isInTrial:true', () => {
    const e = entitlementFrom(
      customerInfo(activeEntitlement({ periodType: 'TRIAL' })),
    );
    expect(e.isPro).toBe(true);
    expect(e.isInTrial).toBe(true);
  });

  it('willRenew:false propagates (user has cancelled)', () => {
    const e = entitlementFrom(
      customerInfo(activeEntitlement({ willRenew: false })),
    );
    expect(e.willRenew).toBe(false);
  });
});
