<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAdminStore } from '@/store/admin';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';

const adminStore = useAdminStore();
const confirm = useConfirm();

// State
const folders = ref([
  { name: 'posts', label: 'Статьи' },
  { name: 'cases', label: 'Кейсы' },
  { name: '', label: 'Все файлы' }
]);
const currentFolder = ref('');
const searchQuery = ref('');
const isUploading = ref(false);
const uploadProgress = ref(0);
const selectedFile = ref(null as any);
const showImagePreview = ref(false);
const showFileDetails = ref(false);

// Filter media files by search query
const filteredFiles = computed(() => {
  if (!adminStore.mediaFiles.length) return [];
  
  if (!searchQuery.value.trim()) return adminStore.mediaFiles;
  
  const query = searchQuery.value.toLowerCase();
  return adminStore.mediaFiles.filter(file => 
    file.name.toLowerCase().includes(query)
  );
});

// Load media files
const loadMediaFiles = async () => {
  await adminStore.fetchMediaFiles(currentFolder.value);
};

// Change folder
const changeFolder = async (folder: string) => {
  currentFolder.value = folder;
  await loadMediaFiles();
};

// Upload file via dialog
const uploadFile = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,.pdf,.doc,.docx,.txt';
  input.onchange = async (event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) return;
    
    const file = target.files[0];
    
    isUploading.value = true;
    uploadProgress.value = 0;
    
    // Simulate progress (in a real app, you'd use upload progress events)
    const progressInterval = setInterval(() => {
      uploadProgress.value += 5;
      if (uploadProgress.value >= 95) {
        clearInterval(progressInterval);
      }
    }, 100);
    
    try {
      await adminStore.uploadMediaFile(file, currentFolder.value);
    } finally {
      clearInterval(progressInterval);
      uploadProgress.value = 100;
      
      setTimeout(() => {
        isUploading.value = false;
        uploadProgress.value = 0;
      }, 500);
    }
  };
  
  input.click();
};

// Handle drag and drop uploads
const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  
  if (!event.dataTransfer?.files.length) return;
  
  const files = Array.from(event.dataTransfer.files);
  
  // Upload each file
  files.forEach(async (file) => {
    if (!file.type.startsWith('image/') && 
        !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
      adminStore.addNotification({
        type: 'warn',
        message: 'Неподдерживаемый тип файла',
        detail: `Файл ${file.name} не может быть загружен. Поддерживаются только изображения, PDF, DOC и TXT.`
      });
      return;
    }
    
    isUploading.value = true;
    uploadProgress.value = 0;
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      uploadProgress.value += 5;
      if (uploadProgress.value >= 95) {
        clearInterval(progressInterval);
      }
    }, 100);
    
    try {
      await adminStore.uploadMediaFile(file, currentFolder.value);
    } finally {
      clearInterval(progressInterval);
      uploadProgress.value = 100;
      
      setTimeout(() => {
        isUploading.value = false;
        uploadProgress.value = 0;
      }, 500);
    }
  });
};

// Copy URL to clipboard
const copyUrl = (url: string) => {
  navigator.clipboard.writeText(url).then(() => {
    adminStore.addNotification({
      type: 'success',
      message: 'URL скопирован в буфер обмена'
    });
  }).catch((error) => {
    console.error('Error copying URL:', error);
    adminStore.addNotification({
      type: 'error',
      message: 'Не удалось скопировать URL'
    });
  });
};

// Show image preview
const previewImage = (file: any) => {
  if (!file.type.startsWith('image/')) {
    window.open(file.url, '_blank');
    return;
  }
  
  selectedFile.value = file;
  showImagePreview.value = true;
};

// Show file details
const showDetails = (file: any) => {
  selectedFile.value = file;
  showFileDetails.value = true;
};

// Confirm delete file
const confirmDeleteFile = (file: any) => {
  confirm.require({
    message: `Вы уверены, что хотите удалить файл "${file.name}"?`,
    header: 'Подтверждение удаления',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    accept: () => {
      adminStore.deleteMediaFile(file.path);
    }
  });
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Initialize
onMounted(() => {
  loadMediaFiles();
});
</script>

<template>
  <div 
    class="media-manager"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <!-- Toolbar -->
    <div class="media-toolbar">
      <div class="toolbar-folder-selector">
        <span class="p-buttonset">
          <Button 
            v-for="folder in folders" 
            :key="folder.name"
            :label="folder.label"
            :class="{ 'p-button-secondary': currentFolder !== folder.name, 'p-button-primary': currentFolder === folder.name }"
            @click="changeFolder(folder.name)"
          />
        </span>
      </div>
      
      <div class="toolbar-actions">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText v-model="searchQuery" placeholder="Поиск..." />
        </span>
        
        <Button 
          label="Загрузить" 
          icon="pi pi-upload" 
          @click="uploadFile" 
        />
      </div>
    </div>
    
    <!-- Upload progress -->
    <div v-if="isUploading" class="upload-progress">
      <ProgressBar :value="uploadProgress" />
      <div class="progress-text">Загрузка файлов... {{ uploadProgress }}%</div>
    </div>
    
    <!-- Media grid -->
    <div v-if="adminStore.isLoading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Загрузка медиа файлов...</p>
    </div>
    
    <div v-else-if="filteredFiles.length === 0" class="empty-state">
      <i class="pi pi-images"></i>
      <h3>Нет медиа файлов</h3>
      <p v-if="searchQuery">Нет файлов, соответствующих запросу "{{ searchQuery }}"</p>
      <p v-else>Загрузите файлы, чтобы начать</p>
      <Button label="Загрузить файлы" icon="pi pi-upload" @click="uploadFile" />
    </div>
    
    <div v-else class="media-grid">
      <div 
        v-for="file in filteredFiles" 
        :key="file.id"
        class="media-item" 
        :class="{ 'image-item': file.type.startsWith('image/') }"
      >
        <!-- Preview area -->
        <div class="media-preview" @click="previewImage(file)">
          <img 
            v-if="file.type.startsWith('image/')" 
            :src="file.url" 
            :alt="file.name" 
            loading="lazy"
            class="preview-image"
          />
          <div v-else class="file-icon-container">
            <i 
              class="pi file-icon" 
              :class="{
                'pi-file-pdf': file.type === 'application/pdf',
                'pi-file-word': file.type.includes('word'),
                'pi-file-excel': file.type.includes('excel'),
                'pi-file': !['application/pdf', 'word', 'excel'].some(t => file.type.includes(t))
              }"
            ></i>
          </div>
        </div>
        
        <!-- File info -->
        <div class="media-info">
          <div class="media-name" :title="file.name">{{ file.name }}</div>
          <div class="media-size">{{ formatFileSize(file.size) }}</div>
        </div>
        
        <!-- Actions -->
        <div class="media-actions">
          <Button 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm" 
            @click="copyUrl(file.url)"
            v-tooltip.bottom="'Копировать URL'"
            aria-label="Копировать URL"
          />
          <Button 
            icon="pi pi-info-circle" 
            class="p-button-text p-button-sm" 
            @click="showDetails(file)"
            v-tooltip.bottom="'Сведения'"
            aria-label="Сведения о файле"
          />
          <Button 
            icon="pi pi-trash" 
            class="p-button-text p-button-danger p-button-sm" 
            @click="confirmDeleteFile(file)"
            v-tooltip.bottom="'Удалить'"
            aria-label="Удалить файл"
          />
        </div>
      </div>
    </div>
    
    <!-- Image preview dialog -->
    <Dialog 
      v-model:visible="showImagePreview" 
      modal 
      :header="selectedFile?.name" 
      :style="{ width: '90vw', maxWidth: '800px' }"
      :dismissableMask="true"
      :closeOnEscape="true"
    >
      <div class="image-preview-container">
        <img 
          :src="selectedFile?.url" 
          :alt="selectedFile?.name" 
          class="preview-dialog-image"
        />
      </div>
      
      <div class="dialog-actions">
        <Button 
          label="Копировать URL" 
          icon="pi pi-copy" 
          @click="copyUrl(selectedFile?.url)"
        />
        <Button 
          label="Закрыть" 
          icon="pi pi-times" 
          class="p-button-text" 
          @click="showImagePreview = false"
        />
      </div>
    </Dialog>
    
    <!-- File details dialog -->
    <Dialog 
      v-model:visible="showFileDetails" 
      modal 
      header="Сведения о файле" 
      :style="{ width: '90vw', maxWidth: '500px' }"
      :dismissableMask="true"
      :closeOnEscape="true"
    >
      <div v-if="selectedFile" class="file-details">
        <div class="detail-item">
          <div class="detail-label">Имя файла</div>
          <div class="detail-value">{{ selectedFile.name }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">Тип</div>
          <div class="detail-value">{{ selectedFile.type }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">Размер</div>
          <div class="detail-value">{{ formatFileSize(selectedFile.size) }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">Загружен</div>
          <div class="detail-value">{{ formatDate(selectedFile.created_at) }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">URL</div>
          <div class="detail-value url-value">
            {{ selectedFile.url }}
            <Button 
              icon="pi pi-copy" 
              class="p-button-text p-button-sm" 
              @click="copyUrl(selectedFile.url)"
              v-tooltip.left="'Копировать URL'"
            />
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <Button 
          label="Закрыть" 
          icon="pi pi-times" 
          class="p-button-text" 
          @click="showFileDetails = false"
        />
      </div>
    </Dialog>
    
    <!-- Confirmation dialog for delete operations -->
    <ConfirmDialog />
  </div>
</template>

<style scoped>
.media-manager {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 400px;
}

.media-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.upload-progress {
  margin-top: 0.5rem;
}

.progress-text {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  text-align: center;
  color: var(--color-text-muted);
}

/* Loading and empty states */
.loading-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

/* Media grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.media-item {
  background-color: var(--color-surface);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.media-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  cursor: pointer;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.file-icon {
  font-size: 2.5rem;
  color: var(--color-text-muted);
}

.media-info {
  padding: 0.5rem;
}

.media-name {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-size {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.media-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 0.25rem 0.5rem 0.25rem;
}

/* Image preview dialog */
.image-preview-container {
  text-align: center;
  margin-bottom: 1rem;
  max-height: 60vh;
  overflow: hidden;
}

.preview-dialog-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* File details */
.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-label {
  width: 100px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.detail-value {
  flex: 1;
}

.url-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  word-break: break-all;
}

@media (prefers-reduced-motion: reduce) {
  .media-item:hover {
    transform: none;
  }
}

@media screen and (max-width: 768px) {
  .toolbar-folder-selector,
  .toolbar-actions {
    width: 100%;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>