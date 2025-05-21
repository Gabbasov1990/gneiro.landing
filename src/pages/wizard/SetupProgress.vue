<script setup lang="ts">
import { useWizardStore } from '@/store/wizard';
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { supabase } from '@/lib/supabase';

const wizardStore = useWizardStore();
const router = useRouter();

// Timer for ETA countdown
const etaMinutes = ref(4);
const etaSeconds = ref(59);
let countdownInterval: number | null = null;

// Animation states
const setupPhases = ref([
  { id: 'init', label: 'Инициализация AI-ядра', complete: false },
  { id: 'knowledge', label: 'Извлечение знаний из источников', complete: false },
  { id: 'config', label: 'Настройка профиля ассистента', complete: false },
  { id: 'whatsapp', label: 'Подготовка WhatsApp интеграции', complete: false },
  { id: 'final', label: 'Активация AI-ассистента', complete: false }
]);
const currentPhaseIndex = ref(0);
const animationParticles = ref(Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 10 + 5,
  x: Math.random() * 100,
  y: Math.random() * 100,
  speed: Math.random() * 1 + 0.5,
  opacity: Math.random() * 0.7 + 0.3
})));

// Chat demo states
const showChatDemo = ref(false);
const chatMessages = ref([
  { id: 1, text: 'Здравствуйте! Я ваш новый AI-ассистент. Чем могу помочь?', sender: 'bot', animate: false },
  { id: 2, text: 'Какие у вас есть товары со скидкой?', sender: 'user', animate: false },
  { id: 3, text: 'У нас действует акция на всю летнюю коллекцию, скидки до 30%. Особенно рекомендую обратить внимание на новую линейку футболок, которые поступили на прошлой неделе. Хотите посмотреть каталог?', sender: 'bot', animate: false }
]);
const samplePrompts = [
  'Какие условия доставки?',
  'Можно оплатить картой?',
  'Нужна консультация по выбору'
];
const newMessage = ref('');
const isTyping = ref(false);
const selectedPrompt = ref('');

// Authentication modal
const showAuthModal = ref(false);
const activeAuthTab = ref('email');
const authEmail = ref('');
const authPassword = ref('');
const authPhone = ref('');
const authOtp = ref('');
const authLoading = ref(false);
const authError = ref('');
const whatsappOtpSent = ref(false);

// Format time
const formattedTime = computed(() => {
  const minutes = etaMinutes.value.toString().padStart(2, '0');
  const seconds = etaSeconds.value.toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
});

// Handle countdown
const startCountdown = () => {
  countdownInterval = window.setInterval(() => {
    if (etaSeconds.value > 0) {
      etaSeconds.value--;
    } else if (etaMinutes.value > 0) {
      etaMinutes.value--;
      etaSeconds.value = 59;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);
};

// Show registration modal
const showRegistration = () => {
  showAuthModal.value = true;
};

// Go to dashboard
const goToDashboard = () => {
  wizardStore.markConnected();
};

// Skip QR code step
const skipConnection = () => {
  showChatDemo.value = true;
};

// Handle setup phases animation
const animateSetupPhases = () => {
  const interval = setInterval(() => {
    if (currentPhaseIndex.value < setupPhases.value.length) {
      setupPhases.value[currentPhaseIndex.value].complete = true;
      currentPhaseIndex.value++;
    } else {
      clearInterval(interval);
    }
  }, 3000);
};

// Send a chat message
const sendMessage = () => {
  if (!newMessage.value.trim() && !selectedPrompt.value) return;
  
  const messageText = selectedPrompt.value || newMessage.value;
  
  // Add user message
  chatMessages.value.push({
    id: chatMessages.value.length + 1,
    text: messageText,
    sender: 'user',
    animate: true
  });
  
  newMessage.value = '';
  selectedPrompt.value = '';
  
  // Simulate bot typing
  isTyping.value = true;
  
  setTimeout(() => {
    isTyping.value = false;
    
    // Bot reply based on message content
    let reply = "Спасибо за ваш запрос! Я помогу вам с этим. Что бы вы хотели узнать подробнее?";
    
    if (messageText.toLowerCase().includes("доставк")) {
      reply = "Мы предлагаем бесплатную доставку по городу при заказе от 5000₸, а также доставку по всему Казахстану. Срок доставки в регионы - 2-5 рабочих дней. Могу помочь оформить заказ?";
    } else if (messageText.toLowerCase().includes("оплат") || messageText.toLowerCase().includes("карт")) {
      reply = "Да, вы можете оплатить картой Visa, MasterCard или через Apple Pay. Также доступна оплата переводом на Kaspi или наличными при получении. Какой способ вам удобнее?";
    } else if (messageText.toLowerCase().includes("консультаци") || messageText.toLowerCase().includes("выбор")) {
      reply = "Конечно! Я с радостью помогу вам подобрать подходящий товар. Расскажите, пожалуйста, что именно вас интересует и какие у вас предпочтения по цене, цвету или размеру?";
    }
    
    // Add bot message
    chatMessages.value.push({
      id: chatMessages.value.length + 1,
      text: reply,
      sender: 'bot',
      animate: true
    });
  }, 2000);
};

// Use a sample prompt
const usePrompt = (prompt) => {
  selectedPrompt.value = prompt;
  sendMessage();
};

// Check if user is authenticated
const checkAuth = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Complete setup and go to dashboard
const completeSetup = async () => {
  const isAuthenticated = await checkAuth();
  
  if (isAuthenticated) {
    // User is already authenticated, mark as connected and go to dashboard
    wizardStore.markConnected();
  } else {
    // Show auth modal for registration
    showRegistration();
  }
};

// Auth methods
const signInWithEmail = async () => {
  if (!authEmail.value) {
    authError.value = 'Пожалуйста, введите email';
    return;
  }
  
  authLoading.value = true;
  authError.value = '';
  
  try {
    if (authPassword.value) {
      // Sign in with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail.value,
        password: authPassword.value
      });
      
      if (error) throw error;
    } else {
      // Sign in with magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail.value
      });
      
      if (error) throw error;
      
      // Show success message for magic link
      authError.value = 'Ссылка для входа отправлена на ваш email';
      return;
    }
    
    // Close modal and proceed
    showAuthModal.value = false;
    wizardStore.markConnected();
  } catch (error) {
    authError.value = error.message || 'Ошибка авторизации';
  } finally {
    authLoading.value = false;
  }
};

const signInWithGoogle = async () => {
  authLoading.value = true;
  authError.value = '';
  
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/create?step=7`
      }
    });
    
    if (error) throw error;
  } catch (error) {
    authError.value = error.message || 'Ошибка авторизации через Google';
    authLoading.value = false;
  }
};

const sendWhatsAppOtp = async () => {
  if (!authPhone.value) {
    authError.value = 'Пожалуйста, введите номер телефона';
    return;
  }
  
  authLoading.value = true;
  authError.value = '';
  
  try {
    // In a real implementation, this would call an edge function
    // For demo purposes, we'll simulate OTP
    console.log(`Sending OTP to ${authPhone.value}`);
    
    setTimeout(() => {
      // Simulate OTP sent
      whatsappOtpSent.value = true;
      authLoading.value = false;
    }, 1500);
  } catch (error) {
    authError.value = error.message || 'Ошибка отправки кода';
    authLoading.value = false;
  }
};

const verifyWhatsAppOtp = async () => {
  if (!authOtp.value) {
    authError.value = 'Пожалуйста, введите код';
    return;
  }
  
  authLoading.value = true;
  authError.value = '';
  
  try {
    // In a real implementation, this would call an edge function
    // For demo purposes, we'll simulate verification with any 6-digit code
    if (authOtp.value.length === 6 && /^\d+$/.test(authOtp.value)) {
      // Close modal and proceed
      showAuthModal.value = false;
      
      // In a real implementation, would create a user here
      // For demo, we'll just mark as connected
      wizardStore.markConnected();
    } else {
      throw new Error('Неверный код. Пожалуйста, проверьте и попробуйте снова.');
    }
  } catch (error) {
    authError.value = error.message || 'Ошибка проверки кода';
  } finally {
    authLoading.value = false;
  }
};

// Close auth modal
const closeAuthModal = () => {
  showAuthModal.value = false;
  authEmail.value = '';
  authPassword.value = '';
  authPhone.value = '';
  authOtp.value = '';
  authError.value = '';
  whatsappOtpSent.value = false;
  activeAuthTab.value = 'email';
};

// Watch for QR code to update
watch(() => wizardStore.qrCode, (newValue) => {
  if (newValue) {
    // Clear all intervals
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  }
});

watch(() => wizardStore.status, (newStatus) => {
  console.log('Status changed:', newStatus);
  if (newStatus === 'ready') {
    // Agent is ready, move to QR code screen if not there already
    if (wizardStore.setupProgress >= 100) {
      showChatDemo.value = false;
    }
  } else if (newStatus === 'connected') {
    // Agent is connected, redirect to dashboard
    wizardStore.markConnected();
  }
});

// Start the setup process
onMounted(() => {
  // Check if we already have a created agent
  if (!wizardStore.createdAgentId) {
    // Try to create an agent if we don't have one yet
    wizardStore.createAgent().catch(error => {
      console.error('Error creating agent:', error);
    });
  } else {
    // Resume real-time listening for existing agent
    wizardStore.listenRealtime(wizardStore.createdAgentId);
  }
  
  // Start the countdown
  startCountdown();
  
  // Start phases animation
  animateSetupPhases();
});

// Clean up intervals
onBeforeUnmount(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  // Clean up realtime subscription
  if (wizardStore.createdAgentId) {
    const channel = supabase.channel('agent-changes');
    channel.unsubscribe();
  }
});
</script>

<template>
  <div class="setup-progress">
    <div class="setup-content">
      <!-- Loading state -->
      <div v-if="wizardStore.status === 'configuring' || (wizardStore.setupProgress < 100 && !wizardStore.qrCode && !showChatDemo)" class="loading-state">
        <div class="animation-container">
          <div class="particle-animation">
            <div 
              v-for="particle in animationParticles" 
              :key="particle.id"
              class="particle"
              :style="{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: particle.opacity,
                animationDuration: `${10 / particle.speed}s`
              }"
            ></div>
          </div>
          
          <div class="logo-loader">
            <img 
              src="https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg" 
              alt="Gneiro Logo" 
              class="logo-image"
            />
          </div>
        </div>
        
        <h2 class="setup-title">Создание AI-ассистента</h2>
        
        <div class="eta-timer">{{ formattedTime }}</div>
        
        <ProgressBar :value="wizardStore.setupProgress" class="setup-progress-bar" />
        
        <div class="setup-phases">
          <div 
            v-for="(phase, index) in setupPhases" 
            :key="phase.id"
            class="setup-phase"
            :class="{ 
              'active': index === currentPhaseIndex,
              'completed': phase.complete
            }"
          >
            <div class="phase-indicator">
              <i v-if="phase.complete" class="pi pi-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="phase-label">{{ phase.label }}</div>
          </div>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="wizardStore.error" class="error-state">
        <i class="pi pi-exclamation-triangle error-icon"></i>
        <h2 class="error-title">Что-то пошло не так</h2>
        <p class="error-message">{{ wizardStore.error }}</p>
        <button @click="wizardStore.resetWizard" class="btn btn-primary">
          Попробовать снова
        </button>
      </div>
      
      <!-- QR code state (Step 7) -->
      <div v-else-if="(wizardStore.qrCode || wizardStore.status === 'ready') && !showChatDemo" class="qr-state">
        <div class="success-animation">
          <div class="checkmark">
            <i class="pi pi-check"></i>
          </div>
        </div>
        
        <h2 class="qr-title">Ваш ассистент готов!</h2>
        <p class="qr-subtitle">Сканируйте QR-код, чтобы подключить WhatsApp</p>
        
        
        <div class="qr-instructions">
          <ol class="connection-steps">
            <li>Откройте WhatsApp на своем телефоне</li>
            <li>Нажмите Настройки > Связанные устройства</li>
            <li>Нажмите "Привязать устройство"</li>
            <li>Отсканируйте QR-код</li>
          </ol>
          
          <div class="connection-status">
            <div class="status-indicator">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Ожидание подключения...</span>
            </div>
          </div>
        </div>
        
        <div class="qr-actions">
          <button @click="skipConnection" class="btn btn-primary">
            Пропустить
          </button>
          
          <button @click="goToDashboard" class="btn btn-outline">
            В панель управления
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>
      </div>
      
      <!-- Chat demo (Step 8) -->
      <div v-else-if="showChatDemo" class="chat-demo">
        <h2 class="demo-title">Попробуйте пообщаться с вашим ассистентом</h2>
        
        <div class="chat-container">
          <div class="chat-header">
            <div class="chat-avatar">
              <img 
                src="https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg" 
                alt="AI Assistant" 
              />
            </div>
            <div class="chat-header-info">
              <h3 class="chat-name">{{ wizardStore.form.botName || 'AI Ассистент' }}</h3>
              <div class="chat-status">
                <span class="status-dot"></span>
                <span>Онлайн</span>
              </div>
            </div>
          </div>
          
          <div class="chat-messages" ref="chatMessages">
            <div 
              v-for="message in chatMessages" 
              :key="message.id"
              :class="['message', message.sender, { 'animate-in': message.animate }]"
            >
              <div class="message-content">{{ message.text }}</div>
            </div>
            
            <div v-if="isTyping" class="message bot">
              <div class="message-content typing">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
          
          <div class="sample-prompts">
            <p>Попробуйте эти примеры:</p>
            <div class="prompts-container">
              <button 
                v-for="(prompt, index) in samplePrompts" 
                :key="index"
                class="sample-prompt"
                @click="usePrompt(prompt)"
              >
                {{ prompt }}
              </button>
            </div>
          </div>
          
          <div class="chat-input">
            <input 
              type="text" 
              v-model="newMessage" 
              placeholder="Введите сообщение..." 
              @keyup.enter="sendMessage"
            />
            <button @click="sendMessage" class="send-button" :disabled="!newMessage.trim() && !selectedPrompt">
              <i class="pi pi-send"></i>
            </button>
          </div>
        </div>
        
        <div class="demo-actions">
          <button @click="completeSetup" class="btn btn-primary">
            Всё работает
          </button>
        </div>
      </div>
    </div>
    
    <!-- Registration Modal -->
    <Dialog 
      v-model:visible="showAuthModal"
      :modal="true"
      :closable="true"
      :closeOnEscape="true"
      header="Регистрация для доступа к панели"
      :style="{width: '90vw', maxWidth: '450px'}"
      :pt="{
        root: { class: 'auth-modal' }
      }"
    >
      <div class="auth-tabs">
        <button 
          class="auth-tab" 
          :class="{ active: activeAuthTab === 'email' }" 
          @click="activeAuthTab = 'email'"
        >
          Email
        </button>
        <button 
          class="auth-tab" 
          :class="{ active: activeAuthTab === 'google' }"
          @click="activeAuthTab = 'google'"
        >
          Google
        </button>
        <button 
          class="auth-tab" 
          :class="{ active: activeAuthTab === 'whatsapp' }"
          @click="activeAuthTab = 'whatsapp'"
        >
          WhatsApp
        </button>
      </div>
      
      <!-- Email Tab -->
      <div v-if="activeAuthTab === 'email'" class="auth-content">
        <div class="form-group">
          <label for="auth-email">Email</label>
          <InputText 
            id="auth-email" 
            v-model="authEmail" 
            type="email" 
            class="w-full" 
            placeholder="Ваш email" 
            :disabled="authLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="auth-password">Пароль (опционально)</label>
          <Password 
            id="auth-password" 
            v-model="authPassword" 
            :feedback="false" 
            toggleMask 
            class="w-full"
            :disabled="authLoading"
          />
          <small class="form-hint">Оставьте пустым для входа по Magic Link</small>
        </div>
      </div>
      
      <!-- Google Tab -->
      <div v-if="activeAuthTab === 'google'" class="auth-content google-auth">
        <div class="google-info">
          <i class="pi pi-google"></i>
          <p>Войдите с помощью вашего аккаунта Google</p>
        </div>
      </div>
      
      <!-- WhatsApp Tab -->
      <div v-if="activeAuthTab === 'whatsapp'" class="auth-content">
        <div v-if="!whatsappOtpSent">
          <div class="form-group">
            <label for="auth-phone">Номер телефона WhatsApp</label>
            <InputText 
              id="auth-phone" 
              v-model="authPhone" 
              type="tel" 
              class="w-full" 
              placeholder="+7 (XXX) XXX-XX-XX" 
              :disabled="authLoading"
            />
            <small class="form-hint">Введите номер, привязанный к WhatsApp</small>
          </div>
        </div>
        
        <div v-else class="form-group">
          <label for="auth-otp">Введите код из WhatsApp</label>
          <InputText 
            id="auth-otp" 
            v-model="authOtp" 
            type="text" 
            class="w-full otp-input" 
            placeholder="XXXXXX" 
            maxlength="6"
            :disabled="authLoading"
          />
          <small class="form-hint">Код отправлен на номер {{ authPhone }}</small>
        </div>
      </div>
      
      <!-- Error message -->
      <div v-if="authError" class="auth-error">
        {{ authError }}
      </div>
      
      <!-- Action buttons -->
      <template #footer>
        <Button
          label="Отмена"
          class="p-button-text"
          @click="closeAuthModal"
          :disabled="authLoading"
        />
        
        <Button
          v-if="activeAuthTab === 'email'"
          :label="authPassword ? 'Войти' : 'Отправить ссылку'"
          icon="pi pi-envelope"
          @click="signInWithEmail"
          :loading="authLoading"
          autofocus
        />
        
        <Button
          v-else-if="activeAuthTab === 'google'"
          label="Продолжить с Google"
          icon="pi pi-google"
          @click="signInWithGoogle"
          :loading="authLoading"
        />
        
        <Button
          v-else-if="activeAuthTab === 'whatsapp' && !whatsappOtpSent"
          label="Отправить код"
          icon="pi pi-whatsapp"
          @click="sendWhatsAppOtp"
          :loading="authLoading"
        />
        
        <Button
          v-else-if="activeAuthTab === 'whatsapp' && whatsappOtpSent"
          label="Подтвердить"
          icon="pi pi-check"
          @click="verifyWhatsAppOtp"
          :loading="authLoading"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.setup-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  text-align: center;
}

.setup-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  position: relative;
  overflow: hidden;
}

:root[data-theme='dark'] .setup-content {
  background-color: rgba(28, 33, 40, 0.9);
}

/* Animation container */
.animation-container {
  position: relative;
  height: 100px;
  margin-bottom: 1rem;
}

.particle-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background-color: var(--color-accent);
  border-radius: 50%;
  animation: float 10s infinite;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-10px) translateX(20px);
  }
  75% {
    transform: translateY(10px) translateX(5px);
  }
  100% {
    transform: translateY(0) translateX(0);
  }
}

.logo-loader {
  position: relative;
  z-index: 2;
  animation: pulse 2s infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.logo-image {
  height: 60px;
  width: auto;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: relative;
}

.setup-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.eta-timer {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-accent);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.setup-progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 5px;
}

.setup-phases {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
}

.setup-phase {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

.setup-phase.active {
  background-color: rgba(var(--accent-rgb), 0.1);
  transform: translateX(10px);
}

.setup-phase.completed {
  background-color: rgba(var(--success-rgb, 50, 215, 75), 0.1);
}

.phase-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-accent);
  color: white;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 500;
}

.setup-phase.completed .phase-indicator {
  background-color: var(--color-success, #32d74b);
}

.phase-label {
  flex: 1;
  text-align: left;
  font-size: 0.95rem;
}

/* Error state */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.error-icon {
  font-size: 3rem;
  color: var(--color-danger, #ff3b30);
}

.error-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.error-message {
  color: var(--color-text-muted);
  margin: 0;
}

/* QR code state */
.qr-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.success-animation {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-success, #32d74b);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scale-in 0.5s ease-out;
}

.checkmark i {
  color: white;
  font-size: 2rem;
  animation: check-mark 0.3s ease-in-out 0.3s both;
}

@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes check-mark {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.qr-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.qr-subtitle {
  color: var(--color-text-muted);
  margin: 0;
}

.qr-container {
  background-color: white;
  padding: 1rem;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0.5rem 0;
  position: relative;
  overflow: hidden;
}

.qr-container::before {
  content: '';
  position: absolute;
  top: -10px;
  right: -10px;
  width: 40px;
  height: 40px;
  background-color: var(--color-accent);
  opacity: 0.2;
  border-radius: 50%;
  filter: blur(15px);
}

.qr-container::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: -10px;
  width: 60px;
  height: 60px;
  background-color: var(--color-accent);
  opacity: 0.2;
  border-radius: 50%;
  filter: blur(20px);
}

.qr-code {
  position: relative;
  z-index: 2;
}

.qr-instructions {
  width: 100%;
  text-align: left;
  margin: 0.5rem 0;
}

.connection-steps {
  padding-left: 1.5rem;
  margin: 0 0 1rem 0;
}

.connection-steps li {
  margin-bottom: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.connection-status {
  padding: 0.75rem;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  margin: 1rem 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.status-indicator i {
  color: var(--color-accent);
}

.qr-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

/* Chat demo */
.chat-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.demo-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.chat-container {
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-header {
  background-color: var(--color-accent);
  color: white;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
}

.chat-avatar img {
  width: 70%;
  height: auto;
}

.chat-header-info {
  flex: 1;
}

.chat-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4ede79;
  display: inline-block;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  max-width: 70%;
  display: flex;
}

.message.user {
  align-self: flex-end;
}

.message.bot {
  align-self: flex-start;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.95rem;
}

.message.user .message-content {
  background-color: var(--color-accent);
  color: white;
  border-top-right-radius: 0;
}

.message.bot .message-content {
  background-color: white;
  color: var(--color-text);
  border-top-left-radius: 0;
}

.typing .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-text-muted);
  animation: typing-dot 1.4s infinite;
  margin: 0 2px;
}

.typing .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-dot {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.sample-prompts {
  padding: 0.75rem 1rem;
  background-color: rgba(255, 255, 255, 0.5);
  border-top: 1px solid var(--color-border);
}

.sample-prompts p {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.prompts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sample-prompt {
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sample-prompt:hover {
  background-color: var(--color-surface);
  border-color: var(--color-accent);
}

.chat-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border);
  background-color: white;
}

.chat-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 1.5rem;
  border: 1px solid var(--color-border);
  font-size: 0.95rem;
}

.chat-input input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-accent);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-actions {
  margin-top: 1.5rem;
}

/* Auth Modal */
.auth-modal {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.auth-tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-muted);
  position: relative;
}

.auth-tab.active {
  color: var(--color-accent);
}

.auth-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-accent);
}

.auth-content {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.9rem;
}

.form-hint {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.google-auth {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
}

.google-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-muted);
}

.google-info i {
  font-size: 2.5rem;
  color: #DB4437;
}

.auth-error {
  color: var(--color-danger, #ff3b30);
  background-color: rgba(255, 59, 48, 0.1);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.otp-input {
  letter-spacing: 0.5rem;
  text-align: center;
  font-size: 1.25rem;
}

/* Common button styles */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
  border: none;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
}

.btn-outline {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-outline:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-muted);
  transform: translateY(-2px);
}

/* Animation classes */
.animate-in {
  animation: message-appear 0.3s ease-out forwards;
}

@keyframes message-appear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .setup-content {
    padding: 2rem 1rem;
  }
  
  .setup-title {
    font-size: 1.5rem;
  }
  
  .eta-timer {
    font-size: 2rem;
  }
  
  .qr-actions, .demo-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  
  .qr-actions .btn, .demo-actions .btn {
    width: 100%;
  }
  
  .chat-container {
    height: 400px;
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
  }
  
  .logo-loader {
    animation: none;
  }
  
  .checkmark {
    animation: none;
  }
  
  .checkmark i {
    animation: none;
  }
  
  .typing .dot {
    animation: none;
  }
  
  .animate-in {
    animation: none;
  }
  
  .setup-phase.active {
    transform: none;
  }
  
  .btn:hover {
    transform: none;
  }
}
</style>