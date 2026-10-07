import { describe, expect, it } from 'vitest';
import { phoneSchema } from './phoneSchema';

describe('phoneSchema', () => {
  it.each(['07700 900123', '+44 7700 900123', '(020) 7946 0958', '+1-202-555-0143'])(
    'accepts %s',
    (phone) => {
      // Arrange & Act
      const result = phoneSchema.safeParse(phone);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(phone);
    }
  );

  it.each(['12345', 'phone', '+44 7700 900123 999 999'])('rejects %s', (phone) => {
    // Arrange & Act
    const result = phoneSchema.safeParse(phone);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Enter a valid phone number.');
  });

  it.each(['', '   '])('treats %j as no phone number', (phone) => {
    // Arrange & Act
    const result = phoneSchema.safeParse(phone);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeUndefined();
  });

  it('trims surrounding whitespace', () => {
    // Arrange
    const phone = '  07700 900123 ';

    // Act
    const result = phoneSchema.safeParse(phone);

    // Assert
    expect(result.data).toBe('07700 900123');
  });
});
