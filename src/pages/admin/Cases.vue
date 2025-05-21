<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminStore } from '@/store/admin';
import EntityTable from '@/components/admin/EntityTable.vue';
import EntityEditor from '@/components/admin/EntityEditor.vue';
import Card from 'primevue/card';

const adminStore = useAdminStore();

// State
const showEditor = ref(false);
const currentCase = ref(null);
const isNewCase = ref(false);

// Fetch cases when component mounts
onMounted(async () => {
  await adminStore.fetchCases();
});

// Add new case
const handleAddCase = () => {
  currentCase.value = null;
  isNewCase.value = true;
  showEditor.value = true;
};

// Edit case
const handleEditCase = (caseItem) => {
  currentCase.value = caseItem;
  isNewCase.value = false;
  showEditor.value = true;
};

// View case
const handleViewCase = (caseItem) => {
  // In a real app, open the case in a new tab or display a preview
  window.open(`/cases/${caseItem.slug}`, '_blank');
};

// Delete case
const handleDeleteCase = async (caseItem) => {
  await adminStore.deleteCase(caseItem.id);
};

// Refresh cases
const handleRefresh = async () => {
  await adminStore.fetchCases();
};

// Save case
const handleSaveCase = async (caseItem) => {
  try {
    if (isNewCase.value) {
      await adminStore.createCase(caseItem);
    } else {
      await adminStore.updateCase(caseItem.id, caseItem);
    }
    showEditor.value = false;
  } catch (error) {
    console.error('Error saving case:', error);
  }
};

// Preview case
const handlePreviewCase = (caseItem) => {
  // For preview, we'd typically open a new window or display a preview modal
  console.log('Preview case:', caseItem);
  
  // Could also open a placeholder URL with query params
  // window.open(`/cases/preview?title=${encodeURIComponent(caseItem.title)}`, '_blank');
};
</script>

<template>
  <div class="cases-page">
    <Card>
      <template #content>
        <EntityTable 
          :items="adminStore.cases"
          :loading="adminStore.isLoading"
          entityName="кейс"
          entityNamePlural="кейсы"
          @add="handleAddCase"
          @edit="handleEditCase"
          @view="handleViewCase"
          @delete="handleDeleteCase"
          @refresh="handleRefresh"
        />
      </template>
    </Card>
    
    <EntityEditor 
      v-model:visible="showEditor"
      :entity="currentCase"
      entityType="case"
      :isNew="isNewCase"
      @save="handleSaveCase"
      @preview="handlePreviewCase"
    />
  </div>
</template>

<style scoped>
.cases-page {
  margin-bottom: 2rem;
}
</style>