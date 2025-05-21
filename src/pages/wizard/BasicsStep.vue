<script setup lang="ts">
import { useWizardStore } from '@/store/wizard';
import { computed } from 'vue';

const wizardStore = useWizardStore();

const canProceed = computed(() => {
  return wizardStore.form.companyName.length >= 3 && wizardStore.form.botName.length >= 3;
});
</script>

<template>
  <div class="basics-step">
    <h1 class="step-title">Уточните пару моментов</h1>
    
    <div class="form-container">
      <div class="form-group">
        <label for="company-name" class="form-label">Название компании</label>
        <input 
          id="company-name" 
          v-model="wizardStore.form.companyName" 
          type="text" 
          class="form-input"
          placeholder="Например: ТехноМаркет"
          minlength="3"
          required
        />
        <small v-if="wizardStore.form.companyName && wizardStore.form.companyName.length < 3" class="input-error">
          Название должно содержать минимум 3 символа
        </small>
      </div>
      
      <div class="form-group">
        <label for="bot-name" class="form-label">Имя ассистента</label>
        <input 
          id="bot-name" 
          v-model="wizardStore.form.botName" 
          type="text" 
          class="form-input"
          placeholder="Например: Алиса"
          minlength="3"
          required
        />
        <small v-if="wizardStore.form.botName && wizardStore.form.botName.length < 3" class="input-error">
          Имя должно содержать минимум 3 символа
        </small>
      </div>
    </div>
    
    <div class="navigation-buttons">
      <button @click="wizardStore.prevStep" class="btn btn-outline">
        <i class="pi pi-arrow-left"></i>
        Назад
      </button>
      
      <button 
        @click="wizardStore.nextStep" 
        class="btn btn-primary"
        :disabled="!canProceed"
      >
        Далее
        <i class="pi pi-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.basics-step {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  text-align: center;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1rem 0 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  font-size: 1rem;
  color: var(--color-text);
}

.form-input {
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

.input-error {
  color: var(--color-danger, #ff3b30);
  font-size: 0.875rem;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  border: none;
}

.btn-primary:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
  color: var(--color-text-muted);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
}

.btn-outline {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-outline:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .navigation-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn {
    width: 100%;
  }
}
</style>