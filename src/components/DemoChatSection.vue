<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
}

// Chat state
const messages = ref<Message[]>([]);
const userInput = ref('');
const isTyping = ref(false);
const messageId = ref(0);
const audioRecording = ref(false);
const fileAttached = ref(false);
const fileAttachmentName = ref('');

// Example questions that appear as suggestion bubbles
const suggestions = [
  'Сколько стоит?',
  'Как работает?',
  'Можно оплатить картой?',
  'Какие сроки доставки?'
];

// Responses for the demo questions
const responseMap: Record<string, string> = {
  'сколько стоит': 'Базовый тариф Gneiro начинается от 1 900 ₽ в месяц. Для вашего бизнеса я рекомендую тариф "Бизнес" за 4 900 ₽/мес, который включает до 2000 диалогов и интеграцию с CRM.',
  'как работает': 'Gneiro подключается к вашему WhatsApp за 5 минут. Бот анализирует сообщения клиентов, моментально отвечает на вопросы, отправляет фото и документы. Вся информация о ваших товарах и услугах загружается автоматически с вашего сайта.',
  'можно оплатить картой': 'Да, вы можете оплатить подписку банковской картой, через СБП или безналичным расчетом для юридических лиц. Первые 7 дней — бесплатный пробный период без ограничений функционала.',
  'какие сроки доставки': 'Активация Gneiro происходит мгновенно после подключения. Если вы уже подготовили информацию о товарах, то настройка занимает не более 5 минут. Техподдержка доступна 24/7.',
  'default': 'Спасибо за ваш интерес! Мы можем рассказать подробнее о возможностях Gneiro для вашего бизнеса. Что именно вас интересует?'
};

// Get best matching response from predefined answers
const getBotResponse = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  for (const [key, response] of Object.entries(responseMap)) {
    if (lowerCaseMessage.includes(key)) {
      return response;
    }
  }
  
  return responseMap.default;
};

// Format timestamp as HH:MM
const formatTime = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// Add a new message to the chat
const addMessage = (text: string, sender: 'user' | 'bot', typing = false) => {
  const newMessage: Message = {
    id: messageId.value++,
    text,
    sender,
    timestamp: new Date(),
    typing
  };
  
  messages.value.push(newMessage);
  
  // Auto-scroll to the latest message
  setTimeout(() => {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, 100);
};

// Send a message from the user
const sendMessage = () => {
  if (!userInput.value.trim() && !audioRecording.value && !fileAttached.value) return;
  
  let messageText = userInput.value;
  
  // Handle voice message
  if (audioRecording.value) {
    messageText = '[Голосовое сообщение]';
    audioRecording.value = false;
  }
  
  // Handle file attachment
  if (fileAttached.value) {
    messageText = `[Документ: ${fileAttachmentName.value}]`;
    fileAttached.value = false;
    fileAttachmentName.value = '';
  }
  
  // Add user message
  addMessage(messageText, 'user');
  userInput.value = '';
  
  // Show typing indicator
  isTyping.value = true;
  
  // Simulate response time (1-3 seconds)
  const responseTime = Math.floor(Math.random() * 2000) + 1000;
  setTimeout(() => {
    isTyping.value = false;
    
    // Add bot response
    const botResponse = getBotResponse(messageText);
    addMessage(botResponse, 'bot');
  }, responseTime);
};

// Toggle audio recording
const toggleAudioRecording = () => {
  audioRecording.value = !audioRecording.value;
  
  if (audioRecording.value) {
    // Simulate sending a voice message after 3 seconds
    setTimeout(() => {
      if (audioRecording.value) {
        sendMessage();
      }
    }, 3000);
  }
};

// Handle file attachment
const handleFileAttachment = () => {
  const fileNames = ['Прайс-лист.pdf', 'Коммерческое_предложение.docx', 'Каталог_товаров.pdf'];
  fileAttachmentName.value = fileNames[Math.floor(Math.random() * fileNames.length)];
  fileAttached.value = true;
};

// Handle selecting a suggestion
const selectSuggestion = (suggestion: string) => {
  userInput.value = suggestion;
  sendMessage();
};

// Check if user prefers reduced motion
const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
});

// Initialize chat with bot greeting
onMounted(() => {
  // Add initial bot greeting
  addMessage('Здравствуйте! Я AI-помощник Gneiro. Чем могу вам помочь?', 'bot');
});
</script>

<template>
  <section id="demo-chat" class="demo-chat-section">
    <div class="container">
      <div class="section-content">
        <!-- Left column: Info -->
        <div class="info-column">
          <h2 class="section-title">Ваш личный ИИ-продавец отвечает за 3 сек</h2>
          
          <ul class="features-list">
            <li class="feature-item">
              <i class="pi pi-bolt feature-icon"></i>
              <div class="feature-text">
                <h3 class="feature-title">Ответ ≤ 3 сек</h3>
                <p class="feature-description">Скорость реакции выше 99% менеджеров</p>
              </div>
            </li>
            
            <li class="feature-item">
              <i class="pi pi-microphone feature-icon"></i>
              <div class="feature-text">
                <h3 class="feature-title">Голос, фото, документы</h3>
                <p class="feature-description">Бот расшифровывает аудио и читает PDF</p>
              </div>
            </li>
            
            <li class="feature-item">
              <i class="pi pi-language feature-icon"></i>
              <div class="feature-text">
                <h3 class="feature-title">3 языка</h3>
                <p class="feature-description">Русский, казахский, английский (авто-детект)</p>
              </div>
            </li>
            
            <li class="feature-item">
              <i class="pi pi-users feature-icon"></i>
              <div class="feature-text">
                <h3 class="feature-title">Человеческий стиль</h3>
                <p class="feature-description">Скрипты продаж адаптированы под вашу нишу</p>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Right column: Chat widget -->
        <div class="chat-column">
          <div class="chat-widget">
            <!-- Chat header -->
            <div class="chat-header">
              <div class="chat-header-info">
                <div class="chat-avatar">
                  <img 
                    src="https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg" 
                    alt="Gneiro AI"
                  />
                </div>
                <div>
                  <h4 class="chat-title">Gneiro AI</h4>
                  <div class="chat-status">
                    <span class="status-indicator"></span>
                    <span>Онлайн</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Chat messages area -->
            <div class="chat-messages" role="log" aria-live="polite">
              <!-- Messages -->
              <div v-for="message in messages" 
                   :key="message.id" 
                   class="message" 
                   :class="message.sender">
                <div class="message-bubble">
                  <div v-if="message.typing" class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <template v-else>{{ message.text }}</template>
                </div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
              
              <!-- Typing indicator when bot is replying -->
              <div v-if="isTyping" class="message bot">
                <div class="message-bubble">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
              
              <!-- Suggestion bubbles -->
              <div v-if="messages.length === 1" class="suggestions">
                <button 
                  v-for="(suggestion, index) in suggestions" 
                  :key="index"
                  class="suggestion-bubble"
                  @click="selectSuggestion(suggestion)"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
            
            <!-- Chat input area -->
            <div class="chat-input-container">
              <div v-if="fileAttached" class="file-preview">
                <div class="file-preview-content">
                  <i class="pi pi-file-pdf file-icon"></i>
                  <span>{{ fileAttachmentName }}</span>
                </div>
                <button class="file-preview-close" @click="fileAttached = false">
                  <i class="pi pi-times"></i>
                </button>
              </div>
              
              <div class="chat-input">
                <button 
                  class="attachment-button"
                  @click="handleFileAttachment"
                  aria-label="Прикрепить файл"
                >
                  <i class="pi pi-paperclip"></i>
                </button>
                
                <input 
                  type="text" 
                  v-model="userInput" 
                  placeholder="Введите сообщение..."
                  @keyup.enter="sendMessage"
                  :disabled="audioRecording"
                  class="message-input"
                />
                
                <button 
                  class="voice-button"
                  :class="{ 'recording': audioRecording }"
                  @click="toggleAudioRecording"
                  aria-label="Записать голосовое сообщение"
                >
                  <i :class="audioRecording ? 'pi pi-stop-circle' : 'pi pi-microphone'"></i>
                </button>
                
                <button 
                  class="send-button"
                  @click="sendMessage"
                  aria-label="Отправить сообщение"
                  :disabled="!userInput && !audioRecording && !fileAttached"
                >
                  <i class="pi pi-send"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- CTA buttons -->
          <div class="chat-cta">
            <a href="#pricing" class="btn btn-primary">Создать своего бота</a>
            <a href="/cases" class="btn btn-outline">Смотреть больше примеров</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.demo-chat-section {
  padding: var(--space-16) 0;
  background-color: var(--color-bg);
}

.section-content {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-12);
}

/* Left column styles */
.info-column {
  flex: 1;
  min-width: 300px;
}

.section-title {
  font-size: var(--fz-h2);
  margin-bottom: var(--space-8);
  line-height: 1.2;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  align-items: flex-start;
}

.feature-icon {
  color: var(--color-accent);
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--space-1);
}

.feature-description {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 0.95rem;
}

/* Right column styles */
.chat-column {
  flex: 1;
  min-width: 350px;
}

.chat-widget {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 500px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chat-widget:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Chat header */
.chat-header {
  background-color: var(--color-accent);
  color: white;
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.chat-avatar img {
  width: 70%;
  height: auto;
}

.chat-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.8rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4ade80;
  display: inline-block;
}

/* Chat messages area */
.chat-messages {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Dark theme support */
:root[data-theme='dark'] .chat-messages {
  background-color: var(--color-surface);
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

.message.user {
  align-self: flex-end;
}

.message.bot {
  align-self: flex-start;
}

.message-bubble {
  padding: var(--space-3);
  border-radius: 12px;
  position: relative;
  word-break: break-word;
}

.message.user .message-bubble {
  background-color: #e1f5fe;
  color: #0c2d48;
  border-top-right-radius: 4px;
}

.message.bot .message-bubble {
  background-color: white;
  color: var(--color-text);
  border-top-left-radius: 4px;
}

/* Dark theme support */
:root[data-theme='dark'] .message.user .message-bubble {
  background-color: var(--color-accent);
  color: white;
}

:root[data-theme='dark'] .message.bot .message-bubble {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.message-time {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  margin-top: var(--space-1);
  align-self: flex-end;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 3px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-text-muted);
  display: inline-block;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-4px); }
}

/* Suggestion bubbles */
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.suggestion-bubble {
  background-color: white;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: 18px;
  padding: 6px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Dark theme support */
:root[data-theme='dark'] .suggestion-bubble {
  background-color: var(--color-surface);
  border-color: var(--color-accent);
}

.suggestion-bubble:hover {
  background-color: var(--color-accent);
  color: white;
}

/* Chat input area */
.chat-input-container {
  padding: var(--space-3);
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
}

.file-preview {
  margin-bottom: var(--space-2);
  background-color: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-preview-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.file-icon {
  color: var(--color-accent);
}

.file-preview-close {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.chat-input {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background-color: var(--color-surface);
  border-radius: 24px;
  padding: 4px 8px;
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px;
  font-size: 0.95rem;
  color: var(--color-text);
  outline: none;
}

.message-input::placeholder {
  color: var(--color-text-muted);
}

.attachment-button,
.voice-button,
.send-button {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.attachment-button:hover,
.voice-button:hover,
.send-button:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-accent);
}

.voice-button.recording {
  background-color: var(--color-accent);
  color: white;
  animation: pulse 1.5s infinite;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(10, 132, 255, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(10, 132, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(10, 132, 255, 0); }
}

/* CTA section */
.chat-cta {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-6);
  justify-content: center;
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
}

.btn-outline:hover {
  border-color: var(--color-text-muted);
  background-color: var(--color-surface);
}

/* Responsive styles */
@media (max-width: 992px) {
  .section-content {
    flex-direction: column;
  }
  
  .info-column, .chat-column {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .chat-widget {
    height: 450px;
  }
  
  .attachment-button {
    display: none;
  }
  
  .chat-cta {
    flex-direction: column;
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .chat-widget:hover {
    transform: none;
  }
  
  .typing-indicator span {
    animation: none;
  }
  
  .voice-button.recording {
    animation: none;
  }
}
</style>