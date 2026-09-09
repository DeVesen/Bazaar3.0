import { decodeJwt } from './jwt-decoder';

function fakeToken(payload: unknown): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('decodeJwt', () => {
  it('decodes a valid token into sub/role/exp', () => {
    const token = fakeToken({ sub: 'user-1', role: 'admin', exp: 9999999999 });
    expect(decodeJwt(token)).toEqual({ sub: 'user-1', role: 'admin', exp: 9999999999 });
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
