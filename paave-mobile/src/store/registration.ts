/**
 * Registration flow store — Zustand
 *
 * Tracks multi-step registration state:
 *   Step 1 — Data consent + DOB + email/password (Screen 20)
 *   Step 2 — Email verification / OTP (Screen 21)
 *   Step 3 — Biometric enrollment prompt (Screen 22)
 */
import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RegistrationStep =
  | 'consent'
  | 'market'
  | 'account'
  | 'verify';

export interface ConsentState {
  tosAccepted: boolean;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
  tosConsentAt?: string;
  privacyConsentAt?: string;
}

export interface RegistrationState {
  /** Current registration step */
  currentStep: RegistrationStep;

  /** Step 1 — consent checkboxes */
  consent: ConsentState;

  /** Step 1 — date of birth (ISO string YYYY-MM-DD) */
  dob: string | null;

  /** Step 1 — account details */
  email: string;
  fullname: string;
  password: string;

  /** Nationality selected during onboarding */
  nationality: string | null;

  /** Market preferences (multi-select) */
  marketPreferences: string[];

  /** Step 2 — OTP identifier returned by send-otp */
  otpId: string | null;

  // Actions
  setStep: (step: RegistrationStep) => void;
  setConsent: (consent: Partial<ConsentState>) => void;
  setDOB: (dob: string) => void;
  setAccountDetails: (details: {
    email: string;
    fullname: string;
    password: string;
  }) => void;
  setNationality: (nationality: string) => void;
  setMarketPreferences: (markets: string[]) => void;
  setOtpId: (otpId: string) => void;
  /** Clear all registration state (after success or cancel) */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialConsent: ConsentState = {
  tosAccepted: false,
  privacyAccepted: false,
  marketingOptIn: false,
};

const initialState = {
  currentStep: 'consent' as RegistrationStep,
  consent: initialConsent,
  dob: null,
  email: '',
  fullname: '',
  password: '',
  nationality: null,
  marketPreferences: [],
  otpId: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setConsent: (partial) =>
    set((state) => ({
      consent: { ...state.consent, ...partial },
    })),

  setDOB: (dob) => set({ dob }),

  setAccountDetails: ({ email, fullname, password }) =>
    set({ email, fullname, password }),

  setNationality: (nationality) => set({ nationality }),

  setMarketPreferences: (markets) => set({ marketPreferences: markets }),

  setOtpId: (otpId) => set({ otpId }),

  reset: () => set(initialState),
}));
