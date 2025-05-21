<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Check for reduced motion preference
const prefersReducedMotion = ref(false);
const sectionVisible = ref(false);

// Features list for the 2x2 grid
const features = [
  {
    id: 'scripts',
    icon: 'pi pi-comment-check',
    title: 'Скрипты под вашу нишу',
    description: '20+ готовых сценариев для отраслей'
  },
  {
    id: 'leads',
    icon: 'pi pi-user-edit',
    title: 'Горячие, тёплые, холодные',
    description: 'Отдельные подходы для каждого лида'
  },
  {
    id: 'objections',
    icon: 'pi pi-shield',
    title: 'Умная обработка возражений',
    description: 'Бот парирует цену, сроки и сомнения'
  },
  {
    id: 'crm',
    icon: 'pi pi-database',
    title: 'Запись в CRM без ошибок',
    description: 'Авто-создание сделки и задачи follow-up'
  }
];

// For flow animation
const flowLineProgress = ref(0);
const flowLineAnimationDone = ref(false);

// Initialize animations and check preferences
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  setTimeout(() => {
    sectionVisible.value = true;
    
    // If user prefers reduced motion, skip animations
    if (prefersReducedMotion.value) {
      flowLineProgress.value = 100;
      flowLineAnimationDone.value = true;
      return;
    }
    
    // Animate flow line
    setTimeout(() => {
      flowLineProgress.value = 100;
      
      setTimeout(() => {
        flowLineAnimationDone.value = true;
      }, 500);
    }, 800);
  }, 300);
});

// Handler for CTA buttons
const tryFree = () => {
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    pricingSection.scrollIntoView({ 
      behavior: prefersReducedMotion.value ? 'auto' : 'smooth' 
    });
  }
};

const viewScripts = () => {
  // In a real implementation, this would navigate to a scripts showcase page
  console.log('View scripts clicked');
};
</script>

<template>
  <section id="ready-to-sell" class="ready-to-sell-section" :class="{ 'visible': sectionVisible }">
    <div class="container">
      <h2 class="section-title">Ваш продавец готов продавать с первой минуты</h2>
      
      <div class="section-content">
        <!-- Features grid (2x2) -->
        <div class="features-grid">
          <article 
            v-for="(feature, index) in features" 
            :key="feature.id"
            class="feature-card"
            :style="`animation-delay: ${prefersReducedMotion ? 0 : index * 100}ms`"
            :aria-label="`Feature: ${feature.title}`"
          >
            <div class="icon-wrapper">
              <i :class="feature.icon" class="feature-icon"></i>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </article>
        </div>
        
        <!-- Flow map illustration -->
        <div class="flow-map">
          <div class="flow-step client">
            <div class="flow-icon">
              <i class="pi pi-user"></i>
            </div>
            <div class="flow-label">Клиент</div>
          </div>
          
          <div class="flow-line-wrapper">
            <div 
              class="flow-line" 
              :style="`width: ${flowLineProgress}%`"
            ></div>
          </div>
          
          <div class="flow-step bot">
            <div class="flow-icon">
              <i class="pi pi-comment"></i>
            </div>
            <div class="flow-label">Бот</div>
          </div>
          
          <div class="flow-line-wrapper">
            <div 
              class="flow-line" 
              :style="`width: ${flowLineProgress}%`"
            ></div>
          </div>
          
          <div class="flow-step crm">
            <div class="flow-icon">
              <i class="pi pi-database"></i>
            </div>
            <div class="flow-label">CRM</div>
          </div>
        </div>
      </div>
      
      <!-- CTA buttons -->
      <div class="section-cta">
        <button @click="tryFree" class="btn btn-primary">Попробовать бесплатно 7 дней</button>
        <button @click="viewScripts" class="btn btn-outline">Смотреть скрипты</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ready-to-sell-section {
  padding: var(--space-16) 0;
  background-color: var(--color-surface);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.ready-to-sell-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-title {
  font-size: var(--fz-h2);
  margin-bottom: var(--space-12);
  max-width: 800px;
}

.section-content {
  display: flex;
  gap: var(--space-12);
  margin-bottom: var(--space-12);
  align-items: center;
}

/* Features grid styles */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: var(--space-6);
  flex: 2;
}

.feature-card {
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  display: flex;
  gap: var(--space-4);
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(4px);
  opacity: 0;
  transform: scale(0.95);
  animation: fade-scale-in 0.5s forwards;
  border: 2px solid transparent;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-accent);
}

.feature-card:hover .icon-wrapper {
  transform: scale(1.1);
}

.icon-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: rgba(10, 132, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.feature-icon {
  font-size: 1.5rem;
  color: var(--color-accent);
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.feature-description {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.4;
}

/* Flow map styles */
.flow-map {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  max-width: 300px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.flow-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.flow-step.client .flow-icon {
  background-color: #f0f9ff;
  color: #0369a1;
}

.flow-step.bot .flow-icon {
  background-color: #ecfdf5;
  color: #059669;
}

.flow-step.crm .flow-icon {
  background-color: #f5f3ff;
  color: #7c3aed;
}

.flow-label {
  font-size: 0.95rem;
  font-weight: 500;
}

.flow-line-wrapper {
  width: 4px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.flow-line {
  height: 100%;
  background-color: var(--color-accent);
  border-radius: 2px;
  transition: width 1s ease-in-out;
}

/* CTA section */
.section-cta {
  display: flex;
  gap: var(--space-8);
  justify-content: center;
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  min-width: 240px;
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.2);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(10, 132, 255, 0.3);
  transform: translateY(-2px);
}

.btn-outline:hover {
  border-color: var(--color-text-muted);
  background-color: var(--color-surface);
  transform: translateY(-2px);
}

/* Animations */
@keyframes fade-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive styles */
@media (max-width: 1280px) {
  .section-content {
    flex-direction: column;
  }
  
  .flow-map {
    flex-direction: row;
    max-width: none;
    width: 100%;
    justify-content: center;
    margin-top: var(--space-8);
  }
  
  .flow-line-wrapper {
    width: 60px;
    height: 4px;
  }
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: calc(var(--fz-h2) * 0.8);
    text-align: center;
  }
  
  .section-cta {
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .flow-map {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .flow-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
  
  .flow-line-wrapper {
    width: 4px;
    height: 40px;
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .ready-to-sell-section {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .feature-card {
    opacity: 1;
    transform: none;
    animation: none !important;
  }
  
  .feature-card:hover {
    transform: none;
  }
  
  .feature-card:hover .icon-wrapper {
    transform: none;
  }
  
  .flow-line {
    transition: none;
  }
  
  .btn:hover {
    transform: none;
  }
}
</style>