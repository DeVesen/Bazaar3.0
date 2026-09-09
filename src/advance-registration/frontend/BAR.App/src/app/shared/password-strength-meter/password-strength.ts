export type PasswordStrength = 'weak' | 'medium' | 'strong';

function characterTypeCount(password: string): number {
  return [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length;
}

function specialCharCount(password: string): number {
  return (password.match(/[^A-Za-z0-9]/g) ?? []).length;
}

// Epic_Login Abschnitt 6: schwach < 8 Zeichen oder 1 Typ; mittel >= 8 Zeichen
// + 2 Typen; stark >= 10 Zeichen + alle 4 Typen + mind. 2 Sonderzeichen.
export function computePasswordStrength(password: string): PasswordStrength {
  const types = characterTypeCount(password);

  if (password.length >= 10 && types === 4 && specialCharCount(password) >= 2) {
    return 'strong';
  }

  if (password.length >= 8 && types >= 2) {
    return 'medium';
  }

  return 'weak';
}
