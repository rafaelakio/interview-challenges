# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o Interview Challenges! Este projeto é mantido pela comunidade e suas contribuições são muito bem-vindas.

## 📋 Como Contribuir

### 1. Reportar Bugs

Se você encontrou um bug, abra uma issue usando o template de **Bug Report** (`.github/ISSUE_TEMPLATE/bug_report.md`). Verifique antes se já não existe uma issue aberta para o mesmo problema.

### 2. Sugerir Melhorias

Para sugerir novas features ou melhorias, use o template de **Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.md`) e descreva claramente a melhoria proposta, a motivação e exemplos de uso.

### 3. Adicionar Novos Desafios

Para adicionar um novo desafio:

1. Fork do repositório
2. Crie uma branch seguindo a convenção (ver abaixo)
3. Siga a estrutura padrão dos desafios existentes
4. Abra um Pull Request preenchendo o template

## 🌿 Workflow de Branches

Use branches específicas para cada tipo de mudança e sempre faça merge via Pull Request em `main`.

- `feature/<nome-curto>` — novas funcionalidades e desafios
- `fix/<nome-curto>` — correções de bugs
- `chore/<nome-curto>` — manutenção, configuração, dependências
- `docs/<nome-curto>` — documentação

Fluxo:

1. Crie a branch a partir de `main` atualizado.
2. Faça commits pequenos e descritivos.
3. Abra um PR para `main`.
4. Aguarde revisão e CI.
5. Merge após aprovação.

## 📝 Conventional Commits

Todos os commits devem seguir [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/):

- `feat:` — nova feature
- `fix:` — correção de bug
- `chore:` — manutenção geral (dependências, configs)
- `docs:` — mudanças apenas em documentação
- `test:` — adicionar ou ajustar testes
- `refactor:` — refatoração sem mudança de comportamento
- `ci:` — mudanças em pipelines de CI/CD

Exemplos:

```
feat: adicionar solução LRU cache em Go
fix: corrigir typo no README do autocomplete
docs: atualizar QUICKSTART com instruções de testes
```

## 🔁 Processo de Code Review

- Todo PR exige **pelo menos 1 aprovação** antes de ser mergeado.
- O CI deve estar **verde** (todos os checks passando).
- Resolva todos os comentários da review antes do merge.
- Prefira squash merge para manter histórico limpo em `main`.

## 📬 Como Criar PRs

1. Dê um título descritivo seguindo Conventional Commits (ex: `feat: adicionar solução de rate limiter em Python`).
2. Preencha todo o template de PR (`.github/pull_request_template.md`).
3. Vincule a issue relacionada com `Closes #<número>`.
4. Adicione screenshots/GIFs para mudanças visuais.
5. Marque revisores e aguarde CI + review.

## 🔒 Branch Protection (instruções para admins)

Para garantir a qualidade de `main`, configure em **GitHub → Settings → Branches → Add rule** para o padrão `main`:

- ✅ **Require a pull request before merging**
  - Require approvals: **1**
  - Dismiss stale pull request approvals when new commits are pushed
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - Selecione os checks do workflow CI (ex.: `test (18.x)`, `test (20.x)`)
- ✅ **Require conversation resolution before merging**
- ✅ **Include administrators**
- ❌ **Allow force pushes** — desativado
- ❌ **Allow deletions** — desativado

## 🧪 Desenvolvimento Local

```bash
make install   # instala dependências
make test      # roda testes (jest)
make lint      # roda o linter
make format    # formata o código
```

Ou diretamente via npm:

```bash
npm install
npm test
npm run lint
npm run format
```

## 📚 Estrutura de um Desafio

```markdown
# Nome do Desafio

## 🎯 Por Que Este Desafio?
[Explicação da relevância]

**Empresas que usam**: [Lista]

## 📋 Requisitos
### Funcionais
- Requisito 1
### Não-Funcionais
- Performance / Escalabilidade

## 🧠 Conceitos Avaliados
- Conceito 1

## 💡 Soluções
### Solução 1: Básica
### Solução 2: Intermediária
### Solução 3: Avançada

## 📊 Comparação de Soluções
## 🤔 Perguntas Comuns do Entrevistador
## 🎯 Dicas para a Entrevista
## 📚 Recursos Adicionais
```

Obrigado pela contribuição! 🚀
