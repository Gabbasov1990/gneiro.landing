<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useThemeStore } from '@/store/theme';

const themeStore = useThemeStore();

// Logo URLs
const darkLogoUrl = 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg';
const lightLogoUrl = 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro_w.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm9fdy5zdmciLCJpYXQiOjE3NDc2NTE5OTMsImV4cCI6MTc3OTE4Nzk5M30.0kWOZ6zyXyXzc3Gil806s0tArLEvclr0CGsePBfV3w';

// Social media links
const socialLinks = [
  { icon: 'pi pi-whatsapp', url: 'https://wa.me/message/example', label: 'WhatsApp' },
  { icon: 'pi pi-instagram', url: 'https://instagram.com/gneiro', label: 'Instagram' },
  { icon: 'pi pi-telegram', url: 'https://t.me/gneiro', label: 'Telegram' }
];

// Navigation links
const productLinks = [
  { label: 'Функции', url: '/#features' },
  { label: 'Кейсы', url: '/cases' },
  { label: 'Блог', url: '/blog' },
  { label: 'Тарифы', url: '/#pricing' }
];

const resourceLinks = [
  { label: 'Документация API', url: '/api-docs' },
  { label: 'Статус серверов', url: '/status' },
  { label: 'Карьера', url: '/careers' }
];

// Get current year for copyright
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer" role="contentinfo">
    <div class="container">
      <!-- Upper grid section -->
      <div class="footer-grid">
        <!-- Brand column -->
        <div class="footer-column brand-column">
          <div class="footer-logo">
            <img 
              :src="themeStore.theme === 'light' ? darkLogoUrl : lightLogoUrl" 
              alt="Gneiro Logo" 
              class="logo-image"
            />
          </div>
          <p class="footer-tagline">
            AI-продавец для WhatsApp, который работает 24/7 и автоматически увеличивает ваши продажи
          </p>
        </div>
        
        <!-- Product column -->
        <div class="footer-column">
          <h3 class="footer-heading">Продукт</h3>
          <ul class="footer-links">
            <li v-for="(link, index) in productLinks" :key="`product-${index}`">
              <RouterLink :to="link.url" class="footer-link">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
        
        <!-- Resources column -->
        <div class="footer-column">
          <h3 class="footer-heading">Ресурсы</h3>
          <ul class="footer-links">
            <li v-for="(link, index) in resourceLinks" :key="`resource-${index}`">
              <a :href="link.url" class="footer-link">{{ link.label }}</a>
            </li>
          </ul>
        </div>
        
        <!-- Contact column -->
        <div class="footer-column">
          <h3 class="footer-heading">Контакты</h3>
          <ul class="footer-links">
            <li>
              <a href="mailto:hi@gneiro.com" class="footer-link">hi@gneiro.com</a>
            </li>
            <li>
              <a href="https://wa.me/message/example" class="footer-link">WhatsApp</a>
            </li>
            <li>
              <a href="https://t.me/gneiro" class="footer-link">Telegram</a>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Divider -->
      <div class="footer-divider"></div>
      
      <!-- Bottom section with copyright and social links -->
      <div class="footer-bottom">
        <div class="copyright">
          &copy; {{ currentYear }} Gneiro · 
          <RouterLink to="/privacy" class="footer-small-link">Политика конфиденциальности</RouterLink> · 
          <RouterLink to="/terms" class="footer-small-link">Условия</RouterLink>
        </div>
        
        <div class="social-links">
          <a 
            v-for="link in socialLinks" 
            :key="link.label" 
            :href="link.url" 
            class="social-link" 
            target="_blank" 
            rel="noopener"
            :aria-label="`${link.label} – Gneiro`"
          >
            <i :class="link.icon"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-surface);
  padding-top: var(--space-12);
  padding-bottom: var(--space-8);
}

:root[data-theme='dark'] .footer {
  background-color: #11171f;
}

.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
  max-width: 1100px;
}

/* Footer grid layout */
.footer-grid {
  display: grid;
  gap: var(--sp-5);
  margin-bottom: var(--space-8);
}

@media (min-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .brand-column {
    grid-column: 1;
    grid-row: 1;
  }
}

.footer-column {
  display: flex;
  flex-direction: column;
}

.brand-column {
  max-width: 300px;
}

.footer-logo {
  margin-bottom: var(--space-3);
}

.logo-image {
  height: 32px;
  width: auto;
}

.footer-tagline {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-top: 0;
}

.footer-heading {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--color-text);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.footer-link {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover,
.footer-link:focus {
  color: var(--color-accent);
  outline: none;
}

.footer-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Divider */
.footer-divider {
  height: 1px;
  background-color: var(--color-border);
  margin-bottom: var(--space-4);
}

/* Footer bottom */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.footer-small-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-small-link:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

.social-links {
  display: flex;
  gap: var(--space-3);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(var(--accent-rgb), 0.08);
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.social-link:hover {
  background-color: rgba(var(--accent-rgb), 0.18);
  color: var(--color-accent);
  transform: scale(1.1);
}

/* Responsive styles */
@media (max-width: 767px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: var(--space-4);
    text-align: center;
  }
  
  .brand-column {
    max-width: none;
  }
  
  .footer-tagline {
    max-width: 80%;
    margin: 0 auto;
  }
  
  .footer-heading {
    text-align: center;
  }
  
  .footer-links {
    align-items: center;
  }
  
  .social-links {
    justify-content: center;
  }
}

/* CSS Variables for dark mode support */
:root {
  --accent-rgb: 10, 132, 255;
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .social-link:hover {
    transform: none;
  }
}
</style>