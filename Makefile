.PHONY: install test lint format clean help

help:
	@echo "Available targets:"
	@echo "  install  - Instala dependências (npm install)"
	@echo "  test     - Executa a suíte de testes (jest)"
	@echo "  lint     - Executa o linter (eslint)"
	@echo "  format   - Formata o código (prettier)"
	@echo "  clean    - Remove node_modules e artefatos de build"

install:
	npm install

test:
	npm test

lint:
	npm run lint --if-present

format:
	npm run format --if-present

clean:
	rm -rf node_modules coverage .cache
