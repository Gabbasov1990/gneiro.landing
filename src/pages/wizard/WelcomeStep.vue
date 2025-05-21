<script setup lang="ts">
import { useWizardStore } from '@/store/wizard';
import { useRouter } from 'vue-router';

const wizardStore = useWizardStore();
const router = useRouter();

// Start the wizard process
const startWizard = () => {
  wizardStore.nextStep();
};

// Open video tutorial
const openTutorial = () => {
  window.open('https://youtube.com/watch?v=tutorial', '_blank');
};
</script>

<template>
  <div class="welcome-step">
    <div class="welcome-content">
      <h1 class="welcome-title">Создайте ИИ-ассистента ✨</h1>
      
      <p class="welcome-description">
        За 5 минут мы создадим персонального AI-продавца для вашего бизнеса. 
        Нужно будет ответить на несколько вопросов и подключить источники данных.
      </p>
      
      <div class="action-buttons">
        <button @click="startWizard" class="btn btn-primary btn-lg">
          Создать
        </button>
        
        <button @click="openTutorial" class="btn btn-link">
          <i class="pi pi-video"></i>
          Видео-урок
        </button>
      </div>
      
      <div class="preview-container">
        <img 
          src="https://gthmjsohqhfslrxiszeq.supabase.co/storage/v1/object/sign/img/ai-assistant-preview.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcvYWktYXNzaXN0YW50LXByZXZpZXcuanBnIiwiaWF0IjoxNTgzMTcwODczLCJleHAiOjE1ODMxNzQ0NzN9.9TaBFjP8dJRqpL3k5Q5K_yNZmQmUwI8CzC9rG8Q5QZA" 
          alt="AI Assistant Preview" 
          class="preview-image"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-step {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.welcome-description {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-link {
  background: none;
  border: none;
  color: var(--color-accent);
  text-decoration: underline;
  padding: 0.75rem;
}

.btn-link:hover {
  color: var(--color-accent-hover);
}

.btn-lg {
  font-size: 1.125rem;
  padding: 0.875rem 2rem;
}

.preview-container {
  margin-top: 2rem;
  max-width: 100%;
  overflow: hidden;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  object-fit: cover;
  border-radius: 1rem;
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-description {
    font-size: 1.1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>