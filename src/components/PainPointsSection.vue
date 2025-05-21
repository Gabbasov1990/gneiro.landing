<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Функция для скролла к разделу "5 шагов"
const scrollToStart = () => {
  const startSection = document.getElementById('start');
  if (startSection) {
    startSection.scrollIntoView({ behavior: 'smooth' });
  }
};

// Анимация счетчика для первой карточки
const percentCounter = ref(50);
const targetPercent = 68;

onMounted(() => {
  // Проверка предпочтений пользователя по анимации
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    percentCounter.value = targetPercent;
    return;
  }
  
  const duration = 700; // 0.7 секунды
  const steps = 30;
  const increment = (targetPercent - percentCounter.value) / steps;
  const stepTime = duration / steps;
  
  let current = 0;
  const timer = setInterval(() => {
    current++;
    percentCounter.value = Math.min(
      Math.floor(50 + (increment * current)), 
      targetPercent
    );
    
    if (current >= steps) {
      clearInterval(timer);
      percentCounter.value = targetPercent;
    }
  }, stepTime);
});
</script>

<template>
  <section id="pain-points" class="pain-points-section">
    <div class="container">
      <!-- Заголовок секции -->
      <h2 class="section-title" data-sr>
        Ваши клиенты <span class="accent">уходят</span> к тем, кто отвечает быстрее
      </h2>
      
      <!-- Карточки со статистикой -->
      <ul class="stats-cards">
        <!-- Карточка 1: Потерянные клиенты -->
        <li data-sr>
          <article class="stat-card" aria-labelledby="stat-title-1">
            <div class="card-layout">
              <div class="card-header">
                <h3 id="stat-title-1" class="stat-number"><span class="accent">{{ percentCounter }}%</span></h3>
                <i class="pi pi-sign-out card-icon" aria-hidden="true"></i>
              </div>
              <h4 class="stat-title">Уходят без ответа</h4>
              <p class="stat-description">покупателей не дождались ответа — ушли к конкурентам</p>
            </div>
          </article>
        </li>
        
        <!-- Карточка 2: Стоимость найма -->
        <li data-sr>
          <article class="stat-card" aria-labelledby="stat-title-2">
            <div class="card-layout">
              <div class="card-icons-group">
                <i class="pi pi-clock icon-bounce" aria-hidden="true" title="Время"></i>
                <i class="pi pi-dollar icon-bounce" aria-hidden="true" title="Деньги" style="animation-delay: 0.1s"></i>
                <i class="pi pi-book icon-bounce" aria-hidden="true" title="Обучение" style="animation-delay: 0.2s"></i>
              </div>
              <div class="progress-bar">
                <div class="progress-segment"></div>
              </div>
              <h3 id="stat-title-2" class="stat-title">Найм продавцов</h3>
              <p class="stat-description">время + деньги + обучение</p>
            </div>
          </article>
        </li>
        
        <!-- Карточка 3: Медленный WhatsApp -->
        <li data-sr>
          <article class="stat-card" aria-labelledby="stat-title-3">
            <div class="card-layout">
              <div class="chat-mock">
                <div class="chat-bubble">Здравствуйте! Можно узнать стоимость?</div>
                <div class="chat-time">Ожидание ответа: <span class="blink">2+ ч</span></div>
              </div>
              <h3 id="stat-title-3" class="stat-title">WhatsApp — главный канал продаж</h3>
              <p class="stat-description">но <span class="accent">70%</span> компаний отвечают > 2 ч</p>
            </div>
          </article>
        </li>
      </ul>
      
      <!-- Мини-триггер CTA -->
      <div class="cta-trigger" data-sr>
        <p class="cta-question">Теряете лиды из-за задержек?</p>
        <button @click="scrollToStart" class="btn btn-primary">Исправить за 5 минут</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pain-points-section {
  padding: var(--space-16) 0;
  background-color: var(--color-bg);
}

.section-title {
  text-align: center;
  margin-bottom: var(--space-12);
  font-size: var(--fz-h2);
  line-height: 1.2;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.accent {
  color: var(--color-accent);
  font-weight: bold;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);
  margin-bottom: var(--space-12);
  list-style: none;
  padding: 0;
}

.stat-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  height: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.card-layout {
  padding: var(--space-6);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-accent);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.card-icon {
  font-size: 1.5rem;
  color: var(--color-accent);
  opacity: 0.3;
}

.stat-number {
  font-size: 3.5rem;
  line-height: 1;
  margin: 0;
  font-weight: 800;
}

.stat-title {
  font-size: 1.25rem;
  margin-bottom: var(--space-2);
  font-weight: 600;
}

.stat-description {
  color: var(--color-text-muted);
  margin-top: auto;
  font-size: 0.95rem;
}

/* Стили для карточки 2 */
.card-icons-group {
  display: flex;
  gap: var(--space-6);
  margin-bottom: var(--space-4);
  justify-content: center;
}

.card-icons-group i {
  font-size: 2rem;
  color: var(--color-accent);
}

.progress-bar {
  display: block;
  margin: 12px 0 20px;
  height: 2px;
  width: 100%;
  background-color: var(--color-accent);
  border-radius: 2px;
}

.progress-segment {
  height: 100%;
  background-color: var(--color-accent);
  border-radius: 2px;
  animation: fillProgress 1.2s ease-in-out forwards;
  transform-origin: left;
  transform: scaleX(0);
}

/* Стили для карточки 3 */
.chat-mock {
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: var(--radius-sm);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  animation: fadeUp 0.5s ease-out forwards;
}

.chat-bubble {
  background-color: #e2e2e2;
  color: #333;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  border-top-left-radius: 0;
  margin-bottom: var(--space-2);
  max-width: 90%;
  font-size: 0.9rem;
}

.chat-time {
  font-size: 0.75rem;
  color: var(--color-danger, #ff3b30);
  text-align: right;
}

.blink {
  animation: blink 2s ease-in-out 1s;
}

.cta-trigger {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.cta-question {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: var(--space-4);
}

/* Анимации */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes fillProgress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes fadeUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.icon-bounce {
  animation: bounce 1s ease-in-out;
}

/* Адаптивность для маленьких экранов */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: calc(var(--fz-h2) * 0.8);
  }
}

/* Темная тема */
:root[data-theme='dark'] .stat-card {
  background-color: var(--color-surface);
}

:root[data-theme='dark'] .chat-bubble {
  background-color: #3a3a3a;
  color: #f3f4f6;
}

/* Поддержка prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .stat-card:hover {
    transform: none;
  }
  
  .icon-bounce,
  .progress-segment,
  .blink,
  .chat-mock {
    animation: none;
  }
  
  .progress-segment {
    transform: scaleX(1);
  }
}
</style>