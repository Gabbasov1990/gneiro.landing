<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import Sidebar from 'primevue/sidebar';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Editor from 'primevue/editor';
import Message from 'primevue/message';
import { useAdminStore } from '@/store/admin';
import slugify from 'slugify';

const props = defineProps<{
  visible: boolean;
  entity: any;
  entityType: 'post' | 'case';
  isNew: boolean;
}>();

const emit = defineEmits(['update:visible', 'save', 'preview']);

// Admin store
const adminStore = useAdminStore();

// Form model
const formData = ref({} as any);
const formErrors = ref({} as Record<string, string>);
const editorModules = ref({});
const isGeneratingSlug = ref(false);

// Categories for posts
const categories = [
  { label: 'Автоматизация', value: 'Автоматизация' },
  { label: 'Интеграции', value: 'Интеграции' },
  { label: 'Маркетинг', value: 'Маркетинг' },
  { label: 'Искусственный интеллект', value: 'Искусственный интеллект' },
  { label: 'Руководства', value: 'Руководства' },
  { label: 'Аналитика', value: 'Аналитика' },
  { label: 'Дизайн', value: 'Дизайн' }
];

// Computed title based on entity type and mode
const editorTitle = computed(() => {
  const action = props.isNew ? 'Создание' : 'Редактирование';
  const entity = props.entityType === 'post' ? 'статьи' : 'кейса';
  return `${action} ${entity}`;
});

// Configuration for editor
const setupEditor = async () => {
  await nextTick();
  editorModules.value = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  };
};

// Form validation
const validateForm = () => {
  formErrors.value = {};
  let isValid = true;
  
  // Common fields for both posts and cases
  if (!formData.value.title?.trim()) {
    formErrors.value.title = 'Заголовок обязателен';
    isValid = false;
  }
  
  if (!formData.value.slug?.trim()) {
    formErrors.value.slug = 'Slug обязателен';
    isValid = false;
  }
  
  if (!formData.value.excerpt?.trim()) {
    formErrors.value.excerpt = 'Краткое описание обязательно';
    isValid = false;
  }
  
  // Post specific fields
  if (props.entityType === 'post') {
    if (!formData.value.content?.trim()) {
      formErrors.value.content = 'Содержание статьи обязательно';
      isValid = false;
    }
    
    if (!formData.value.category?.trim()) {
      formErrors.value.category = 'Категория обязательна';
      isValid = false;
    }
    
    if (!formData.value.read_time || formData.value.read_time <= 0) {
      formErrors.value.read_time = 'Время чтения обязательно';
      isValid = false;
    }
  }
  
  // Case specific fields
  if (props.entityType === 'case') {
    if (!formData.value.owner_name?.trim()) {
      formErrors.value.owner_name = 'Имя владельца обязательно';
      isValid = false;
    }
    
    if (!formData.value.content_md?.trim()) {
      formErrors.value.content_md = 'Содержание кейса обязательно';
      isValid = false;
    }
    
    // Check metrics
    if (!formData.value.metrics || formData.value.metrics.length === 0) {
      formErrors.value.metrics = 'Добавьте хотя бы одну метрику';
      isValid = false;
    }
  }
  
  return isValid;
};

// Generate slug from title
const generateSlug = () => {
  if (!formData.value.title) return;
  
  isGeneratingSlug.value = true;
  
  const slug = slugify(formData.value.title, {
    lower: true,
    strict: true,
    locale: 'ru',
    remove: /[*+~.()'"!:@]/g
  });
  
  formData.value.slug = slug;
  isGeneratingSlug.value = false;
};

// Initialize form data when entity changes
watch(
  () => props.entity, 
  (newEntity) => {
    if (newEntity) {
      formData.value = { ...newEntity };
      
      // Ensure metrics is an array for case
      if (props.entityType === 'case' && !formData.value.metrics) {
        formData.value.metrics = [];
      }
      
      // Set default date for new entities
      if (props.isNew && !formData.value.published_at) {
        formData.value.published_at = new Date().toISOString();
      }
    } else {
      // Reset form for new entity
      formData.value = {
        title: '',
        slug: '',
        excerpt: '',
        published_at: new Date().toISOString(),
        views: 0
      };
      
      if (props.entityType === 'post') {
        formData.value.content = '';
        formData.value.category = '';
        formData.value.read_time = 5;
        formData.value.cover_url = '';
      } else {
        formData.value.content_md = '';
        formData.value.owner_name = '';
        formData.value.owner_photo = '';
        formData.value.hero_image = '';
        formData.value.metrics = [];
      }
    }
    
    // Setup editor when sidebar is shown
    if (props.visible) {
      setupEditor();
    }
  }, 
  { immediate: true }
);

// Save entity
const saveEntity = () => {
  if (!validateForm()) return;
  
  emit('save', formData.value);
};

// Add metric for case
const addMetric = () => {
  if (!formData.value.metrics) {
    formData.value.metrics = [];
  }
  
  formData.value.metrics.push({
    label: '',
    desc: ''
  });
};

// Remove metric from case
const removeMetric = (index: number) => {
  formData.value.metrics.splice(index, 1);
};

// Handle image selection for cover/hero image
const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  
  if (!input.files?.length) return;
  
  const file = input.files[0];
  
  // Upload to Supabase storage
  uploadImage(file);
};

// Upload image to Supabase
const uploadImage = async (file: File) => {
  try {
    adminStore.isLoading = true;
    
    // Create path based on entity type
    const path = props.entityType === 'post' ? 'posts' : 'cases';
    const fileName = `${path}/${Date.now()}-${file.name}`;
    
    // Upload the file
    const mediaFile = await adminStore.uploadMediaFile(file, path);
    
    if (mediaFile) {
      // Set URL based on entity type
      if (props.entityType === 'post') {
        formData.value.cover_url = mediaFile.url;
      } else {
        formData.value.hero_image = mediaFile.url;
      }
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    adminStore.addNotification({
      type: 'error',
      message: 'Ошибка загрузки изображения',
      detail: error.message
    });
  } finally {
    adminStore.isLoading = false;
  }
};

// Close sidebar
const closeSidebar = () => {
  emit('update:visible', false);
};

// Show preview
const showPreview = () => {
  emit('preview', formData.value);
};
</script>

<template>
  <Sidebar 
    v-model:visible="props.visible" 
    position="right" 
    :style="{ width: '560px' }"
    :showCloseIcon="true"
    @hide="closeSidebar"
    :modal="true"
    :dismissable="false"
    :closeOnEscape="true"
  >
    <template #header>
      <h2 class="sidebar-title">{{ editorTitle }}</h2>
    </template>
    
    <div class="editor-content">
      <form @submit.prevent="saveEntity" class="entity-form">
        <!-- Title -->
        <div class="form-field">
          <label for="title" class="field-label">Заголовок</label>
          <InputText 
            id="title" 
            v-model="formData.title" 
            class="w-full" 
            :class="{ 'p-invalid': formErrors.title }"
            @blur="generateSlug"
          />
          <small class="field-error" v-if="formErrors.title">{{ formErrors.title }}</small>
        </div>
        
        <!-- Slug -->
        <div class="form-field">
          <label for="slug" class="field-label">
            Slug
            <Button 
              icon="pi pi-refresh" 
              class="p-button-text p-button-sm ml-2"
              @click="generateSlug"
              :loading="isGeneratingSlug"
              type="button"
            />
          </label>
          <InputText 
            id="slug" 
            v-model="formData.slug" 
            class="w-full" 
            :class="{ 'p-invalid': formErrors.slug }"
          />
          <small class="field-error" v-if="formErrors.slug">{{ formErrors.slug }}</small>
        </div>
        
        <!-- Excerpt -->
        <div class="form-field">
          <label for="excerpt" class="field-label">Краткое описание</label>
          <Textarea 
            id="excerpt" 
            v-model="formData.excerpt" 
            class="w-full" 
            :class="{ 'p-invalid': formErrors.excerpt }"
            rows="3"
            autoResize
          />
          <small class="field-error" v-if="formErrors.excerpt">{{ formErrors.excerpt }}</small>
        </div>
        
        <!-- Post specific fields -->
        <template v-if="props.entityType === 'post'">
          <!-- Category -->
          <div class="form-field">
            <label for="category" class="field-label">Категория</label>
            <Dropdown 
              id="category" 
              v-model="formData.category" 
              :options="categories" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Выберите категорию" 
              class="w-full" 
              :class="{ 'p-invalid': formErrors.category }"
            />
            <small class="field-error" v-if="formErrors.category">{{ formErrors.category }}</small>
          </div>
          
          <!-- Read time -->
          <div class="form-field">
            <label for="read_time" class="field-label">Время чтения (мин)</label>
            <InputText 
              id="read_time" 
              v-model.number="formData.read_time" 
              type="number" 
              min="1" 
              class="w-full" 
              :class="{ 'p-invalid': formErrors.read_time }"
            />
            <small class="field-error" v-if="formErrors.read_time">{{ formErrors.read_time }}</small>
          </div>
          
          <!-- Cover image -->
          <div class="form-field">
            <label for="cover_url" class="field-label">Обложка</label>
            <div class="image-upload-container">
              <div 
                v-if="formData.cover_url" 
                class="image-preview"
                :style="{ backgroundImage: `url(${formData.cover_url})` }"
              >
                <Button 
                  icon="pi pi-times" 
                  class="p-button-rounded p-button-danger image-remove-btn" 
                  @click="formData.cover_url = ''"
                  type="button"
                />
              </div>
              <div v-else class="image-upload-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  id="cover-image-upload"
                  @change="handleImageSelect"
                  class="hidden-input"
                />
                <label for="cover-image-upload" class="upload-label">
                  <i class="pi pi-image"></i>
                  <span>Нажмите, чтобы загрузить</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div class="form-field">
            <label for="content" class="field-label">Содержание</label>
            <Editor 
              v-model="formData.content" 
              editorStyle="height: 320px" 
              :modules="editorModules"
              :class="{ 'p-invalid': formErrors.content }"
            />
            <small class="field-error" v-if="formErrors.content">{{ formErrors.content }}</small>
          </div>
        </template>
        
        <!-- Case specific fields -->
        <template v-else>
          <!-- Owner name -->
          <div class="form-field">
            <label for="owner_name" class="field-label">Имя владельца</label>
            <InputText 
              id="owner_name" 
              v-model="formData.owner_name" 
              class="w-full" 
              :class="{ 'p-invalid': formErrors.owner_name }"
            />
            <small class="field-error" v-if="formErrors.owner_name">{{ formErrors.owner_name }}</small>
          </div>
          
          <!-- Owner photo -->
          <div class="form-field">
            <label for="owner_photo" class="field-label">Фото владельца</label>
            <InputText 
              id="owner_photo" 
              v-model="formData.owner_photo" 
              class="w-full" 
              placeholder="URL фотографии"
            />
          </div>
          
          <!-- Hero image -->
          <div class="form-field">
            <label for="hero_image" class="field-label">Главное изображение</label>
            <div class="image-upload-container">
              <div 
                v-if="formData.hero_image" 
                class="image-preview"
                :style="{ backgroundImage: `url(${formData.hero_image})` }"
              >
                <Button 
                  icon="pi pi-times" 
                  class="p-button-rounded p-button-danger image-remove-btn" 
                  @click="formData.hero_image = ''"
                  type="button"
                />
              </div>
              <div v-else class="image-upload-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  id="hero-image-upload"
                  @change="handleImageSelect"
                  class="hidden-input"
                />
                <label for="hero-image-upload" class="upload-label">
                  <i class="pi pi-image"></i>
                  <span>Нажмите, чтобы загрузить</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Metrics -->
          <div class="form-field">
            <div class="metrics-header">
              <label class="field-label">Метрики</label>
              <Button 
                icon="pi pi-plus" 
                label="Добавить" 
                class="p-button-sm" 
                @click="addMetric"
                type="button"
              />
            </div>
            <div v-if="formErrors.metrics" class="field-error mb-2">{{ formErrors.metrics }}</div>
            
            <div v-if="formData.metrics && formData.metrics.length > 0" class="metrics-container">
              <div 
                v-for="(metric, index) in formData.metrics" 
                :key="index"
                class="metric-item"
              >
                <div class="metric-inputs">
                  <InputText 
                    v-model="metric.label" 
                    placeholder="Метрика (пр.: +45%)" 
                    class="metric-label-input"
                  />
                  <InputText 
                    v-model="metric.desc" 
                    placeholder="Описание (пр.: конверсия)" 
                    class="metric-desc-input"
                  />
                </div>
                <Button 
                  icon="pi pi-times" 
                  class="p-button-text p-button-danger p-button-sm metric-remove-btn" 
                  @click="removeMetric(index)"
                  type="button"
                />
              </div>
            </div>
            <Message 
              v-else 
              severity="info" 
              :closable="false"
              :sticky="true"
              style="margin-top: 0.5rem;"
            >
              Добавьте метрики, чтобы показать результаты кейса
            </Message>
          </div>
          
          <!-- Case content (markdown) -->
          <div class="form-field">
            <label for="content_md" class="field-label">Содержание (Markdown)</label>
            <Textarea 
              id="content_md" 
              v-model="formData.content_md" 
              class="w-full" 
              :class="{ 'p-invalid': formErrors.content_md }"
              rows="15"
              autoResize
            />
            <small class="field-error" v-if="formErrors.content_md">{{ formErrors.content_md }}</small>
            <small class="field-help">Используйте формат Markdown для форматирования текста</small>
          </div>
        </template>
        
        <!-- Published date -->
        <div class="form-field">
          <label for="published_at" class="field-label">Дата публикации</label>
          <Calendar 
            id="published_at" 
            v-model="formData.published_at" 
            dateFormat="dd.mm.yy" 
            showTime 
            hourFormat="24"
            class="w-full"
          />
        </div>
        
        <!-- Form actions -->
        <div class="form-actions">
          <Button 
            label="Отмена" 
            icon="pi pi-times" 
            class="p-button-text" 
            @click="closeSidebar"
            type="button"
          />
          <Button 
            label="Предпросмотр" 
            icon="pi pi-eye" 
            class="p-button-outlined" 
            @click="showPreview"
            type="button"
          />
          <Button 
            label="Сохранить" 
            icon="pi pi-check" 
            class="p-button-primary" 
            type="submit"
            :loading="adminStore.isSaving"
          />
        </div>
      </form>
    </div>
  </Sidebar>
</template>

<style scoped>
.sidebar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.editor-content {
  padding: 1rem;
}

.entity-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.field-error {
  color: #f44336;
  font-size: 0.8rem;
}

.field-help {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* Image upload */
.image-upload-container {
  width: 100%;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--color-surface);
}

.image-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.upload-label i {
  font-size: 2rem;
  color: var(--color-text-muted);
}

.image-preview {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.image-remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
}

/* Metrics section */
.metrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metrics-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--color-surface);
  border-radius: var(--radius-sm);
}

.metric-inputs {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.metric-label-input {
  width: 40%;
}

.metric-desc-input {
  flex: 1;
}

.metric-remove-btn {
  flex-shrink: 0;
}

@media screen and (max-width: 640px) {
  .form-actions {
    flex-wrap: wrap;
  }
  
  .metric-inputs {
    flex-direction: column;
  }
  
  .metric-label-input,
  .metric-desc-input {
    width: 100%;
  }
}
</style>