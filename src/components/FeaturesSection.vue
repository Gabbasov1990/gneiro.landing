<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Features data
const features = [
  {
    id: 'always-online',
    icon: 'pi pi-clock',
    title: 'Работает 24/7',
    description: 'Отвечает клиентам в любое время суток без перерывов и выходных'
  },
  {
    id: 'understands-requests',
    icon: 'pi pi-comments',
    title: 'Понимает запросы',
    description: 'Распознает вопросы клиентов и дает на них точные ответы'
  },
  {
    id: 'increases-sales',
    icon: 'pi pi-shopping-cart',
    title: 'Увеличивает продажи',
    description: 'Помогает клиентам выбрать товар и оформить заказ'
  },
  {
    id: 'automates-followup',
    icon: 'pi pi-send',
    title: 'Автоматические follow-up',
    description: 'Напоминает клиентам о незавершённых заказах и брошенных корзинах'
  },
  {
    id: 'integrates-with-crm',
    icon: 'pi pi-database',
    title: 'Интеграция с CRM',
    description: 'Автоматически сохраняет контакты и создаёт сделки в вашей CRM-системе'
  },
  {
    id: 'analytics',
    icon: 'pi pi-chart-line',
    title: 'Аналитика и отчёты',
    description: 'Детальная статистика по конверсии, времени ответа и эффективности продаж'
  }
];

// Control animation for prefers-reduced-motion users
const prefersReducedMotion = ref(false);

// Check if user prefers reduced motion
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
});
</script>

<template>
  <section id="features" class="features-section" data-sr>
    <div class="container">
      <h2 class="section-title">Интеллектуальный помощник продаж</h2>
      
      <div class="features-grid">
        <article 
          v-for="(feature, index) in features" 
          :key="feature.id"
          class="feature-card"
          :style="`animation-delay: ${prefersReducedMotion ? 0 : index * 100}ms`"
        >
          <div class="feature-icon-wrapper">
            <i :class="feature.icon"></i>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </article>
      </div>
      
      <div class="features-cta">
        <RouterLink to="/#pricing" class="btn btn-primary">Попробовать бесплатно</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  padding: var(--space-16) 0;
  background-color: var(--color-surface);
}

.section-title {
  text-align: center;
  margin-bottom: var(--space-12);
  font-size: var(--fz-h2);
  color: var(--color-text);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.feature-card {
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  animation: fadeInUp 0.5s forwards ease-out;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(10, 132, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1);
  background-color: rgba(10, 132, 255, 0.15);
}

.feature-icon-wrapper i {
  font-size: 2rem;
  color: var(--color-accent);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--color-text);
}

.feature-description {
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.features-cta {
  text-align: center;
  margin-top: var(--space-8);
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.2);
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(10, 132, 255, 0.3);
  transform: translateY(-2px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive styles */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-card {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .section-title {
    font-size: calc(var(--fz-h2) * 0.8);
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .feature-card {
    animation: none;
    opacity: 1;
  }
  
  .feature-card:hover {
    transform: none;
  }
  
  .feature-card:hover .feature-icon-wrapper {
    transform: none;
  }
  
  .btn:hover {
    transform: none;
  }
}
</style>