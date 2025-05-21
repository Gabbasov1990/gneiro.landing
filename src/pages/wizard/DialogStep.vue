<script setup lang="ts">
import { useWizardStore } from '@/store/wizard';
import { computed, ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const wizardStore = useWizardStore();

const canProceed = computed(() => {
  return wizardStore.form.flow.length >= 3 && 
         wizardStore.form.flow.every(step => step.text.trim().length > 0);
});

// Currently dragged step for reordering
const draggedStep = ref(null);

// Handle drag start
const onDragStart = (step) => {
  draggedStep.value = step;
};

// Handle drag end
const onDragEnd = () => {
  draggedStep.value = null;
};

// Handle drop to reorder
const onDrop = (event, targetStep) => {
  if (draggedStep.value) {
    const draggedStepIndex = wizardStore.form.flow.findIndex(s => s.id === draggedStep.value.id);
    const targetStepIndex = wizardStore.form.flow.findIndex(s => s.id === targetStep.id);
    
    if (draggedStepIndex !== -1 && targetStepIndex !== -1) {
      // Create a new array with the updated order
      const newOrder = [...wizardStore.form.flow];
      const [removed] = newOrder.splice(draggedStepIndex, 1);
      newOrder.splice(targetStepIndex, 0, removed);
      
      // Update the flow with the new order
      wizardStore.form.flow = newOrder;
    }
  }
};

// Handle Enter key in input to add a new step
const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    wizardStore.addDialogStep();
  }
};
</script>

<template>
  <div class="dialog-step">
    <h1 class="step-title">Как ассистент развивает диалог?</h1>
    
    <div class="instructions">
      <p>
        Добавьте последовательность шагов, которые ваш ассистент должен выполнить при общении с клиентом. 
        Добавьте не менее 3 шагов для эффективного диалога.
      </p>
    </div>
    
    <div class="dialog-container">
      <ul class="dialog-steps">
        <li 
          v-for="step in wizardStore.form.flow" 
          :key="step.id"
          class="dialog-item"
          draggable="true"
          @dragstart="onDragStart(step)"
          @dragend="onDragEnd"
          @drop="onDrop($event, step)"
          @dragover.prevent
          @dragenter.prevent
        >
          <div class="dialog-controls">
            <i class="pi pi-bars handle"></i>
            
            <div class="step-number">{{ wizardStore.form.flow.indexOf(step) + 1 }}</div>
          </div>
          
          <div class="dialog-content">
            <InputText
              v-model="step.text"
              class="w-full"
              placeholder="Введите шаг диалога"
              @keydown="handleKeyDown"
            />
          </div>
          
          <div class="dialog-actions">
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger p-button-sm"
              @click="wizardStore.removeDialogStep(step.id)"
              :disabled="wizardStore.form.flow.length <= 1"
              aria-label="Удалить шаг"
            />
          </div>
        </li>
      </ul>
      
      <div class="add-step">
        <Button
          label="+ Добавить шаг"
          class="p-button-text"
          @click="wizardStore.addDialogStep"
        />
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
.dialog-step {
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

.instructions {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.dialog-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin: 1rem 0 2rem;
}

.dialog-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dialog-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  cursor: grab;
}

.dialog-item:active {
  cursor: grabbing;
}

.dialog-item:hover {
  background-color: var(--color-bg);
}

.dialog-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.handle {
  cursor: grab;
  color: var(--color-text-muted);
  font-size: 1rem;
}

.step-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-accent);
  color: white;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 500;
}

.dialog-content {
  flex: 1;
}

.dialog-actions {
  align-self: center;
}

.add-step {
  margin-top: 1.5rem;
  text-align: center;
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