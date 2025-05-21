<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { prefersReducedMotion } from '@/lib/utils';

// Define business niches with their icons, titles, and descriptions
const businessTypes = [
  {
    id: 'auto',
    icon: 'pi pi-car',
    title: 'Автосервисы',
    description: 'Запись на ТО, upsell масел'
  },
  {
    id: 'beauty',
    icon: 'pi pi-user-plus',
    title: 'Салоны красоты',
    description: 'Бронирование, напоминания'
  },
  {
    id: 'medical',
    icon: 'pi pi-heart',
    title: 'Медицинские центры',
    description: 'Анализы, приём врачей'
  },
  {
    id: 'education',
    icon: 'pi pi-book',
    title: 'Онлайн-школы',
    description: 'Прогрев, продажи курсов'
  },
  {
    id: 'ecommerce',
    icon: 'pi pi-shopping-cart',
    title: 'Интернет-магазины',
    description: 'Подбор товара, статус заказа'
  },
  {
    id: 'restaurant',
    icon: 'pi pi-cutlery',
    title: 'Рестораны и доставка',
    description: 'Меню, пред-заказ, отслеживание'
  }
];

// Define dialog examples for each business type
const dialogExamples = {
  auto: [
    { text: "Записаться на замену масла?", sender: "user" },
    { text: "Свободно завтра 14:00. Подойдёт?", sender: "bot" },
    { text: "Да", sender: "user" }
  ],
  beauty: [
    { text: "Маникюр завтра есть?", sender: "user" },
    { text: "11:30 — классика, 14:00 — гель. Что выбираем?", sender: "bot" },
    { text: "14:00", sender: "user" }
  ],
  medical: [
    { text: "Сдать анализы крови", sender: "user" },
    { text: "Есть экспресс-пакет, готово за 2 ч. Записать?", sender: "bot" },
    { text: "Да", sender: "user" }
  ],
  education: [
    { text: "Сложно ли ваш курс Python?", sender: "user" },
    { text: "Даем базу с нуля, 6 недель. Хотите программу?", sender: "bot" },
    { text: "Да", sender: "user" }
  ],
  ecommerce: [
    { text: "Кроссовки 42 есть?", sender: "user" },
    { text: "Nike Air Zoom, 42 — в наличии. Добавить в корзину?", sender: "bot" },
    { text: "Добавь", sender: "user" }
  ],
  restaurant: [
    { text: "Пицца 4 сыра + доставка", sender: "user" },
    { text: "Будет через 35 мин, 4200 ₸. Подтвердить?", sender: "bot" },
    { text: "Да", sender: "user" }
  ]
};

// State management
const selectedType = ref<string | null>(null);
const visibleMessages = ref<number>(0);
const typingMessage = ref<boolean>(false);
const isReducedMotion = ref(prefersReducedMotion());
const isMobile = ref(window.innerWidth <= 768);

// Create computed property for the selected dialog
const selectedDialog = computed(() => {
  if (!selectedType.value) return [];
  return dialogExamples[selectedType.value as keyof typeof dialogExamples] || [];
});

// Computed property for CTA button text
const ctaButtonText = computed(() => {
  if (!selectedType.value) return 'Создать своего бота';
  
  const selectedBusiness = businessTypes.find(type => type.id === selectedType.value);
  return `Создать бота для ${selectedBusiness?.title.toLowerCase() || 'вашего бизнеса'}`;
});

// Function to select a business type
const selectBusinessType = (typeId: string) => {
  if (selectedType.value === typeId) return;
  
  selectedType.value = typeId;
  visibleMessages.value = 0;
  
  // Animate messages appearing one by one
  if (isReducedMotion.value) {
    visibleMessages.value = dialogExamples[typeId as keyof typeof dialogExamples].length;
    return;
  }
  
  // First user message appears immediately
  visibleMessages.value = 1;
  
  // Bot starts typing
  setTimeout(() => {
    typingMessage.value = true;
    
    // Bot message appears after typing
    setTimeout(() => {
      typingMessage.value = false;
      visibleMessages.value = 2;
      
      // Second user message appears
      setTimeout(() => {
        visibleMessages.value = 3;
      }, 1000);
    }, 1500);
  }, 500);
};

// Function to scroll to pricing section
const goToPricing = () => {
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    pricingSection.scrollIntoView({ 
      behavior: isReducedMotion.value ? 'auto' : 'smooth'
    });
  }
};

// Handle window resize for responsive layout
const handleWindowResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Initialize component
onMounted(() => {
  window.addEventListener('resize', handleWindowResize);

  // Select first business type by default
  if (businessTypes.length > 0) {
    selectBusinessType(businessTypes[0].id);
  }
  
  // Clean up event listener on component destroy
  return () => {
    window.removeEventListener('resize', handleWindowResize);
  };
});
</script>

<template>
  <section id="business-types" class="business-types-section scroll-mt-20">
    <div class="container">
      <h2 class="section-title">Решение для любого бизнеса</h2>
      
      <div class="content-area">
        <!-- Business type cards grid/slider -->
        <div 
          class="business-cards" 
          role="tablist" 
          :class="{'business-cards-mobile': isMobile}"
        >
          <button
            v-for="business in businessTypes"
            :key="business.id"
            class="business-card"
            :class="{ 'active': selectedType === business.id }"
            role="tab"
            :id="`tab-${business.id}`"
            :aria-selected="selectedType === business.id"
            :aria-controls="`panel-${business.id}`"
            @click="selectBusinessType(business.id)"
          >
            <div class="icon-circle">
              <i :class="business.icon" aria-hidden="true"></i>
              <span class="check-badge" v-if="selectedType === business.id" aria-hidden="true">
                <i class="pi pi-check"></i>
              </span>
            </div>
            <h3 class="business-title">{{ business.title }}</h3>
            <p class="business-description">{{ business.description }}</p>
          </button>
        </div>
        
        <!-- Dialog example area -->
        <div 
          class="dialog-example"
          role="tabpanel"
          :id="`panel-${selectedType}`"
          :aria-labelledby="`tab-${selectedType}`"
        >
          <div class="dialog-header">
            <div class="dialog-avatar">
              <img 
                src="https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg" 
                alt="Gneiro AI"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="dialog-info">
              <h4 class="dialog-title">Gneiro AI</h4>
              <div class="dialog-status">
                <span class="status-indicator" aria-hidden="true"></span>
                <span>Онлайн</span>
              </div>
            </div>
          </div>
          
          <div class="dialog-messages">
            <template v-if="selectedType">
              <div 
                v-for="(message, index) in selectedDialog"
                :key="`message-${index}`"
                class="message"
                :class="message.sender"
                v-show="index < visibleMessages"
                aria-live="polite"
              >
                <div class="message-bubble">{{ message.text }}</div>
              </div>
              
              <!-- Typing indicator -->
              <div class="message bot" v-if="typingMessage" aria-live="polite">
                <div class="message-bubble">
                  <div class="typing-indicator" aria-label="Gneiro печатает...">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div class="business-cta">
        <button class="btn btn-primary" @click="goToPricing">
          {{ ctaButtonText }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.business-types-section {
  padding: var(--sp-8) 0;
  background-color: var(--color-bg);
  position: relative;
}

@media (min-width: 768px) {
  .business-types-section {
    padding: var(--sp-12) 0;
  }
}

@media (min-width: 1024px) {
  .business-types-section {
    padding: var(--sp-16) 0;
  }
}

.section-title {
  text-align: center;
  margin-bottom: var(--sp-6);
  font-size: var(--fz-h2);
  line-height: 1.2;
}

@media (min-width: 768px) {
  .section-title {
    margin-bottom: var(--sp-8);
  }
}

@media (min-width: 1024px) {
  .section-title {
    margin-bottom: var(--sp-12);
  }
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: var(--sp-8);
  margin-bottom: var(--sp-8);
}

@media (min-width: 1024px) {
  .content-area {
    flex-direction: row;
    gap: var(--sp-8);
  }
}

/* Business cards grid */
.business-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: var(--sp-4);
  width: 100%;
}

/* Mobile horizontal scrolling for business cards */
.business-cards-mobile {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: var(--sp-4);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.business-cards-mobile::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.business-cards-mobile .business-card {
  flex: 0 0 auto;
  width: 85%; /* Adjust width for mobile view */
  max-width: 250px;
  margin-right: var(--sp-4);
  scroll-snap-align: start;
}

.business-cards-mobile .business-card:last-child {
  margin-right: 0;
}

.business-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
  min-height: 180px;
}

.business-card:hover, .business-card:focus {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.business-card:focus {
  outline: none;
  border-color: var(--color-accent);
}

.business-card.active {
  border-color: var(--color-accent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(10, 132, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--sp-3);
  position: relative;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .icon-circle {
    width: 72px;
    height: 72px;
  }
}

.business-card.active .icon-circle {
  background-color: rgba(10, 132, 255, 0.15);
  transform: scale(1.1);
}

.icon-circle i {
  font-size: 24px;
  color: var(--color-accent);
}

@media (min-width: 768px) {
  .icon-circle i {
    font-size: 28px;
  }
}

.check-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background-color: var(--color-accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.business-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--sp-2);
  color: var(--color-text);
}

.business-description {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

/* Dialog example area */
.dialog-example {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  height: 350px;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .dialog-example {
    height: 400px;
    margin: 0;
  }
}

.dialog-header {
  background-color: var(--color-accent);
  color: white;
  padding: var(--sp-4);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.dialog-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.dialog-avatar img {
  width: 70%;
  height: auto;
}

.dialog-info {
  flex: 1;
}

.dialog-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.dialog-status {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: 0.8rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4ade80;
  display: inline-block;
}

.dialog-messages {
  flex: 1;
  padding: var(--sp-4);
  overflow-y: auto;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

/* Dark theme support */
:root[data-theme='dark'] .dialog-messages {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  animation: message-appear 0.3s ease-out;
}

.message.user {
  align-self: flex-end;
}

.message.bot {
  align-self: flex-start;
}

.message-bubble {
  padding: var(--sp-3);
  border-radius: 12px;
  position: relative;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
  background-color: #2A2F36;
  color: var(--color-text);
  border: 1px solid var(--color-border);
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

/* CTA button */
.business-cta {
  display: flex;
  justify-content: center;
  margin-top: var(--sp-6);
}

.btn {
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  min-width: 280px;
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
  font-size: 1.05rem;
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(10, 132, 255, 0.4);
  transform: translateY(-2px);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .btn-primary {
    width: 100%;
    max-width: 280px;
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .typing-indicator span {
    animation: none;
  }
  
  .business-card:hover, 
  .business-card:focus, 
  .business-card.active {
    transform: none;
  }
  
  .business-card.active .icon-circle {
    transform: none;
  }
  
  .btn-primary:hover {
    transform: none;
  }
  
  .message {
    animation: none;
  }
}
</style>