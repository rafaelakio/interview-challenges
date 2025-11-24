# Infinite Scroll - Scroll Infinito com Virtualização

## 🎯 Por Que Este Desafio?

Infinite scroll é essencial para:

1. **Performance**: Renderizar milhares de itens sem travar
2. **UX**: Experiência fluida sem paginação
3. **Mobile**: Padrão em apps mobile
4. **Otimização**: Lazy loading de recursos

**Empresas que usam**: Twitter, Instagram, Facebook, Pinterest, LinkedIn

## 📋 Requisitos

### Funcionais
- Carregar mais itens ao chegar no fim da lista
- Loading indicator durante carregamento
- Tratamento de erros
- Pull-to-refresh (opcional)
- Scroll para posição específica

### Não-Funcionais
- Smooth scrolling (60fps)
- Baixo uso de memória
- Funcionar com 10k+ itens
- Acessibilidade (keyboard navigation)

## 🧠 Conceitos Avaliados

- **Performance**: Virtual scrolling, memoization
- **React Hooks**: useEffect, useCallback, useRef
- **Intersection Observer API**: Detecção de visibilidade
- **Estado**: Gerenciamento de lista infinita
- **Debouncing/Throttling**: Otimização de eventos

## 💡 Soluções

### Solução 1: Básica (Scroll Event)

**Abordagem**: Detectar scroll e carregar mais itens

```jsx
// React básico
import React, { useState, useEffect } from 'react';

function InfiniteScrollBasic() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = async (pageNum) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items?page=${pageNum}&limit=20`);
      const data = await response.json();
      
      setItems(prev => [...prev, ...data.items]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  const handleScroll = () => {
    // Verifica se chegou perto do fim
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100 && !loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="infinite-scroll">
      <div className="items-list">
        {items.map((item, index) => (
          <div key={item.id || index} className="item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      )}
      
      {!hasMore && (
        <div className="end-message">
          Você chegou ao fim!
        </div>
      )}
    </div>
  );
}

export default InfiniteScrollBasic;
```

**CSS**:
```css
.infinite-scroll {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.item {
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.loading {
  text-align: center;
  padding: 20px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**Prós**:
- Simples de implementar
- Funciona em todos os browsers

**Contras**:
- Performance ruim com muitos itens
- Scroll event dispara muito
- Alto uso de memória

---

### Solução 2: Intersection Observer

**Abordagem**: Usar Intersection Observer API para detectar visibilidade

```jsx
// React com Intersection Observer
import React, { useState, useEffect, useRef, useCallback } from 'react';

function InfiniteScrollObserver() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const observer = useRef();
  const lastItemRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px' // Carrega antes de chegar no fim
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchItems = async (pageNum) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/items?page=${pageNum}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      
      setItems(prev => {
        // Remove duplicatas
        const newItems = data.items.filter(
          newItem => !prev.some(item => item.id === newItem.id)
        );
        return [...prev, ...newItems];
      });
      
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  const retry = () => {
    setError(null);
    fetchItems(page);
  };

  return (
    <div className="infinite-scroll">
      <div className="items-list">
        {items.map((item, index) => {
          // Adiciona ref ao último item
          if (items.length === index + 1) {
            return (
              <div ref={lastItemRef} key={item.id} className="item">
                <ItemCard item={item} />
              </div>
            );
          }
          
          return (
            <div key={item.id} className="item">
              <ItemCard item={item} />
            </div>
          );
        })}
      </div>

      {loading && <LoadingSpinner />}
      
      {error && (
        <div className="error">
          <p>Erro ao carregar itens: {error}</p>
          <button onClick={retry}>Tentar novamente</button>
        </div>
      )}
      
      {!hasMore && !loading && (
        <div className="end-message">
          Você chegou ao fim!
        </div>
      )}
    </div>
  );
}

// Componente otimizado com memo
const ItemCard = React.memo(({ item }) => (
  <>
    <img src={item.image} alt={item.title} loading="lazy" />
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </>
));

const LoadingSpinner = () => (
  <div className="loading">
    <div className="spinner"></div>
    <p>Carregando mais itens...</p>
  </div>
);

export default InfiniteScrollObserver;
```

**Prós**:
- Melhor performance
- Não dispara constantemente
- API moderna e eficiente

**Contras**:
- Ainda renderiza todos os itens
- Memória cresce indefinidamente

---

### Solução 3: Virtual Scrolling (Avançado)

**Abordagem**: Renderizar apenas itens visíveis

```jsx
// React com Virtual Scrolling
import React, { useState, useEffect, useRef, useMemo } from 'react';

function VirtualInfiniteScroll({ itemHeight = 100, containerHeight = 600 }) {
  const [items, setItems] = useState([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const containerRef = useRef();

  // Calcula quais itens devem ser renderizados
  const { visibleItems, offsetY, totalHeight } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    // Renderiza alguns itens extras para suavizar
    const overscan = 3;
    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(items.length, endIndex + overscan);
    
    return {
      visibleItems: items.slice(start, end).map((item, index) => ({
        ...item,
        index: start + index
      })),
      offsetY: start * itemHeight,
      totalHeight: items.length * itemHeight
    };
  }, [items, scrollTop, itemHeight, containerHeight]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setScrollTop(scrollTop);

    // Carrega mais quando chega perto do fim
    if (scrollTop + clientHeight >= scrollHeight - 200 && !loading && hasMore) {
      loadMore();
    }
  };

  const loadMore = async () => {
    setLoading(true);
    
    try {
      const page = Math.floor(items.length / 20) + 1;
      const response = await fetch(`/api/items?page=${page}&limit=20`);
      const data = await response.json();
      
      setItems(prev => [...prev, ...data.items]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <div
      ref={containerRef}
      className="virtual-scroll-container"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(item => (
            <div
              key={item.id}
              className="virtual-item"
              style={{ height: itemHeight }}
            >
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      </div>
      
      {loading && <LoadingSpinner />}
    </div>
  );
}

export default VirtualInfiniteScroll;
```

---

### Solução 4: React Window (Biblioteca)

**Abordagem**: Usar biblioteca otimizada

```jsx
// React com react-window
import React, { useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';

function InfiniteScrollReactWindow() {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMoreItems = async (startIndex, stopIndex) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const page = Math.floor(startIndex / 20) + 1;
      const response = await fetch(`/api/items?page=${page}&limit=20`);
      const data = await response.json();
      
      setItems(prev => {
        const newItems = [...prev];
        data.items.forEach((item, index) => {
          newItems[startIndex + index] = item;
        });
        return newItems;
      });
      
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  };

  const isItemLoaded = index => !!items[index];

  const itemCount = hasMore ? items.length + 1 : items.length;

  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="loading-item">
          Carregando...
        </div>
      );
    }

    const item = items[index];
    
    return (
      <div style={style} className="virtual-item">
        <ItemCard item={item} />
      </div>
    );
  };

  return (
    <div style={{ height: '100vh' }}>
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
            threshold={5}
          >
            {({ onItemsRendered, ref }) => (
              <List
                height={height}
                itemCount={itemCount}
                itemSize={120}
                onItemsRendered={onItemsRendered}
                ref={ref}
                width={width}
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
}

export default InfiniteScrollReactWindow;
```

**Prós**:
- Performance excelente
- Suporta milhões de itens
- Bem testado e mantido

**Contras**:
- Dependência externa
- Menos controle

## 📊 Comparação de Soluções

| Solução | Performance | Memória | Complexidade | Itens Suportados |
|---------|-------------|---------|--------------|------------------|
| Scroll Event | Ruim | Alta | Baixa | ~1000 |
| Intersection Observer | Boa | Alta | Média | ~5000 |
| Virtual Scroll | Excelente | Baixa | Alta | Ilimitado |
| React Window | Excelente | Baixa | Baixa | Ilimitado |

## 🤔 Perguntas Comuns do Entrevistador

1. **Como otimizar performance com muitos itens?**
   - Virtual scrolling
   - Memoization (React.memo)
   - Lazy loading de imagens

2. **Como lidar com itens de altura variável?**
   - Usar VariableSizeList do react-window
   - Calcular altura dinamicamente
   - Cache de alturas

3. **Como implementar scroll para posição específica?**
   - Guardar posição no estado
   - scrollToIndex/scrollToItem
   - Restaurar ao voltar

4. **Como fazer pull-to-refresh?**
   - Detectar scroll negativo
   - Touch events
   - Bibliotecas como react-pull-to-refresh

5. **Como garantir acessibilidade?**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

## 🎯 Dicas para a Entrevista

1. **Comece simples**: Implemente scroll básico primeiro
2. **Discuta performance**: Mostre que entende os problemas
3. **Considere UX**: Loading states, erros, fim da lista
4. **Pense em edge cases**: Rede lenta, erros, lista vazia
5. **Otimização progressiva**: Adicione features incrementalmente

## 📚 Recursos Adicionais

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Window](https://react-window.vercel.app/)
- [Virtual Scrolling Guide](https://web.dev/virtualize-long-lists-react-window/)
- [Infinite Scroll Best Practices](https://www.smashingmagazine.com/2013/05/infinite-scrolling-lets-get-to-the-bottom-of-this/)
