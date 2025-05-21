<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Слайды с шагами настройки
const slides = [
  {
    id: 1,
    imageUrl: 'https://images.pexels.com/photos/6179274/pexels-photo-6179274.jpeg',
    title: 'Заполните короткую анкету',
    description: 'Отвечаем на несколько вопросов о вашей компании и менеджере'
  },
  {
    id: 2,
    imageUrl: 'https://images.pexels.com/photos/3937174/pexels-photo-3937174.jpeg',
    title: 'Подключите ваш сайт',
    description: 'Указываем сайт и Instagram — контент подтягивается автоматически'
  },
  {
    id: 3,
    imageUrl: 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg',
    title: 'Сканируйте QR-код',
    description: 'Сканируете QR-код — бот появляется в WhatsApp'
  },
  {
    id: 4,
    imageUrl: 'https://images.pexels.com/photos/5053740/pexels-photo-5053740.jpeg',
    title: 'Готово!',
    description: 'Отправляете тестовое сообщение — получаете ответ через 3 секунды'
  }
];

const currentSlide = ref(0);
let slideInterval: number | null = null;
const autoplayDuration = 3000; // 3 секунды на слайд
const prefersReducedMotion = ref(false);

// Переключение на следующий слайд
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

// Переключение на предыдущий слайд
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

// Переход к конкретному слайду
const goToSlide = (index: number) => {
  currentSlide.value = index;
  resetInterval();
};

// Сброс таймера автопрокрутки
const resetInterval = () => {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
  
  if (!prefersReducedMotion.value) {
    slideInterval = window.setInterval(() => {
      nextSlide();
    }, autoplayDuration);
  }
};

// Открыть демо-версию WhatsApp
const openDemo = () => {
  window.open('https://wa.me/your-demo-number', '_blank');
};

// Переход к секции регистрации
const startSetup = () => {
  const startSection = document.getElementById('start');
  if (startSection) {
    startSection.scrollIntoView({ behavior: prefersReducedMotion.value ? 'auto' : 'smooth' });
  }
};

onMounted(() => {
  // Проверка настроек анимации пользователя
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Запуск автопрокрутки, если пользователь не против анимаций
  if (!prefersReducedMotion.value) {
    resetInterval();
  }
});

onBeforeUnmount(() => {
  // Очистка таймера при уничтожении компонента
  if (slideInterval) {
    clearInterval(slideInterval);
  }
});
</script>

<template>
  <section id="quick-setup" class="setup-section" data-sr>
    <div class="container">
      <h2 class="setup-title">ИИ-агент за 5 минут</h2>
      
      <div 
        class="carousel" 
        role="group" 
        aria-roledescription="carousel" 
        aria-label="Демонстрация настройки Gneiro за 5 минут"
      >
        <!-- Слайдер с изображениями и текстом -->
        <div class="carousel-container">
          <!-- Кнопки навигации -->
          <button 
            class="carousel-control prev" 
            @click="prevSlide" 
            aria-label="Предыдущий шаг"
          >
            <i class="pi pi-chevron-left"></i>
          </button>
          
          <div class="carousel-slides">
            <div 
              v-for="(slide, index) in slides" 
              :key="slide.id"
              class="carousel-slide"
              :class="{ active: index === currentSlide }"
              :aria-hidden="index !== currentSlide"
            >
              <div class="slide-content">
                <div class="slide-image-container">
                  <img 
                    :src="slide.imageUrl" 
                    :alt="`Шаг ${index + 1}: ${slide.title}`" 
                    class="slide-image"
                  >
                  <div class="slide-overlay">
                    <div class="step-number">{{ index + 1 }}</div>
                  </div>
                </div>
                <h3 class="slide-title">{{ slide.title }}</h3>
                <p class="slide-description">{{ slide.description }}</p>
              </div>
            </div>
          </div>
          
          <button 
            class="carousel-control next" 
            @click="nextSlide" 
            aria-label="Следующий шаг"
          >
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
        
        <!-- Индикаторы слайдов -->
        <div class="carousel-indicators">
          <button 
            v-for="(slide, index) in slides" 
            :key="`indicator-${slide.id}`"
            class="indicator"
            :class="{ active: index === currentSlide }"
            @click="goToSlide(index)"
            :aria-label="`Перейти к шагу ${index + 1}`"
            :aria-current="index === currentSlide"
          ></button>
        </div>
      </div>
      
      <!-- CTA кнопки -->
      <div class="setup-actions">
        <button @click="startSetup" class="btn btn-primary btn-lg">
          Начать за 5 минут
        </button>
        <button @click="openDemo" class="btn btn-outline btn-lg">
          Смотреть демо
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.setup-section {
  padding: var(--space-16) 0;
  background-color: var(--color-bg);
}

.setup-title {
  text-align: center;
  margin-bottom: var(--space-8);
  font-size: var(--fz-h2);
}

.carousel {
  max-width: 800px;
  margin: 0 auto var(--space-8);
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: var(--space-4);
}

.carousel-slides {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  background-color: var(--color-surface);
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
  display: flex;
  flex-direction: column;
}

.carousel-slide.active {
  opacity: 1;
  z-index: 1;
}

.slide-content {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.slide-image-container {
  position: relative;
  width: 100%;
  height: 60%;
  overflow: hidden;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.slide-overlay {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  background-color: var(--color-accent);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
}

.slide-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.slide-description {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: var(--color-bg);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.carousel-control:hover {
  background-color: var(--color-accent);
  color: white;
}

.prev {
  left: -20px;
}

.next {
  right: -20px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-border);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.indicator.active {
  background-color: var(--color-accent);
  transform: scale(1.2);
}

.setup-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-top: var(--space-8);
}

.btn-lg {
  padding: var(--space-3) var(--space-6);
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 768px) {
  .carousel-slides {
    height: 500px;
  }
  
  .carousel-slide {
    overflow-y: auto;
  }
  
  .setup-actions {
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .btn-lg {
    width: 100%;
  }
  
  .carousel-control {
    width: 36px;
    height: 36px;
  }
  
  .prev {
    left: -10px;
  }
  
  .next {
    right: -10px;
  }
}

/* Поддержка prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .carousel-slide {
    transition: none;
  }
  
  .slide-image {
    transition: none;
  }
  
  .carousel-control:hover {
    transform: translateY(-50%);
  }
  
  .indicator.active {
    transform: none;
  }
}
</style>