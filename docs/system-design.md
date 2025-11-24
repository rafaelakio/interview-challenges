# System Design - Guia de Design de Sistemas

## 🎯 O Que é System Design?

System design é o processo de definir a arquitetura, componentes, módulos, interfaces e dados de um sistema para satisfazer requisitos específicos. É uma das partes mais importantes de entrevistas para posições sênior.

## 📋 Framework de Abordagem

### 1. Entender o Problema (5-10 min)

**Perguntas a fazer**:
- Quais são os requisitos funcionais principais?
- Quais são os requisitos não-funcionais (escala, latência, disponibilidade)?
- Quantos usuários? Quantas requisições por segundo?
- Qual é o tamanho dos dados?
- Há requisitos de consistência específicos?

**Exemplo**:
```
Entrevistador: "Design um sistema de URL shortener"

Você: 
- Quantas URLs serão encurtadas por dia?
- Qual a taxa de leitura vs escrita?
- As URLs expiram?
- Precisamos de analytics?
- Qual latência é aceitável?
```

### 2. Definir Escopo (5 min)

**Requisitos Funcionais**:
- ✅ Encurtar URL
- ✅ Redirecionar URL curta
- ❌ Analytics detalhado (fora do escopo)
- ❌ URLs customizadas (fora do escopo)

**Requisitos Não-Funcionais**:
- 100M URLs criadas/mês
- 10:1 read/write ratio
- Latência < 100ms
- 99.9% disponibilidade
- URLs não expiram

### 3. Estimativas de Capacidade (5-10 min)

**Cálculos importantes**:

```
Tráfego:
- Escritas: 100M/mês = ~40 req/s
- Leituras: 400 req/s
- Pico: 2x = 800 req/s

Armazenamento:
- 100M URLs/mês
- Cada URL: ~500 bytes
- Por mês: 100M * 500B = 50GB
- 5 anos: 50GB * 60 = 3TB

Banda:
- Escrita: 40 req/s * 500B = 20KB/s
- Leitura: 400 req/s * 500B = 200KB/s

Cache:
- 80/20 rule: 20% das URLs = 80% do tráfego
- Cache: 0.2 * 3TB = 600GB
```

### 4. Design de Alto Nível (10-15 min)

**Componentes principais**:

```
┌─────────┐
│ Cliente │
└────┬────┘
     │
     ▼
┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┐
   ▼       ▼
┌────┐  ┌────┐
│API │  │API │
│Srv1│  │Srv2│
└─┬──┘  └─┬──┘
  │       │
  └───┬───┘
      ▼
  ┌───────┐
  │ Cache │
  │(Redis)│
  └───┬───┘
      │
      ▼
  ┌──────────┐
  │ Database │
  │(Postgres)│
  └──────────┘
```

### 5. Design Detalhado (15-20 min)

**API Design**:
```
POST /api/shorten
Request: { "url": "https://example.com/very/long/url" }
Response: { "shortUrl": "http://short.ly/abc123" }

GET /:shortCode
Response: 302 Redirect to original URL
```

**Geração de Short Code**:
```python
# Opção 1: Base62 encoding de ID auto-incrementado
def encode_base62(num):
    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if num == 0:
        return chars[0]
    
    result = []
    while num:
        result.append(chars[num % 62])
        num //= 62
    
    return ''.join(reversed(result))

# ID 1000000 -> "4c92"
# 7 caracteres = 62^7 = 3.5 trilhões de URLs
```

**Schema de Banco**:
```sql
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    clicks BIGINT DEFAULT 0
);

CREATE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_created_at ON urls(created_at);
```

**Estratégia de Cache**:
```
Cache Strategy: Write-through + LRU eviction

1. Escrita:
   - Salva no DB
   - Salva no cache
   - TTL: 24h

2. Leitura:
   - Busca no cache
   - Se miss: busca no DB e atualiza cache
   - Incrementa contador (async)
```

### 6. Identificar Gargalos e Otimizar (10 min)

**Gargalos Potenciais**:

1. **Banco de Dados**
   - Problema: Single point of failure
   - Solução: Replicação master-slave
   - Solução: Sharding por hash do short_code

2. **Geração de IDs**
   - Problema: Auto-increment não escala
   - Solução: Snowflake ID generator
   - Solução: UUID

3. **Cache**
   - Problema: Cache miss em URLs populares
   - Solução: Pre-warming
   - Solução: Redis Cluster

4. **Latência**
   - Problema: Latência de rede
   - Solução: CDN
   - Solução: Edge locations

## 🏗️ Padrões Comuns de System Design

### 1. Load Balancing

**Algoritmos**:
- Round Robin
- Least Connections
- IP Hash
- Weighted Round Robin

**Implementação**:
```nginx
upstream backend {
    least_conn;
    server backend1.example.com weight=3;
    server backend2.example.com weight=2;
    server backend3.example.com weight=1;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### 2. Caching

**Níveis de Cache**:
```
Browser Cache (Client)
    ↓
CDN Cache (Edge)
    ↓
Application Cache (Redis)
    ↓
Database Cache (Query Cache)
    ↓
Database
```

**Estratégias**:
- **Cache-Aside**: App gerencia cache
- **Write-Through**: Escreve em cache e DB
- **Write-Behind**: Escreve em cache, DB async
- **Refresh-Ahead**: Pre-fetch antes de expirar

### 3. Database Scaling

**Vertical Scaling**:
- Aumentar CPU, RAM, Disco
- Limite: Hardware máximo
- Custo: Exponencial

**Horizontal Scaling**:

**Replicação**:
```
Master (Write)
    ↓
    ├─→ Slave 1 (Read)
    ├─→ Slave 2 (Read)
    └─→ Slave 3 (Read)
```

**Sharding**:
```python
# Sharding por hash
def get_shard(user_id, num_shards=4):
    return hash(user_id) % num_shards

# Sharding por range
def get_shard(user_id):
    if user_id < 1000000:
        return 'shard_1'
    elif user_id < 2000000:
        return 'shard_2'
    else:
        return 'shard_3'
```

### 4. Consistent Hashing

**Problema**: Adicionar/remover servidores requer rehash de tudo

**Solução**: Consistent Hashing
```python
import hashlib

class ConsistentHash:
    def __init__(self, nodes=None, replicas=3):
        self.replicas = replicas
        self.ring = {}
        self.sorted_keys = []
        
        if nodes:
            for node in nodes:
                self.add_node(node)
    
    def add_node(self, node):
        for i in range(self.replicas):
            key = self._hash(f"{node}:{i}")
            self.ring[key] = node
            self.sorted_keys.append(key)
        
        self.sorted_keys.sort()
    
    def remove_node(self, node):
        for i in range(self.replicas):
            key = self._hash(f"{node}:{i}")
            del self.ring[key]
            self.sorted_keys.remove(key)
    
    def get_node(self, key):
        if not self.ring:
            return None
        
        hash_key = self._hash(key)
        
        # Busca primeiro nó >= hash_key
        for node_key in self.sorted_keys:
            if node_key >= hash_key:
                return self.ring[node_key]
        
        # Wrap around
        return self.ring[self.sorted_keys[0]]
    
    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)
```

### 5. Message Queues

**Quando usar**:
- Processamento assíncrono
- Desacoplamento de serviços
- Load leveling
- Garantia de entrega

**Exemplo com RabbitMQ**:
```python
import pika

# Producer
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='tasks', durable=True)

channel.basic_publish(
    exchange='',
    routing_key='tasks',
    body='Process this task',
    properties=pika.BasicProperties(
        delivery_mode=2,  # Persistent
    )
)

# Consumer
def callback(ch, method, properties, body):
    print(f"Processing: {body}")
    # Process task
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='tasks', on_message_callback=callback)
channel.start_consuming()
```

## 📊 CAP Theorem

**CAP**: Consistency, Availability, Partition Tolerance

**Você só pode ter 2 de 3**:

```
        Consistency
            /\
           /  \
          /    \
         /  CA  \
        /        \
       /          \
      /____________\
Partition      Availability
Tolerance

CP: MongoDB, HBase, Redis
AP: Cassandra, DynamoDB, CouchDB
CA: PostgreSQL, MySQL (sem particionamento)
```

**Escolha baseada em requisitos**:
- **Financeiro**: CP (consistência crítica)
- **Social Media**: AP (disponibilidade crítica)
- **E-commerce**: Depende (carrinho = AP, pagamento = CP)

## 🎯 Checklist de System Design

### Requisitos
- [ ] Requisitos funcionais claros
- [ ] Requisitos não-funcionais definidos
- [ ] Escopo bem delimitado

### Estimativas
- [ ] Tráfego (QPS)
- [ ] Armazenamento
- [ ] Banda
- [ ] Cache

### Design
- [ ] Diagrama de alto nível
- [ ] API design
- [ ] Schema de dados
- [ ] Fluxo de dados

### Escalabilidade
- [ ] Load balancing
- [ ] Caching
- [ ] Database scaling
- [ ] CDN

### Confiabilidade
- [ ] Replicação
- [ ] Backup
- [ ] Disaster recovery
- [ ] Monitoring

### Segurança
- [ ] Autenticação
- [ ] Autorização
- [ ] Rate limiting
- [ ] Encryption

## 📚 Recursos Recomendados

**Livros**:
- "Designing Data-Intensive Applications" - Martin Kleppmann
- "System Design Interview" - Alex Xu
- "Building Microservices" - Sam Newman

**Sites**:
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [High Scalability](http://highscalability.com/)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)

**Canais YouTube**:
- Gaurav Sen
- Tech Dummies
- System Design Interview

**Prática**:
- [LeetCode System Design](https://leetcode.com/discuss/interview-question/system-design)
- [Pramp](https://www.pramp.com/)
- [Exponent](https://www.tryexponent.com/)
