<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminStore } from '@/store/admin';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';

const adminStore = useAdminStore();
const confirm = useConfirm();

// State
const showCreateDialog = ref(false);
const newKeyLabel = ref('');
const validationError = ref('');
const newApiKey = ref('');
const showNewKeyDialog = ref(false);
const isCreating = ref(false);

// Load API keys
onMounted(async () => {
  await adminStore.fetchApiKeys();
});

// Open create dialog
const openCreateDialog = () => {
  newKeyLabel.value = '';
  validationError.value = '';
  showCreateDialog.value = true;
};

// Create new API key
const createApiKey = async () => {
  // Validate label
  if (!newKeyLabel.value.trim()) {
    validationError.value = 'Пожалуйста, введите название ключа';
    return;
  }
  
  isCreating.value = true;
  
  try {
    const result = await adminStore.createApiKey(newKeyLabel.value.trim());
    
    if (result) {
      showCreateDialog.value = false;
      newApiKey.value = result.token;
      showNewKeyDialog.value = true;
    }
  } finally {
    isCreating.value = false;
  }
};

// Toggle API key active state
const toggleApiKeyStatus = async (key, active) => {
  await adminStore.toggleApiKey(key.id, active);
};

// Confirm delete API key
const confirmDeleteApiKey = (key) => {
  confirm.require({
    message: `Вы уверены, что хотите удалить API ключ "${key.label}"? Это действие нельзя отменить.`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      adminStore.deleteApiKey(key.id);
    }
  });
};

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Copy API key to clipboard
const copyApiKey = () => {
  navigator.clipboard.writeText(newApiKey.value)
    .then(() => {
      adminStore.addNotification({
        type: 'success',
        message: 'API ключ скопирован в буфер обмена'
      });
    })
    .catch(err => {
      console.error('Could not copy API key: ', err);
      adminStore.addNotification({
        type: 'error',
        message: 'Не удалось скопировать API ключ'
      });
    });
};
</script>

<template>
  <div class="api-keys-page">
    <Card>
      <template #title>
        <div class="card-title-container">
          <h2 class="card-title">API Ключи</h2>
          <Button 
            label="Создать новый ключ" 
            icon="pi pi-plus" 
            @click="openCreateDialog"
          />
        </div>
      </template>
      
      <template #content>
        <p class="api-description">
          API ключи используются для доступа к API Gneiro из внешних систем, например, для интеграции с n8n. 
          Создайте ключи для разных интеграций и отслеживайте их использование.
        </p>
        
        <!-- API Keys Table -->
        <DataTable 
          :value="adminStore.apiKeys"
          :loading="adminStore.isLoading"
          :paginator="true"
          :rows="10"
          stripedRows
          :empty-message="'Нет API ключей'"
          class="mt-4"
        >
          <Column field="label" header="Название" sortable>
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.label }}</span>
            </template>
          </Column>
          
          <Column field="created_at" header="Создан" sortable>
            <template #body="slotProps">
              <span>{{ formatDate(slotProps.data.created_at) }}</span>
            </template>
          </Column>
          
          <Column field="active" header="Статус" sortable>
            <template #body="slotProps">
              <span 
                class="status-badge" 
                :class="{ 'active': slotProps.data.active, 'inactive': !slotProps.data.active }"
              >
                {{ slotProps.data.active ? 'Активен' : 'Неактивен' }}
              </span>
            </template>
          </Column>
          
          <Column headerStyle="width: 10rem; min-width: 8rem;" bodyStyle="text-align: center;">
            <template #body="slotProps">
              <Button 
                v-if="slotProps.data.active"
                icon="pi pi-ban" 
                class="p-button-text p-button-secondary" 
                @click="toggleApiKeyStatus(slotProps.data, false)"
                aria-label="Деактивировать ключ"
                v-tooltip.top="'Деактивировать'"
              />
              <Button 
                v-else
                icon="pi pi-check" 
                class="p-button-text p-button-success" 
                @click="toggleApiKeyStatus(slotProps.data, true)"
                aria-label="Активировать ключ"
                v-tooltip.top="'Активировать'"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-text p-button-danger" 
                @click="confirmDeleteApiKey(slotProps.data)"
                aria-label="Удалить ключ"
                v-tooltip.top="'Удалить'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
    
    <!-- Create API Key Dialog -->
    <Dialog 
      v-model:visible="showCreateDialog" 
      :style="{ width: '450px' }" 
      header="Создание API ключа" 
      modal 
      :closable="true"
      :dismissableMask="true"
      :closeOnEscape="true"
    >
      <div class="create-key-form">
        <div class="form-field">
          <label for="key-label" class="form-label">Название ключа</label>
          <InputText 
            id="key-label"
            v-model="newKeyLabel"
            class="w-full"
            :class="{ 'p-invalid': validationError }"
            placeholder="Например: Integration, n8n, External API"
            aria-describedby="label-error"
          />
          <small id="label-error" class="form-error" v-if="validationError">{{ validationError }}</small>
          <small class="form-help">Используйте понятное название, чтобы потом легко определить назначение ключа</small>
        </div>
      </div>
      
      <div class="dialog-footer">
        <Button 
          label="Отмена" 
          icon="pi pi-times" 
          @click="showCreateDialog = false" 
          class="p-button-text"
        />
        <Button 
          label="Создать" 
          icon="pi pi-check" 
          @click="createApiKey"
          :loading="isCreating"
        />
      </div>
    </Dialog>
    
    <!-- New API Key Dialog -->
    <Dialog 
      v-model:visible="showNewKeyDialog" 
      :style="{ width: '500px' }" 
      header="Новый API ключ создан" 
      modal 
      :closable="false"
      :closeOnEscape="false"
      :dismissableMask="false"
    >
      <div class="new-key-info">
        <p class="key-warning">
          <i class="pi pi-exclamation-triangle warning-icon"></i>
          Этот ключ будет показан только один раз. Сохраните его в надежном месте!
        </p>
        
        <div class="key-container">
          <div class="key-value">{{ newApiKey }}</div>
          <Button 
            icon="pi pi-copy" 
            @click="copyApiKey"
            aria-label="Копировать ключ"
            class="copy-button"
            v-tooltip.left="'Копировать ключ'"
          />
        </div>
      </div>
      
      <div class="dialog-footer">
        <Button 
          label="Закрыть" 
          icon="pi pi-check" 
          @click="showNewKeyDialog = false" 
          class="p-button-primary"
        />
      </div>
    </Dialog>
    
    <!-- Confirmation dialog for delete operations -->
    <ConfirmDialog />
  </div>
</template>

<style scoped>
.api-keys-page {
  margin-bottom: 2rem;
}

.card-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.api-description {
  margin-bottom: 1.5rem;
  color: var(--color-text-muted);
}

/* Status badge */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(var(--success-rgb, 50, 215, 75), 0.1);
  color: var(--color-success, #32d74b);
}

.status-badge.inactive {
  background-color: rgba(var(--danger-rgb, 255, 59, 48), 0.1);
  color: var(--color-danger, #ff3b30);
}

/* Dialog styling */
.create-key-form {
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.form-error {
  color: var(--color-danger, #ff3b30);
  font-size: 0.8rem;
}

.form-help {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* New key dialog */
.new-key-info {
  text-align: center;
}

.key-warning {
  color: var(--color-warning, #ff9500);
  font-weight: 500;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.warning-icon {
  font-size: 1.5rem;
}

.key-container {
  background-color: var(--color-surface);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  position: relative;
  font-family: monospace;
  word-break: break-all;
}

.key-value {
  flex: 1;
}

.copy-button {
  position: absolute;
  right: 0.5rem;
}

@media screen and (max-width: 768px) {
  .card-title-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>