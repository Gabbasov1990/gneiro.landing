<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { useThemeStore } from '@/store/theme';

const themeStore = useThemeStore();
const isLoading = ref(true);

onMounted(() => {
  // Simulate loading time or any initialization
  setTimeout(() => {
    isLoading.value = false;
  }, 300);
  
  // Initialize theme on mount
  document.documentElement.setAttribute('data-theme', themeStore.theme);
});
</script>

<template>
  <div class="layout-wrapper" :class="themeStore.theme">
    <div v-if="isLoading" class="loading-screen">
      <div class="spinner"></div>
    </div>
    
    <Navbar />
    
    <main class="main-content">
      <slot></slot>
    </main>
    
    <Footer />
  </div>
</template>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1100px;   /* рекомендуемый лимит HIG для десктопа */
  margin-inline: auto;
  padding-inline: var(--sp-4);
  width: 100%;
}

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-accent);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>