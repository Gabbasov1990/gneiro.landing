<script setup lang="ts">
import { useWizardStore } from '@/store/wizard';
import { computed } from 'vue';
import Card from 'primevue/card';
import ToggleButton from 'primevue/togglebutton';
import Dropdown from 'primevue/dropdown';

const wizardStore = useWizardStore();

// CRM options
const crmOptions = [
  { label: 'Нет', value: '' },
  { label: 'AmoCRM', value: 'amocrm' },
  { label: 'Bitrix24', value: 'bitrix24' },
  { label: 'HubSpot', value: 'hubspot' },
  { label: 'Другая CRM', value: 'other' }
];

// Always valid for this step
const canProceed = computed(() => true);
</script>

<template>
  <div class="integrations-step">
    <h1 class="step-title">Выберите интеграции</h1>
    
    <div class="integrations-container">
      <!-- CRM Integration -->
      <Card class="integration-card">
        <template #header>
          <div class="card-header">
            <i class="pi pi-users header-icon"></i>
            <h3 class="header-title">CRM-система</h3>
          </div>
        </template>
        <template #content>
          <p class="card-description">
            Подключите вашу CRM-систему, чтобы автоматически создавать контакты 
            и сделки из диалогов с клиентами.
          </p>
          
          <div class="form-group">
            <label for="crm-select">Выберите CRM-систему</label>
            <Dropdown 
              id="crm-select"
              v-model="wizardStore.form.integrations.crm"
              :options="crmOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Выберите CRM"
              class="w-full"
            />
          </div>
        </template>
      </Card>
      
      <!-- Payment Processing -->
      <Card class="integration-card">
        <template #header>
          <div class="card-header">
            <i class="pi pi-credit-card header-icon"></i>
            <h3 class="header-title">Прием платежей</h3>
          </div>
        </template>
        <template #content>
          <p class="card-description">
            Позвольте клиентам оплачивать заказы прямо в чате через поддерживаемые
            платежные системы.
          </p>
          
          <div class="toggle-control">
            <ToggleButton 
              v-model="wizardStore.form.integrations.payment" 
              onLabel="Включено" 
              offLabel="Отключено"
              class="w-full"
            />
          </div>
        </template>
      </Card>
      
      <!-- Analytics Integration -->
      <Card class="integration-card">
        <template #header>
          <div class="card-header">
            <i class="pi pi-chart-bar header-icon"></i>
            <h3 class="header-title">Аналитика</h3>
          </div>
        </template>
        <template #content>
          <p class="card-description">
            Отслеживайте эффективность ассистента - конверсию, популярные вопросы
            и удовлетворенность клиентов.
          </p>
          
          <div class="toggle-control">
            <ToggleButton 
              v-model="wizardStore.form.integrations.analytics" 
              onLabel="Включено" 
              offLabel="Отключено"
              class="w-full"
            />
          </div>
        </template>
      </Card>
      
      <!-- API Access -->
      <Card class="integration-card">
        <template #header>
          <div class="card-header">
            <i class="pi pi-code header-icon"></i>
            <h3 class="header-title">API-доступ</h3>
          </div>
        </template>
        <template #content>
          <p class="card-description">
            Разрешите программный доступ к вашему ассистенту для интеграции с вашими
            собственными системами.
          </p>
          
          <div class="toggle-control">
            <ToggleButton 
              v-model="wizardStore.form.integrations.apiAccess" 
              onLabel="Включено" 
              offLabel="Отключено"
              class="w-full"
            />
          </div>
        </template>
      </Card>
    </div>
    
    <div class="navigation-buttons">
      <button @click="wizardStore.prevStep" class="btn btn-outline">
        <i class="pi pi-arrow-left"></i>
        Назад
      </button>
      
      <button @click="wizardStore.nextStep" class="btn btn-primary">
        Далее
        <i class="pi pi-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.integrations-step {
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

.integrations-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin: 1rem 0 2rem;
}

.integration-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(var(--accent-rgb, 10, 132, 255), 0.05);
}

.header-icon {
  font-size: 1.5rem;
  color: var(--color-accent);
}

.header-title {
  font-size: 1.25rem;
  margin: 0;
}

.card-description {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-control {
  display: flex;
  justify-content: center;
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

.btn-primary:hover {
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
  .integrations-container {
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