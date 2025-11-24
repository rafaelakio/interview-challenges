# URL Shortener - Encurtador de URLs

## 🎯 Por Que Este Desafio?

O desafio de criar um encurtador de URLs é extremamente popular em entrevistas porque:

1. **Simplicidade Aparente**: Parece simples, mas tem muitas nuances
2. **Escalabilidade**: Testa conhecimento de sistemas distribuídos
3. **Design de APIs**: Avalia capacidade de criar APIs RESTful
4. **Banco de Dados**: Testa modelagem e otimização
5. **Algoritmos**: Envolve hashing e geração de IDs únicos

**Empresas que usam**: Bitly, TinyURL, Google (goo.gl), Amazon, Uber

## 📋 Requisitos

### Funcionais
- Encurtar uma URL longa em uma URL curta
- Redirecionar URL curta para URL original
- URLs customizadas (opcional)
- Expiração de URLs (opcional)
- Analytics básico (contador de cliques)

### Não-Funcionais
- Alta disponibilidade (99.9%)
- Baixa latência (<100ms)
- Escalável (milhões de URLs)
- URLs curtas devem ser únicas

## 🧠 Conceitos Avaliados

- **System Design**: Arquitetura escalável
- **Algoritmos**: Hash functions, Base62 encoding
- **Banco de Dados**: Indexação, sharding
- **Caching**: Redis para performance
- **APIs**: REST design patterns
- **Concorrência**: Race conditions, locks

## 💡 Soluções

### Solução 1: Básica (Hash MD5)

**Abordagem**: Usar MD5 hash da URL original

```javascript
// Node.js + Express
const crypto = require('crypto');
const express = require('express');
const app = express();

const urlDatabase = new Map();

app.post('/shorten', (req, res) => {
  const { url } = req.body;
  
  // Gera hash MD5 e pega primeiros 7 caracteres
  const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 7);
  
  urlDatabase.set(hash, url);
  
  res.json({ shortUrl: `http://short.url/${hash}` });
});

app.get('/:shortCode', (req, res) => {
  const url = urlDatabase.get(req.params.shortCode);
  
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).send('URL not found');
  }
});
```

**Prós**:
- Simples de implementar
- Determinístico (mesma URL = mesmo hash)

**Contras**:
- Colisões possíveis
- Não garante URLs curtas
- Não escalável

---

### Solução 2: Intermediária (Auto-increment + Base62)

**Abordagem**: Usar ID auto-incrementado convertido para Base62

```python
# Python + Flask + PostgreSQL
from flask import Flask, request, redirect
import psycopg2
import string

app = Flask(__name__)

# Base62: 0-9, a-z, A-Z
BASE62 = string.digits + string.ascii_lowercase + string.ascii_uppercase

def encode_base62(num):
    if num == 0:
        return BASE62[0]
    
    result = []
    while num:
        result.append(BASE62[num % 62])
        num //= 62
    
    return ''.join(reversed(result))

def decode_base62(string):
    num = 0
    for char in string:
        num = num * 62 + BASE62.index(char)
    return num

@app.route('/shorten', methods=['POST'])
def shorten():
    url = request.json['url']
    
    conn = psycopg2.connect("dbname=urlshortener")
    cur = conn.cursor()
    
    # Insere e retorna ID auto-incrementado
    cur.execute(
        "INSERT INTO urls (original_url, created_at) VALUES (%s, NOW()) RETURNING id",
        (url,)
    )
    url_id = cur.fetchone()[0]
    
    short_code = encode_base62(url_id)
    
    cur.execute(
        "UPDATE urls SET short_code = %s WHERE id = %s",
        (short_code, url_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {'shortUrl': f'http://short.url/{short_code}'}

@app.route('/<short_code>')
def redirect_url(short_code):
    url_id = decode_base62(short_code)
    
    conn = psycopg2.connect("dbname=urlshortener")
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE urls SET clicks = clicks + 1 WHERE id = %s RETURNING original_url",
        (url_id,)
    )
    
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    if result:
        return redirect(result[0])
    return 'URL not found', 404
```

**Schema SQL**:
```sql
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE,
    clicks BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_created_at ON urls(created_at);
```

**Prós**:
- URLs curtas garantidas (7 caracteres = 3.5 trilhões de URLs)
- Sem colisões
- Fácil de escalar verticalmente

**Contras**:
- ID sequencial pode ser previsível
- Single point of failure no banco

---

### Solução 3: Avançada (Distributed ID Generator + Cache)

**Abordagem**: Snowflake ID + Redis Cache + Sharding

```go
// Go + Redis + PostgreSQL
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/go-redis/redis/v8"
    "github.com/bwmarrin/snowflake"
    "database/sql"
    _ "github.com/lib/pq"
    "context"
    "time"
)

var (
    redisClient *redis.Client
    db          *sql.DB
    node        *snowflake.Node
)

type URLService struct{}

func (s *URLService) ShortenURL(originalURL string) (string, error) {
    ctx := context.Background()
    
    // Gera ID único usando Snowflake
    id := node.Generate()
    shortCode := encodeBase62(id.Int64())
    
    // Salva no banco (com sharding por hash do shortCode)
    _, err := db.Exec(
        `INSERT INTO urls (id, original_url, short_code, created_at) 
         VALUES ($1, $2, $3, $4)`,
        id.Int64(), originalURL, shortCode, time.Now(),
    )
    if err != nil {
        return "", err
    }
    
    // Cache no Redis (TTL de 24h)
    redisClient.Set(ctx, shortCode, originalURL, 24*time.Hour)
    
    return shortCode, nil
}

func (s *URLService) GetOriginalURL(shortCode string) (string, error) {
    ctx := context.Background()
    
    // Tenta buscar no cache primeiro
    url, err := redisClient.Get(ctx, shortCode).Result()
    if err == nil {
        // Incrementa contador de forma assíncrona
        go s.incrementClicks(shortCode)
        return url, nil
    }
    
    // Cache miss - busca no banco
    id := decodeBase62(shortCode)
    var originalURL string
    
    err = db.QueryRow(
        "SELECT original_url FROM urls WHERE id = $1",
        id,
    ).Scan(&originalURL)
    
    if err != nil {
        return "", err
    }
    
    // Atualiza cache
    redisClient.Set(ctx, shortCode, originalURL, 24*time.Hour)
    
    // Incrementa contador
    go s.incrementClicks(shortCode)
    
    return originalURL, nil
}

func (s *URLService) incrementClicks(shortCode string) {
    ctx := context.Background()
    
    // Usa Redis para contador distribuído
    redisClient.Incr(ctx, "clicks:"+shortCode)
    
    // Flush para banco a cada 100 cliques
    clicks, _ := redisClient.Get(ctx, "clicks:"+shortCode).Int64()
    if clicks%100 == 0 {
        id := decodeBase62(shortCode)
        db.Exec("UPDATE urls SET clicks = clicks + 100 WHERE id = $1", id)
        redisClient.Del(ctx, "clicks:"+shortCode)
    }
}

func main() {
    // Inicializa Snowflake (cada instância tem um node ID único)
    node, _ = snowflake.NewNode(1)
    
    // Conecta Redis
    redisClient = redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
    })
    
    // Conecta PostgreSQL
    db, _ = sql.Open("postgres", "postgres://user:pass@localhost/urlshortener")
    
    router := gin.Default()
    service := &URLService{}
    
    router.POST("/shorten", func(c *gin.Context) {
        var req struct {
            URL string `json:"url"`
        }
        c.BindJSON(&req)
        
        shortCode, err := service.ShortenURL(req.URL)
        if err != nil {
            c.JSON(500, gin.H{"error": err.Error()})
            return
        }
        
        c.JSON(200, gin.H{"shortUrl": "http://short.url/" + shortCode})
    })
    
    router.GET("/:code", func(c *gin.Context) {
        url, err := service.GetOriginalURL(c.Param("code"))
        if err != nil {
            c.JSON(404, gin.H{"error": "URL not found"})
            return
        }
        
        c.Redirect(302, url)
    })
    
    router.Run(":8080")
}

func encodeBase62(num int64) string {
    const base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if num == 0 {
        return string(base62[0])
    }
    
    result := []byte{}
    for num > 0 {
        result = append([]byte{base62[num%62]}, result...)
        num /= 62
    }
    return string(result)
}

func decodeBase62(str string) int64 {
    const base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    var num int64
    for _, char := range str {
        for i, b := range base62 {
            if byte(char) == byte(b) {
                num = num*62 + int64(i)
                break
            }
        }
    }
    return num
}
```

**Prós**:
- Altamente escalável (milhões de req/s)
- Baixa latência com cache
- IDs distribuídos sem coordenação
- Fault tolerant

**Contras**:
- Complexidade maior
- Mais componentes para gerenciar
- Custo de infraestrutura

## 📊 Comparação de Soluções

| Aspecto | Básica | Intermediária | Avançada |
|---------|--------|---------------|----------|
| Escalabilidade | Baixa | Média | Alta |
| Latência | ~50ms | ~20ms | ~5ms |
| Complexidade | Baixa | Média | Alta |
| Colisões | Sim | Não | Não |
| Custo | $ | $$ | $$$ |

## 🤔 Perguntas Comuns do Entrevistador

1. **Como você lida com colisões?**
   - Solução 1: Adicionar salt e tentar novamente
   - Solução 2/3: Não há colisões com IDs únicos

2. **Como escalar para bilhões de URLs?**
   - Sharding por hash do short_code
   - Cache distribuído (Redis Cluster)
   - Load balancing

3. **Como garantir URLs customizadas?**
   - Verificar disponibilidade antes de inserir
   - Usar índice único no banco

4. **E se o Redis cair?**
   - Fallback para banco de dados
   - Redis Sentinel para HA
   - Múltiplas réplicas

5. **Como implementar expiração?**
   - Campo expires_at no banco
   - TTL no Redis
   - Job periódico para limpeza

## 🎯 Dicas para a Entrevista

1. **Comece simples**: Implemente a solução básica primeiro
2. **Discuta trade-offs**: Mostre que entende as limitações
3. **Pense em escala**: Pergunte sobre volume esperado
4. **Considere edge cases**: URLs duplicadas, caracteres especiais
5. **Métricas**: Fale sobre monitoramento e observabilidade

## 📚 Recursos Adicionais

- [System Design: URL Shortener](https://www.youtube.com/watch?v=fMZMm_0ZhK4)
- [Bitly Architecture](https://www.infoq.com/presentations/bitly-lessons/)
- [Base62 Encoding](https://en.wikipedia.org/wiki/Base62)
- [Snowflake ID](https://github.com/twitter-archive/snowflake)
