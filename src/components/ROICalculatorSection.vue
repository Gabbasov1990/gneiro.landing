<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { prefersReducedMotion, formatNumber } from '@/lib/utils';

// Form inputs with default values
const inquiriesPerDay = ref(45);
const averageOrderValue = ref(18000);
const conversionRate = ref(15);
const hasCRM = ref(true);

// Results
const savedHoursPerMonth = computed(() => {
  // Inquiries per day × 3 minutes / 60 × 30 days
  return Math.round((inquiriesPerDay.value * 3 / 60) * 30);
});

const additionalMonthlySales = computed(() => {
  // Inquiries × (Conversion/100) × Order Value × 0.1 × 30 days
  return Math.round(inquiriesPerDay.value * (conversionRate.value / 100) * averageOrderValue.value * 0.1 * 30);
});

const crmEfficiencyFactor = computed(() => {
  return hasCRM.value ? 1.1 : 1.0;
});

const roiDays = computed(() => {
  // Monthly subscription cost / (daily additional sales × CRM efficiency)
  const monthlyCost = 14900; // Fixed cost of "Микро бизнес" tariff
  const dailyAdditionalSales = additionalMonthlySales.value / 30;
  
  const result = Math.ceil(monthlyCost / (dailyAdditionalSales * crmEfficiencyFactor.value));
  
  // Cap the result to reasonable bounds
  if (result <= 0 || !isFinite(result)) return 1;
  if (result > 90) return 90;
  
  return result;
});

// For formatted values in the UI
const formattedAdditionalSales = computed(() => {
  return formatNumber(additionalMonthlySales.value);
});

// Calculate ROI immediately when values change
watch([inquiriesPerDay, averageOrderValue, conversionRate, hasCRM], () => {
  // Validate inputs
  if (inquiriesPerDay.value < 1) inquiriesPerDay.value = 1;
  if (averageOrderValue.value < 1000) averageOrderValue.value = 1000;
  if (conversionRate.value < 1) conversionRate.value = 1;
  if (conversionRate.value > 100) conversionRate.value = 100;
});

// Animation controls
const isExpanded = ref(false);
const isReducedMotion = ref(prefersReducedMotion());
const isMobile = ref(window.innerWidth < 768);

// Check screen size and update layout
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
};

// Toggle FAQ explanation
const toggleExplanation = () => {
  isExpanded.value = !isExpanded.value;
};

// Scroll to pricing section
const scrollToPricing = () => {
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    pricingSection.scrollIntoView({ 
      behavior: isReducedMotion.value ? 'auto' : 'smooth' 
    });
  }
};

// Open chat or contact form
const openContactForm = () => {
  const finalCtaSection = document.getElementById('final-cta');
  if (finalCtaSection) {
    finalCtaSection.scrollIntoView({ 
      behavior: isReducedMotion.value ? 'auto' : 'smooth' 
    });
  }
};

onMounted(() => {
  // Set up resize listener
  window.addEventListener('resize', checkScreenSize);
  checkScreenSize(); // Initial check
  
  // Clean up event listener on component destroy
  return () => {
    window.removeEventListener('resize', checkScreenSize);
  };
});
</script>

<template>
  <section id="roi" class="roi-calculator-section scroll-mt-20">
    <div class="container">
      <h2 class="section-title">Рассчитайте окупаемость для вашего бизнеса</h2>
      
      <div class="calculator-container">
        <!-- Calculator form -->
        <div class="calculator-form">
          <div class="form-row">
            <div class="form-group">
              <label for="inquiries" class="form-label">Количество обращений в день</label>
              <input 
                type="number" 
                id="inquiries" 
                v-model="inquiriesPerDay"
                min="1"
                class="form-input"
                placeholder="например, 45"
                aria-describedby="inquiries-desc"
              />
              <small id="inquiries-desc" class="form-hint">Среднее число запросов в WhatsApp</small>
            </div>
            
            <div class="form-group">
              <label for="orderValue" class="form-label">Средний чек, ₸</label>
              <input 
                type="number" 
                id="orderValue" 
                v-model="averageOrderValue"
                min="1000"
                step="1000"
                class="form-input"
                placeholder="например, 18 000"
                aria-describedby="ordervalue-desc"
              />
              <small id="ordervalue-desc" class="form-hint">Сумма среднего заказа</small>
            </div>
            
            <div class="form-group">
              <label for="conversion" class="form-label">Конверсия в продажу, %</label>
              <input 
                type="number" 
                id="conversion" 
                v-model="conversionRate"
                min="1"
                max="100"
                class="form-input"
                placeholder="например, 15"
                aria-describedby="conversion-desc"
              />
              <small id="conversion-desc" class="form-hint">Текущая конверсия запросов в продажи</small>
            </div>
            
            <div class="form-group crm-toggle">
              <span class="form-label" id="crm-label">У вас уже есть CRM?</span>
              <div 
                class="toggle-container" 
                role="radiogroup"
                aria-labelledby="crm-label"
              >
                <button 
                  class="toggle-button" 
                  :class="{ 'active': hasCRM }"
                  @click="hasCRM = true"
                  role="radio"
                  :aria-checked="hasCRM"
                >
                  Да
                </button>
                <button 
                  class="toggle-button" 
                  :class="{ 'active': !hasCRM }"
                  @click="hasCRM = false"
                  role="radio" 
                  :aria-checked="!hasCRM"
                >
                  Нет
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Results card -->
        <div class="results-card">
          <div class="result-item primary">
            <div class="result-value" aria-live="polite">{{ roiDays }} дней</div>
            <div class="result-label">Окупаемость</div>
          </div>
          
          <div class="result-item">
            <div class="result-value" aria-live="polite">{{ savedHoursPerMonth }} ч/мес</div>
            <div class="result-label">Экономия времени</div>
          </div>
          
          <div class="result-item">
            <div class="result-value" aria-live="polite">{{ formattedAdditionalSales }} ₸</div>
            <div class="result-label">Доп. продажи в месяц</div>
          </div>
          
          <!-- FAQ/Explanation toggle -->
          <div class="explanation-toggle">
            <button 
              @click="toggleExplanation" 
              class="toggle-explanation"
              :aria-expanded="isExpanded"
              aria-controls="explanation-content"
            >
              Как мы считаем
              <i :class="isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" aria-hidden="true"></i>
            </button>
          </div>
          
          <!-- Expandable explanation -->
          <div 
            id="explanation-content"
            class="explanation-content" 
            :class="{ 'expanded': isExpanded }"
          >
            <p>Расчёт строится на:</p>
            <ul>
              <li>Экономия времени: 3 минуты на каждое обращение</li>
              <li>Дополнительные продажи: в среднем +10% к существующим продажам</li>
              <li>С CRM эффективность выше на 10%</li>
              <li>Окупаемость считается относительно тарифа "Микро бизнес" (14 900 ₸/мес)</li>
            </ul>
            <p class="disclaimer">Результаты примерные и зависят от специфики вашего бизнеса</p>
          </div>
        </div>
      </div>
      
      <!-- CTA buttons -->
      <div class="roi-cta">
        <button 
          @click="scrollToPricing" 
          class="btn btn-primary"
          aria-label="Попробовать бесплатно"
        >
          Попробовать бесплатно
        </button>
        <button 
          @click="openContactForm" 
          class="btn btn-outline"
          aria-label="Задать вопрос"
        >
          Задать вопрос
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.roi-calculator-section {
  padding: var(--sp-8) 0;
  background-color: var(--color-surface);
}

@media (min-width: 768px) {
  .roi-calculator-section {
    padding: var(--sp-12) 0;
  }
}

@media (min-width: 1024px) {
  .roi-calculator-section {
    padding: var(--sp-16) 0;
  }
}

.section-title {
  font-size: var(--fz-h2);
  margin-bottom: var(--sp-6);
  text-align: center;
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

.calculator-container {
  display: flex;
  flex-direction: column;
  gap: var(--sp-8);
  margin-bottom: var(--sp-8);
}

@media (min-width: 1024px) {
  .calculator-container {
    flex-direction: row;
    gap: var(--sp-12);
  }
}

/* Form styles */
.calculator-form {
  flex: 1;
  min-width: 300px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

@media (min-width: 768px) {
  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-4) var(--sp-6);
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: var(--fz-body);
  font-weight: 500;
  margin-bottom: var(--sp-2);
  color: var(--color-text);
}

.form-hint {
  font-size: var(--fz-xs);
  color: var(--color-text-muted);
  margin-top: var(--sp-1);
}

.form-input {
  width: 100%;
  padding: var(--sp-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.75);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  min-height: 44px;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.15);
}

:root[data-theme='dark'] .form-input {
  background-color: rgba(30, 32, 34, 0.65);
}

/* CRM toggle */
.crm-toggle {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.toggle-container {
  display: flex;
  gap: 2px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--color-border);
  padding: 2px;
}

.toggle-button {
  background: transparent;
  border: none;
  padding: var(--sp-2) var(--sp-3);
  cursor: pointer;
  flex: 1;
  font-size: 0.95rem;
  border-radius: calc(var(--radius-sm) - 2px);
  transition: all 0.2s ease;
  min-height: 40px;
  color: var(--color-text-muted);
}

.toggle-button.active {
  background-color: white;
  font-weight: 500;
  color: var(--color-text);
}

.toggle-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

:root[data-theme='dark'] .toggle-button.active {
  background-color: var(--color-surface);
}

/* Results card */
.results-card {
  flex: 1;
  min-width: 300px;
  background-color: var(--color-bg);
  border-radius: var(--radius-xl, 1.25rem);
  padding: var(--sp-6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  transition: all 0.3s ease;
}

.results-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.result-item {
  text-align: center;
  padding: var(--sp-3);
}

.result-item.primary {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--sp-6);
  margin-bottom: var(--sp-2);
}

.result-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.1;
}

.result-item.primary .result-value {
  font-size: 3rem;
  color: var(--color-accent);
}

.result-label {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin-top: var(--sp-1);
}

/* Explanation toggle */
.explanation-toggle {
  margin-top: var(--sp-2);
  text-align: center;
}

.toggle-explanation {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  margin: 0 auto;
  padding: var(--sp-2);
  min-height: 44px;
  justify-content: center;
}

.toggle-explanation:hover {
  color: var(--color-accent);
}

.toggle-explanation:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Expandable explanation */
.explanation-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
  opacity: 0;
  padding: 0 var(--sp-2);
  font-size: 0.9rem;
}

.explanation-content.expanded {
  max-height: 300px;
  opacity: 1;
  padding: var(--sp-4) var(--sp-2);
  border-top: 1px solid var(--color-border);
}

.explanation-content p {
  margin-bottom: var(--sp-2);
}

.explanation-content ul {
  margin: var(--sp-2) 0;
  padding-left: var(--sp-6);
}

.explanation-content li {
  margin-bottom: var(--sp-1);
  color: var(--color-text-muted);
}

.disclaimer {
  font-style: italic;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: center;
  margin-top: var(--sp-4);
}

/* CTA buttons */
.roi-cta {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  align-items: center;
}

@media (min-width: 768px) {
  .roi-cta {
    flex-direction: row;
    gap: var(--sp-6);
    justify-content: center;
  }
}

.btn {
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  min-width: 200px;
  min-height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.2);
  width: 100%;
  max-width: 240px;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  width: 100%;
  max-width: 240px;
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(10, 132, 255, 0.3);
  transform: translateY(-2px);
}

.btn-primary:focus-visible,
.btn-outline:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn-outline:hover {
  border-color: var(--color-text-muted);
  background-color: var(--color-surface);
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .btn-primary, .btn-outline {
    width: auto;
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .results-card:hover {
    transform: none;
  }
  
  .explanation-content {
    transition: none;
  }
  
  .btn:hover {
    transform: none;
  }
}
</style>