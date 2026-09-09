import { decodeJwt } from './jwt-decoder';

function fakeToken(payload: unknown): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

// So kodieren echte Ausgeber: base64url ohne Padding, Payload als UTF-8.
function base64UrlToken(payload: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const body = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${body}.fake-signature`;
}

describe('decodeJwt', () => {
  it('decodes a valid token into sub/role/exp', () => {
    const token = fakeToken({ sub: 'user-1', role: 'admin', exp: 9999999999 });
    expect(decodeJwt(token)).toEqual({ sub: 'user-1', role: 'admin', exp: 9999999999 });
  });

  it('decodes a base64url payload with substituted characters and stripped padding', () => {
    const sub = 'demo-admin~??';
    const token = base64UrlToken({ sub, role: 'admin', exp: 9999999999 });
    expect(token.split('.')[1]).toMatch(/[-_]/);
    expect(decodeJwt(token)).toEqual({ sub, role: 'admin', exp: 9999999999 });
  });

  it('decodes a payload whose sub contains umlauts as UTF-8', () => {
    const token = base64UrlToken({ sub: 'jörg-müller', role: 'seller', exp: 9999999999 });
    expect(decodeJwt(token)?.sub).toBe('jörg-müller');
  });

  it('returns null for a token with only two segments', () => {
    expect(decodeJwt('only.two')).toBeNull();
  });

  it('returns null for a payload missing required fields', () => {
    const token = fakeToken({ sub: 'user-1' });
    expect(decodeJwt(token)).toBeNull();
  });

  it('returns null for an unparseable payload', () => {
    expect(decodeJwt('a.!!!not-base64!!!.c')).toBeNull();
  });
});
