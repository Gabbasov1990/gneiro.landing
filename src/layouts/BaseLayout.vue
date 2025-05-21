<template>
  <header class="navbar" :class="navbarClasses" role="banner">
    <div class="container mx-auto px-4 flex items-center justify-between py-3 relative">
      <RouterLink to="/" class="flex items-center">
        <img :src="themeStore.theme === 'light' ? darkLogoUrl : lightLogoUrl" alt="Gneiro" class="h-8" />
      </RouterLink>

      <!-- Desktop navigation -->
      <nav class="hidden lg:flex items-center space-x-8" aria-label="Основная навигация">
        <a
          v-for="link in links"
          :key="link.id"
          :href="link.href"
          class="text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1 text-[15px] transition-colors"
          :class="{ 'font-semibold text-[var(--color-accent)] relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[var(--color-accent)] after:rounded': active === link.id }"
          @click.prevent="scrollToSection(link.id)"
        >
          {{ link.label }}
        </a>
        <RouterLink to="/cases" class="text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1 text-[15px] transition-colors">
          Кейсы
        </RouterLink>
        <RouterLink to="/blog" class="text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1 text-[15px] transition-colors">
          Блог
        </RouterLink>
      </nav>

      <!-- Right side controls -->
      <div class="flex items-center gap-3">
        <!-- Theme toggle -->
        <button
          class="bg-transparent border-none cursor-pointer flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          @click="themeStore.toggleTheme"
          aria-label="Переключить тему"
        >
          <i v-if="themeStore.theme === 'light'" class="pi pi-moon text-lg"></i>
          <i v-else class="pi pi-sun text-lg"></i>
        </button>
        
        <!-- Desktop CTA -->
        <a
          href="#hero" 
          class="hidden md:flex btn btn-primary py-2 px-4 text-sm min-w-[140px] justify-center items-center"
          @click.prevent="scrollToTop"
        >
          Начать бесплатно
        </a>
        
        <!-- Mobile menu button -->
        <button
          class="lg:hidden bg-transparent border-none cursor-pointer flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          @click="toggleMobileMenu"
          aria-label="Меню навигации"
          :aria-expanded="isMobileMenuOpen"
        >
          <i v-if="isMobileMenuOpen" class="pi pi-times text-lg"></i>
          <i v-else class="pi pi-bars text-lg"></i>
        </button>
      </div>
      
      <!-- Mobile navigation overlay -->
      <div 
        v-if="isMobileMenuOpen" 
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="closeMobileMenu"
        aria-hidden="true"
      ></div>

      <!-- Mobile navigation menu -->
      <div 
        class="fixed top-0 right-0 h-full w-[280px] bg-[var(--color-bg)] z-50 transform transition-transform duration-300 overflow-auto"
        :class="isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'"
        aria-label="Мобильное меню"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex justify-end p-4">
          <button
            class="bg-transparent border-none cursor-pointer flex items-center justify-center w-10 h-10 rounded-full"
            @click="closeMobileMenu"
            aria-label="Закрыть меню"
          >
            <i class="pi pi-times text-lg"></i>
          </button>
        </div>
        
        <nav class="px-6 pt-4 pb-8 flex flex-col space-y-4">
          <a
            v-for="link in links"
            :key="link.id"
            :href="link.href"
            class="text-[var(--color-text)] px-2 py-3 text-[17px] border-b border-[var(--color-border)] last:border-0"
            :class="{ 'font-semibold text-[var(--color-accent)]': active === link.id }"
            @click.prevent="mobileNavigate(link.id)"
          >
            {{ link.label }}
          </a>
          <RouterLink 
            to="/cases"
            class="text-[var(--color-text)] px-2 py-3 text-[17px] border-b border-[var(--color-border)]"
            @click="closeMobileMenu"
          >
            Кейсы
          </RouterLink>
          <RouterLink 
            to="/blog"
            class="text-[var(--color-text)] px-2 py-3 text-[17px] border-b border-[var(--color-border)]"
            @click="closeMobileMenu"
          >
            Блог
          </RouterLink>
          
          <a
            href="#hero" 
            class="btn btn-primary py-3 px-4 text-[15px] mt-4 text-center font-medium"
            @click.prevent="mobileNavigate('hero')"
          >
            Начать бесплатно
          </a>
        </nav>
      </div>
    </div>
  </header>

  <main role="main" id="content">
    <slot />
  </main>

  <footer class="footer py-12 bg-[var(--color-surface)] border-t border-[var(--color-border)]" role="contentinfo">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <!-- Brand column -->
        <div>
          <img :src="themeStore.theme === 'light' ? darkLogoUrl : lightLogoUrl" alt="Gneiro" class="h-8 mb-4" />
          <p class="text-sm text-[var(--color-text-muted)] max-w-xs">
            AI-продавец для WhatsApp, который работает 24/7 без ошибок и автоматически увеличивает продажи
          </p>
        </div>
        
        <!-- Links groups -->
        <div>
          <h3 class="text-base font-semibold mb-4">Продукт</h3>
          <ul class="space-y-2">
            <li><a href="#features" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm">Функции</a></li>
            <li><RouterLink to="/cases" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm">Кейсы</RouterLink></li>
            <li><a href="#pricing" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm">Тарифы</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-base font-semibold mb-4">Ресурсы</h3>
          <ul class="space-y-2">
            <li><RouterLink to="/blog" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm">Блог</RouterLink></li>
            <li><a href="#" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm">Документация API</a></li>
            <li><a href="#" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm">Справочный центр</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-base font-semibold mb-4">Контакты</h3>
          <ul class="space-y-2">
            <li><a href="mailto:info@gneiro.com" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm">info@gneiro.com</a></li>
            <li><a href="#" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm">Telegram</a></li>
            <li><a href="#" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] text-sm">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-[var(--color-border)] pt-6 flex flex-col md:flex-row items-center justify-between">
        <div class="text-xs text-[var(--color-text-muted)] mb-4 md:mb-0">
          &copy; {{ new Date().getFullYear() }} Gneiro · Все права защищены
        </div>
        
        <div class="flex gap-4">
          <RouterLink to="/privacy" class="text-xs text-[var(--color-text-muted)] hover:underline">Политика конфиденциальности</RouterLink>
          <RouterLink to="/terms" class="text-xs text-[var(--color-text-muted)] hover:underline">Условия использования</RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, onUnmounted } from 'vue';
import { useThemeStore } from '@/store/theme';
import { RouterLink, useRoute } from 'vue-router';
import { throttle } from '@/lib/utils';

const themeStore = useThemeStore();
const route = useRoute();
const active = ref('');
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

// Logo URLs
const darkLogoUrl = 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg';
const lightLogoUrl = 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro_w.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm9fdy5zdmciLCJpYXQiOjE3NDc2NTE5OTMsImV4cCI6MTc3OTE4Nzk5M30.0kWOZ6zyXyXzc3Gil806s0tArLEvclr0CGsePBfV3w';

// Navigation links in specified order
const links = [
  { id: 'features', label: 'Функции', href: '#features' },
  { id: 'channels', label: 'Каналы', href: '#channels' },
  { id: 'integrations', label: 'Интеграции', href: '#integrations' },
  { id: 'roi', label: 'ROI-калькулятор', href: '#roi' },
  { id: 'pricing', label: 'Тарифы', href: '#pricing' },
];

// Navbar classes based on scroll position
const navbarClasses = computed(() => {
  return {
    'bg-white/85 dark:bg-[#0f141a]/85 backdrop-blur shadow-sm': isScrolled.value,
    'bg-transparent': !isScrolled.value
  };
});

// Handle scroll event
const handleScroll = throttle(() => {
  isScrolled.value = window.scrollY > 10;
  updateActiveSection();
}, 100);

// Update active section based on scroll position
const updateActiveSection = () => {
  const sections = links.map(l => l.id);
  
  // Find the section currently in viewport
  for (const id of sections) {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      
      // Section is considered "in view" if its top is within 300px of the viewport top
      // This threshold can be adjusted based on your layout
      if (rect.top <= 300 && rect.bottom >= 100) {
        active.value = id;
        return;
      }
    }
  }
};

// Scroll to section with proper offset for fixed header
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offset = 80; // Height of the fixed header plus some padding
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Mobile navigation and menu management
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  
  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.classList.remove('overflow-hidden');
};

// Mobile navigation handling
const mobileNavigate = (sectionId: string) => {
  closeMobileMenu();
  setTimeout(() => {
    scrollToSection(sectionId);
  }, 300); // Small delay to ensure menu is closed first
};

// Scroll to top
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Handle Escape key to close mobile menu
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu();
  }
};

// Setup and cleanup
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleEscKey);
  handleScroll(); // Check initial state
  
  // Set initial active section based on hash or scroll position
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    active.value = hash;
  } else {
    updateActiveSection();
  }
});

// Clean up event listeners
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleEscKey);
});

// Close mobile menu when route changes
watch(route, () => {
  closeMobileMenu();
});
</script>

<style scoped>
/* Add scroll margin to all sections to account for fixed header */
:deep(section[id]) {
  scroll-margin-top: 80px;
}

/* Setting a minimum touch target size for accessibility */
a, button {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
}

/* Ensure links in navbar have proper touch target size while maintaining look */
.navbar .nav-link {
  padding: 10px;
  margin: -10px;
}

/* Smooth transition for the mobile menu */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Prefers reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .nav-link::after {
    transition: none;
  }
  
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>