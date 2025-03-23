import { describe, it, expect } from 'vitest';

describe('Tests simples', () => {
  it('1 + 1 devrait être égal à 2', () => {
    expect(1 + 1).toBe(2);
  });

  it('true devrait être vrai', () => {
    expect(true).toBe(true);
  });

  it('false ne devrait pas être vrai', () => {
    expect(false).not.toBe(true);
  });
}); 