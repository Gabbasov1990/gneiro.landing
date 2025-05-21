<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import { useIntersectionObserver } from '@vueuse/core';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string;
  category: string;
  read_time: number;
  published_at: string;
  views: number;
}

const posts = ref<BlogPost[]>([]);
const loading = ref(true);
const initialLoading = ref(true);
const error = ref<string | null>(null);
const hasMore = ref(true);
const currentPage = ref(0);
const pageSize = 9;
const loadMoreRef = ref<HTMLElement | null>(null);
const sortOrder = ref<'popular' | 'newest'>('newest');
const prefersReducedMotion = ref(false);

// Fetch blog posts with pagination
const fetchPosts = async (reset = false) => {
  try {
    // If reset is true, clear existing data and start from the first page
    if (reset) {
      posts.value = [];
      currentPage.value = 0;
      hasMore.value = true;
      initialLoading.value = true;
    }

    // Don't fetch if there are no more items to load
    if (!hasMore.value && !reset) return;

    loading.value = true;
    
    // Build the query based on the sort order
    let query = supabase
      .from('posts')
      .select('*');
    
    if (sortOrder.value === 'popular') {
      query = query.order('views', { ascending: false });
    } else {
      query = query.order('published_at', { ascending: false });
    }
    
    query = query
      .range(currentPage.value * pageSize, (currentPage.value + 1) * pageSize - 1);
    
    const { data, error: err } = await query;
    
    if (err) throw new Error(err.message);
    
    if (data) {
      // Check if we've reached the end of the data
      if (data.length < pageSize) {
        hasMore.value = false;
      }
      
      // Add the new blog posts to the list
      posts.value = [...posts.value, ...data];
      
      // Increment the page counter
      currentPage.value += 1;
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Произошла ошибка при загрузке статей';
    }
    console.error('Error fetching blog posts:', err);
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

// Set up infinite scroll using Intersection Observer
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Initial load
  fetchPosts();
  
  // Set up intersection observer for infinite scroll
  if (loadMoreRef.value) {
    const { stop } = useIntersectionObserver(
      loadMoreRef,
      ([{ isIntersecting }]) => {
        if (isIntersecting && !loading.value && hasMore.value) {
          fetchPosts();
        }
      },
      { threshold: 0.5 }
    );
  }
  
  // If there's no posts in the database, create fake ones for display
  setTimeout(() => {
    if (posts.value.length === 0 && !loading.value) {
      posts.value = [
        {
          id: '1',
          slug: 'ai-sales-automation',
          title: 'Как AI-автоматизация увеличивает продажи в WhatsApp на 45%',
          excerpt: 'Разбор трёх кейсов клиентов Gneiro, которые внедрили автоматизацию продаж',
          content: '## Автоматизация продаж через WhatsApp\n\nWhatsApp стал основным каналом для бизнес-коммуникаций...',
          cover_url: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg',
          category: 'Автоматизация',
          read_time: 4,
          published_at: '2025-05-01T10:00:00Z',
          views: 542
        },
        {
          id: '2',
          slug: 'chatbot-integration-guide',
          title: 'Интеграция чат-бота с CRM: пошаговое руководство',
          excerpt: 'Подробная инструкция по подключению Gneiro к популярным CRM-системам',
          content: '## Зачем интегрировать чат-бота с CRM-системой\n\nОбъединение чат-бота Gneiro с вашей CRM-системой...',
          cover_url: 'https://images.pexels.com/photos/7563687/pexels-photo-7563687.jpeg',
          category: 'Интеграции',
          read_time: 6,
          published_at: '2025-04-15T14:30:00Z',
          views: 327
        },
        {
          id: '3',
          slug: 'whatsapp-business-tips',
          title: '7 приёмов для бизнес-аккаунта WhatsApp, которые повысят конверсию',
          excerpt: 'Практические советы по оптимизации бизнес-аккаунта WhatsApp для продаж',
          content: '## Как превратить WhatsApp в мощный инструмент продаж\n\nWhatsApp Business давно стал одним из главных каналов...',
          cover_url: 'https://images.pexels.com/photos/4549408/pexels-photo-4549408.jpeg',
          category: 'Маркетинг',
          read_time: 5,
          published_at: '2025-04-03T09:15:00Z',
          views: 481
        },
        {
          id: '4',
          slug: 'ai-bot-training-guide',
          title: 'Как обучить AI-бота для вашего бизнеса: подробное руководство',
          excerpt: 'Пошаговый гайд по обучению ИИ-бота знаниям о вашем бизнесе и продуктах',
          content: '## Почему важно правильно обучить AI-бота\n\nКачество работы искусственного интеллекта напрямую зависит от данных...',
          cover_url: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg',
          category: 'Руководства',
          read_time: 8,
          published_at: '2025-03-20T12:00:00Z',
          views: 356
        },
        {
          id: '5',
          slug: 'whatsapp-vs-telegram-business',
          title: 'WhatsApp vs Telegram: какой мессенджер эффективнее для бизнеса в 2025',
          excerpt: 'Сравнительный анализ двух популярных мессенджеров для бизнес-коммуникаций',
          content: '## Битва титанов мессенджеров\n\nWhatsApp и Telegram — два самых популярных мессенджера...',
          cover_url: 'https://images.pexels.com/photos/193003/pexels-photo-193003.jpeg',
          category: 'Аналитика',
          read_time: 7,
          published_at: '2025-03-05T15:45:00Z',
          views: 678
        },
        {
          id: '6',
          slug: 'ai-conversation-design',
          title: 'Дизайн AI-диалогов: как создавать естественные и продающие сценарии',
          excerpt: 'Принципы создания диалоговых сценариев для чат-ботов, которые конвертируют',
          content: '## Что такое дизайн AI-диалогов\n\nДизайн диалогов (Conversation Design) — это искусство создания...',
          cover_url: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg',
          category: 'Дизайн',
          read_time: 6,
          published_at: '2025-02-18T08:30:00Z',
          views: 412
        }
      ];
    }
  }, 1500);
});

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Change sort order
const changeSortOrder = (order: 'popular' | 'newest') => {
  if (sortOrder.value !== order) {
    sortOrder.value = order;
    fetchPosts(true);
  }
};
</script>

<template>
  <div class="blog-page">
    <!-- Hero section -->
    <section class="blog-hero">
      <div class="container">
        <h1 class="page-title">Блог Gneiro</h1>
        <p class="page-subtitle">Статьи о развитии бизнеса, автоматизации продаж и использовании искусственного интеллекта в WhatsApp</p>
      </div>
    </section>
    
    <!-- Filter bar -->
    <div class="filter-bar">
      <div class="container">
        <div class="sort-options">
          <button 
            class="sort-option" 
            :class="{ active: sortOrder === 'newest' }"
            @click="changeSortOrder('newest')"
          >
            <i class="pi pi-calendar"></i>
            Новые
          </button>
          <button 
            class="sort-option" 
            :class="{ active: sortOrder === 'popular' }"
            @click="changeSortOrder('popular')"
          >
            <i class="pi pi-chart-line"></i>
            Популярные
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main content area -->
    <div class="blog-content-area">
      <div class="container">
        <!-- Loading state -->
        <div v-if="initialLoading" class="skeleton-grid">
          <div v-for="i in 9" :key="`skeleton-${i}`" class="blog-card skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-badge"></div>
              <div class="skeleton-title"></div>
              <div class="skeleton-meta"></div>
              <div class="skeleton-excerpt"></div>
              <div class="skeleton-link"></div>
            </div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="error-message">
          <p>{{ error }}</p>
          <button @click="fetchPosts(true)" class="btn btn-primary">Попробовать снова</button>
        </div>
        
        <!-- Blog posts grid -->
        <div v-else-if="posts.length > 0" class="blog-grid">
          <article 
            v-for="(post, index) in posts" 
            :key="post.id"
            class="blog-card"
            :class="{ 'fade-in': true }"
            :style="{ 
              animationDelay: prefersReducedMotion ? '0ms' : `${index * 100}ms` 
            }"
            itemscope 
            itemtype="https://schema.org/BlogPosting"
          >
            <RouterLink :to="`/blog/${post.slug}`" class="card-link">
              <div class="card-content">
                <div class="cover-wrapper">
                  <span class="category-badge">{{ post.category }}</span>
                  <img 
                    :src="post.cover_url" 
                    :alt="post.title"
                    class="cover-image"
                    loading="lazy"
                    decoding="async"
                    itemprop="image"
                  />
                </div>
                
                <div class="post-content">
                  <h2 class="post-title" itemprop="headline">{{ post.title }}</h2>
                  
                  <div class="post-meta">
                    <time :datetime="post.published_at" itemprop="datePublished">
                      {{ formatDate(post.published_at) }}
                    </time>
                    <span class="read-time">· {{ post.read_time }} мин чтения</span>
                  </div>
                  
                  <p class="post-excerpt" itemprop="description">{{ post.excerpt }}</p>
                  
                  <div class="read-more">
                    <span>Читать</span>
                    <i class="pi pi-arrow-right"></i>
                  </div>
                </div>
              </div>
            </RouterLink>
          </article>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="!initialLoading && posts.length === 0" class="empty-state">
          <i class="pi pi-file-edit"></i>
          <h2>Статьи не найдены</h2>
          <p>Скоро здесь появятся полезные материалы</p>
        </div>
        
        <!-- Load more indicator -->
        <div v-if="hasMore && posts.length > 0" ref="loadMoreRef" class="load-more">
          <div v-if="loading && !initialLoading" class="loading-spinner">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Загрузка статей...</span>
          </div>
        </div>
        
        <!-- No more content indicator -->
        <div v-else-if="!initialLoading && posts.length > 0" class="no-more-content">
          <p>Показаны все статьи</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-page {
  min-height: 100vh;
}

.blog-hero {
  background-color: var(--color-surface);
  padding: var(--space-12) 0;
  text-align: center;
}

.page-title {
  font-size: var(--fz-h1);
  margin-bottom: var(--space-4);
  color: var(--color-text);
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.4;
}

.filter-bar {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sort-options {
  display: flex;
  gap: var(--space-4);
}

.sort-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.sort-option.active,
.sort-option:hover {
  color: var(--color-accent);
  background-color: rgba(10, 132, 255, 0.1);
}

.blog-content-area {
  padding: var(--space-8) 0;
}

.skeleton-grid,
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

/* Blog Card Styling */
.blog-card {
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  height: 100%;
  opacity: 0;
  animation: fadeIn 0.4s forwards;
}

:root[data-theme='dark'] .blog-card {
  background-color: rgba(30, 32, 34, 0.65);
}

.blog-card:hover, .blog-card:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-link {
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Cover Image */
.cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  transition: transform 0.3s ease;
}

.blog-card:hover .cover-image {
  transform: scale(1.05);
}

.category-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: rgba(var(--accent-rgb, 10, 132, 255), 0.08);
  color: var(--color-accent);
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
  backdrop-filter: blur(4px);
}

/* Post Content */
.post-content {
  padding: var(--space-4);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--space-2);
  color: var(--color-text);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.6em;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-bottom: var(--space-3);
}

.post-excerpt {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0 0 var(--space-4);
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.read-more {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-accent);
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: auto;
}

.read-more i {
  transition: transform 0.2s ease;
}

.blog-card:hover .read-more i {
  transform: translateX(2px);
}

/* Skeleton Loaders */
.skeleton {
  background-color: var(--color-surface);
  animation: pulse 1.5s infinite;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: rgba(0, 0, 0, 0.05);
}

.skeleton-content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-badge {
  height: 24px;
  width: 80px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 100px;
}

.skeleton-title {
  height: 28px;
  width: 90%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
}

.skeleton-meta {
  height: 16px;
  width: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
}

.skeleton-excerpt {
  height: 40px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
}

.skeleton-link {
  height: 20px;
  width: 60px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  margin-top: var(--space-4);
}

/* Error Message */
.error-message {
  text-align: center;
  padding: var(--space-8);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-8);
}

.load-more {
  text-align: center;
  padding: var(--space-8) 0;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
}

.no-more-content {
  text-align: center;
  padding: var(--space-8) 0;
  color: var(--color-text-muted);
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: var(--space-16);
  color: var(--color-text-muted);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.empty-state h2 {
  margin-bottom: var(--space-2);
  font-size: 1.5rem;
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: var(--color-accent);
  color: white;
  border: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

/* Responsive Styles */
@media (min-width: 1280px) {
  .blog-grid,
  .skeleton-grid {
    gap: var(--sp-5);
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .blog-grid,
  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-4);
  }
}

@media (max-width: 767px) {
  .blog-grid,
  .skeleton-grid {
    grid-template-columns: 1fr;
    gap: var(--sp-4);
  }
  
  .page-title {
    font-size: calc(var(--fz-h1) * 0.6);
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
}

/* Support for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .blog-card {
    animation: none;
    opacity: 1;
  }
  
  .blog-card:hover, .blog-card:focus-within {
    transform: none;
  }
  
  .blog-card:hover .cover-image {
    transform: none;
  }
  
  .blog-card:hover .read-more i {
    transform: none;
  }
  
  .skeleton {
    animation: none;
  }
  
  .btn:hover {
    transform: none;
  }
}

:root {
  --accent-rgb: 10, 132, 255;
}
</style>