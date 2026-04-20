const LRUCache = require('./lru-cache');

describe('LRUCache', () => {
  test('retorna -1 para chave ausente', () => {
    const cache = new LRUCache(2);
    expect(cache.get('a')).toBe(-1);
  });

  test('armazena e recupera valores', () => {
    const cache = new LRUCache(2);
    cache.put('a', 1);
    cache.put('b', 2);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
  });

  test('evicta o item menos recentemente utilizado', () => {
    const cache = new LRUCache(2);
    cache.put('a', 1);
    cache.put('b', 2);
    cache.get('a');
    cache.put('c', 3);
    expect(cache.get('b')).toBe(-1);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('c')).toBe(3);
  });

  test('atualiza valor existente sem evictar', () => {
    const cache = new LRUCache(2);
    cache.put('a', 1);
    cache.put('a', 10);
    expect(cache.get('a')).toBe(10);
  });
});
