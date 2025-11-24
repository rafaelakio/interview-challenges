# Cache System - Sistema de Cache Distribuído

## 🎯 Por Que Este Desafio?

Implementar um sistema de cache testa:

1. **Algoritmos**: LRU, LFU, eviction policies
2. **Concorrência**: Thread-safety, locks
3. **Performance**: O(1) operations
4. **Memória**: Gerenciamento eficiente

**Empresas que usam**: Redis, Memcached, Amazon (ElastiCache)

## 📋 Requisitos

### Funcionais
- Get/Set/Delete operations
- TTL (Time To Live)
- Eviction policy (LRU)
- Tamanho máximo
- Estatísticas (hit rate)

### Não-Funcionais
- O(1) para get/set
- Thread-safe
- Baixo uso de memória
- Alta performance

## 💡 Solução: LRU Cache

### Implementação Python

```python
from collections import OrderedDict
from threading import Lock
import time

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity
        self.lock = Lock()
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str):
        with self.lock:
            if key not in self.cache:
                self.misses += 1
                return None
            
            # Move para o fim (mais recente)
            self.cache.move_to_end(key)
            value, expiry = self.cache[key]
            
            # Verifica expiração
            if expiry and time.time() > expiry:
                del self.cache[key]
                self.misses += 1
                return None
            
            self.hits += 1
            return value
    
    def set(self, key: str, value, ttl: int = None):
        with self.lock:
            # Remove se já existe
            if key in self.cache:
                del self.cache[key]
            
            # Remove item mais antigo se cheio
            elif len(self.cache) >= self.capacity:
                self.cache.popitem(last=False)
            
            # Calcula expiração
            expiry = time.time() + ttl if ttl else None
            
            # Adiciona no fim
            self.cache[key] = (value, expiry)
    
    def delete(self, key: str):
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                return True
            return False
    
    def clear(self):
        with self.lock:
            self.cache.clear()
            self.hits = 0
            self.misses = 0
    
    def stats(self):
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        
        return {
            'hits': self.hits,
            'misses': self.misses,
            'hit_rate': f'{hit_rate:.2f}%',
            'size': len(self.cache),
            'capacity': self.capacity
        }

# Uso
cache = LRUCache(capacity=3)

cache.set('a', 1)
cache.set('b', 2)
cache.set('c', 3)

print(cache.get('a'))  # 1
cache.set('d', 4)      # Remove 'b' (LRU)
print(cache.get('b'))  # None

# Com TTL
cache.set('temp', 'value', ttl=5)  # Expira em 5 segundos
```

### Implementação JavaScript

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    if (!this.cache.has(key)) {
      this.misses++;
      return null;
    }

    const { value, expiry } = this.cache.get(key);

    // Verifica expiração
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Move para o fim (mais recente)
    this.cache.delete(key);
    this.cache.set(key, { value, expiry });

    this.hits++;
    return value;
  }

  set(key, value, ttl = null) {
    // Remove se já existe
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Remove item mais antigo se cheio
    else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // Calcula expiração
    const expiry = ttl ? Date.now() + ttl * 1000 : null;

    // Adiciona no fim
    this.cache.set(key, { value, expiry });
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total * 100).toFixed(2) : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      capacity: this.capacity
    };
  }
}

// Uso
const cache = new LRUCache(3);

cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);

console.log(cache.get('a')); // 1
cache.set('d', 4);            // Remove 'b'
console.log(cache.get('b')); // null

console.log(cache.stats());
```

### Implementação Go (Thread-Safe)

```go
package main

import (
    "container/list"
    "sync"
    "time"
)

type entry struct {
    key    string
    value  interface{}
    expiry *time.Time
}

type LRUCache struct {
    capacity int
    cache    map[string]*list.Element
    list     *list.List
    mu       sync.RWMutex
    hits     int64
    misses   int64
}

func NewLRUCache(capacity int) *LRUCache {
    return &LRUCache{
        capacity: capacity,
        cache:    make(map[string]*list.Element),
        list:     list.New(),
    }
}

func (c *LRUCache) Get(key string) (interface{}, bool) {
    c.mu.Lock()
    defer c.mu.Unlock()

    elem, exists := c.cache[key]
    if !exists {
        c.misses++
        return nil, false
    }

    entry := elem.Value.(*entry)

    // Verifica expiração
    if entry.expiry != nil && time.Now().After(*entry.expiry) {
        c.removeElement(elem)
        c.misses++
        return nil, false
    }

    // Move para frente (mais recente)
    c.list.MoveToFront(elem)
    c.hits++

    return entry.value, true
}

func (c *LRUCache) Set(key string, value interface{}, ttl *time.Duration) {
    c.mu.Lock()
    defer c.mu.Unlock()

    // Se já existe, remove
    if elem, exists := c.cache[key]; exists {
        c.removeElement(elem)
    }

    // Se cheio, remove o mais antigo
    if c.list.Len() >= c.capacity {
        oldest := c.list.Back()
        if oldest != nil {
            c.removeElement(oldest)
        }
    }

    // Calcula expiração
    var expiry *time.Time
    if ttl != nil {
        exp := time.Now().Add(*ttl)
        expiry = &exp
    }

    // Adiciona na frente
    entry := &entry{
        key:    key,
        value:  value,
        expiry: expiry,
    }

    elem := c.list.PushFront(entry)
    c.cache[key] = elem
}

func (c *LRUCache) Delete(key string) bool {
    c.mu.Lock()
    defer c.mu.Unlock()

    if elem, exists := c.cache[key]; exists {
        c.removeElement(elem)
        return true
    }

    return false
}

func (c *LRUCache) removeElement(elem *list.Element) {
    entry := elem.Value.(*entry)
    delete(c.cache, entry.key)
    c.list.Remove(elem)
}

func (c *LRUCache) Stats() map[string]interface{} {
    c.mu.RLock()
    defer c.mu.RUnlock()

    total := c.hits + c.misses
    hitRate := 0.0
    if total > 0 {
        hitRate = float64(c.hits) / float64(total) * 100
    }

    return map[string]interface{}{
        "hits":     c.hits,
        "misses":   c.misses,
        "hitRate":  hitRate,
        "size":     c.list.Len(),
        "capacity": c.capacity,
    }
}

// Uso
func main() {
    cache := NewLRUCache(3)

    cache.Set("a", 1, nil)
    cache.Set("b", 2, nil)
    cache.Set("c", 3, nil)

    value, _ := cache.Get("a") // 1
    
    cache.Set("d", 4, nil) // Remove "b"
    
    _, exists := cache.Get("b") // false

    // Com TTL
    ttl := 5 * time.Second
    cache.Set("temp", "value", &ttl)
}
```

## 🔄 Outras Políticas de Eviction

### LFU (Least Frequently Used)

```python
from collections import defaultdict
import heapq

class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}  # key -> (value, freq, timestamp)
        self.freq_map = defaultdict(set)  # freq -> set of keys
        self.min_freq = 0
        self.timestamp = 0
    
    def get(self, key: str):
        if key not in self.cache:
            return None
        
        value, freq, _ = self.cache[key]
        
        # Atualiza frequência
        self.freq_map[freq].remove(key)
        if not self.freq_map[freq] and freq == self.min_freq:
            self.min_freq += 1
        
        self.cache[key] = (value, freq + 1, self.timestamp)
        self.freq_map[freq + 1].add(key)
        self.timestamp += 1
        
        return value
    
    def set(self, key: str, value):
        if self.capacity == 0:
            return
        
        if key in self.cache:
            _, freq, _ = self.cache[key]
            self.cache[key] = (value, freq, self.timestamp)
            self.get(key)  # Atualiza frequência
            return
        
        if len(self.cache) >= self.capacity:
            # Remove item com menor frequência
            keys_to_remove = self.freq_map[self.min_freq]
            # Se empate, remove o mais antigo
            key_to_remove = min(keys_to_remove, 
                              key=lambda k: self.cache[k][2])
            
            self.freq_map[self.min_freq].remove(key_to_remove)
            del self.cache[key_to_remove]
        
        self.cache[key] = (value, 1, self.timestamp)
        self.freq_map[1].add(key)
        self.min_freq = 1
        self.timestamp += 1
```

### FIFO (First In First Out)

```javascript
class FIFOCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    this.queue = [];
  }

  get(key) {
    return this.cache.get(key) || null;
  }

  set(key, value) {
    if (!this.cache.has(key)) {
      if (this.cache.size >= this.capacity) {
        // Remove o primeiro que entrou
        const firstKey = this.queue.shift();
        this.cache.delete(firstKey);
      }
      this.queue.push(key);
    }
    
    this.cache.set(key, value);
  }
}
```

## 🤔 Perguntas Comuns

1. **Por que usar doubly linked list + hash map?**
   - Hash map: O(1) lookup
   - Linked list: O(1) insertion/deletion
   - Combinados: O(1) para todas operações

2. **Como implementar cache distribuído?**
   - Consistent hashing
   - Replicação
   - Sincronização

3. **Como lidar com cache stampede?**
   - Lock por chave
   - Probabilistic early expiration
   - Cache warming

4. **Qual política de eviction escolher?**
   - LRU: Acesso temporal
   - LFU: Acesso por frequência
   - FIFO: Simples, menos eficiente

## 📚 Recursos

- [LRU Cache - LeetCode](https://leetcode.com/problems/lru-cache/)
- [Redis Implementation](https://redis.io/topics/lru-cache)
- [Caching Strategies](https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/Strategies.html)
