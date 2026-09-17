import { decodeJwt } from './jwt-decoder';

function fakeToken(payload: unknown): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('decodeJwt', () => {
  it('decodes a valid token into a DecodedToken', () => {
    const token = fakeToken({
      sub: 'user-1',
      name: 'Max Mustermann',
      role: 'admin',
      mustChangePassword: false,
      exp: 9999999999,
    });
    expect(decodeJwt(token)).toEqual({
      sub: 'user-1',
      name: 'Max Mustermann',
      role: 'admin',
      mustChangePassword: false,
      exp: 9999999999,
    });
  });

  it('returns null for a token with only two segments', () => {
    expect(decodeJwt('only.two')).toBeNull();
  });

  it('returns null for a payload missing required fields', () => {
    const token = fakeToken({ sub: 'user-1' });
    expect(decodeJwt(token)).toBeNull();
  });

  it('returns null for a payload with a role outside admin/cashier', () => {
    const token = fakeToken({
      sub: 'user-1',
      name: 'X',
      role: 'seller',
      mustChangePassword: false,
      exp: 9999999999,
    });
    expect(decodeJwt(token)).toBeNull();
  });

  it('returns null for a payload with a wrong-typed field', () => {
    const token = fakeToken({
      sub: 'user-1',
      name: 'X',
      role: 'admin',
      mustChangePassword: 'no',
      exp: 9999999999,
    });
    expect(decodeJwt(token)).toBeNull();
  });

  it('returns null for an unparseable payload', () => {
    expect(decodeJwt('a.!!!not-base64!!!.c')).toBeNull();
  });

  it('does not itself reject an expired token (exp check is AuthService responsibility)', () => {
    const token = fakeToken({
      sub: 'user-1',
      name: 'X',
      role: 'cashier',
      mustChangePassword: false,
      exp: 1,
    });
    expect(decodeJwt(token)).toEqual(
      expect.objectContaining({ sub: 'user-1', exp: 1 }),
    );
  });
});
