<script setup lang="ts">
import { ref } from 'vue';

// Step data for the 5-step process
const steps = [
  {
    number: 1,
    title: 'Зарегистрируйтесь',
    description: 'Создайте бесплатный аккаунт на платформе Gneiro'
  },
  {
    number: 2,
    title: 'Загрузите информацию',
    description: 'Добавьте данные о ваших товарах и услугах'
  },
  {
    number: 3,
    title: 'Настройте скрипты',
    description: 'Задайте шаблоны ответов и сценарии разговоров'
  },
  {
    number: 4,
    title: 'Подключите WhatsApp',
    description: 'Привяжите рабочий номер WhatsApp к системе'
  },
  {
    number: 5,
    title: 'Запустите продажи',
    description: 'Активируйте AI-продавца и начните получать прибыль'
  }
];
</script>

<template>
  <section id="start" class="five-steps-section" data-sr>
    <div class="container">
      <h2 class="section-title">Запустите AI-продавца за 5 шагов</h2>
      
      <div class="steps-container">
        <div v-for="step in steps" :key="step.number" class="step-item">
          <div class="step-progress">
            <div class="step-number">{{ step.number }}</div>
          </div>
          <div class="step-content">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.five-steps-section {
  padding: var(--space-16) 0;
  background-color: var(--color-surface);
}

.section-title {
  text-align: center;
  margin-bottom: var(--space-12);
  font-size: var(--fz-h2);
  color: var(--color-text);
}

.steps-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-6);
}

.step-progress {
  position: relative;
  width: 100%;
  max-width: 400px;
  flex-shrink: 0;
}

.step-progress::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background-color: var(--color-accent);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-number {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
}

.step-content {
  flex: 1;
  padding-top: 6px;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--color-text);
}

.step-description {
  color: var(--color-text-muted);
  font-size: 1rem;
}

/* Responsive styles */
@media (max-width: 768px) {
  .step-item {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .step-progress {
    width: 100%;
  }
  
  .step-content {
    padding-top: 0;
  }
}
</style>