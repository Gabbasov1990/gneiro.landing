<script setup lang="ts">
import { useWizardStore } from '@/store/wizard';
import { computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';

const wizardStore = useWizardStore();

// Tone options for dropdown
const toneOptions = [
  { label: 'Профессиональный', value: 'professional' },
  { label: 'Дружелюбный', value: 'friendly' },
  { label: 'Формальный', value: 'formal' },
  { label: 'Ненавязчивый', value: 'casual' },
  { label: 'Энтузиастичный', value: 'enthusiastic' }
];

// No-answer phrase options
const noAnswerOptions = [
  { label: 'Стандартная', value: "I'll need to check with a human colleague about that. Can I help with something else?" },
  { label: 'Дружелюбная', value: "I don't know that yet, but I'd be happy to connect you with a team member who can help!" },
  { label: 'Продающая', value: "I'm not sure about that specific detail, but I can tell you about our amazing features instead!" }
];

// Goal options
const goalOptions = [
  { label: 'Продажи', value: 'sell', icon: 'pi pi-shopping-cart' },
  { label: 'Консультации', value: 'consult', icon: 'pi pi-info-circle' },
  { label: 'Поддержка', value: 'support', icon: 'pi pi-user' },
  { label: 'Другое', value: 'other', icon: 'pi pi-star' }
];

const canProceed = computed(() => {
  return !!wizardStore.form.tone && 
         !!wizardStore.form.noAnswer && 
         !!wizardStore.form.goal;
});
</script>

<template>
  <div class="personality-step">
    <h1 class="step-title">Осталось чуть-чуть</h1>
    
    <div class="form-container">
      <div class="form-group">
        <label for="tone" class="form-label">Тон общения ассистента</label>
        <Dropdown
          id="tone"
          v-model="wizardStore.form.tone"
          :options="toneOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Выберите тон общения"
          class="w-full"
        />
      </div>
      
      <div class="form-group">
        <label for="no-answer" class="form-label">Фраза, когда ассистент не знает ответа</label>
        <Dropdown
          id="no-answer"
          v-model="wizardStore.form.noAnswer"
          :options="noAnswerOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Выберите фразу"
          class="w-full"
        />
        <Textarea
          v-if="wizardStore.form.noAnswer"
          v-model="wizardStore.form.noAnswer"
          rows="3"
          class="w-full mt-2"
          placeholder="Настройте фразу"
          autoResize
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Основная цель ассистента</label>
        <div class="goal-options">
          <button
            v-for="option in goalOptions"
            :key="option.value"
            class="goal-option"
            :class="{ active: wizardStore.form.goal === option.value }"
            @click="wizardStore.form.goal = option.value"
          >
            <i :class="option.icon"></i>
            <span>{{ option.label }}</span>
          </button>
        </div>
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
.personality-step {
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

.goal-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
}

.goal-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  background-color: var(--color-bg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.goal-option:hover {
  border-color: var(--color-accent-subtle);
  background-color: var(--color-surface);
}

.goal-option.active {
  border-color: var(--color-accent);
  background-color: var(--color-accent-subtle);
}

.goal-option i {
  font-size: 1.5rem;
  color: var(--color-accent);
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
  .goal-options {
    grid-template-columns: 1fr;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn {
    width: 100%;
  }
}
</style>