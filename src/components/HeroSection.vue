<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { prefersReducedMotion, formatNumber } from '@/lib/utils';

const router = useRouter();

// Для анимированного счётчика сэкономленных часов
const savedHours = ref(0);
const targetHours = 4782; // Целевое значение
const isReducedMotion = ref(prefersReducedMotion());

// Анимация счётчика сэкономленных часов
onMounted(() => {
  // Если пользователь предпочитает меньше анимаций, просто установим финальное значение
  if (isReducedMotion.value) {
    savedHours.value = targetHours;
    return;
  }
  
  const duration = 1000; // 1 секунда для анимации
  const steps = 60; // Количество шагов (для плавности)
  const increment = targetHours / steps;
  const stepTime = duration / steps;
  
  let current = 0;
  const timer = setInterval(() => {
    current++;
    savedHours.value = Math.min(Math.floor(increment * current), targetHours);
    
    if (current >= steps) {
      clearInterval(timer);
      savedHours.value = targetHours;
    }
  }, stepTime);
});

// Navigate to the create assistant page
const scrollToStart = () => {
  router.push('/create');
};

// Открытие демо в WhatsApp
const openDemo = () => {
  // Ссылка на демо-номер WhatsApp - заменить на реальный
  window.open('https://wa.me/message/ABCDEFGHIJKLM1', '_blank');
};

// Форматирование числа для счётчика
const formattedHours = computed(() => {
  return formatNumber(savedHours.value);
});
</script>

<template>
  <section id="hero" class="hero-section scroll-mt-20">
    <!-- Декоративный фон -->
    <div class="hero-background" aria-hidden="true"></div>
    
    <div class="container">
      <div class="hero-content" data-sr>
        <!-- Заголовок -->
        <h1 class="hero-title">
          Создайте <span class="accent">AI-продавца</span> в WhatsApp<br class="hidden md:inline"/>
          <span class="whitespace-nowrap">за 5 минут</span>
        </h1>
        
        <!-- Подзаголовок -->
        <p class="hero-subtitle">
          Продавайте 24/7 на русском, казахском и английском — без найма сотрудников и ошибок
        </p>
        
        <!-- Фишки-пилюли -->
        <div class="feature-pills">
          <div class="pill">
            <i class="pi pi-volume-up" aria-hidden="true"></i>
            <span>Принимает голосовые, фото, документы</span>
          </div>
          <div class="pill">
            <i class="pi pi-clock" aria-hidden="true"></i>
            <span>Ответ за 3 сек</span>
          </div>
          <div class="pill">
            <i class="pi pi-chart-line" aria-hidden="true"></i>
            <span>Окупаемость ≤ 1 недели</span>
          </div>
        </div>
        
        <!-- Кнопки действия -->
        <div class="hero-actions">
          <button 
            @click="scrollToStart" 
            class="btn btn-primary btn-lg"
            aria-label="Начать бесплатно"
          >
            Начать бесплатно
          </button>
          <button 
            @click="openDemo" 
            class="btn btn-outline btn-lg"
            aria-label="Посмотреть демо в WhatsApp"
          >
            Посмотреть демо
          </button>
        </div>
        
        <!-- Счётчик сэкономленных часов -->
        <div class="saved-hours" aria-live="polite">
          <i class="pi pi-clock" aria-hidden="true"></i>
          <span>{{ formattedHours }} часов уже сэкономлено пользователям</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  padding: var(--sp-12) 0 var(--sp-8);
  overflow: hidden;
  min-height: 85vh;
  display: flex;
  align-items: center;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: radial-gradient(
    circle at top center,
    var(--color-accent-subtle) 0%,
    transparent 70%
  );
  z-index: -1;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

.hero-title {
  font-size: var(--fz-h1);
  margin-bottom: var(--sp-4);
  line-height: 1.1;
  hyphens: auto;
}

.hero-title .accent {
  color: var(--color-accent);
}

.hero-subtitle {
  font-size: var(--fz-body);
  color: var(--color-text-muted);
  margin-bottom: var(--sp-6);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.feature-pills {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-bottom: var(--sp-6);
  align-items: center;
}

@media (min-width: 640px) {
  .feature-pills {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.pill {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  background-color: var(--color-surface);
  padding: 0.5rem 1rem;
  border-radius: 100px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  min-height: 44px;
  text-align: left;
}

.pill i {
  color: var(--color-accent);
  font-size: 1rem;
  flex-shrink: 0;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  margin-bottom: var(--sp-8);
  align-items: center;
}

@media (min-width: 640px) {
  .hero-actions {
    flex-direction: row;
    justify-content: center;
  }
}

.btn-lg {
  min-height: 48px;
  padding: var(--sp-3) var(--sp-6);
  font-weight: 600;
  min-width: 220px;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  border: none;
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
  border-color: var(--color-text);
}

.saved-hours {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.saved-hours i {
  color: var(--color-accent);
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

/* Адаптивность для маленьких экранов */
@media (max-width: 768px) {
  .hero-section {
    padding: var(--sp-8) var(--sp-4);
    min-height: 70vh;
  }
  
  .hero-title {
    font-size: var(--fz-h1);
  }
}

@media (max-width: 480px) {
  .hero-actions {
    width: 100%;
  }
  
  .btn-lg {
    width: 100%;
  }
}

/* Поддержка prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .hero-content {
    animation: none;
  }
  
  .btn-primary:hover,
  .btn-outline:hover {
    transform: none;
  }
}
</style>