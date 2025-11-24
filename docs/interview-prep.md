# Guia de Preparação para Entrevistas Técnicas

## 🎯 Visão Geral

Este guia cobre como se preparar para entrevistas técnicas em empresas de tecnologia, desde startups até FAANG.

## 📅 Timeline de Preparação

### 3-6 Meses Antes

**Fundamentos (40%)**:
- [ ] Estruturas de dados básicas
- [ ] Algoritmos fundamentais
- [ ] Complexidade (Big O)
- [ ] Programação orientada a objetos

**Prática (40%)**:
- [ ] 2-3 problemas LeetCode/dia (Easy → Medium)
- [ ] Implementar estruturas de dados do zero
- [ ] Revisar conceitos de CS

**Projetos (20%)**:
- [ ] Contribuir para open source
- [ ] Criar projeto pessoal relevante
- [ ] Documentar no GitHub

### 1-3 Meses Antes

**Algoritmos Avançados (30%)**:
- [ ] Dynamic Programming
- [ ] Grafos (DFS, BFS, Dijkstra)
- [ ] Árvores (BST, Trie, Segment Tree)
- [ ] Backtracking

**System Design (30%)**:
- [ ] Estudar arquiteturas conhecidas
- [ ] Praticar design de sistemas
- [ ] Entender trade-offs

**Prática Intensiva (40%)**:
- [ ] 3-5 problemas Medium/Hard por dia
- [ ] Mock interviews
- [ ] Revisar problemas anteriores

### 2-4 Semanas Antes

**Revisão (50%)**:
- [ ] Revisar todos os tópicos
- [ ] Refazer problemas difíceis
- [ ] Identificar pontos fracos

**Behavioral (30%)**:
- [ ] Preparar histórias STAR
- [ ] Praticar respostas
- [ ] Pesquisar sobre a empresa

**Mock Interviews (20%)**:
- [ ] 2-3 mock interviews por semana
- [ ] Com amigos ou plataformas
- [ ] Gravar e revisar

### 1 Semana Antes

**Revisão Final (60%)**:
- [ ] Revisar anotações
- [ ] Problemas fáceis para confiança
- [ ] Padrões comuns

**Preparação Mental (40%)**:
- [ ] Descansar bem
- [ ] Exercícios físicos
- [ ] Mindfulness/meditação

## 🧠 Estruturas de Dados Essenciais

### 1. Arrays e Strings

**Conceitos**:
- Two pointers
- Sliding window
- Prefix sum

**Problemas Clássicos**:
```python
# Two Sum
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Longest Substring Without Repeating Characters
def length_of_longest_substring(s):
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    
    return max_length
```

### 2. Linked Lists

**Conceitos**:
- Fast & slow pointers
- Reversão
- Merge

**Problemas Clássicos**:
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Reverse Linked List
def reverse_list(head):
    prev = None
    current = head
    
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    
    return prev

# Detect Cycle
def has_cycle(head):
    slow = fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            return True
    
    return False

# Merge Two Sorted Lists
def merge_two_lists(l1, l2):
    dummy = ListNode(0)
    current = dummy
    
    while l1 and l2:
        if l1.val < l2.val:
            current.next = l1
            l1 = l1.next
        else:
            current.next = l2
            l2 = l2.next
        current = current.next
    
    current.next = l1 or l2
    return dummy.next
```

### 3. Trees

**Conceitos**:
- DFS (Pre/In/Post-order)
- BFS (Level-order)
- BST properties

**Problemas Clássicos**:
```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Maximum Depth
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

# Validate BST
def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')):
    if not root:
        return True
    
    if root.val <= min_val or root.val >= max_val:
        return False
    
    return (is_valid_bst(root.left, min_val, root.val) and
            is_valid_bst(root.right, root.val, max_val))

# Level Order Traversal
def level_order(root):
    if not root:
        return []
    
    result = []
    queue = [root]
    
    while queue:
        level = []
        level_size = len(queue)
        
        for _ in range(level_size):
            node = queue.pop(0)
            level.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(level)
    
    return result
```

### 4. Graphs

**Conceitos**:
- DFS/BFS
- Topological sort
- Shortest path (Dijkstra, Bellman-Ford)
- Union-Find

**Problemas Clássicos**:
```python
# Number of Islands (DFS)
def num_islands(grid):
    if not grid:
        return 0
    
    count = 0
    
    def dfs(i, j):
        if (i < 0 or i >= len(grid) or 
            j < 0 or j >= len(grid[0]) or 
            grid[i][j] != '1'):
            return
        
        grid[i][j] = '0'  # Mark as visited
        
        dfs(i+1, j)
        dfs(i-1, j)
        dfs(i, j+1)
        dfs(i, j-1)
    
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == '1':
                count += 1
                dfs(i, j)
    
    return count

# Course Schedule (Topological Sort)
def can_finish(num_courses, prerequisites):
    graph = {i: [] for i in range(num_courses)}
    in_degree = [0] * num_courses
    
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1
    
    queue = [i for i in range(num_courses) if in_degree[i] == 0]
    completed = 0
    
    while queue:
        course = queue.pop(0)
        completed += 1
        
        for next_course in graph[course]:
            in_degree[next_course] -= 1
            if in_degree[next_course] == 0:
                queue.append(next_course)
    
    return completed == num_courses
```

### 5. Dynamic Programming

**Padrões Comuns**:
- 0/1 Knapsack
- Unbounded Knapsack
- Fibonacci
- LCS/LIS

**Problemas Clássicos**:
```python
# Climbing Stairs
def climb_stairs(n):
    if n <= 2:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]

# Coin Change
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1

# Longest Common Subsequence
def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]
```

## 🎤 Behavioral Interview

### Framework STAR

**S**ituation: Contexto
**T**ask: Desafio/objetivo
**A**ction: O que você fez
**R**esult: Resultado/aprendizado

### Perguntas Comuns

**1. "Conte sobre um projeto desafiador"**

Exemplo de resposta:
```
Situation: No meu último projeto, precisávamos migrar um monolito 
para microserviços sem downtime.

Task: Eu era responsável por arquitetar a solução e liderar a 
implementação, garantindo zero impacto para os usuários.

Action: 
- Desenhei uma arquitetura de strangler pattern
- Implementei feature flags para rollout gradual
- Criei testes de integração abrangentes
- Coordenei com 3 times diferentes

Result: 
- Migração completa em 6 meses
- Zero downtime
- Redução de 40% no tempo de deploy
- Aprendi muito sobre arquitetura distribuída
```

**2. "Descreva um conflito com colega"**

**3. "Como você lida com prazos apertados?"**

**4. "Conte sobre uma vez que falhou"**

**5. "Por que quer trabalhar aqui?"**

### Perguntas para Fazer

**Sobre o time**:
- Como é a estrutura do time?
- Qual o processo de code review?
- Como vocês fazem deploy?

**Sobre a empresa**:
- Quais os maiores desafios técnicos?
- Como é a cultura de engenharia?
- Oportunidades de crescimento?

**Sobre o trabalho**:
- Como é um dia típico?
- Qual stack tecnológico?
- Como medem sucesso?

## 📝 Durante a Entrevista

### Coding Interview

**1. Entenda o Problema (5 min)**
```
- Leia com atenção
- Faça perguntas clarificadoras
- Confirme entendimento
- Discuta exemplos
```

**2. Planeje a Solução (5-10 min)**
```
- Pense em voz alta
- Discuta abordagens
- Analise complexidade
- Escolha melhor solução
```

**3. Implemente (20-25 min)**
```
- Escreva código limpo
- Use nomes descritivos
- Comente partes complexas
- Teste com exemplos
```

**4. Teste e Otimize (5-10 min)**
```
- Teste edge cases
- Verifique bugs
- Discuta otimizações
- Analise complexidade final
```

### System Design Interview

**1. Requisitos (10 min)**
```
- Funcionais
- Não-funcionais
- Escopo
- Estimativas
```

**2. High-Level Design (15 min)**
```
- Componentes principais
- Fluxo de dados
- APIs
- Diagrama
```

**3. Deep Dive (20 min)**
```
- Detalhes de componentes
- Banco de dados
- Cache
- Escalabilidade
```

**4. Discussão (10 min)**
```
- Trade-offs
- Gargalos
- Melhorias
- Monitoramento
```

## 🎯 Dicas Finais

### Do's ✅
- Pense em voz alta
- Faça perguntas
- Discuta trade-offs
- Seja honesto sobre o que não sabe
- Mostre entusiasmo
- Seja colaborativo

### Don'ts ❌
- Não fique em silêncio
- Não pule direto para código
- Não ignore edge cases
- Não seja arrogante
- Não desista fácil
- Não minta

### Checklist Pré-Entrevista

**Técnico**:
- [ ] Ambiente de código funcionando
- [ ] Internet estável
- [ ] Backup de internet (celular)
- [ ] Fones de ouvido testados

**Mental**:
- [ ] Dormiu bem
- [ ] Comeu bem
- [ ] Hidratado
- [ ] Calmo e confiante

**Logística**:
- [ ] Link da entrevista salvo
- [ ] Currículo revisado
- [ ] Perguntas preparadas
- [ ] 10 min de antecedência

## 📚 Recursos de Estudo

### Plataformas de Prática
- **LeetCode**: Algoritmos e estruturas de dados
- **HackerRank**: Desafios variados
- **CodeSignal**: Avaliações técnicas
- **Pramp**: Mock interviews gratuitas
- **Interviewing.io**: Mock interviews com engenheiros

### Livros
- "Cracking the Coding Interview" - Gayle McDowell
- "Elements of Programming Interviews" - Aziz, Lee, Prakash
- "System Design Interview" - Alex Xu
- "Designing Data-Intensive Applications" - Martin Kleppmann

### Cursos
- [Grokking the Coding Interview](https://www.educative.io/courses/grokking-the-coding-interview)
- [Grokking the System Design Interview](https://www.educative.io/courses/grokking-the-system-design-interview)
- [AlgoExpert](https://www.algoexpert.io/)

### YouTube
- **NeetCode**: Explicações detalhadas de problemas
- **Tech Dummies**: System design
- **Gaurav Sen**: Arquitetura de sistemas
- **Back To Back SWE**: Algoritmos

## 🏆 Empresas e Seus Focos

### FAANG

**Google**:
- Algoritmos complexos
- System design escalável
- Googleyness (cultura)

**Amazon**:
- Leadership principles
- Behavioral forte
- System design prático

**Meta (Facebook)**:
- Coding rápido
- Product sense
- System design

**Apple**:
- Detalhes de implementação
- Performance
- Design patterns

**Netflix**:
- Autonomia
- Contexto sobre controle
- Experiência relevante

### Unicórnios Brasileiros

**Nubank**:
- Functional programming (Clojure)
- Microserviços
- Cultura forte

**Stone**:
- Sistemas distribuídos
- Alta disponibilidade
- Fintech experience

**iFood**:
- Escalabilidade
- Real-time systems
- Mobile

**Mercado Livre**:
- E-commerce scale
- Distributed systems
- Java/Go

## 📊 Estatísticas e Expectativas

### Taxa de Aprovação
- FAANG: 1-3%
- Unicórnios: 5-10%
- Startups: 10-20%

### Número de Entrevistas
- Screening: 1
- Technical: 2-4
- System Design: 1-2
- Behavioral: 1-2
- Onsite: 4-6 rounds

### Timeline Típico
- Aplicação → Resposta: 1-2 semanas
- Screening → Technical: 1 semana
- Technical → Onsite: 2-3 semanas
- Onsite → Oferta: 1-2 semanas
- **Total**: 1-2 meses

## 🎓 Conclusão

Preparação para entrevistas técnicas é uma maratona, não uma corrida. Seja consistente, pratique regularmente e não desanime com rejeições. Cada entrevista é uma oportunidade de aprendizado.

**Lembre-se**: Você não precisa ser perfeito. Você precisa demonstrar:
- Capacidade de resolver problemas
- Comunicação clara
- Vontade de aprender
- Fit cultural

Boa sorte! 🚀
