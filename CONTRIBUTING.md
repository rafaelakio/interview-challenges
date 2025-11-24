# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o Interview Challenges! Este projeto é mantido pela comunidade e suas contribuições são muito bem-vindas.

## 📋 Como Contribuir

### 1. Reportar Bugs

Se você encontrou um bug:

1. Verifique se já não existe uma issue aberta
2. Crie uma nova issue com:
   - Título descritivo
   - Descrição detalhada do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)

### 2. Sugerir Melhorias

Para sugerir novas features ou melhorias:

1. Abra uma issue com tag `enhancement`
2. Descreva claramente a melhoria proposta
3. Explique por que seria útil
4. Forneça exemplos de uso

### 3. Adicionar Novos Desafios

Para adicionar um novo desafio:

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/novo-desafio`
3. Siga a estrutura padrão (veja abaixo)
4. Commit suas mudanças: `git commit -m 'Add: Novo desafio X'`
5. Push para a branch: `git push origin feature/novo-desafio`
6. Abra um Pull Request

#### Estrutura de um Desafio

```markdown
# Nome do Desafio

## 🎯 Por Que Este Desafio?

[Explicação da relevância do desafio]

**Empresas que usam**: [Lista de empresas]

## 📋 Requisitos

### Funcionais
- Requisito 1
- Requisito 2

### Não-Funcionais
- Performance
- Escalabilidade

## 🧠 Conceitos Avaliados

- Conceito 1
- Conceito 2

## 💡 Soluções

### Solução 1: Básica

[Código e explicação]

**Prós**:
- Pro 1

**Contras**:
- Contra 1

### Solução 2: Intermediária

[Código e explicação]

### Solução 3: Avançada

[Código e explicação]

## 📊 Comparação de Soluções

[Tabela comparativa]

## 🤔 Perguntas Comuns do Entrevistador

1. Pergunta 1
2. Pergunta 2

## 🎯 Dicas para a Entrevista

1. Dica 1
2. Dica 2

## 📚 Recursos Adicionais

- Link 1
- Link 2
```

### 4. Melhorar Soluções Existentes

Para melhorar uma solução existente:

1. Identifique o que pode ser melhorado
2. Implemente a melhoria
3. Adicione comentários explicativos
4. Atualize a documentação
5. Abra um Pull Request

### 5. Adicionar Implementações em Outras Linguagens

Aceitamos implementações em:
- JavaScript/TypeScript
- Python
- Go
- Java
- C++
- Rust
- Outras linguagens populares

## 📝 Padrões de Código

### JavaScript/TypeScript

```javascript
// Use camelCase para variáveis e funções
const myVariable = 'value';

function myFunction() {
  // Código bem comentado
  return result;
}

// Use classes quando apropriado
class MyClass {
  constructor() {
    // Inicialização
  }
}
```

### Python

```python
# Use snake_case para variáveis e funções
my_variable = 'value'

def my_function():
    """Docstring explicativa."""
    return result

# Use classes quando apropriado
class MyClass:
    def __init__(self):
        # Inicialização
        pass
```

### Go

```go
// Use camelCase para variáveis privadas
myVariable := "value"

// Use PascalCase para exportados
func MyFunction() {
    // Código bem comentado
}

// Structs bem documentados
type MyStruct struct {
    Field1 string
    Field2 int
}
```

## ✅ Checklist do Pull Request

Antes de submeter um PR, verifique:

- [ ] O código está bem formatado
- [ ] Há comentários explicativos
- [ ] A documentação está atualizada
- [ ] Não há erros de sintaxe
- [ ] O código segue os padrões do projeto
- [ ] Adicionei exemplos de uso
- [ ] Testei a implementação
- [ ] Atualizei o INDEX.md se necessário

## 🎨 Estilo de Documentação

### Títulos

```markdown
# Título Principal (H1)
## Seção (H2)
### Subseção (H3)
```

### Emojis

Use emojis para melhorar a legibilidade:

- 🎯 Objetivos/Por quê
- 📋 Requisitos/Listas
- 🧠 Conceitos/Conhecimento
- 💡 Soluções/Ideias
- 📊 Comparações/Dados
- 🤔 Perguntas/Dúvidas
- 🎯 Dicas/Sugestões
- 📚 Recursos/Links
- ⚠️ Avisos/Atenção
- ✅ Checklist/Confirmação
- ❌ Erros/Não fazer

### Code Blocks

Sempre especifique a linguagem:

````markdown
```javascript
const code = 'here';
```

```python
code = 'here'
```
````

## 🔍 Processo de Review

1. **Automated Checks**: Verificações automáticas de formatação
2. **Code Review**: Revisão por mantenedores
3. **Feedback**: Sugestões de melhoria
4. **Approval**: Aprovação e merge

## 🌟 Reconhecimento

Todos os contribuidores serão:
- Listados no README
- Mencionados no changelog
- Reconhecidos na comunidade

## 📞 Dúvidas?

- Abra uma issue com tag `question`
- Entre em contato via discussions
- Consulte a documentação existente

## 📜 Código de Conduta

### Nossos Padrões

**Comportamentos esperados**:
- Ser respeitoso e inclusivo
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade
- Mostrar empatia

**Comportamentos inaceitáveis**:
- Linguagem ofensiva ou discriminatória
- Assédio de qualquer tipo
- Ataques pessoais
- Comportamento não profissional

### Aplicação

Violações do código de conduta podem resultar em:
1. Aviso
2. Banimento temporário
3. Banimento permanente

## 🙏 Agradecimentos

Obrigado por contribuir para tornar este projeto melhor para toda a comunidade de desenvolvedores!

---

**Lembre-se**: Toda contribuição, por menor que seja, é valiosa! 🚀
