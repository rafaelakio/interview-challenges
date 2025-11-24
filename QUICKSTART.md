# 🚀 Guia Rápido de Início

Este guia te ajudará a começar rapidamente com os desafios de entrevista.

## 📦 Instalação

### Clonar o Repositório

```bash
git clone https://github.com/yourusername/interview-challenges.git
cd interview-challenges
```

### Estrutura do Projeto

```
interview-challenges/
├── backend/              # Desafios de backend
│   ├── url-shortener/
│   ├── rate-limiter/
│   ├── cache-system/
│   └── ...
├── frontend/             # Desafios de frontend
│   ├── infinite-scroll/
│   ├── autocomplete/
│   └── ...
├── fullstack/            # Desafios full-stack
│   ├── chat-application/
│   └── ...
├── docs/                 # Documentação
│   ├── system-design.md
│   ├── interview-prep.md
│   └── ...
├── INDEX.md             # Índice completo
├── README.md            # Visão geral
└── QUICKSTART.md        # Este arquivo
```

## 🎯 Primeiros Passos

### 1. Escolha Seu Nível

**Iniciante (0-2 anos de experiência)**
```bash
# Comece com estes desafios:
cd backend/cache-system/
cd backend/url-shortener/
cd frontend/autocomplete/
cd frontend/infinite-scroll/
```

**Intermediário (2-5 anos)**
```bash
# Tente estes:
cd backend/rate-limiter/
cd fullstack/chat-application/
cd frontend/drag-and-drop/
```

**Avançado (5+ anos)**
```bash
# Desafie-se com:
cd backend/distributed-lock/
cd backend/event-sourcing/
cd backend/search-engine/
```

### 2. Leia o Desafio

Cada desafio contém:
- **Por que este desafio?**: Contexto e relevância
- **Requisitos**: O que implementar
- **Conceitos avaliados**: Habilidades testadas
- **Soluções**: Múltiplas implementações
- **Perguntas comuns**: O que esperar na entrevista

### 3. Tente Implementar

**Antes de ver as soluções**:
1. Leia apenas os requisitos
2. Tente implementar sozinho
3. Teste sua solução
4. Depois compare com as soluções fornecidas

## 💻 Exemplos Práticos

### Exemplo 1: Cache LRU (15 minutos)

**Desafio**: Implementar um cache LRU com capacidade limitada

```python
# Sua implementação aqui
class LRUCache:
    def __init__(self, capacity: int):
        # TODO: Implementar
        pass
    
    def get(self, key: str):
        # TODO: Implementar
        pass
    
    def set(self, key: str, value):
        # TODO: Implementar
        pass

# Teste
cache = LRUCache(2)
cache.set('a', 1)
cache.set('b', 2)
print(cache.get('a'))  # Deve retornar 1
cache.set('c', 3)      # Remove 'b'
print(cache.get('b'))  # Deve retornar None
```

**Depois de tentar**, veja a solução em `backend/cache-system/README.md`

### Exemplo 2: Autocomplete (20 minutos)

**Desafio**: Criar um componente de autocomplete com debounce

```javascript
// Sua implementação aqui
class Autocomplete {
  constructor(inputElement, options) {
    // TODO: Implementar
  }
  
  handleInput(e) {
    // TODO: Implementar debounce
  }
  
  async search(query) {
    // TODO: Buscar sugestões
  }
  
  renderSuggestions(suggestions) {
    // TODO: Renderizar lista
  }
}

// Teste
const input = document.querySelector('#search');
const autocomplete = new Autocomplete(input, {
  debounceTime: 300,
  fetchSuggestions: async (query) => {
    // Sua API aqui
    return ['suggestion1', 'suggestion2'];
  }
});
```

**Depois de tentar**, veja a solução em `frontend/autocomplete/README.md`

### Exemplo 3: Rate Limiter (30 minutos)

**Desafio**: Implementar rate limiting com sliding window

```javascript
// Sua implementação aqui
class RateLimiter {
  constructor(maxRequests, windowSeconds) {
    // TODO: Implementar
  }
  
  async isAllowed(userId) {
    // TODO: Verificar se pode fazer requisição
  }
}

// Teste
const limiter = new RateLimiter(100, 60); // 100 req/min

app.use(async (req, res, next) => {
  const allowed = await limiter.isAllowed(req.user.id);
  
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  next();
});
```

**Depois de tentar**, veja a solução em `backend/rate-limiter/README.md`

## 🎓 Trilhas de Estudo

### Semana 1: Fundamentos

**Dia 1-2**: Cache System
- Implemente LRU cache
- Adicione TTL
- Torne thread-safe

**Dia 3-4**: URL Shortener
- Implemente versão básica
- Adicione Base62 encoding
- Pense em escalabilidade

**Dia 5-7**: Autocomplete
- Implemente versão básica
- Adicione debounce
- Adicione cache

### Semana 2: Intermediário

**Dia 1-3**: Rate Limiter
- Implemente fixed window
- Implemente sliding window
- Adicione Redis

**Dia 4-7**: Chat Application
- Implemente com Socket.io
- Adicione salas
- Adicione histórico

### Semana 3-4: Avançado

**Dia 1-5**: System Design
- Estude padrões
- Pratique estimativas
- Desenhe arquiteturas

**Dia 6-14**: Projetos Complexos
- Event Sourcing
- Distributed Lock
- Search Engine

## 🛠️ Setup de Ambiente

### Backend (Node.js)

```bash
# Instalar dependências
npm init -y
npm install express socket.io redis mongoose

# Estrutura básica
mkdir src
touch src/server.js

# Executar
node src/server.js
```

### Backend (Python)

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install flask socketio redis pymongo

# Estrutura básica
mkdir src
touch src/app.py

# Executar
python src/app.py
```

### Frontend (React)

```bash
# Criar projeto
npx create-react-app my-challenge
cd my-challenge

# Instalar dependências adicionais
npm install axios socket.io-client

# Executar
npm start
```

## 📚 Recursos Recomendados

### Para Praticar
- [LeetCode](https://leetcode.com/) - Algoritmos
- [HackerRank](https://www.hackerrank.com/) - Desafios variados
- [Pramp](https://www.pramp.com/) - Mock interviews
- [Exercism](https://exercism.org/) - Prática com mentoria

### Para Estudar
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Tech Interview Handbook](https://www.techinterviewhandbook.org/)
- [Coding Interview University](https://github.com/jwasham/coding-interview-university)

### Canais YouTube
- NeetCode - Explicações de algoritmos
- Gaurav Sen - System design
- Tech Dummies - Arquitetura
- Clément Mihailescu - Entrevistas

## 🎯 Dicas de Estudo

### 1. Consistência > Intensidade

```
❌ Ruim: 8 horas no sábado
✅ Bom: 2 horas por dia, 5 dias/semana
```

### 2. Prática Ativa

```
❌ Ruim: Apenas ler código
✅ Bom: Implementar do zero
```

### 3. Espaçamento

```
❌ Ruim: Fazer 10 problemas novos
✅ Bom: Revisar 3 antigos + 2 novos
```

### 4. Explicação

```
❌ Ruim: Resolver em silêncio
✅ Bom: Explicar em voz alta
```

## 📝 Template de Estudo

Use este template para cada desafio:

```markdown
# Desafio: [Nome]
Data: [DD/MM/YYYY]

## Primeira Tentativa
- Tempo: [X minutos]
- Dificuldade: [1-5]
- Consegui resolver? [Sim/Não]
- Problemas encontrados:
  - Problema 1
  - Problema 2

## Solução Oficial
- Diferenças da minha solução:
  - Diferença 1
  - Diferença 2
- Aprendi:
  - Conceito 1
  - Conceito 2

## Revisão (1 semana depois)
- Consegui resolver sem consultar? [Sim/Não]
- Tempo: [X minutos]
- Melhorias:
  - Melhoria 1
  - Melhoria 2

## Notas
- [Anotações adicionais]
```

## 🤝 Comunidade

### Compartilhe Seu Progresso

```bash
# Fork o repositório
# Adicione suas soluções em uma pasta pessoal
mkdir my-solutions/
git add my-solutions/
git commit -m "Add: Minha solução para [desafio]"
git push
```

### Peça Ajuda

- Abra uma issue com tag `help-wanted`
- Use discussions para perguntas gerais
- Participe de code reviews

### Contribua

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre como contribuir.

## 🎉 Próximos Passos

1. ✅ Escolha um desafio do seu nível
2. ✅ Tente implementar sozinho (30-60 min)
3. ✅ Compare com as soluções
4. ✅ Implemente versões mais avançadas
5. ✅ Pratique explicar sua solução
6. ✅ Repita com próximo desafio

## 📞 Suporte

Precisa de ajuda?

- 📧 Email: [seu-email]
- 💬 Discord: [link-discord]
- 🐦 Twitter: [@seu-twitter]
- 📝 Issues: [GitHub Issues](https://github.com/yourusername/interview-challenges/issues)

---

**Boa sorte nos seus estudos! 🚀**

Lembre-se: A preparação é a chave para o sucesso em entrevistas técnicas. Seja consistente, pratique regularmente e não desista!
