<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import { useWizardStore } from '@/store/wizard';
import { prefersReducedMotion } from '@/lib/utils';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useAdminStore } from '@/store/admin';
import { supabase } from '@/lib/supabase';

const router = useRouter();
const route = useRoute();
const wizardStore = useWizardStore();
const adminStore = useAdminStore();
const isReducedMotion = ref(prefersReducedMotion());

// Keep route and store in sync
watch(() => route.path, (newPath) => {
  if (newPath === '/create') {
    wizardStore.goToStep(1);
  } else if (newPath === '/create/basics') {
    wizardStore.goToStep(2);
  } else if (newPath === '/create/personality') {
    wizardStore.goToStep(3);
  } else if (newPath === '/create/dialog') {
    wizardStore.goToStep(4);
  } else if (newPath === '/create/integrations') {
    wizardStore.goToStep(5);
  } else if (newPath === '/create/deployment') {
    wizardStore.goToStep(6);
  } else if (newPath === '/create/training') {
    wizardStore.goToStep(7);
  } else if (newPath === '/create/setup') {
    wizardStore.goToStep(8);
  }
});

watch(() => wizardStore.step, (newStep) => {
  if (newStep === 1) {
    router.push('/create');
  } else if (newStep === 2) {
    router.push('/create/basics');
  } else if (newStep === 3) {
    router.push('/create/personality');
  } else if (newStep === 4) {
    router.push('/create/dialog');
  } else if (newStep === 5) {
    router.push('/create/integrations');
  } else if (newStep === 6) {
    router.push('/create/deployment');
  } else if (newStep === 7) {
    router.push('/create/training');
  } else if (newStep === 8) {
    router.push('/create/setup');
  }
});

// Compute progress percentage
const progressPercentage = computed(() => {
  return (wizardStore.step / wizardStore.maxStep) * 100;
});

// Go back one step or to home if on first step
const goBack = () => {
  if (wizardStore.step > 1) {
    wizardStore.prevStep();
  } else {
    router.push('/');
  }
};

// Auth state
const showAuthDialog = ref(false);
const authEmail = ref('');
const authPassword = ref('');
const authLoading = ref(false);
const authError = ref('');

// Check authentication when navigating past step 1
watch(() => wizardStore.step, async (newStep, oldStep) => {
  if (newStep > 1 && oldStep === 1) {
    // Check if user is logged in
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      showAuthDialog.value = true;
    }
  }
});

// Handle signup with email
const signupWithEmail = async () => {
  if (!authEmail.value) {
    authError.value = 'Пожалуйста, введите email';
    return;
  }
  
  authLoading.value = true;
  authError.value = '';
  
  try {
    // Register with the email
    const { data, error } = await adminStore.register(
      authEmail.value, 
      authPassword.value || Math.random().toString(36).substring(2, 10) // Generate random password if not provided
    );
    
    if (error) {
      throw error;
    }
    
    // Close the dialog
    showAuthDialog.value = false;
    
    // Continue with the wizard
    wizardStore.goToStep(2);
  } catch (error) {
    console.error('Sign-up error:', error);
    authError.value = error.message || 'Ошибка при регистрации';
  } finally {
    authLoading.value = false;
  }
};
</script>

<template>
  <div class="wizard-layout">
    <!-- Header -->
    <header class="wizard-header">
      <div class="container">
        <div class="header-content">
          <button class="back-button" @click="goBack" aria-label="Назад">
            <i class="pi pi-arrow-left"></i>
          </button>
          <RouterLink to="/" class="logo">
            <img 
              src="https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg" 
              alt="Gneiro Logo" 
              class="logo-image"
            />
          </RouterLink>
          <a href="https://docs.gneiro.com/guide" target="_blank" class="help-link">
            <i class="pi pi-question-circle"></i>
            <span>Помощь</span>
          </a>
        </div>
      </div>
    </header>
    
    <!-- Progress bar -->
    <div class="progress-container">
      <div class="container">
        <ProgressBar :value="progressPercentage" class="progress-bar" />
      </div>
    </div>
    
    <!-- Main content -->
    <main class="wizard-content">
      <div class="container">
        <div class="step-content">
          <transition 
            :name="isReducedMotion ? '' : 'fade-slide'" 
            mode="out-in"
          >
            <RouterView />
          </transition>
        </div>
      </div>
    </main>
    
    <!-- Auth dialog -->
    <Dialog 
      v-model:visible="showAuthDialog" 
      :modal="true" 
      :closable="false"
      :dismissableMask="false"
      :closeOnEscape="false"
      header="Быстрая регистрация"
      style="width: 90vw; max-width: 400px;"
    >
      <div class="auth-dialog-content">
        <p class="auth-dialog-text">Для создания AI-ассистента, пожалуйста, укажите ваш email:</p>
        
        <div class="auth-form">
          <div class="form-group">
            <label for="auth-email">Email</label>
            <input 
              id="auth-email" 
              v-model="authEmail"
              type="email"
              class="form-input"
              placeholder="Ваш email"
              :disabled="authLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="auth-password">Пароль (опционально)</label>
            <input 
              id="auth-password" 
              v-model="authPassword"
              type="password"
              class="form-input"
              placeholder="Пароль"
              :disabled="authLoading"
            />
            <small class="help-text">Если не указан, сгенерируем автоматически</small>
          </div>
          
          <div v-if="authError" class="auth-error">
            {{ authError }}
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Продолжить" 
          icon="pi pi-check" 
          @click="signupWithEmail" 
          :loading="authLoading"
          autofocus
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.wizard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
}

.wizard-header {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 32px;
  width: auto;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
  padding: 0.5rem;
}

.help-link:hover {
  color: var(--color-accent);
}

.progress-container {
  padding: 1rem 0;
  background-color: var(--color-bg);
}

.progress-bar {
  height: 8px;
  border-radius: 4px;
}

.wizard-content {
  flex: 1;
  padding: 2rem 0;
}

.step-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Auth dialog */
.auth-dialog-content {
  margin-bottom: 1.5rem;
}

.auth-dialog-text {
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
}

.form-input:focus {
  border-color: var(--color-accent);
  outline: none;
  box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.1);
}

.help-text {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.auth-error {
  color: var(--color-danger, #ff3b30);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

@media (max-width: 767px) {
  .step-content {
    padding: 1.5rem;
  }
  
  .help-link span {
    display: none;
  }
}
</style>