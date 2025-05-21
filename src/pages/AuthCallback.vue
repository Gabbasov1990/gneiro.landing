<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();
const route = useRoute();
const error = ref<string | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    // Handle the OAuth callback
    const { data, error: authError } = await supabase.auth.getSession();
    console.log('Auth callback data:', data);
    if (authError) {
      throw authError;
    }
    
    if (!data.session) {
      throw new Error('No session found after authentication');
    }
    
    // Get the intended redirect path from the URL hash or query
    const redirectTo = route.query.redirectTo as string || '/admin';
    
    console.log('Auth callback successful, redirecting to:', redirectTo);
    
    // Redirect to the intended destination
    router.replace(redirectTo);
  } catch (e) {
    console.error('Auth callback error:', e);
    error.value = e.message || 'Authentication failed';
    // Redirect to login after error
    setTimeout(() => {
      router.replace('/admin/login');
    }, 3000);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="auth-callback-page">
    <div class="container">
      <div v-if="loading" class="callback-content">
        <div class="spinner"></div>
        <h1>Аутентификация...</h1>
        <p>Пожалуйста, подождите, мы проверяем ваши учетные данные.</p>
      </div>
      
      <div v-else-if="error" class="callback-content error">
        <i class="pi pi-exclamation-circle error-icon"></i>
        <h1>Произошла ошибка</h1>
        <p>{{ error }}</p>
        <p class="redirect-message">Перенаправление на страницу входа...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
}

.callback-content {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.callback-content.error {
  border-left: 4px solid var(--color-danger, #ff3b30);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-accent);
  margin: 0 auto 1.5rem;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 48px;
  color: var(--color-danger, #ff3b30);
  margin-bottom: 1.5rem;
}

.redirect-message {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-style: italic;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

p {
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>