# Chat Application - Sistema de Chat em Tempo Real

## 🎯 Por Que Este Desafio?

Chat em tempo real é um dos desafios mais completos porque testa:

1. **WebSockets**: Comunicação bidirecional em tempo real
2. **Arquitetura**: Design de sistemas distribuídos
3. **Escalabilidade**: Milhares de conexões simultâneas
4. **Estado**: Sincronização entre clientes
5. **Full Stack**: Backend + Frontend + Infraestrutura

**Empresas que usam**: Slack, Discord, WhatsApp, Telegram, Microsoft Teams

## 📋 Requisitos

### Funcionais
- Enviar e receber mensagens em tempo real
- Múltiplas salas/canais
- Indicador de "digitando..."
- Histórico de mensagens
- Notificações
- Presença online/offline
- Mensagens não lidas

### Não-Funcionais
- Latência < 100ms
- Suportar 10k+ usuários simultâneos
- Mensagens persistidas
- Reconexão automática
- Funcionar offline (queue)

## 🧠 Conceitos Avaliados

- **WebSockets**: Socket.io, WS
- **Pub/Sub**: Redis, RabbitMQ
- **Banco de Dados**: MongoDB, PostgreSQL
- **Caching**: Redis
- **Autenticação**: JWT, Sessions
- **Escalabilidade**: Load balancing, horizontal scaling

## 💡 Soluções

### Solução 1: Básica (Node.js + Socket.io)

**Backend**:
```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// MongoDB Schema
const messageSchema = new mongoose.Schema({
  room: String,
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Conecta MongoDB
mongoose.connect('mongodb://localhost/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Armazena usuários online
const users = new Map();

io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id);

  // Usuário entra em uma sala
  socket.on('join-room', async ({ room, username }) => {
    socket.join(room);
    
    users.set(socket.id, { username, room });
    
    // Notifica outros usuários
    socket.to(room).emit('user-joined', {
      username,
      timestamp: new Date()
    });

    // Envia histórico de mensagens
    const messages = await Message.find({ room })
      .sort({ timestamp: -1 })
      .limit(50);
    
    socket.emit('message-history', messages.reverse());

    // Atualiza lista de usuários online
    const roomUsers = Array.from(users.values())
      .filter(user => user.room === room)
      .map(user => user.username);
    
    io.to(room).emit('users-online', roomUsers);
  });

  // Recebe mensagem
  socket.on('send-message', async ({ room, message }) => {
    const user = users.get(socket.id);
    
    if (!user) return;

    // Salva no banco
    const newMessage = new Message({
      room,
      username: user.username,
      message
    });
    
    await newMessage.save();

    // Envia para todos na sala
    io.to(room).emit('receive-message', {
      id: newMessage._id,
      username: user.username,
      message,
      timestamp: newMessage.timestamp
    });
  });

  // Usuário está digitando
  socket.on('typing', ({ room }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(room).emit('user-typing', user.username);
    }
  });

  socket.on('stop-typing', ({ room }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(room).emit('user-stop-typing', user.username);
    }
  });

  // Desconexão
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user) {
      socket.to(user.room).emit('user-left', {
        username: user.username,
        timestamp: new Date()
      });

      users.delete(socket.id);

      // Atualiza lista de usuários
      const roomUsers = Array.from(users.values())
        .filter(u => u.room === user.room)
        .map(u => u.username);
      
      io.to(user.room).emit('users-online', roomUsers);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

**Frontend (React)**:
```jsx
// ChatApp.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './ChatApp.css';

function ChatApp() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [usersOnline, setUsersOnline] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('message-history', (history) => {
      setMessages(history);
    });

    socket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user-joined', ({ username }) => {
      setMessages(prev => [...prev, {
        type: 'system',
        message: `${username} entrou na sala`
      }]);
    });

    socket.on('user-left', ({ username }) => {
      setMessages(prev => [...prev, {
        type: 'system',
        message: `${username} saiu da sala`
      }]);
    });

    socket.on('users-online', (users) => {
      setUsersOnline(users);
    });

    socket.on('user-typing', (username) => {
      setTypingUsers(prev => {
        if (!prev.includes(username)) {
          return [...prev, username];
        }
        return prev;
      });
    });

    socket.on('user-stop-typing', (username) => {
      setTypingUsers(prev => prev.filter(u => u !== username));
    });

    return () => {
      socket.off('message-history');
      socket.off('receive-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('users-online');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinRoom = (e) => {
    e.preventDefault();
    if (username && room && socket) {
      socket.emit('join-room', { room, username });
      setJoined(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() && socket) {
      socket.emit('send-message', {
        room,
        message: inputMessage
      });
      
      setInputMessage('');
      socket.emit('stop-typing', { room });
    }
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);

    if (!socket) return;

    socket.emit('typing', { room });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { room });
    }, 1000);
  };

  if (!joined) {
    return (
      <div className="join-container">
        <form onSubmit={joinRoom} className="join-form">
          <h2>Entrar no Chat</h2>
          <input
            type="text"
            placeholder="Seu nome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Nome da sala"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h3>Sala: {room}</h3>
        <div className="users-online">
          <h4>Online ({usersOnline.length})</h4>
          <ul>
            {usersOnline.map((user, index) => (
              <li key={index}>
                <span className="online-indicator"></span>
                {user}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="chat-main">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.type === 'system' ? 'system-message' : ''} ${
                msg.username === username ? 'own-message' : ''
              }`}
            >
              {msg.type !== 'system' && (
                <>
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </>
              )}
              {msg.type === 'system' && (
                <div className="system-message-content">{msg.message}</div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} digitando...
          </div>
        )}

        <form onSubmit={sendMessage} className="message-form">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={inputMessage}
            onChange={handleTyping}
            autoFocus
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}

export default ChatApp;
```

**CSS**:
```css
/* ChatApp.css */
.chat-container {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 20px;
}

.sidebar h3 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #34495e;
}

.users-online ul {
  list-style: none;
  padding: 0;
}

.users-online li {
  padding: 8px 0;
  display: flex;
  align-items: center;
}

.online-indicator {
  width: 8px;
  height: 8px;
  background: #2ecc71;
  border-radius: 50%;
  margin-right: 8px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ecf0f1;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  max-width: 70%;
}

.own-message {
  margin-left: auto;
  background: #3498db;
  color: white;
}

.system-message {
  text-align: center;
  background: transparent;
  color: #7f8c8d;
  font-style: italic;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.message-username {
  font-weight: bold;
}

.message-time {
  color: #95a5a6;
}

.typing-indicator {
  padding: 8px 20px;
  color: #7f8c8d;
  font-style: italic;
  font-size: 14px;
}

.message-form {
  display: flex;
  padding: 20px;
  background: white;
  border-top: 1px solid #bdc3c7;
}

.message-form input {
  flex: 1;
  padding: 12px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 14px;
}

.message-form button {
  margin-left: 10px;
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.message-form button:hover {
  background: #2980b9;
}

.join-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #ecf0f1;
}

.join-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 300px;
}

.join-form h2 {
  margin-top: 0;
  text-align: center;
}

.join-form input {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  box-sizing: border-box;
}

.join-form button {
  width: 100%;
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
```

---

### Solução 2: Escalável (Redis Pub/Sub + Microserviços)

**Arquitetura**:
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client 1  │────▶│  Server 1   │────▶│             │
└─────────────┘     └─────────────┘     │             │
                                         │   Redis     │
┌─────────────┐     ┌─────────────┐     │   Pub/Sub   │
│   Client 2  │────▶│  Server 2   │────▶│             │
└─────────────┘     └─────────────┘     │             │
                                         └─────────────┘
┌─────────────┐     ┌─────────────┐            │
│   Client 3  │────▶│  Server 3   │────────────┘
└─────────────┘     └─────────────┘
```

**Backend com Redis**:
```javascript
// server-scalable.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Redis clients
const pubClient = redis.createClient({ host: 'localhost', port: 6379 });
const subClient = pubClient.duplicate();

// Conecta Redis Adapter
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log('Redis adapter conectado');
});

// Cache de presença
const presenceCache = redis.createClient();
presenceCache.connect();

io.on('connection', (socket) => {
  socket.on('join-room', async ({ room, username, userId }) => {
    socket.join(room);
    socket.userId = userId;
    socket.username = username;
    socket.room = room;

    // Adiciona ao cache de presença
    await presenceCache.sAdd(`room:${room}:users`, userId);
    await presenceCache.hSet(`user:${userId}`, {
      username,
      room,
      socketId: socket.id,
      lastSeen: Date.now()
    });

    // Publica evento de entrada
    await pubClient.publish('chat:events', JSON.stringify({
      type: 'user-joined',
      room,
      username,
      userId,
      timestamp: Date.now()
    }));

    // Busca histórico do MongoDB
    const messages = await getMessageHistory(room);
    socket.emit('message-history', messages);

    // Envia lista de usuários online
    const onlineUsers = await getOnlineUsers(room);
    io.to(room).emit('users-online', onlineUsers);
  });

  socket.on('send-message', async ({ room, message }) => {
    const messageData = {
      id: generateId(),
      room,
      userId: socket.userId,
      username: socket.username,
      message,
      timestamp: Date.now()
    };

    // Salva no MongoDB (assíncrono)
    saveMessage(messageData);

    // Publica no Redis para todos os servidores
    await pubClient.publish(`chat:room:${room}`, JSON.stringify({
      type: 'message',
      data: messageData
    }));
  });

  socket.on('disconnect', async () => {
    if (socket.room && socket.userId) {
      await presenceCache.sRem(`room:${socket.room}:users`, socket.userId);
      await presenceCache.del(`user:${socket.userId}`);

      await pubClient.publish('chat:events', JSON.stringify({
        type: 'user-left',
        room: socket.room,
        username: socket.username,
        userId: socket.userId,
        timestamp: Date.now()
      }));
    }
  });
});

// Subscreve aos eventos do Redis
subClient.subscribe('chat:events', (message) => {
  const event = JSON.parse(message);
  
  switch(event.type) {
    case 'user-joined':
      io.to(event.room).emit('user-joined', event);
      break;
    case 'user-left':
      io.to(event.room).emit('user-left', event);
      break;
  }
});

// Subscreve às mensagens de todas as salas
subClient.pSubscribe('chat:room:*', (message, channel) => {
  const data = JSON.parse(message);
  const room = channel.split(':')[2];
  
  io.to(room).emit('receive-message', data.data);
});

server.listen(3001);
```

## 📊 Comparação de Soluções

| Aspecto | Básica | Escalável |
|---------|--------|-----------|
| Complexidade | Baixa | Alta |
| Escalabilidade | 1 servidor | Múltiplos servidores |
| Latência | ~50ms | ~30ms |
| Custo | $ | $$$ |
| Manutenção | Fácil | Complexa |

## 🤔 Perguntas Comuns

1. **Como escalar para milhões de usuários?**
   - Redis Pub/Sub para sincronização
   - Load balancer (Nginx, HAProxy)
   - Sharding por sala
   - CDN para assets

2. **Como garantir entrega de mensagens?**
   - Acknowledgments
   - Message queue (RabbitMQ)
   - Retry logic
   - Offline queue no cliente

3. **Como implementar criptografia end-to-end?**
   - Signal Protocol
   - Chaves públicas/privadas
   - Key exchange

4. **Como lidar com reconexão?**
   - Exponential backoff
   - Sincronização de estado
   - Message deduplication

## 🎯 Dicas para a Entrevista

1. **Comece simples**: Implemente funcionalidade básica primeiro
2. **Discuta escalabilidade**: Mostre que pensa em crescimento
3. **Considere edge cases**: Desconexões, mensagens duplicadas
4. **Pense em UX**: Loading states, otimistic updates
5. **Segurança**: Autenticação, rate limiting, sanitização

## 📚 Recursos

- [Socket.io Documentation](https://socket.io/docs/)
- [Scaling WebSockets](https://www.ably.io/topic/websockets-scaling)
- [Redis Pub/Sub](https://redis.io/topics/pubsub)
- [Building Real-time Apps](https://www.pubnub.com/guides/websockets/)
