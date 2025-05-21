import { createApp } from 'vue';
import './styles/main.css';
import './styles/prime-overrides.css';
import App from './App.vue';
import router from './router';
import pinia from './store';

// PrimeVue
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

// PrimeVue theme
import 'primevue/resources/themes/aura-light-green/theme.css';
import 'primeicons/primeicons.css';

// Auth store initialization
import { useAuthStore } from './store/auth';

// Create the Vue app
const app = createApp(App);

// Use plugins
app.use(router);
app.use(pinia);
app.use(PrimeVue, { 
  ripple: true,
  unstyled: false,
  pt: {
    // Add any Prime Theme customizations here
  }
});
app.use(ConfirmationService);
app.use(ToastService);

// Register directives
app.directive('tooltip', Tooltip);

// Mount the app
app.mount('#app');

// Initialize auth after mount
const authStore = useAuthStore();
authStore.initialize();
const unsubscribeAuth = authStore.setupAuthListener();

// Cleanup on unmount (this is mainly for HMR during development)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    unsubscribeAuth();
  });
}