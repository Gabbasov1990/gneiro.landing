<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Channel data with brand colors and gradient pairs
const channels = [
  {
    id: 'whatsapp',
    icon: 'pi pi-whatsapp',
    iconColor: '#25D366',
    gradientStart: '#25D366',
    gradientEnd: '#128C7E',
    title: 'WhatsApp Business',
    description: '89% клиентов пишут именно сюда'
  },
  {
    id: 'instagram',
    icon: 'pi pi-instagram',
    iconColor: '#E1306C',
    gradientStart: '#833AB4',
    gradientEnd: '#FD1D1D', // Instagram uses a multi-color gradient
    title: 'Instagram Direct',
    description: 'Отвечаем прямо из чата Gneiro'
  },
  {
    id: 'telegram',
    icon: 'pi pi-telegram',
    iconColor: '#0088cc',
    gradientStart: '#0088CC',
    gradientEnd: '#229ED9',
    title: 'Telegram-бот',
    description: 'Канал быстрых заявок в СНГ'
  },
  {
    id: 'website',
    icon: 'pi pi-comments',
    iconColor: '#64748b',
    gradientStart: '#64748b',
    gradientEnd: '#94a3b8',
    title: 'Виджет на сайт',
    description: '2 строки кода — и виджет готов'
  }
];

// Controls for animations
const prefersReducedMotion = ref(false);
const sectionVisible = ref(false);

// Check user preferences for animations
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Initialize section visibility for staggered animations
  setTimeout(() => {
    sectionVisible.value = true;
  }, 100);
});

// Handler for primary CTA button
const scrollToIntegrations = () => {
  const integrationsSection = document.getElementById('integrations');
  if (integrationsSection) {
    integrationsSection.scrollIntoView({ 
      behavior: prefersReducedMotion.value ? 'auto' : 'smooth' 
    });
  } else {
    // Fallback to pricing section if integrations section doesn't exist
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: prefersReducedMotion.value ? 'auto' : 'smooth' 
      });
    }
  }
};

// Show tooltip with connection instructions
const showConnectionInfo = (channelId: string) => {
  console.log(`Show connection info for ${channelId}`);
  // In a real implementation, this would show a tooltip or modal
  // with connection instructions specific to the channel
};
</script>

<template>
  <section id="channels" class="multi-channel-section" :class="{ 'visible': sectionVisible }">
    <div class="container">
      <h2 class="section-title">Один агент — все каналы общения</h2>
      
      <!-- Channel cards grid -->
      <div class="channel-grid">
        <div 
          v-for="(channel, index) in channels" 
          :key="channel.id"
          class="channel-card"
          :style="`animation-delay: ${prefersReducedMotion ? 0 : index * 100}ms`"
          tabindex="0"
          @click="showConnectionInfo(channel.id)"
          @keydown.enter="showConnectionInfo(channel.id)"
        >
          <!-- Halo effect and glass card styling -->
          <div class="halo-background" 
               :style="`background: radial-gradient(circle, ${channel.gradientStart} 0%, ${channel.gradientEnd} 100%);`"></div>
          
          <div class="glass-content">
            <div class="channel-icon-wrapper" :style="`background-color: ${channel.iconColor}10`">
              <div class="icon-inner-glow"></div>
              <i :class="channel.icon" class="channel-icon" :style="`color: ${channel.iconColor}`"></i>
            </div>
            <h3 class="channel-title">{{ channel.title }}</h3>
            <p class="channel-description">{{ channel.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- CTA section -->
      <div class="channel-cta">
        <button @click="scrollToIntegrations" class="btn btn-primary">Подключить каналы</button>
        <a href="/blog/multi-channel-setup" class="btn btn-link">Смотреть инструкции</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.multi-channel-section {
  padding: var(--space-16) 0;
  background-color: var(--color-bg);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.multi-channel-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-title {
  text-align: center;
  margin-bottom: var(--space-12);
  font-size: var(--fz-h2);
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.channel-card {
  position: relative;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fade-in-up 0.5s forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: none;
  overflow: hidden;
  height: 100%;
}

/* Glass effect on card */
.channel-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1;
}

/* Dark theme support for glass effect */
:root[data-theme='dark'] .channel-card::before {
  background-color: rgba(30, 32, 34, 0.65);
}

.channel-card:hover, .channel-card:focus {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.channel-card:focus {
  box-shadow: 0 0 0 2px var(--color-accent);
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

/* Halo background behind icon */
.halo-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.25;
  z-index: 0;
  transition: opacity 0.3s ease;
}

:root[data-theme='dark'] .halo-background {
  opacity: 0.35;
}

.channel-card:hover .halo-background {
  opacity: 0.35;
}

:root[data-theme='dark'] .channel-card:hover .halo-background {
  opacity: 0.45;
}

/* Glass content container */
.glass-content {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.channel-icon-wrapper {
  position: relative;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  border-radius: 50%;
}

/* Glossy effect for icon */
.icon-inner-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  filter: blur(6px);
  z-index: 1;
}

.channel-icon {
  position: relative;
  font-size: 28px;
  z-index: 2;
}

.channel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.channel-description {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.4;
  position: relative;
  z-index: 2;
  letter-spacing: 0.01em;
  padding-top: var(--space-1);
}

/* Dark theme specific contrast enhancement for description */
:root[data-theme='dark'] .channel-description {
  color: #9CA3AF;
}

.channel-cta {
  display: flex;
  gap: var(--space-8);
  justify-content: center;
  align-items: center;
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
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

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.25;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.35;
  }
}

/* Animation for halo effect */
.channel-card:not(:focus):hover .channel-icon-wrapper {
  animation: pulse 4s infinite;
}

/* Responsive styles */
@media (max-width: 768px) {
  .channel-grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
  
  .section-title {
    font-size: calc(var(--fz-h2) * 0.8);
  }
}

@media (max-width: 480px) {
  .channel-cta {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .channel-icon-wrapper {
    width: 72px;
    height: 72px;
  }
  
  .icon-inner-glow {
    width: 40px;
    height: 40px;
  }
  
  .channel-icon {
    font-size: 24px;
  }
  
  .channel-title {
    font-size: 1.1rem;
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .multi-channel-section {
    opacity: 1;
    transform: none;
    transition: none;
  }
  
  .channel-card {
    opacity: 1;
    transform: none;
    animation: none !important;
  }
  
  .channel-card:hover .channel-icon-wrapper,
  .channel-card:focus .channel-icon-wrapper,
  .channel-card:hover .halo-background {
    animation: none !important;
    transition: none !important;
  }
  
  .btn:hover {
    transform: none;
  }
}
</style>