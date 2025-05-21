<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { formatDate } from '@/lib/utils';

const confirm = useConfirm();

const props = defineProps<{
  items: any[];
  loading: boolean;
  entityName: string;
  entityNamePlural: string;
}>();

const emit = defineEmits(['add', 'edit', 'delete', 'view', 'refresh']);

const selectedItems = ref([]);
const globalFilter = ref('');
const itemsPerPage = ref(10);

// Computed properties
const noItemsSelected = computed(() => selectedItems.value.length === 0);
const multipleItemsSelected = computed(() => selectedItems.value.length > 1);

// Clear selection when items change
watch(
  () => props.items, 
  () => {
    selectedItems.value = [];
  }
);

// Filter function
const onGlobalFilter = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  globalFilter.value = value;
};

// Confirm single delete
const confirmDelete = (item: any) => {
  confirm.require({
    message: `Вы уверены, что хотите удалить ${props.entityName.toLowerCase()} "${item.title || item.label}"?`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    accept: () => {
      emit('delete', item);
    }
  });
};

// Confirm multiple delete
const confirmDeleteSelected = () => {
  confirm.require({
    message: `Вы уверены, что хотите удалить выбранные ${props.entityNamePlural.toLowerCase()} (${selectedItems.value.length})?`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      selectedItems.value.forEach(item => {
        emit('delete', item);
      });
      selectedItems.value = [];
    }
  });
};

// Format date for display
const formatDateForDisplay = (date: string) => {
  if (!date) return '';
  return formatDate(date);
};
</script>

<template>
  <div class="entity-table">
    <!-- Table toolbar -->
    <div class="table-toolbar">
      <!-- Left side: Actions -->
      <div class="toolbar-left">
        <Button 
          label="Создать" 
          icon="pi pi-plus" 
          @click="$emit('add')" 
        />
        
        <Button 
          label="Просмотреть" 
          icon="pi pi-eye" 
          :disabled="noItemsSelected || multipleItemsSelected" 
          @click="$emit('view', selectedItems[0])" 
          class="p-button-outlined"
        />
        
        <Button 
          label="Редактировать" 
          icon="pi pi-pencil" 
          :disabled="noItemsSelected || multipleItemsSelected" 
          @click="$emit('edit', selectedItems[0])" 
          class="p-button-outlined"
        />
        
        <Button 
          label="Удалить" 
          icon="pi pi-trash" 
          :disabled="noItemsSelected" 
          @click="confirmDeleteSelected" 
          class="p-button-outlined p-button-danger"
        />
      </div>
      
      <!-- Right side: Search and refresh -->
      <div class="toolbar-right">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <input 
            type="text" 
            class="p-inputtext p-component" 
            placeholder="Поиск..." 
            @input="onGlobalFilter"
          />
        </span>
        
        <Button 
          icon="pi pi-refresh" 
          @click="$emit('refresh')" 
          class="p-button-outlined p-button-rounded"
          aria-label="Обновить"
        />
      </div>
    </div>
    
    <!-- Data table -->
    <DataTable 
      :value="props.items" 
      v-model:selection="selectedItems"
      :paginator="true" 
      :rows="itemsPerPage" 
      :loading="loading"
      dataKey="id"
      :global-filter-fields="['title', 'slug', 'category', 'published_at', 'owner_name', 'label']"
      :global-filter="globalFilter"
      responsive-layout="stack"
      class="p-datatable-sm"
      stripedRows
      :rows-per-page-options="[5, 10, 20, 50]"
      :empty-message="`Нет ${props.entityNamePlural.toLowerCase()} для отображения`"
      :loading-message="`Загрузка ${props.entityNamePlural.toLowerCase()}...`"
    >
      <template #empty>
        <div class="empty-state">
          <div class="empty-icon">
            <i :class="props.entityName === 'кейс' ? 'pi pi-briefcase' : 'pi pi-file-edit'"></i>
          </div>
          <h3 class="empty-title">Нет {{ props.entityNamePlural.toLowerCase() }}</h3>
          <p class="empty-message">Нажмите "Создать", чтобы добавить {{ props.entityName.toLowerCase() }}.</p>
        </div>
      </template>
      
      <template #loading>
        <div class="loading-state">
          <i class="pi pi-spin pi-spinner loading-icon"></i>
          <p class="loading-message">Загрузка {{ props.entityNamePlural.toLowerCase() }}...</p>
        </div>
      </template>
      
      <!-- Selection column -->
      <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
      
      <!-- Data columns -->
      <Column field="title" header="Заголовок" sortable>
        <template #body="slotProps">
          <span class="font-medium">{{ slotProps.data.title || slotProps.data.label }}</span>
        </template>
      </Column>
      
      <Column field="slug" header="Slug" sortable class="hidden sm:table-cell">
        <template #body="slotProps">
          <span>{{ slotProps.data.slug }}</span>
        </template>
      </Column>
      
      <Column field="views" header="Просмотры" sortable class="hidden md:table-cell">
        <template #body="slotProps">
          <span>{{ slotProps.data.views || 0 }}</span>
        </template>
      </Column>
      
      <Column field="published_at" header="Опубликовано" sortable>
        <template #body="slotProps">
          <span>{{ formatDateForDisplay(slotProps.data.published_at) }}</span>
        </template>
      </Column>
      
      <Column headerStyle="width: 7rem; min-width: 7rem;" bodyStyle="overflow: visible">
        <template #body="slotProps">
          <div class="actions-cell">
            <Button 
              icon="pi pi-eye" 
              @click="$emit('view', slotProps.data)" 
              class="p-button-text p-button-rounded" 
              aria-label="Просмотр"
            />
            <Button 
              icon="pi pi-pencil" 
              @click="$emit('edit', slotProps.data)" 
              class="p-button-text p-button-rounded" 
              aria-label="Редактирование"
            />
            <Button 
              icon="pi pi-trash" 
              @click="confirmDelete(slotProps.data)" 
              class="p-button-text p-button-rounded p-button-danger" 
              aria-label="Удаление"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    
    <!-- Confirmation dialog for delete operations -->
    <ConfirmDialog />
  </div>
</template>

<style scoped>
.entity-table {
  width: 100%;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .toolbar-left, .toolbar-right {
    width: 100%;
  }
}

.toolbar-left {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Empty state styling */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.empty-message {
  color: var(--color-text-muted);
}

/* Loading state styling */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.loading-icon {
  font-size: 2rem;
  color: var(--color-accent);
  margin-bottom: 1rem;
}

.loading-message {
  color: var(--color-text-muted);
}

/* Action buttons in table cells */
.actions-cell {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

@media screen and (max-width: 640px) {
  .p-datatable-wrapper {
    overflow-x: auto;
  }
  
  .actions-cell {
    justify-content: flex-start;
  }
}
</style>