/**
 * Validation utilities
 *
 * Used by registration and login screens.
 * Password rules from design-system.md / screen-specs.md Screen 20.
 */

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate email format (RFC 5322 simplified).
 * Max length: 254 characters.
 */
export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

// ---------------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------------

export interface PasswordRuleChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
}

export interface PasswordValidation {
  /** 0 = no rules met, 4 = all 4 character rules met */
  strength: 0 | 1 | 2 | 3 | 4;
  /** Individual rule checks */
  rules: PasswordRuleChecks;
  /** True when password meets all requirements (>= 8 chars + 4 rules) */
  isValid: boolean;
}

/**
 * Validate password strength.
 *
 * Rules (from Screen 20 dev handoff):
 *   - Min 8 characters (max 64)
 *   - 1 uppercase letter [A-Z]
 *   - 1 lowercase letter [a-z]
 *   - 1 digit [0-9]
 *   - 1 special character [!@#$%^&*]
 *
 * Returns a strength score 0-4 based on how many of the 4 character
 * rules are met. isValid is true only when all rules + min length pass.
 */
export function validatePassword(password: string): PasswordValidation {
  const rules: PasswordRuleChecks = {
    minLength: password.length >= 8 && password.length <= 64,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  };

  // Strength counts only the 4 character-class rules
  const charRules = [
    rules.hasUppercase,
    rules.hasLowercase,
    rules.hasDigit,
    rules.hasSpecial,
  ];
  const strength = charRules.filter(Boolean).length as 0 | 1 | 2 | 3 | 4;

  return {
    strength,
    rules,
    isValid: rules.minLength && strength === 4,
  };
}

// ---------------------------------------------------------------------------
// Age
// ---------------------------------------------------------------------------

/**
 * Calculate age in full years from a date-of-birth string (YYYY-MM-DD).
 */
export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

export type AgeGate = 'adult' | 'learn_mode' | 'parental' | 'blocked';

/**
 * Determine the age-gate category for registration.
 *
 * From Screen 20 (FR-AGE-01):
 *   18+   : adult — full access
 *   16-17 : learn_mode — LEARN_MODE (paper trading only)
 *   13-15 : parental — requires parental consent (deferred to V3)
 *   <13   : blocked — registration not allowed
 */
export function getAgeGate(dob: string): AgeGate {
  const age = calculateAge(dob);

  if (age >= 18) return 'adult';
  if (age >= 16) return 'learn_mode';
  if (age >= 13) return 'parental';
  return 'blocked';
}
