<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useThemeStore } from '@/store/theme';
import { RouterLink, useRoute } from 'vue-router';

const themeStore = useThemeStore();
const route = useRoute();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const activeSection = ref('');

// Navigation links in specified order
const navLinks = [
  { text: 'Функции', href: '#features' },
  { text: 'Каналы', href: '#channels' },
  { text: 'Интеграции', href: '#integrations' },
  { text: 'ROI-калькулятор', href: '#roi' },
  { text: 'Кейсы', href: '/cases' },
  { text: 'Тарифы', href: '#pricing' },
  { text: 'Блог', href: '/blog' }
];

// Handle scroll events for navbar styling and scroll spy
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
  
  // Scroll spy logic
  const sections = navLinks
    .filter(link => link.href.startsWith('#'))
    .map(link => link.href.substring(1));
  
  // Find the current active section
  for (const section of sections) {
    const element = document.getElementById(section);
    if (element) {
      const rect = element.getBoundingClientRect();
      // If the section is in view (with some buffer for better UX)
      if (rect.top <= 200 && rect.bottom >= 200) {
        activeSection.value = section;
        break;
      }
    }
  }
};

// Compute navbar classes based on scroll state
const navbarClasses = computed(() => ({
  'navbar-scrolled': isScrolled.value,
  'navbar-transparent': !isScrolled.value
}));

// Check if a link is active
const isLinkActive = (href: string) => {
  if (href.startsWith('#')) {
    return activeSection.value === href.substring(1);
  } else if (href.startsWith('/')) {
    return route.path === href;
  }
  return false;
};

// Close mobile menu when Escape key is pressed
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleKeyDown);
  handleScroll(); // Check initial state
  
  // Set initial active section based on hash
  if (window.location.hash) {
    activeSection.value = window.location.hash.substring(1);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeyDown);
});

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  
  // When opening the mobile menu, prevent body scroll
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Close mobile menu when clicking outside
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

// Scroll to top when logo is clicked
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  closeMobileMenu();
};

// Logo URLs
const darkLogoUrl = 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg';
const lightLogoUrl = 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro_w.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm9fdy5zdmciLCJpYXQiOjE3NDc2NTE5OTMsImV4cCI6MTc3OTE4Nzk5M30.0kWOZ6zyXyXzc3Gil806s0tArLEvclr0CGsePBfV3w';

// Close mobile menu when route changes
watch(
  () => route.path,
  () => closeMobileMenu()
);

// Handle internal link navigation
const handleNavigation = (href: string) => {
  closeMobileMenu();
  
  if (href.startsWith('#')) {
    const element = document.getElementById(href.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
};
</script>

<template>
  <header class="navbar" :class="navbarClasses" role="banner">
    <div class="container navbar-container">
      <!-- Logo -->
      <a href="#" class="navbar-logo" @click.prevent="scrollToTop">
        <img 
          :src="themeStore.theme === 'light' ? darkLogoUrl : lightLogoUrl" 
          alt="Gneiro Logo" 
          class="logo-image"
        />
      </a>
      
      <div class="navbar-actions">
        <!-- Desktop Navigation -->
        <nav class="navbar-nav" :class="{ 'nav-open': isMobileMenuOpen }" aria-label="Основная навигация">
          <template v-for="(link, index) in navLinks" :key="index">
            <RouterLink 
              v-if="!link.href.startsWith('#')" 
              :to="link.href" 
              class="nav-link"
              :class="{ 'active': isLinkActive(link.href) }"
              @click="closeMobileMenu"
            >
              {{ link.text }}
            </RouterLink>
            <a 
              v-else 
              :href="link.href" 
              class="nav-link"
              :class="{ 'active': isLinkActive(link.href) }"
              @click.prevent="handleNavigation(link.href)"
            >
              {{ link.text }}
            </a>
          </template>
        </nav>
        
        <!-- Mobile menu overlay -->
        <div 
          v-if="isMobileMenuOpen" 
          class="mobile-menu-overlay"
          @click="closeMobileMenu"
          aria-hidden="true"
        ></div>
        
        <!-- Controls (Theme toggle, CTA button, Mobile menu) -->
        <div class="navbar-controls">
          <button 
            class="theme-toggle" 
            @click="themeStore.toggleTheme"
            aria-label="Переключить тему"
          >
            <i v-if="themeStore.theme === 'light'" class="pi pi-moon"></i>
            <i v-else class="pi pi-sun"></i>
          </button>
          
          <a href="#hero" class="btn btn-primary">Начать бесплатно</a>
          
          <button 
            class="mobile-menu-toggle" 
            @click="toggleMobileMenu"
            aria-label="Открыть меню"
            :aria-expanded="isMobileMenuOpen"
          >
            <i v-if="!isMobileMenuOpen" class="pi pi-bars"></i>
            <i v-else class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 40;
  transition: all 0.3s ease;
  padding: var(--space-4) 0;
}

.navbar-scrolled {
  background-color: rgba(var(--bg-rgb, 255, 255, 255), 0.85);
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 0 0 var(--color-border);
}

:root[data-theme='dark'] .navbar-scrolled {
  background-color: rgba(15, 20, 26, 0.85);
}

.navbar-transparent {
  background-color: transparent;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  z-index: 50;
}

.logo-image {
  height: 32px;
  width: auto;
}

.navbar-actions {
  display: flex;
  align-items: center;
  position: relative;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 56px; /* HIG spacing for desktop */
}

.nav-link {
  color: var(--color-text);
  font-weight: 500;
  position: relative;
  text-decoration: none;
  padding: var(--space-2) 0;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--color-accent);
}

.nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
  border-radius: 2px;
}

.nav-link.active {
  font-weight: 600;
  color: var(--color-accent);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-accent);
  border-radius: 2px;
}

.navbar-controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-left: var(--space-6);
}

.theme-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background-color: var(--color-surface);
  color: var(--color-accent);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.mobile-menu-toggle {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  color: var(--color-text);
  z-index: 50;
}

.mobile-menu-toggle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.mobile-menu-overlay {
  display: none;
}

/* Mobile styles */
@media (max-width: 1023px) {
  .navbar-nav {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 280px;
    background-color: var(--color-bg);
    flex-direction: column;
    align-items: flex-start;
    padding: 80px var(--space-6) var(--space-6);
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 40;
    gap: var(--space-6);
  }

  .nav-open {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
  }
  
  .mobile-menu-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 30;
  }
  
  .navbar-controls {
    margin-left: 0;
  }
  
  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn {
    display: none;
  }
  
  .nav-link {
    width: 100%;
    padding: var(--space-2) 0;
    font-size: 1.1rem;
  }
  
  .nav-link.active::after {
    bottom: -2px;
  }
}

/* CSS variables for theme support */
:root {
  --bg-rgb: 255, 255, 255;
}

:root[data-theme='dark'] {
  --bg-rgb: 15, 20, 26;
}
</style>