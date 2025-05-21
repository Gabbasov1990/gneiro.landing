<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { prefersReducedMotion } from '@/lib/utils';

// Reactive state
const billingPeriod = ref<'monthly' | 'sixMonth'>('monthly');
const microMessagesCount = ref(1500);
const growthMessagesCount = ref(10000);
const isReducedMotion = ref(prefersReducedMotion());
const isMobile = ref(window.innerWidth < 768);

// Pricing plans data
const plans = [
  {
    id: 'micro',
    name: 'Микро бизнес',
    basePrice: 14900,
    stepPrice: 3,
    minMessages: 1000,
    maxMessages: 5000,
    defaultMessages: 1500,
    popular: false,
    features: [
      '1 WhatsApp + чат-виджет',
      'Базовая CRM',
      'База знаний о товарах',
      'Умные скрипты продаж',
      'Поддержка в рабочие часы'
    ]
  },
  {
    id: 'growth',
    name: 'Рост бизнеса',
    basePrice: 49900,
    stepPrice: 2,
    minMessages: 3000,
    maxMessages: 20000,
    defaultMessages: 10000,
    popular: true,
    features: [
      '2 WhatsApp, Telegram, Instagram + виджет',
      'Рассылки по базе клиентов',
      'Расширенная CRM-интеграция',
      'Аналитика эффективности',
      'Приоритетная поддержка 12/7'
    ]
  },
  {
    id: 'unlimited',
    name: 'Без ограничений',
    basePrice: 0, // Custom pricing
    stepPrice: 0,
    minMessages: 0,
    maxMessages: 0,
    defaultMessages: 0,
    isCustom: true,
    popular: false,
    features: [
      'Все каналы связи',
      'Неограниченное число сообщений',
      'API-интеграция',
      'Индивидуальная настройка AI',
      'Персональный менеджер 24/7',
      'White Label решение'
    ]
  }
];

const router = useRouter();

// Initialize component
onMounted(() => {
  // Set default values for sliders
  microMessagesCount.value = plans[0].defaultMessages;
  growthMessagesCount.value = plans[1].defaultMessages;
  
  // Setup resize listener
  window.addEventListener('resize', handleResize);
  handleResize(); // Initial check
  
  // Clean up
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

// Computed properties
const getPlanPrice = (plan: typeof plans[0], messagesCount: number) => {
  if (plan.isCustom) return 'Индивидуально';
  
  let basePrice = plan.basePrice;
  
  // Add price for additional messages
  if (messagesCount > plan.defaultMessages) {
    basePrice += (messagesCount - plan.defaultMessages) * plan.stepPrice;
  }
  
  // Apply discount for 6-month billing
  if (billingPeriod.value === 'sixMonth') {
    const sixMonthPrice = basePrice * 6;
    const discountedPrice = Math.round(sixMonthPrice * 0.85);
    return {
      original: sixMonthPrice,
      discounted: discountedPrice
    };
  }
  
  return basePrice;
};

const microPrice = computed(() => {
  return getPlanPrice(plans[0], microMessagesCount.value);
});

const growthPrice = computed(() => {
  return getPlanPrice(plans[1], growthMessagesCount.value);
});

const formatPrice = (price: number | { original: number, discounted: number } | string) => {
  if (typeof price === 'string') return price;
  
  if (typeof price === 'object') {
    return `<span class="original-price">${new Intl.NumberFormat('ru-RU').format(price.original)}</span> <span class="discounted-price">${new Intl.NumberFormat('ru-RU').format(price.discounted)}</span>`;
  }
  
  return new Intl.NumberFormat('ru-RU').format(price);
};

const formatPriceNumeric = (price: number | { original: number, discounted: number } | string) => {
  if (typeof price === 'string') return price;
  
  if (typeof price === 'object') {
    return new Intl.NumberFormat('ru-RU').format(price.discounted);
  }
  
  return new Intl.NumberFormat('ru-RU').format(price);
};

const periodLabel = computed(() => {
  return billingPeriod.value === 'monthly' ? '/мес' : '/6 мес';
});

// Actions
const toggleBillingPeriod = (period: 'monthly' | 'sixMonth') => {
  billingPeriod.value = period;
};

const selectPlan = (planId: string) => {
  // This would redirect to a signup page with the selected plan
  console.log(`Selected plan: ${planId}`);
  // router.push(`/signup?plan=${planId}`);
  
  // For now, just scroll to a contact section or similar
  const contactSection = document.getElementById('start');
  if (contactSection) {
    contactSection.scrollIntoView({ 
      behavior: isReducedMotion.value ? 'auto' : 'smooth' 
    });
  }
};
</script>

<template>
  <section id="pricing" class="pricing-section scroll-mt-20">
    <div class="container">
      <h2 class="section-title">Выберите подходящий план</h2>
      
      <!-- Billing period toggle -->
      <fieldset class="billing-toggle">
        <legend class="sr-only">Период оплаты</legend>
        <div class="toggle-container" role="radiogroup" aria-label="Выберите период оплаты">
          <label class="toggle-option" :class="{ active: billingPeriod === 'monthly' }">
            <input 
              type="radio" 
              name="billing" 
              value="monthly" 
              v-model="billingPeriod" 
              class="sr-only"
              aria-label="Ежемесячная оплата"
            />
            <span>1 месяц</span>
          </label>
          <label class="toggle-option" :class="{ active: billingPeriod === 'sixMonth' }">
            <input 
              type="radio" 
              name="billing" 
              value="sixMonth" 
              v-model="billingPeriod" 
              class="sr-only"
              aria-label="Оплата за 6 месяцев"
            />
            <div class="discount-option">
              <span>6 месяцев</span>
              <span class="discount-badge">-15%</span>
            </div>
          </label>
        </div>
      </fieldset>
      
      <!-- Pricing cards -->
      <div class="pricing-grid">
        <!-- Micro Business Plan -->
        <div :class="['pricing-card', {'card-mobile': isMobile}]">
          <div class="card-header">
            <h3 class="plan-name">{{ plans[0].name }}</h3>
            <div class="plan-price" v-html="`${formatPrice(microPrice)} <span class='period'>${periodLabel}</span>`"></div>
          </div>
          
          <div class="messages-slider">
            <label for="micro-messages-slider">Сообщений в месяц: <strong>{{ microMessagesCount }}</strong></label>
            <div class="slider-container">
              <input 
                type="range" 
                id="micro-messages-slider" 
                v-model="microMessagesCount" 
                :min="plans[0].minMessages" 
                :max="plans[0].maxMessages" 
                :step="500"
                class="range-slider"
                aria-valuemin="1000"
                aria-valuemax="5000"
                :aria-valuenow="microMessagesCount"
                :aria-valuetext="`${microMessagesCount} сообщений`"
              />
            </div>
            <div class="slider-labels">
              <span class="min-label">{{ plans[0].minMessages }}</span>
              <span class="max-label">{{ plans[0].maxMessages }}</span>
            </div>
            <div class="slider-price">
              <span>{{ formatPriceNumeric(microPrice) }} ₸</span>
            </div>
          </div>
          
          <ul class="features-list">
            <li v-for="(feature, index) in plans[0].features" :key="`micro-${index}`" class="feature-item">
              <i class="pi pi-check" aria-hidden="true"></i>
              <span>{{ feature }}</span>
            </li>
          </ul>
          
          <button 
            @click="selectPlan(plans[0].id)" 
            class="btn btn-outline btn-full"
            aria-label="Попробовать тариф Микро бизнес"
          >
            Попробовать
          </button>
        </div>
        
        <!-- Growth Business Plan (Popular) -->
        <div :class="['pricing-card', 'popular', {'card-mobile': isMobile}]">
          <div class="popular-badge" aria-hidden="true">Самый популярный</div>
          <div class="card-header">
            <h3 class="plan-name">{{ plans[1].name }}</h3>
            <div class="plan-price" v-html="`${formatPrice(growthPrice)} <span class='period'>${periodLabel}</span>`"></div>
          </div>
          
          <div class="messages-slider">
            <label for="growth-messages-slider">Сообщений в месяц: <strong>{{ growthMessagesCount }}</strong></label>
            <div class="slider-container">
              <input 
                type="range" 
                id="growth-messages-slider" 
                v-model="growthMessagesCount" 
                :min="plans[1].minMessages" 
                :max="plans[1].maxMessages" 
                :step="1000"
                class="range-slider"
                aria-valuemin="3000"
                aria-valuemax="20000"
                :aria-valuenow="growthMessagesCount"
                :aria-valuetext="`${growthMessagesCount} сообщений`"
              />
            </div>
            <div class="slider-labels">
              <span class="min-label">{{ plans[1].minMessages }}</span>
              <span class="max-label">{{ plans[1].maxMessages }}</span>
            </div>
            <div class="slider-price">
              <span>{{ formatPriceNumeric(growthPrice) }} ₸</span>
            </div>
          </div>
          
          <ul class="features-list">
            <li v-for="(feature, index) in plans[1].features" :key="`growth-${index}`" class="feature-item">
              <i class="pi pi-check" aria-hidden="true"></i>
              <span>{{ feature }}</span>
            </li>
          </ul>
          
          <button 
            @click="selectPlan(plans[1].id)" 
            class="btn btn-primary btn-full"
            aria-label="Попробовать популярный тариф Рост бизнеса"
          >
            Попробовать
          </button>
        </div>
        
        <!-- Unlimited Plan -->
        <div :class="['pricing-card', {'card-mobile': isMobile}]">
          <div class="card-header">
            <h3 class="plan-name">{{ plans[2].name }}</h3>
            <div class="plan-price">
              Индивидуально
              <span class="period"></span>
            </div>
          </div>
          
          <div class="custom-price-note">
            <p>Персональное предложение для крупного бизнеса с индивидуальными потребностями</p>
          </div>
          
          <ul class="features-list">
            <li v-for="(feature, index) in plans[2].features" :key="`unlimited-${index}`" class="feature-item">
              <i class="pi pi-check" aria-hidden="true"></i>
              <span>{{ feature }}</span>
            </li>
          </ul>
          
          <button 
            @click="selectPlan(plans[2].id)" 
            class="btn btn-outline btn-full"
            aria-label="Получить предложение для корпоративного тарифа Без ограничений"
          >
            Получить предложение
          </button>
        </div>
      </div>
      
      <div class="pricing-footnote">
        <p>Все тарифы включают 7-дневный бесплатный пробный период. Отмена в любое время.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-section {
  padding: var(--sp-8) 0;
  background-color: var(--color-bg);
}

@media (min-width: 768px) {
  .pricing-section {
    padding: var(--sp-12) 0;
  }
}

@media (min-width: 1024px) {
  .pricing-section {
    padding: var(--sp-16) 0;
  }
}

.section-title {
  text-align: center;
  margin-bottom: var(--sp-6);
  font-size: var(--fz-h2);
  color: var(--color-text);
}

@media (min-width: 768px) {
  .section-title {
    margin-bottom: var(--sp-8);
  }
}

/* Billing period toggle */
.billing-toggle {
  border: none;
  margin: 0 0 var(--sp-8);
  padding: 0;
  display: flex;
  justify-content: center;
}

.toggle-container {
  display: flex;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toggle-option {
  padding: var(--sp-2) var(--sp-4);
  border-radius: calc(var(--radius-lg) - 4px);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.toggle-option.active {
  background-color: var(--color-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: var(--color-accent);
}

.toggle-option:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.discount-option {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.discount-badge {
  background-color: var(--color-accent);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Pricing grid */
.pricing-grid {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
  margin-bottom: var(--sp-8);
  align-items: center;
}

@media (min-width: 1024px) {
  .pricing-grid {
    flex-direction: row;
    align-items: stretch;
  }
}

/* Pricing card */
.pricing-card {
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-xl, 1.25rem);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: var(--sp-6);
  display: flex;
  flex-direction: column;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 400px;
}

.card-mobile {
  position: relative;
  padding-bottom: calc(var(--sp-6) + 60px); /* Space for sticky button */
}

:root[data-theme='dark'] .pricing-card {
  background-color: rgba(30, 32, 34, 0.65);
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Popular plan styling */
.pricing-card.popular {
  border-color: var(--color-accent);
  z-index: 1;
}

@media (min-width: 1024px) {
  .pricing-card.popular {
    transform: scale(1.05);
  }

  .pricing-card.popular:hover {
    transform: scale(1.05) translateY(-4px);
  }
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-accent);
  color: white;
  padding: 4px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Card header */
.card-header {
  margin-bottom: var(--sp-6);
  text-align: center;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--sp-4);
}

.plan-price {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--sp-2);
}

.period {
  font-size: 1rem;
  font-weight: 400;
  color: var(--color-text-muted);
}

.original-price {
  font-size: 1.25rem;
  text-decoration: line-through;
  color: var(--color-text-muted);
  margin-right: var(--sp-2);
}

.discounted-price {
  color: var(--color-accent);
}

/* Message slider */
.messages-slider {
  margin-bottom: var(--sp-6);
  padding-bottom: var(--sp-4);
  border-bottom: 1px solid var(--color-border);
}

.messages-slider label {
  display: block;
  margin-bottom: var(--sp-2);
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.slider-container {
  margin-bottom: var(--sp-2);
}

.range-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background-color: var(--color-border);
  border-radius: 3px;
  outline: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.range-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  border: none;
}

.range-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.range-slider:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.slider-price {
  margin-top: var(--sp-2);
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-accent);
}

/* Custom price note for Enterprise plan */
.custom-price-note {
  padding: var(--sp-3);
  margin-bottom: var(--sp-6);
  border-radius: var(--radius-sm);
  background-color: rgba(0, 0, 0, 0.05);
  text-align: center;
}

.custom-price-note p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

/* Features list */
.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--sp-6);
  flex-grow: 1;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-2);
  margin-bottom: var(--sp-3);
  font-size: 0.95rem;
}

.feature-item i {
  color: var(--color-accent);
  font-size: 1rem;
  margin-top: 0.2rem;
}

/* CTA buttons */
.btn {
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  min-height: 44px;
}

.btn-full {
  width: 100%;
  min-height: 48px;
}

.card-mobile .btn-full {
  position: absolute;
  bottom: var(--sp-4);
  left: var(--sp-4);
  right: var(--sp-4);
  width: calc(100% - 2 * var(--sp-4));
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.2);
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

/* Footnote */
.pricing-footnote {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .pricing-card:hover {
    transform: none;
  }
  
  .pricing-card.popular:hover {
    transform: scale(1.05);
  }
  
  .range-slider::-webkit-slider-thumb:hover {
    transform: none;
  }
  
  .range-slider::-moz-range-thumb:hover {
    transform: none;
  }
  
  .btn:hover {
    transform: none;
  }
}
</style>