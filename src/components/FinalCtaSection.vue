<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import { prefersReducedMotion } from '@/lib/utils';

const router = useRouter();
const isReducedMotion = ref(prefersReducedMotion());

// FAQ data
const faqItems = [
  {
    id: 1,
    question: 'Что если мой бизнес нестандартный?',
    answer: 'Gneiro поддерживает кастом-скрипты и открытое API. Поможем адаптировать под любой процесс.'
  },
  {
    id: 2,
    question: 'Нужно ли скачивать приложение?',
    answer: 'Нет. Всё работает в браузере. На смартфоне можно закрепить как PWA-иконку.'
  },
  {
    id: 3,
    question: 'Могу ли я менять скрипты?',
    answer: 'Да. Редактируйте готовые сценарии или создавайте свои в визуальном редакторе без кода.'
  },
  {
    id: 4,
    question: 'Сколько каналов можно подключить?',
    answer: 'От 1 до неограниченного числа. Планы выше включают Telegram, Instagram, FB Messenger и API.'
  },
  {
    id: 5,
    question: 'Как подключить CRM?',
    answer: 'В один клик через коннекторы AmoCRM, Bitrix24, HubSpot или через Webhook/REST API.'
  },
  {
    id: 6,
    question: 'Что если клиент задаст сложный вопрос?',
    answer: 'Бот проверит базу знаний; если ответа нет — передаст чат менеджеру и отметит диалог.'
  },
  {
    id: 7,
    question: 'Какие языки поддерживает система?',
    answer: 'Русский, казахский, английский. Auto-detect в первом сообщении.'
  }
];

// Handler for CTA buttons
const tryFree = () => {
  router.push('/create');
};

const requestDemo = () => {
  router.push('/demo');
};
</script>

<template>
  <section id="final-cta" class="final-cta-section scroll-mt-20" data-sr>
    <div class="container">
      <!-- Main CTA Card -->
      <div class="cta-card">
        <h2 class="cta-title">Ваш ИИ-продавец готов — настройте его за 5 минут</h2>
        <p class="cta-subtitle">Дайте бизнесу продавать 24/7 уже сегодня</p>
        
        <div class="cta-buttons">
          <button 
            @click="tryFree" 
            class="btn btn-primary" 
            role="button" 
            aria-label="Попробовать бесплатно 7 дней"
          >
            Попробовать бесплатно 7 дней
          </button>
          
          <button 
            @click="requestDemo" 
            class="btn btn-outline" 
            role="button" 
            aria-label="Запросить демо"
          >
            Запросить демо
          </button>
        </div>
        
        <p class="cta-note">Не нужно карты, отмена в любой момент</p>
      </div>
      
      <!-- FAQ Section -->
      <div class="faq-section">
        <h2 class="faq-title">Часто задаваемые вопросы</h2>
        
        <div class="faq-container">
          <Accordion :multiple="false" :activeIndex="0">
            <AccordionTab 
              v-for="(item, index) in faqItems" 
              :key="item.id" 
              :header="item.question"
              :pt="{
                root: { class: 'faq-item' },
                headerAction: { class: 'faq-header' },
                headerIcon: { class: 'faq-icon' },
                content: { class: 'faq-content' }
              }"
            >
              <p class="faq-answer">{{ item.answer }}</p>
            </AccordionTab>
          </Accordion>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.final-cta-section {
  padding: var(--sp-8) 0;
  background-color: var(--color-surface);
}

@media (min-width: 768px) {
  .final-cta-section {
    padding: var(--sp-12) 0;
  }
}

@media (min-width: 1024px) {
  .final-cta-section {
    padding: var(--sp-16) 0;
  }
}

.container {
  display: flex;
  flex-direction: column;
  gap: var(--sp-12);
}

/* CTA Card */
.cta-card {
  max-width: 592px;
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-xl, 1.25rem);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: var(--sp-6);
  text-align: center;
  animation: fadeUp 0.4s ease forwards;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .cta-card {
    padding: var(--sp-8);
  }
}

:root[data-theme='dark'] .cta-card {
  background-color: rgba(30, 32, 34, 0.65);
}

/* Add a subtle accent glow */
.cta-card::before {
  content: '';
  position: absolute;
  top: -100px;
  left: -100px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%);
  opacity: 0.6;
  z-index: -1;
}

.cta-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--sp-3);
  color: var(--color-text);
}

@media (min-width: 768px) {
  .cta-title {
    font-size: 2rem;
  }
}

.cta-subtitle {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  margin-bottom: var(--sp-6);
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  margin-bottom: var(--sp-4);
}

@media (min-width: 640px) {
  .cta-buttons {
    flex-direction: row;
    justify-content: center;
  }
}

.btn {
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;
  min-width: 200px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.2);
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(10, 132, 255, 0.3);
  transform: translateY(-2px);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-outline:hover {
  border-color: var(--color-text-muted);
  background-color: var(--color-surface);
  transform: translateY(-2px);
}

.btn-outline:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.cta-note {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: var(--sp-2);
  margin-bottom: 0;
  opacity: 0.8;
}

/* FAQ Section */
.faq-section {
  max-width: 1024px;
  margin: 0 auto;
}

.faq-title {
  text-align: center;
  margin-bottom: var(--sp-6);
  font-size: 1.75rem;
  color: var(--color-text);
}

@media (min-width: 768px) {
  .faq-title {
    margin-bottom: var(--sp-8);
    font-size: 1.8rem;
  }
}

.faq-container {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

/* Customize PrimeVue Accordion */
:deep(.faq-item) {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--sp-4);
  background-color: var(--color-bg);
}

:deep(.faq-header) {
  padding: var(--sp-4);
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-height: 64px;
}

:deep(.faq-header:hover) {
  background-color: var(--color-surface);
}

:deep(.faq-icon) {
  color: var(--color-accent);
  margin-left: auto;
  transition: transform 0.3s ease;
}

:deep(.p-accordion-tab-active .faq-icon) {
  transform: rotate(180deg);
}

:deep(.faq-content) {
  padding: 0 var(--sp-4) var(--sp-4);
  animation: fadeContent 0.25s ease;
}

.faq-answer {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* Animations */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeContent {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive styles for tablet & mobile */
@media (min-width: 1024px) {
  .faq-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-4);
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .cta-card {
    animation: none;
  }
  
  .btn:hover {
    transform: none;
  }
  
  :deep(.faq-content) {
    animation: none;
  }
}
</style>