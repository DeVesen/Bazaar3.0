export interface DecodedToken {
  sub: string;
  role: 'admin' | 'seller';
  exp: number;
}

// JWT-Payloads sind base64url (RFC 7519) und dürfen UTF-8 enthalten:
// atob() allein scheitert an '-'/'_', fehlendem Padding und Umlauten.
function decodeBase64UrlToUtf8(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (base64.length % 4)) % 4;
  const binary = atob(base64 + '='.repeat(paddingLength));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

export function decodeJwt(token: string): DecodedToken | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64UrlToUtf8(parts[1])) as Record<string, unknown>;
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
