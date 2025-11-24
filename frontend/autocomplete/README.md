# Autocomplete - Sistema de Autocompletar

## 🎯 Por Que Este Desafio?

Autocomplete testa:

1. **Debouncing**: Otimização de requisições
2. **Performance**: Busca e filtragem eficiente
3. **UX**: Feedback instantâneo e navegação por teclado
4. **Estado**: Gerenciamento de estado assíncrono

**Empresas que usam**: Google, Amazon, Airbnb, Uber

## 📋 Requisitos

### Funcionais
- Sugestões enquanto digita
- Navegação por teclado (↑↓ Enter Esc)
- Highlight do termo buscado
- Seleção de sugestão
- Histórico de buscas

### Não-Funcionais
- Debounce de 300ms
- Máximo 10 sugestões
- Acessível (ARIA)
- Funcionar offline (cache)

## 💡 Soluções

### Solução 1: Básica (Vanilla JS)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .autocomplete-container {
      position: relative;
      width: 400px;
    }

    .autocomplete-input {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #ddd;
      border-radius: 4px;
    }

    .autocomplete-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-top: none;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .suggestion-item {
      padding: 12px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
    }

    .suggestion-item:hover,
    .suggestion-item.active {
      background: #f5f5f5;
    }

    .highlight {
      font-weight: bold;
      color: #1a73e8;
    }
  </style>
</head>
<body>
  <div class="autocomplete-container">
    <input
      type="text"
      class="autocomplete-input"
      placeholder="Buscar..."
      aria-label="Campo de busca"
      aria-autocomplete="list"
      aria-controls="suggestions"
    />
    <div id="suggestions" class="autocomplete-suggestions" role="listbox"></div>
  </div>

  <script>
    class Autocomplete {
      constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.suggestionsContainer = document.getElementById('suggestions');
        this.debounceTime = options.debounceTime || 300;
        this.minChars = options.minChars || 2;
        this.fetchSuggestions = options.fetchSuggestions;
        
        this.currentFocus = -1;
        this.suggestions = [];
        this.debounceTimer = null;
        
        this.init();
      }

      init() {
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        document.addEventListener('click', (e) => this.handleClickOutside(e));
      }

      handleInput(e) {
        const value = e.target.value.trim();
        
        clearTimeout(this.debounceTimer);
        
        if (value.length < this.minChars) {
          this.hideSuggestions();
          return;
        }

        this.debounceTimer = setTimeout(() => {
          this.search(value);
        }, this.debounceTime);
      }

      async search(query) {
        try {
          this.suggestions = await this.fetchSuggestions(query);
          this.renderSuggestions(query);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }

      renderSuggestions(query) {
        if (this.suggestions.length === 0) {
          this.hideSuggestions();
          return;
        }

        const html = this.suggestions
          .map((suggestion, index) => {
            const highlighted = this.highlightMatch(suggestion, query);
            return `
              <div 
                class="suggestion-item" 
                role="option"
                data-index="${index}"
                aria-selected="false"
              >
                ${highlighted}
              </div>
            `;
          })
          .join('');

        this.suggestionsContainer.innerHTML = html;
        this.suggestionsContainer.style.display = 'block';
        
        // Adiciona event listeners
        this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', () => this.selectSuggestion(item.dataset.index));
        });
      }

      highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
      }

      handleKeydown(e) {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (items.length === 0) return;

        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            this.currentFocus++;
            if (this.currentFocus >= items.length) this.currentFocus = 0;
            this.setActive(items);
            break;
            
          case 'ArrowUp':
            e.preventDefault();
            this.currentFocus--;
            if (this.currentFocus < 0) this.currentFocus = items.length - 1;
            this.setActive(items);
            break;
            
          case 'Enter':
            e.preventDefault();
            if (this.currentFocus > -1) {
              this.selectSuggestion(this.currentFocus);
            }
            break;
            
          case 'Escape':
            this.hideSuggestions();
            break;
        }
      }

      setActive(items) {
        items.forEach((item, index) => {
          item.classList.toggle('active', index === this.currentFocus);
          item.setAttribute('aria-selected', index === this.currentFocus);
        });
      }

      selectSuggestion(index) {
        this.input.value = this.suggestions[index];
        this.hideSuggestions();
        this.input.dispatchEvent(new Event('autocomplete-select', {
          detail: { value: this.suggestions[index] }
        }));
      }

      hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
        this.suggestionsContainer.innerHTML = '';
        this.currentFocus = -1;
      }

      handleClickOutside(e) {
        if (!this.input.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
          this.hideSuggestions();
        }
      }
    }

    // Uso
    const input = document.querySelector('.autocomplete-input');
    
    const autocomplete = new Autocomplete(input, {
      debounceTime: 300,
      minChars: 2,
      fetchSuggestions: async (query) => {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.suggestions;
      }
    });

    // Listener para seleção
    input.addEventListener('autocomplete-select', (e) => {
      console.log('Selected:', e.detail.value);
    });
  </script>
</body>
</html>
```

---

### Solução 2: React com Hooks

```jsx
// React Autocomplete
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Autocomplete.css';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function Autocomplete({ 
  fetchSuggestions, 
  onSelect,
  placeholder = 'Buscar...',
  debounceTime = 300,
  minChars = 2
}) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const debouncedValue = useDebounce(inputValue, debounceTime);

  // Busca sugestões
  useEffect(() => {
    if (debouncedValue.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const searchSuggestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await fetchSuggestions(debouncedValue);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        setError('Erro ao buscar sugestões');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchSuggestions();
  }, [debouncedValue, fetchSuggestions, minChars]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  const selectSuggestion = useCallback((suggestion) => {
    setInputValue(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(suggestion);
  }, [onSelect]);

  const highlightMatch = (text, query) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={index} className="highlight">{part}</strong>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Scroll para item selecionado
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="autocomplete">
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="autocomplete-input"
          aria-label="Campo de busca"
          aria-autocomplete="list"
          aria-controls="autocomplete-suggestions"
          aria-expanded={isOpen}
        />
        
        {isLoading && (
          <div className="autocomplete-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <ul
          id="autocomplete-suggestions"
          ref={suggestionsRef}
          className="autocomplete-suggestions"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => selectSuggestion(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {highlightMatch(suggestion, inputValue)}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <div className="autocomplete-error">{error}</div>
      )}
    </div>
  );
}

export default Autocomplete;

// Exemplo de uso
function App() {
  const fetchSuggestions = async (query) => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.suggestions;
  };

  const handleSelect = (value) => {
    console.log('Selecionado:', value);
  };

  return (
    <div className="app">
      <h1>Busca</h1>
      <Autocomplete
        fetchSuggestions={fetchSuggestions}
        onSelect={handleSelect}
        placeholder="Digite para buscar..."
      />
    </div>
  );
}
```

---

### Solução 3: Com Cache e Histórico

```typescript
// TypeScript com cache avançado
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface AutocompleteProps {
  fetchSuggestions: (query: string) => Promise<string[]>;
  onSelect?: (value: string) => void;
  cacheSize?: number;
  historySize?: number;
}

class SuggestionCache {
  private cache: Map<string, { data: string[]; timestamp: number }>;
  private maxSize: number;
  private ttl: number; // Time to live em ms

  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): string[] | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Verifica se expirou
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: string[]): void {
    // Remove entrada mais antiga se atingiu o limite
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

class SearchHistory {
  private history: string[];
  private maxSize: number;
  private storageKey: string;

  constructor(maxSize = 10, storageKey = 'search-history') {
    this.maxSize = maxSize;
    this.storageKey = storageKey;
    this.history = this.loadFromStorage();
  }

  add(query: string): void {
    // Remove duplicatas
    this.history = this.history.filter(item => item !== query);
    
    // Adiciona no início
    this.history.unshift(query);
    
    // Limita tamanho
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(0, this.maxSize);
    }
    
    this.saveToStorage();
  }

  get(): string[] {
    return [...this.history];
  }

  clear(): void {
    this.history = [];
    this.saveToStorage();
  }

  private loadFromStorage(): string[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }
}

function AdvancedAutocomplete({
  fetchSuggestions,
  onSelect,
  cacheSize = 100,
  historySize = 10
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const cacheRef = useRef(new SuggestionCache(cacheSize));
  const historyRef = useRef(new SearchHistory(historySize));
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    // Cancela requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Verifica cache
    const cached = cacheRef.current.get(query);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const results = await fetchSuggestions(query);
      
      // Salva no cache
      cacheRef.current.set(query, results);
      setSuggestions(results);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchSuggestions]);

  const handleSelect = (value: string) => {
    setInputValue(value);
    historyRef.current.add(value);
    setShowHistory(false);
    onSelect?.(value);
  };

  const handleFocus = () => {
    if (inputValue === '') {
      const history = historyRef.current.get();
      if (history.length > 0) {
        setSuggestions(history);
        setShowHistory(true);
      }
    }
  };

  return (
    <div className="advanced-autocomplete">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowHistory(false);
          if (e.target.value.length >= 2) {
            search(e.target.value);
          }
        }}
        onFocus={handleFocus}
        placeholder="Buscar..."
      />

      {isLoading && <div className="loading">Buscando...</div>}

      {suggestions.length > 0 && (
        <ul className="suggestions">
          {showHistory && (
            <li className="history-header">
              <span>Histórico</span>
              <button onClick={() => historyRef.current.clear()}>
                Limpar
              </button>
            </li>
          )}
          
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="suggestion-item"
            >
              {showHistory && <span className="history-icon">🕐</span>}
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdvancedAutocomplete;
```

## 📊 Comparação de Soluções

| Solução | Complexidade | Features | Performance | Acessibilidade |
|---------|--------------|----------|-------------|----------------|
| Vanilla JS | Média | Básicas | Boa | Boa |
| React Hooks | Média | Completas | Boa | Excelente |
| Com Cache | Alta | Avançadas | Excelente | Excelente |

## 🤔 Perguntas Comuns

1. **Por que usar debounce?**
   - Reduz requisições desnecessárias
   - Melhora performance
   - Economiza recursos do servidor

2. **Como lidar com requisições concorrentes?**
   - AbortController para cancelar
   - Ignorar respostas antigas
   - Request ID para ordenação

3. **Como implementar busca fuzzy?**
   - Algoritmo de Levenshtein distance
   - Bibliotecas como Fuse.js
   - Backend com Elasticsearch

4. **Como otimizar para mobile?**
   - Touch events
   - Teclado virtual
   - Viewport considerations

## 📚 Recursos

- [Debouncing and Throttling](https://css-tricks.com/debouncing-throttling-explained-examples/)
- [ARIA Autocomplete](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [React Autocomplete Libraries](https://github.com/downshift-js/downshift)
