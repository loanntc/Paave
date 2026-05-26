"use client";

const KEY = "paave:onboarding";

export type Nationality = "VN" | "KR" | "GLOBAL";

export interface OnboardingState {
  nationality?: Nationality;
  name?: string;
}

export function readOnboarding(): OnboardingState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OnboardingState) : {};
  } catch {
    return {};
  }
}

export function writeOnboarding(patch: Partial<OnboardingState>) {
  if (typeof window === "undefined") return;
  const next = { ...readOnboarding(), ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearOnboarding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
