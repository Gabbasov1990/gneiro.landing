<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '@/store/admin';
import { useThemeStore } from '@/store/theme';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Divider from 'primevue/divider';
import { prefersReducedMotion } from '@/lib/utils';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const themeStore = useThemeStore();
const isReducedMotion = ref(prefersReducedMotion());

// State
const email = ref('');
const password = ref('');
const fullName = ref('');
const validationError = ref('');
const authError = ref('');
const isSubmitting = ref(false);
const isRegistering = ref(false);
const loginAttempts = ref(0);
const authState = ref<'idle' | 'checking' | 'success' | 'error'>('idle');

// Form validation
const validateLoginForm = () => {
  validationError.value = '';
  authError.value = '';
  
  // Simple email validation
  if (!email.value) {
    validationError.value = 'Пожалуйста, введите email';
    return false;
  }
  
  if (!/\S+@\S+\.\S+/.test(email.value)) {
    validationError.value = 'Пожалуйста, введите корректный email';
    return false;
  }

  // Password validation
  if (!password.value) {
    validationError.value = 'Пожалуйста, введите пароль';
    return false;
  }
  
  return true;
};

const validateRegisterForm = () => {
  validationError.value = '';
  authError.value = '';
  
  // Simple email validation
  if (!email.value) {
    validationError.value = 'Пожалуйста, введите email';
    return false;
  }
  
  if (!/\S+@\S+\.\S+/.test(email.value)) {
    validationError.value = 'Пожалуйста, введите корректный email';
    return false;
  }

  // Password validation
  if (!password.value) {
    validationError.value = 'Пожалуйста, введите пароль';
    return false;
  }

  if (password.value.length < 6) {
    validationError.value = 'Пароль должен содержать минимум 6 символов';
    return false;
  }
  
  return true;
};

// Submit login form
const handleLoginSubmit = async () => {
  console.log("Login submit initiated");
  if (!validateLoginForm()) return;
  
  isSubmitting.value = true;
  authError.value = '';
  loginAttempts.value++;
  authState.value = 'checking';
  
  try {
    console.log("Calling login method with:", email.value);
    const result = await adminStore.login(email.value, password.value);
    console.log("Login method returned:", result);
    
    // If we have a user and they have the correct role, redirect to admin
    if (adminStore.currentUser && 
        (adminStore.currentUser.role === 'editor' || adminStore.currentUser.role === 'admin')) {
      
      console.log("Login successful, redirecting to admin dashboard");
      authState.value = 'success';
      const redirectPath = route.query.redirect?.toString() || '/admin';
      router.push(redirectPath);
    } else {
      console.log("User doesn't have proper role:", adminStore.currentUser);
      authState.value = 'error';
      authError.value = 'У вас нет прав для доступа к админ-панели.';
    }
  } catch (error) {
    console.error('Login submit error:', error);
    authState.value = 'error';
    authError.value = 'Неверный email или пароль. Пожалуйста, проверьте учетные данные и попробуйте снова.';
  } finally {
    isSubmitting.value = false;
    console.log("Login submit completed, authState:", authState.value);
  }
};

// Submit registration form
const handleRegisterSubmit = async () => {
  console.log("Register submit initiated");
  if (!validateRegisterForm()) return;
  
  isSubmitting.value = true;
  authError.value = '';
  authState.value = 'checking';
  
  try {
    console.log("Calling register method with:", email.value);
    const result = await adminStore.register(email.value, password.value, fullName.value);
    console.log("Register method returned:", result);
    
    if (result && result.user) {
      console.log("Registration successful, attempting auto-login...");
      
      // After successful registration, automatically log in
      await adminStore.login(email.value, password.value);
      
      if (adminStore.isAuthenticated) {
        console.log("Auto-login successful, redirecting to admin");
        authState.value = 'success';
        router.push('/admin');
      } else {
        // If auto-login failed, switch to login form
        console.log("Auto-login failed, switching to login form");
        authState.value = 'idle';
        isRegistering.value = false;
        authError.value = '';
        validationError.value = '';
      }
    } else {
      console.log("Registration result missing user data");
      authState.value = 'error';
    }
  } catch (error) {
    console.error('Registration error:', error);
    authState.value = 'error';
    authError.value = 'Ошибка при регистрации. Возможно, пользователь с таким email уже существует.';
  } finally {
    isSubmitting.value = false;
    console.log("Register submit completed, authState:", authState.value);
  }
};

// Toggle between login and registration forms
const toggleForm = () => {
  validationError.value = '';
  authError.value = '';
  isRegistering.value = !isRegistering.value;
  
  // Update URL to match the current form without reloading the page
  const newPath = isRegistering.value ? '/admin/register' : '/admin/login';
  router.replace({ path: newPath });
};

// For demonstration, provide a default admin
const useDefaultAdmin = () => {
  email.value = 'admin@example.com';
  password.value = 'admin123';
};

// Logo URLs
const darkLogoUrl = 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm8uc3ZnIiwiaWF0IjoxNzQ3NjUxOTY0LCJleHAiOjE3NzkxODc5NjR9.wOJagsO2La8JnVXztOv8wLfIOkHT_4yXZze170DVURg';
const lightLogoUrl = 'https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/logo%20gneiro_w.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzExYjA1NGNlLWJkODYtNDU3My04Nzc5LTU4OTg2NjYwNjgzMSJ9.eyJ1cmwiOiJpbWcvbG9nbyBnbmVpcm9fdy5zdmciLCJpYXQiOjE3NDc2NTE5OTMsImV4cCI6MTc3OTE4Nzk5M30.0kWOZ6zyXyXzc3Gil806s0tArLEvclr0CGsePBfV3w';

// Toggle theme function
const toggleTheme = () => {
  themeStore.toggleTheme();
};

// Navigate to home page
const goToHomePage = () => {
  router.push('/');
};

const formTitle = computed(() => {
  return isRegistering.value ? 'Регистрация' : 'Вход в панель управления';
});

const formButtonText = computed(() => {
  return isRegistering.value ? 'Зарегистрироваться' : 'Войти';
});

const toggleText = computed(() => {
  return isRegistering.value 
    ? 'Уже есть аккаунт? Войти' 
    : 'Нет аккаунта? Зарегистрироваться';
});

// Set registration form state based on route
onMounted(() => {
  console.log("Login component mounted, route path:", route.path);
  if (route.path === '/admin/register') {
    console.log("Setting isRegistering to true based on route");
    isRegistering.value = true;
  }
  
  // Check if user is already logged in
  adminStore.fetchCurrentUser().then(user => {
    if (user) {
      console.log("User is already logged in, redirecting to admin");
      router.push('/admin');
    }
  });
});

// Watch for route changes to update the form mode
watch(() => route.path, (newPath) => {
  console.log("Route changed to:", newPath);
  isRegistering.value = newPath === '/admin/register';
});

// Debug info
console.log("Initial login component state - isRegistering:", isRegistering.value);
</script>

<template>
  <div class="login-page">
    <!-- Theme toggle -->
    <button class="theme-toggle" @click="toggleTheme" aria-label="Переключить тему">
      <i v-if="themeStore.theme === 'light'" class="pi pi-moon"></i>
      <i v-else class="pi pi-sun"></i>
    </button>
    
    <!-- Home page link -->
    <button class="home-link" @click="goToHomePage" aria-label="На главную">
      <i class="pi pi-home"></i>
    </button>
    
    <div class="login-container">
      <!-- Logo -->
      <div class="login-logo">
        <img 
          :src="themeStore.theme === 'light' ? darkLogoUrl : lightLogoUrl" 
          alt="Gneiro" 
          class="logo-image"
        />
        <span class="admin-label">Админ-панель</span>
      </div>
      
      <!-- Login/Registration card -->
      <Card class="login-card">
        <template #title>
          <h1 class="text-center text-2xl card-title">{{ formTitle }}</h1>
        </template>
        
        <template #content>
          <!-- Login Form -->
          <form v-if="!isRegistering" @submit.prevent="handleLoginSubmit" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Электронная почта</label>
              <InputText 
                id="email" 
                v-model="email" 
                type="email" 
                aria-describedby="email-error"
                :class="{ 'p-invalid': validationError || authError }"
                class="w-full"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Пароль</label>
              <Password 
                id="password" 
                v-model="password" 
                :toggleMask="true"
                :feedback="false"
                :class="{ 'p-invalid': validationError || authError }"
                inputClass="w-full"
                aria-describedby="password-error"
                required
              />
              <small id="validation-error" class="error-message" v-if="validationError">{{ validationError }}</small>
              <small id="auth-error" class="error-message" v-if="authError">{{ authError }}</small>
            </div>
            
            <Button 
              type="submit" 
              :label="formButtonText" 
              class="w-full"
              :loading="isSubmitting"
              :disabled="isSubmitting" 
            />
            
            <Divider align="center">
              <span class="text-sm text-color-secondary">или</span>
            </Divider>
            
            <div class="text-center">
              <a href="#" @click.prevent="toggleForm" class="toggle-form-link">{{ toggleText }}</a>
            </div>
            
            <!-- Default admin credentials helper for development -->
            <div class="dev-helper">
              <Button 
                label="Использовать тестовый аккаунт" 
                class="p-button-text p-button-sm" 
                @click.prevent="useDefaultAdmin"
              />
              <small class="help-text">admin@example.com / admin123</small>
            </div>
          </form>
          
          <!-- Registration Form -->
          <form v-else @submit.prevent="handleRegisterSubmit" class="login-form">
            <div class="form-group">
              <label for="register-email" class="form-label">Электронная почта</label>
              <InputText 
                id="register-email" 
                v-model="email" 
                type="email" 
                aria-describedby="email-error"
                :class="{ 'p-invalid': validationError || authError }"
                class="w-full"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="register-password" class="form-label">Пароль</label>
              <Password 
                id="register-password" 
                v-model="password" 
                :toggleMask="true"
                :feedback="true"
                :class="{ 'p-invalid': validationError || authError }"
                inputClass="w-full"
                aria-describedby="password-error"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="full-name" class="form-label">Полное имя (опционально)</label>
              <InputText 
                id="full-name" 
                v-model="fullName" 
                class="w-full"
              />
              <small id="validation-error" class="error-message" v-if="validationError">{{ validationError }}</small>
              <small id="auth-error" class="error-message" v-if="authError">{{ authError }}</small>
            </div>
            
            <Button 
              type="submit" 
              :label="formButtonText" 
              class="w-full"
              :loading="isSubmitting"
              :disabled="isSubmitting" 
            />
            
            <Divider align="center">
              <span class="text-sm text-color-secondary">или</span>
            </Divider>
            
            <div class="text-center">
              <a href="#" @click.prevent="toggleForm" class="toggle-form-link">{{ toggleText }}</a>
            </div>
          </form>
        </template>
      </Card>
      
      <!-- Debug status for troubleshooting -->
      <div v-if="loginAttempts > 0" class="debug-status">
        <p>Попытки входа: {{ loginAttempts }}</p>
        <p>Путь: {{ route.path }}</p>
        <p>Статус аутентификации: {{ authState }}</p>
        <p>Пользователь аутентифицирован: {{ adminStore.isAuthenticated ? 'Да' : 'Нет' }}</p>
        <p v-if="adminStore.currentUser">Роль: {{ adminStore.currentUser.role }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface);
  position: relative;
}

:root[data-theme='dark'] .login-page {
  background-color: #11171f;
}

.login-container {
  max-width: 420px;
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.login-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-image {
  height: 40px;
}

.admin-label {
  font-size: 1rem;
  color: var(--color-text-muted);
}

.login-card {
  width: 100%;
  border-radius: var(--radius-lg);
  animation: card-appear 0.5s ease-out forwards;
}

.card-title {
  margin-bottom: 8px;
  color: var(--color-text);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
}

.toggle-form-link {
  color: var(--color-accent);
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.toggle-form-link:hover {
  text-decoration: underline;
}

.theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.theme-toggle:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.home-link {
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-link:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.home-link:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Debug status for troubleshooting */
.debug-status {
  margin-top: 20px;
  padding: 10px;
  background-color: rgba(0,0,0,0.05);
  border-radius: 5px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  width: 100%;
}

/* Development helper */
.dev-helper {
  margin-top: 12px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.help-text {
  display: block;
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 4px;
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-card {
    animation: none;
  }
  
  .theme-toggle, 
  .home-link {
    transition: none;
  }
}

:deep(.p-password input) {
  width: 100%;
}

:deep(.p-password-panel) {
  width: 100%;
}
</style>