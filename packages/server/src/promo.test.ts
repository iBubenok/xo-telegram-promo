import { generatePromoCode } from './promo';

describe('generatePromoCode', () => {
  it('возвращает строку из 5 цифр', () => {
    for (let i = 0; i < 20; i += 1) {
      const code = generatePromoCode();
      expect(code).toMatch(/^\d{5}$/);
    }
  });

  it('может содержать ведущие нули', () => {
    let foundLeadingZero = false;

    for (let i = 0; i < 100; i += 1) {
      const code = generatePromoCode();
      if (code.startsWith('0')) {
        foundLeadingZero = true;
        break;
      }
    }

    expect(foundLeadingZero).toBe(true);
  });
});
