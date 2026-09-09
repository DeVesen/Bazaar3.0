export interface DecodedToken {
  sub: string;
  role: 'admin' | 'seller';
  exp: number;
}

export function decodeJwt(token: string): DecodedToken | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>;
    if (
      typeof payload['sub'] !== 'string' ||
      (payload['role'] !== 'admin' && payload['role'] !== 'seller') ||
      typeof payload['exp'] !== 'number'
    ) {
      return null;
    }
    return { sub: payload['sub'], role: payload['role'], exp: payload['exp'] };
  } catch {
    return null;
  }
}
