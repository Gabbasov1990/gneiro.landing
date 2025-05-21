<script setup lang="ts">
import { onMounted } from 'vue';
import ScrollReveal from 'scrollreveal';
import HeroSection from '@/components/HeroSection.vue';
import PainPointsSection from '@/components/PainPointsSection.vue';
import DemoChatSection from '@/components/DemoChatSection.vue';
import ReactivateCustomersSection from '@/components/ReactivateCustomersSection.vue';
import MultiChannelSection from '@/components/MultiChannelSection.vue';
import IntegrationSection from '@/components/IntegrationSection.vue';
import BusinessTypesSection from '@/components/BusinessTypesSection.vue';
import ReadyToSellSection from '@/components/ReadyToSellSection.vue';
import ROICalculatorSection from '@/components/ROICalculatorSection.vue';
import CaseStudiesSection from '@/components/CaseStudiesSection.vue';
import PricingSection from '@/components/PricingSection.vue';
import FinalCtaSection from '@/components/FinalCtaSection.vue';
import BlogSection from '@/components/BlogSection.vue';

// Initialize ScrollReveal for animations
onMounted(() => {
  ScrollReveal().reveal('[data-sr]', { 
    distance: '40px', 
    duration: 600, 
    easing: 'ease-out', 
    origin: 'bottom', 
    interval: 100 
  });
});
</script>

<template>
  <!-- Hero Section -->
  <HeroSection />
  
  <!-- Проблемы и боли -->
  <PainPointsSection />
  
  <!-- Демо-чат ИИ-бота -->
  <DemoChatSection />
  
  <!-- Оживление спящей базы -->
  <ReactivateCustomersSection />
  
  <!-- Один агент - все каналы -->
  <MultiChannelSection />
  
  <!-- Решение для любого бизнеса -->
  <BusinessTypesSection />
  
  <!-- Интеграция без ограничений -->
  <IntegrationSection />
  
  <!-- Что вы получаете сразу после подключения -->
  <ReadyToSellSection />
  
  <!-- ROI калькулятор -->
  <ROICalculatorSection />
  
  <!-- Кейсы и доказательства -->
  <CaseStudiesSection />
  
  <!-- Тарифы и цены -->
  <PricingSection />
  
  <!-- Финальный CTA и FAQ -->
  <FinalCtaSection />
  
  <!-- Блог -->
  <BlogSection />
</template>

<style scoped>
.btn-lg {
  padding: var(--sp-2) var(--sp-4);
  font-size: var(--fz-body);
}

@media (max-width: 768px) {  
  .hero-title {
    font-size: calc(var(--fz-h1) * 0.6); /* Responsive scaling for mobile */
  }
  
  .hero-subtitle {
    font-size: var(--fz-body);
  }
}
</style>