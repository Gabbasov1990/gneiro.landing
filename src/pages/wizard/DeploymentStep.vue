<script setup lang="ts">
import { useWizardStore } from '@/store/wizard';
import { computed, ref } from 'vue';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Slider from 'primevue/slider';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';

const wizardStore = useWizardStore();

// Dropdown options
const weekdays = ref([
  { label: 'Понедельник', value: 1 },
  { label: 'Вторник', value: 2 },
  { label: 'Среда', value: 3 },
  { label: 'Четверг', value: 4 },
  { label: 'Пятница', value: 5 },
  { label: 'Суббота', value: 6 },
  { label: 'Воскресенье', value: 0 }
]);

const handoffOptions = ref([
  { label: 'Автоматическая передача', value: 'auto' },
  { label: 'Только ручная передача', value: 'manual' },
  { label: 'Не передавать операторам', value: 'never' }
]);

// Hours for dropdowns
const hours = Array.from({ length: 24 }, (_, i) => ({ 
  label: `${String(i).padStart(2, '0')}:00`, 
  value: i 
}));

// Format time value
const formatTime = (hour) => {
  return `${String(hour).padStart(2, '0')}:00`;
};

// Always valid for this step
const canProceed = computed(() => true);
</script>

<template>
  <div class="deployment-step">
    <h1 class="step-title">Настройка работы ассистента</h1>
    
    <div class="form-container">
      <!-- Schedule section -->
      <div class="form-section">
        <h2 class="section-title">Расписание ассистента</h2>
        
        <div class="schedule-options">
          <div class="schedule-option">
            <RadioButton 
              v-model="wizardStore.form.deployment.schedule" 
              value="always"
              :radioClass="'p-radiobutton-input'"
              inputId="schedule-always"
            />
            <label for="schedule-always" class="option-label">
              <strong>24/7</strong>
              <span>Ассистент работает круглосуточно без выходных</span>
            </label>
          </div>
          
          <div class="schedule-option">
            <RadioButton 
              v-model="wizardStore.form.deployment.schedule" 
              value="business_hours"
              :radioClass="'p-radiobutton-input'"
              inputId="schedule-business"
            />
            <label for="schedule-business" class="option-label">
              <strong>Рабочие часы</strong>
              <span>Пн-Пт, с 9:00 до 18:00</span>
            </label>
          </div>
          
          <div class="schedule-option">
            <RadioButton 
              v-model="wizardStore.form.deployment.schedule" 
              value="custom"
              :radioClass="'p-radiobutton-input'"
              inputId="schedule-custom"
            />
            <label for="schedule-custom" class="option-label">
              <strong>Настраиваемое</strong>
              <span>Выберите свои дни и часы работы</span>
            </label>
          </div>
        </div>
        
        <!-- Custom schedule settings -->
        <div v-if="wizardStore.form.deployment.schedule === 'custom'" class="custom-schedule">
          <div class="form-group">
            <label for="weekdays">Дни недели</label>
            <MultiSelect
              id="weekdays"
              v-model="wizardStore.form.deployment.customSchedule.weekdays"
              :options="weekdays"
              optionLabel="label"
              optionValue="value"
              placeholder="Выберите дни недели"
              class="w-full"
              display="chip"
            />
          </div>
          
          <div class="time-range">
            <div class="form-group">
              <label for="start-hour">Начало работы</label>
              <Dropdown
                id="start-hour"
                v-model="wizardStore.form.deployment.customSchedule.startHour"
                :options="hours"
                optionLabel="label"
                optionValue="value"
                placeholder="Выберите время"
                class="w-full"
              />
            </div>
            
            <div class="form-group">
              <label for="end-hour">Конец работы</label>
              <Dropdown
                id="end-hour"
                v-model="wizardStore.form.deployment.customSchedule.endHour"
                :options="hours"
                optionLabel="label"
                optionValue="value"
                placeholder="Выберите время"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Notifications section -->
      <div class="form-section">
        <h2 class="section-title">Уведомления</h2>
        
        <div class="toggle-setting">
          <div class="toggle-info">
            <h3 class="setting-title">Уведомления о новых чатах</h3>
            <p class="setting-desc">Получайте уведомления, когда с ассистентом начинают новый диалог</p>
          </div>
          
          <Checkbox 
            v-model="wizardStore.form.deployment.notifications" 
            :binary="true"
            inputId="notifications-toggle"
          />
        </div>
      </div>
      
      <!-- Handoff section -->
      <div class="form-section">
        <h2 class="section-title">Передача оператору</h2>
        
        <div class="form-group">
          <label for="handoff">Когда передавать диалог живому оператору</label>
          <Dropdown
            id="handoff"
            v-model="wizardStore.form.deployment.handoff"
            :options="handoffOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Выберите опцию"
            class="w-full"
          />
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
.deployment-step {
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
  gap: 2rem;
  margin: 1rem 0 1rem;
}

.form-section {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.schedule-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
}

.schedule-option:hover {
  background-color: rgba(var(--accent-rgb, 10, 132, 255), 0.05);
}

.option-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
}

.option-label strong {
  font-weight: 600;
  font-size: 1rem;
}

.option-label span {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.custom-schedule {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
}

.time-range {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.time-range .form-group {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.9rem;
}

.toggle-setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
}

.toggle-info {
  flex: 1;
}

.setting-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.setting-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
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
  .time-range {
    flex-direction: column;
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