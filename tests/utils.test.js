const { sum, reverseString, isPalindrome } = require('./helpers');

describe('utils: sum', () => {
  test('soma dois números positivos', () => {
    expect(sum(2, 3)).toBe(5);
  });

  test('soma com zero', () => {
    expect(sum(0, 7)).toBe(7);
  });

  test('soma com negativos', () => {
    expect(sum(-5, 3)).toBe(-2);
  });
});

describe('utils: reverseString', () => {
  test('inverte uma string simples', () => {
    expect(reverseString('abc')).toBe('cba');
  });

  test('string vazia permanece vazia', () => {
    expect(reverseString('')).toBe('');
  });
});

describe('utils: isPalindrome', () => {
  test('detecta palíndromo', () => {
    expect(isPalindrome('arara')).toBe(true);
  });

  test('detecta não palíndromo', () => {
    expect(isPalindrome('node')).toBe(false);
  });

  test('ignora case e espaços', () => {
    expect(isPalindrome('A base do Teto desaba')).toBe(true);
  });
});
