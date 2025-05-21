<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { prefersReducedMotion } from '@/lib/utils';

// Integration logos data with service information
const integrations = [
  {
    id: 'amocrm',
    name: 'AmoCRM',
    icon: 'https://autoclick48.ru/wp-content/uploads/2024/04/photo.png',
    brandColor: '#339DC8',
    category: 'CRM-контакты и сделки'
  },
  {
    id: 'bitrix24',
    name: 'Bitrix24',
    icon: 'https://vectorseek.com/wp-content/uploads/2023/09/Bitrix24-Logo-Vector.svg-.png',
    brandColor: '#2FC7F7',
    category: 'CRM-контакты и сделки'
  },
  {
    id: 'moysklad',
    name: 'Мой Склад',
    icon: 'https://shop.solo-it.ru/upload/iblock/9c3/f5ca33c51ab5630358ac35b196709ccd.png',
    brandColor: '#FF8200',
    category: 'CRM-контакты и сделки'
  },
  {
    id: 'gsheets',
    name: 'Google Sheets',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg',
    brandColor: '#0F9D58',
    category: 'Данные клиентов и отчёты'
  },
  {
    id: 'gcalendar',
    name: 'Google Calendar',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png',
    brandColor: '#4285F4',
    category: 'Данные клиентов и отчёты'
  },
  {
    id: 'kaspi',
    name: 'Kaspi Pay',
    icon: 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/kaspi.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcva2FzcGkuc3ZnIiwiaWF0IjoxNzQ3NjU5MjE4LCJleHAiOjE3NzkxOTUyMTh9.-LdFclE7Yo0JagwuB2DtPKTy9I_0OYy7QtQ4Tt8_WlU',
    brandColor: '#FF0000',
    category: 'Оплата прямо в чате'
  }
];

// Tooltip state
const tooltipVisible = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipContent = ref('');

// Animation control
const isReducedMotion = ref(prefersReducedMotion());
const sectionVisible = ref(false);
const isApiCardHovered = ref(false);
const apiCodeTyped = ref(false);
const isMobile = ref(window.innerWidth < 768);

// API code sample for display
const apiCodeSample = `POST /v1/leads
{
  "token": "gneiro_api_123456789",
  "name": "Алексей Петров",
  "phone": "+7 (999) 123-45-67"
}`;

// Initialize section visibility for staggered animations
onMounted(() => {
  sectionVisible.value = true;
  
  // Start typing animation for API code if animations are enabled
  if (!isReducedMotion.value) {
    setTimeout(() => {
      apiCodeTyped.value = true;
    }, 1000);
  } else {
    apiCodeTyped.value = true;
  }
  
  // Handle window resize for responsive layout
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
  };
  
  window.addEventListener('resize', handleResize);
  
  // Clean up event listener on component destroy
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});

// Handle tooltip display
const handleShowTooltip = (e: MouseEvent, integration: typeof integrations[0]) => {
  if (isReducedMotion.value || isMobile.value) return;
  
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  
  tooltipContent.value = `Интегрировать ${integration.name}`;
  tooltipPosition.value = { 
    x: rect.left + rect.width / 2,
    y: rect.top
  };
  
  tooltipVisible.value = true;
};

const handleHideTooltip = () => {
  tooltipVisible.value = false;
};

// Handlers for CTA buttons
const requestCustomIntegration = () => {
  // In a real implementation, this would show a form or navigate to a contact page
  const contactSection = document.getElementById('final-cta');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: isReducedMotion.value ? 'auto' : 'smooth' });
  }
};

const viewApiDocs = () => {
  // In a real implementation, this would navigate to API documentation
  window.open('/api-docs', '_blank');
};
</script>

<template>
  <section id="integrations" class="integration-section scroll-mt-20" :class="{ 'visible': sectionVisible }">
    <div class="container">
      <!-- Section header -->
      <h2 class="section-title">Интеграция без ограничений</h2>
      <p class="section-subtitle">
        Подключите CRM и сервисы в один клик — или задействуйте REST API для редких случаев
      </p>
      
      <!-- Tooltip for desktop -->
      <div 
        v-if="tooltipVisible" 
        class="tooltip"
        :style="`left: ${tooltipPosition.x}px; top: ${tooltipPosition.y}px`"
        aria-hidden="true"
      >
        {{ tooltipContent }}
      </div>
      
      <!-- Main content area -->
      <div class="content-area">
        <!-- Integration logo grid -->
        <div class="integrations-grid">
          <button
            v-for="(integration, index) in integrations"
            :key="integration.id"
            class="integration-logo-card"
            :class="{'fade-in': true}"
            :style="`animation-delay: ${isReducedMotion.value ? 0 : index * 100}ms`"
            :aria-label="`Подключить ${integration.name}`"
            @mouseenter="handleShowTooltip($event, integration)"
            @mouseleave="handleHideTooltip"
            @focus="handleShowTooltip($event, integration)"
            @blur="handleHideTooltip"
          >
            <div class="logo-container">
              <div class="logo-background" :style="`background-color: ${integration.brandColor}10`"></div>
              <div class="logo-wrapper">
                <img 
                  :src="integration.icon" 
                  :alt="integration.name" 
                  class="integration-logo"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <div class="integration-info">
              <span class="integration-name" :style="`color: ${integration.brandColor}`">
                {{ integration.name }}
              </span>
              <span class="integration-category">{{ integration.category }}</span>
            </div>
          </button>
        </div>
        
        <!-- API card -->
        <div 
          class="api-card"
          :class="{ 'hovered': isApiCardHovered }"
          @mouseenter="isApiCardHovered = true"
          @mouseleave="isApiCardHovered = false"
          @focus="isApiCardHovered = true"
          @blur="isApiCardHovered = false"
          tabindex="0"
        >
          <div class="api-card-header">
            <i class="pi pi-code api-icon" aria-hidden="true"></i>
            <span class="api-title">REST API</span>
          </div>
          
          <div class="api-code-container">
            <pre class="api-code" :class="{ 'typed': apiCodeTyped }"><code>{{ apiCodeSample }}</code></pre>
          </div>
          
          <div class="api-card-footer">
            <span class="api-features">Засекречено: 60+ методов, Webhook-подписки, OAuth2</span>
          </div>
        </div>
      </div>
      
      <!-- CTA section -->
      <div class="integration-cta">
        <button 
          @click="requestCustomIntegration" 
          class="btn btn-primary"
          aria-label="Запросить кастомную интеграцию"
        >
          Запросить кастомную интеграцию
        </button>
        <button 
          @click="viewApiDocs" 
          class="btn btn-link"
          aria-label="Просмотр документации API"
        >
          Документация API
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.integration-section {
  padding: var(--sp-8) 0;
  background-color: var(--color-bg);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

@media (min-width: 768px) {
  .integration-section {
    padding: var(--sp-12) 0;
  }
}

@media (min-width: 1024px) {
  .integration-section {
    padding: var(--sp-16) 0;
  }
}

.integration-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  text-align: center;
  margin-bottom: var(--sp-6);
}

.section-title {
  font-size: var(--fz-h2);
  margin-bottom: var(--sp-4);
  text-align: center;
}

.section-subtitle {
  color: var(--color-text-muted);
  font-size: var(--fz-body);
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  margin-bottom: var(--sp-8);
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
  margin-bottom: var(--sp-8);
}

@media (min-width: 1024px) {
  .content-area {
    flex-direction: row;
    gap: var(--sp-8);
  }
}

/* Tooltip */
.tooltip {
  position: fixed;
  background-color: var(--color-surface);
  color: var(--color-text);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translate(-50%, -100%) translateY(-8px);
  pointer-events: none;
  z-index: 100;
  border: 1px solid var(--color-border);
  white-space: nowrap;
}

/* Integration logo grid */
.integrations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-4);
  width: 100%;
}

@media (min-width: 640px) {
  .integrations-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.integration-logo-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  opacity: 0;
  transform: scale(0.95);
  animation: fade-scale-in 0.5s forwards;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  height: 100%;
  min-height: 160px;
}

.integration-logo-card:hover, 
.integration-logo-card:focus {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
  outline: none;
}

.logo-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--sp-3);
}

.logo-background {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(25px);
  z-index: 1;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.integration-logo-card:hover .logo-background {
  transform: scale(1.2);
  opacity: 0.6;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.integration-logo {
  max-height: 60px;
  max-width: 90%;
  transition: transform 0.3s ease;
}

.integration-logo-card:hover .integration-logo {
  transform: scale(1.1);
}

.integration-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  z-index: 2;
}

.integration-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--sp-1);
  transition: color 0.3s ease;
}

.integration-category {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: center;
}

/* API Card */
.api-card {
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
  position: relative;
  margin-top: var(--sp-4);
}

:root[data-theme='dark'] .api-card {
  background-color: rgba(30, 32, 34, 0.65);
}

.api-card.hovered {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--color-accent);
}

.api-card:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-5px);
}

.api-card-header {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-bottom: var(--sp-4);
}

.api-icon {
  font-size: 1.5rem;
  color: var(--color-accent);
}

.api-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.api-code-container {
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  padding: var(--sp-4);
  margin-bottom: var(--sp-4);
  flex: 1;
  overflow: hidden;
}

.api-code {
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  opacity: 0;
}

.api-code.typed {
  opacity: 1;
  animation: typewriter 1.2s steps(40, end);
}

.api-code-container code {
  color: var(--color-text);
}

.api-card-footer {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.api-features {
  opacity: 0.7;
}

/* CTA section */
.integration-cta {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  align-items: center;
}

@media (min-width: 768px) {
  .integration-cta {
    flex-direction: row;
    gap: var(--sp-6);
    justify-content: center;
  }
}

.btn {
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  min-height: 44px;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 320px;
}

@media (min-width: 768px) {
  .btn-primary {
    width: auto;
  }
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn-link {
  color: var(--color-text-muted);
  background: transparent;
  border: none;
}

.btn-link:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

.btn-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
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

@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.fade-in {
  opacity: 0;
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .integration-section {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .integration-logo-card {
    opacity: 1;
    transform: none;
    animation: none !important;
  }
  
  .api-code.typed {
    animation: none;
    opacity: 1;
  }
  
  .btn:hover {
    transform: none;
  }
  
  .integration-logo-card:hover {
    transform: none;
  }
  
  .api-card.hovered {
    transform: none;
  }
  
  .fade-in {
    opacity: 1;
    animation: none;
  }
}
</style>