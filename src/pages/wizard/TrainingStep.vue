<script setup lang="ts">
import { useWizardStore } from '@/store/wizard';
import { computed, ref } from 'vue';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';
import { useRouter } from 'vue-router';

const wizardStore = useWizardStore();
const router = useRouter();
const isCreating = ref(false);
const error = ref('');

const canProceed = computed(() => {
  return (
    wizardStore.form.ig.trim() ||
    wizardStore.form.site.trim() ||
    wizardStore.form.files.length > 0
  );
});

// Handle file upload
const handleFileUpload = (event) => {
  const uploadedFiles = Array.from(event.files);
  wizardStore.form.files = [...wizardStore.form.files, ...uploadedFiles];
};

// Remove a file
const removeFile = (file) => {
  const index = wizardStore.form.files.findIndex(f => f.name === file.name);
  if (index !== -1) {
    wizardStore.form.files.splice(index, 1);
  }
};

// Create agent and proceed
const createAssistant = async () => {
  if (!canProceed.value) {
    error.value = 'Для обучения ассистента требуется хотя бы один источник данных.';
    return;
  }
  
  error.value = '';
  isCreating.value = true;
  
  try {
    console.log('Creating assistant with data:', {
      ig: wizardStore.form.ig,
      site: wizardStore.form.site,
      files: wizardStore.form.files.map(f => f.name)
    });
    
    await wizardStore.createAgent();
    router.push('/create/setup');
  } catch (err) {
    console.error('Error creating assistant:', err);
    error.value = err.message || 'Произошла ошибка при создании ассистента';
  } finally {
    isCreating.value = false;
  }
};
</script>

<template>
  <div class="training-step">
    <h1 class="step-title">Обучение ассистента</h1>
    
    <div class="instructions">
      <p>
        Для эффективной работы ассистенту нужны данные о вашем бизнесе. 
        Добавьте хотя бы один источник из предложенных ниже.
      </p>
    </div>
    
    <div class="form-container">
      <!-- Instagram URL -->
      <div class="form-group">
        <label for="ig-url" class="form-label">Instagram профиль</label>
        <InputText
          id="ig-url"
          v-model="wizardStore.form.ig"
          placeholder="https://instagram.com/ваш_профиль"
          class="w-full"
        />
        <small class="input-help">Мы проанализируем публикации и описания</small>
      </div>
      
      <!-- Website URL -->
      <div class="form-group">
        <label for="site-url" class="form-label">Веб-сайт</label>
        <InputText
          id="site-url"
          v-model="wizardStore.form.site"
          placeholder="https://вашсайт.com"
          class="w-full"
        />
        <small class="input-help">Мы изучим контент вашего сайта</small>
      </div>
      
      <!-- File Upload -->
      <div class="form-group">
        <label class="form-label">Документы</label>
        
        <FileUpload
          mode="advanced"
          :multiple="true"
          accept=".pdf,.docx,.txt"
          :maxFileSize="10000000"
          @upload="handleFileUpload"
          :auto="true"
          chooseLabel="Выбрать файлы"
          cancelLabel="Отмена"
          class="custom-upload"
        >
          <template #empty>
            <p class="upload-empty">
              Перетащите файлы сюда или нажмите для выбора
            </p>
          </template>
        </FileUpload>
        
        <!-- List of selected files -->
        <div v-if="wizardStore.form.files.length > 0" class="selected-files">
          <p class="files-title">Выбранные файлы:</p>
          <ul class="files-list">
            <li v-for="(file, index) in wizardStore.form.files" :key="index" class="file-item">
              <div class="file-info">
                <i 
                  class="pi" 
                  :class="{
                    'pi-file-pdf': file.type === 'application/pdf',
                    'pi-file-word': file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'pi-file': file.type === 'text/plain' || !file.type
                  }"
                ></i>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">({{ (file.size / 1024).toFixed(0) }} KB)</span>
              </div>
              <button @click="removeFile(file)" class="file-remove" aria-label="Удалить файл">
                <i class="pi pi-times"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Validation message -->
      <Message v-if="error" severity="error" class="mt-4">
        <p>{{ error }}</p>
      </Message>
    </div>
    
    <div class="navigation-buttons">
      <button @click="wizardStore.prevStep" class="btn btn-outline">
        <i class="pi pi-arrow-left"></i>
        Назад
      </button>
      
      <button 
        @click="createAssistant" 
        class="btn btn-primary"
        :disabled="!canProceed"
        :class="{ 'loading': isCreating }"
      >
        <i v-if="isCreating" class="pi pi-spin pi-spinner"></i>
        <span v-else>Создать ассистента</span>
        <i v-if="!isCreating" class="pi pi-check"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.training-step {
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

.input-help {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.selected-files {
  margin-top: 1rem;
  padding: 1rem;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
}

.files-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.files-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  background-color: var(--color-bg);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-name {
  font-size: 0.875rem;
}

.file-size {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.file-remove {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.file-remove:hover {
  background-color: var(--color-surface);
  color: var(--color-danger, #ff3b30);
}

.custom-upload {
  width: 100%;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: transparent;
  transition: all 0.2s ease;
}

.custom-upload:hover {
  border-color: var(--color-accent);
}

.upload-empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
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

.btn.loading {
  pointer-events: none;
  opacity: 0.8;
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