# Rate Limiter - Controle de Taxa de Requisições

## 🎯 Por Que Este Desafio?

Rate limiting é crucial para:

1. **Proteção de APIs**: Prevenir abuso e DDoS
2. **Fair Usage**: Garantir recursos para todos os usuários
3. **Custos**: Controlar gastos com infraestrutura
4. **SLA**: Manter qualidade de serviço

**Empresas que usam**: Stripe, Twitter, GitHub, AWS, Cloudflare

## 📋 Requisitos

### Funcionais
- Limitar requisições por usuário/IP
- Diferentes limites por tier (free, premium)
- Resposta clara quando limite é atingido
- Headers informativos (X-RateLimit-*)

### Não-Funcionais
- Baixa latência (<1ms overhead)
- Distribuído (múltiplos servidores)
- Preciso (não permitir mais que o limite)
- Resiliente (não falhar se Redis cair)

## 🧠 Conceitos Avaliados

- **Algoritmos**: Token Bucket, Leaky Bucket, Sliding Window
- **Concorrência**: Race conditions, atomic operations
- **Sistemas Distribuídos**: Sincronização entre servidores
- **Performance**: Otimização de latência
- **Redis**: Comandos avançados (INCR, EXPIRE, Lua scripts)

## 💡 Soluções

### Solução 1: Fixed Window Counter

**Abordagem**: Contador simples por janela de tempo fixa

```javascript
// Node.js + Redis
const redis = require('redis');
const client = redis.createClient();

class FixedWindowRateLimiter {
  constructor(maxRequests, windowSeconds) {
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
  }

  async isAllowed(userId) {
    const now = Date.now();
    const windowStart = Math.floor(now / (this.windowSeconds * 1000));
    const key = `rate_limit:${userId}:${windowStart}`;

    // Usa multi para garantir atomicidade ou define expiração em toda chamada
    // para evitar vazamento de memória caso o primeiro expire falhe.
    const count = await client.incr(key);
    if (count === 1) {
        await client.expire(key, this.windowSeconds);
    }

    return count <= this.maxRequests;
  }

  async getRemainingRequests(userId) {
    const now = Date.now();
    const windowStart = Math.floor(now / (this.windowSeconds * 1000));
    const key = `rate_limit:${userId}:${windowStart}`;

    const count = await client.get(key) || 0;
    return Math.max(0, this.maxRequests - count);
  }
}

// Middleware Express
function rateLimitMiddleware(limiter) {
  return async (req, res, next) => {
    const userId = req.user?.id || req.ip;
    
    const allowed = await limiter.isAllowed(userId);
    const remaining = await limiter.getRemainingRequests(userId);
    
    res.setHeader('X-RateLimit-Limit', limiter.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    
    if (!allowed) {
      res.setHeader('Retry-After', limiter.windowSeconds);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${limiter.windowSeconds} seconds.`
      });
    }
    
    next();
  };
}

// Uso
const limiter = new FixedWindowRateLimiter(100, 60); // 100 req/min
app.use(rateLimitMiddleware(limiter));
```

**Prós**:
- Simples de implementar
- Baixo uso de memória
- Performance excelente

**Contras**:
- Burst no início da janela (pode receber 200 req em 2 segundos)
- Reset abrupto

---

### Solução 2: Sliding Window Log

**Abordagem**: Mantém log de timestamps das requisições

```python
# Python + Redis
import time
import redis

class SlidingWindowLogRateLimiter:
    def __init__(self, max_requests, window_seconds):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.redis = redis.Redis(decode_responses=True)
    
    def is_allowed(self, user_id):
        now = time.time()
        window_start = now - self.window_seconds
        key = f"rate_limit:{user_id}"
        
        # Remove requisições antigas
        self.redis.zremrangebyscore(key, 0, window_start)
        
        # Conta requisições na janela
        count = self.redis.zcard(key)
        
        if count < self.max_requests:
            # Adiciona nova requisição
            self.redis.zadd(key, {str(now): now})
            self.redis.expire(key, self.window_seconds)
            return True
        
        return False
    
    def get_remaining_requests(self, user_id):
        now = time.time()
        window_start = now - self.window_seconds
        key = f"rate_limit:{user_id}"
        
        self.redis.zremrangebyscore(key, 0, window_start)
        count = self.redis.zcard(key)
        
        return max(0, self.max_requests - count)

# Flask middleware
from flask import Flask, request, jsonify
from functools import wraps

app = Flask(__name__)
limiter = SlidingWindowLogRateLimiter(100, 60)

def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = request.headers.get('X-User-ID') or request.remote_addr
        
        if not limiter.is_allowed(user_id):
            remaining = limiter.get_remaining_requests(user_id)
            return jsonify({
                'error': 'Rate limit exceeded',
                'retry_after': 60
            }), 429
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/data')
@rate_limit
def get_data():
    return jsonify({'data': 'success'})
```

**Prós**:
- Precisão perfeita
- Sem burst problems
- Janela deslizante real

**Contras**:
- Alto uso de memória (armazena cada timestamp)
- Mais lento que fixed window

---

### Solução 3: Token Bucket (Avançado)

**Abordagem**: Balde de tokens que se reabastece constantemente

```go
// Go + Redis com Lua Script
package main

import (
    "context"
    "github.com/go-redis/redis/v8"
    "time"
)

const tokenBucketScript = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local requested = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1])
local last_refill = tonumber(bucket[2])

if tokens == nil then
    tokens = capacity
    last_refill = now
end

-- Calcula tokens a adicionar desde último refill
local time_passed = now - last_refill
local tokens_to_add = time_passed * refill_rate
tokens = math.min(capacity, tokens + tokens_to_add)

local allowed = 0
if tokens >= requested then
    tokens = tokens - requested
    allowed = 1
end

-- Atualiza bucket
redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
redis.call('EXPIRE', key, 3600)

return {allowed, tokens}
`

type TokenBucketRateLimiter struct {
    redis       *redis.Client
    capacity    int
    refillRate  float64 // tokens por segundo
    script      *redis.Script
}

func NewTokenBucketRateLimiter(redisClient *redis.Client, capacity int, refillRate float64) *TokenBucketRateLimiter {
    return &TokenBucketRateLimiter{
        redis:      redisClient,
        capacity:   capacity,
        refillRate: refillRate,
        script:     redis.NewScript(tokenBucketScript),
    }
}

func (r *TokenBucketRateLimiter) IsAllowed(ctx context.Context, userID string, tokens int) (bool, int, error) {
    key := "rate_limit:token_bucket:" + userID
    now := time.Now().Unix()
    
    result, err := r.script.Run(
        ctx,
        r.redis,
        []string{key},
        r.capacity,
        r.refillRate,
        tokens,
        now,
    ).Result()
    
    if err != nil {
        return false, 0, err
    }
    
    values := result.([]interface{})
    allowed := values[0].(int64) == 1
    remaining := int(values[1].(int64))
    
    return allowed, remaining, nil
}

// Middleware Gin
func RateLimitMiddleware(limiter *TokenBucketRateLimiter) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.GetHeader("X-User-ID")
        if userID == "" {
            userID = c.ClientIP()
        }
        
        allowed, remaining, err := limiter.IsAllowed(c.Request.Context(), userID, 1)
        
        c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", limiter.capacity))
        c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
        
        if err != nil {
            c.JSON(500, gin.H{"error": "Rate limiter error"})
            c.Abort()
            return
        }
        
        if !allowed {
            c.Header("Retry-After", "1")
            c.JSON(429, gin.H{
                "error": "Too many requests",
                "retry_after": 1,
            })
            c.Abort()
            return
        }
        
        c.Next()
    }
}

// Exemplo com diferentes tiers
type RateLimitTier struct {
    Capacity   int
    RefillRate float64
}

var tiers = map[string]RateLimitTier{
    "free":     {Capacity: 100, RefillRate: 1.67},   // 100 req/min
    "basic":    {Capacity: 1000, RefillRate: 16.67}, // 1000 req/min
    "premium":  {Capacity: 10000, RefillRate: 166.67}, // 10k req/min
}

func RateLimitByTier(redisClient *redis.Client) gin.HandlerFunc {
    limiters := make(map[string]*TokenBucketRateLimiter)
    
    for tier, config := range tiers {
        limiters[tier] = NewTokenBucketRateLimiter(
            redisClient,
            config.Capacity,
            config.RefillRate,
        )
    }
    
    return func(c *gin.Context) {
        tier := c.GetHeader("X-User-Tier")
        if tier == "" {
            tier = "free"
        }
        
        limiter, exists := limiters[tier]
        if !exists {
            limiter = limiters["free"]
        }
        
        userID := c.GetHeader("X-User-ID")
        if userID == "" {
            userID = c.ClientIP()
        }
        
        allowed, remaining, _ := limiter.IsAllowed(c.Request.Context(), userID, 1)
        
        c.Header("X-RateLimit-Tier", tier)
        c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
        
        if !allowed {
            c.JSON(429, gin.H{"error": "Rate limit exceeded"})
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

**Prós**:
- Suaviza tráfego (não permite bursts)
- Flexível (diferentes custos por endpoint)
- Justo (reabastecimento constante)

**Contras**:
- Mais complexo
- Requer Lua script para atomicidade

---

### Solução 4: Sliding Window Counter (Híbrido)

**Abordagem**: Combina fixed window com sliding window

```typescript
// TypeScript + Redis
import { Redis } from 'ioredis';

class SlidingWindowCounterRateLimiter {
  private redis: Redis;
  private maxRequests: number;
  private windowSeconds: number;

  constructor(redis: Redis, maxRequests: number, windowSeconds: number) {
    this.redis = redis;
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
  }

  async isAllowed(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const currentWindow = Math.floor(now / (this.windowSeconds * 1000));
    const previousWindow = currentWindow - 1;

    const currentKey = `rate_limit:${userId}:${currentWindow}`;
    const previousKey = `rate_limit:${userId}:${previousWindow}`;

    // Busca contadores das duas janelas
    const [currentCount, previousCount] = await Promise.all([
      this.redis.get(currentKey).then(v => parseInt(v || '0')),
      this.redis.get(previousKey).then(v => parseInt(v || '0'))
    ]);

    // Calcula peso da janela anterior
    const windowProgress = (now % (this.windowSeconds * 1000)) / (this.windowSeconds * 1000);
    const previousWeight = 1 - windowProgress;

    // Estimativa de requisições na janela deslizante
    const estimatedCount = Math.floor(
      previousCount * previousWeight + currentCount
    );

    if (estimatedCount < this.maxRequests) {
      // Incrementa contador atual
      const pipeline = this.redis.pipeline();
      pipeline.incr(currentKey);
      pipeline.expire(currentKey, this.windowSeconds * 2);
      await pipeline.exec();

      return {
        allowed: true,
        remaining: this.maxRequests - estimatedCount - 1
      };
    }

    return {
      allowed: false,
      remaining: 0
    };
  }
}

// Express middleware com múltiplos limiters
import express from 'express';

interface RateLimitConfig {
  global: { requests: number; window: number };
  perUser: { requests: number; window: number };
  perIP: { requests: number; window: number };
}

function createRateLimitMiddleware(redis: Redis, config: RateLimitConfig) {
  const globalLimiter = new SlidingWindowCounterRateLimiter(
    redis,
    config.global.requests,
    config.global.window
  );

  const userLimiter = new SlidingWindowCounterRateLimiter(
    redis,
    config.perUser.requests,
    config.perUser.window
  );

  const ipLimiter = new SlidingWindowCounterRateLimiter(
    redis,
    config.perIP.requests,
    config.perIP.window
  );

  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = req.user?.id;
    const ip = req.ip;

    // Verifica limite global
    const globalCheck = await globalLimiter.isAllowed('global');
    if (!globalCheck.allowed) {
      return res.status(429).json({
        error: 'Global rate limit exceeded',
        retry_after: config.global.window
      });
    }

    // Verifica limite por IP
    const ipCheck = await ipLimiter.isAllowed(ip);
    if (!ipCheck.allowed) {
      return res.status(429).json({
        error: 'IP rate limit exceeded',
        retry_after: config.perIP.window
      });
    }

    // Verifica limite por usuário (se autenticado)
    if (userId) {
      const userCheck = await userLimiter.isAllowed(userId);
      if (!userCheck.allowed) {
        return res.status(429).json({
          error: 'User rate limit exceeded',
          retry_after: config.perUser.window
        });
      }

      res.setHeader('X-RateLimit-Remaining', userCheck.remaining.toString());
    }

    next();
  };
}

// Uso
const app = express();
const redis = new Redis();

app.use(createRateLimitMiddleware(redis, {
  global: { requests: 10000, window: 60 },
  perUser: { requests: 100, window: 60 },
  perIP: { requests: 50, window: 60 }
}));
```

**Prós**:
- Balanço entre precisão e performance
- Menos memória que sliding log
- Mais suave que fixed window

**Contras**:
- Aproximação (não 100% preciso)
- Lógica mais complexa

## 📊 Comparação de Algoritmos

| Algoritmo | Precisão | Memória | Performance | Burst Control |
|-----------|----------|---------|-------------|---------------|
| Fixed Window | Baixa | Baixa | Excelente | Ruim |
| Sliding Log | Perfeita | Alta | Boa | Excelente |
| Token Bucket | Boa | Baixa | Excelente | Excelente |
| Sliding Counter | Boa | Baixa | Excelente | Boa |

## 🤔 Perguntas Comuns do Entrevistador

1. **Como lidar com múltiplos servidores?**
   - Redis centralizado
   - Sincronização eventual
   - Gossip protocol

2. **E se o Redis ficar indisponível?**
   - Fallback para rate limit local (menos preciso)
   - Fail open vs fail closed
   - Circuit breaker

3. **Como implementar diferentes limites por endpoint?**
   - Chave composta: `user:endpoint`
   - Configuração por rota
   - Custos diferentes (1 req = N tokens)

4. **Como prevenir race conditions?**
   - Lua scripts (atomic)
   - Redis transactions (MULTI/EXEC)
   - Optimistic locking

5. **Como fazer rate limiting distribuído sem Redis?**
   - Gossip protocol (Cassandra-style)
   - Consistent hashing
   - Local counters + sync periódico

## 🎯 Dicas para a Entrevista

1. **Discuta trade-offs**: Cada algoritmo tem prós e contras
2. **Considere escala**: Como funciona com milhões de usuários?
3. **Pense em UX**: Headers informativos, mensagens claras
4. **Segurança**: Prevenir bypass, DDoS
5. **Monitoramento**: Métricas de rate limiting

## 📚 Recursos Adicionais

- [Stripe Rate Limiting](https://stripe.com/blog/rate-limiters)
- [Kong Rate Limiting](https://docs.konghq.com/hub/kong-inc/rate-limiting/)
- [Redis Rate Limiting Patterns](https://redis.io/docs/manual/patterns/rate-limiter/)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
