<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string;
  category: string;
  read_time: number;
  published_at: string;
  views: number;
}

const posts = ref<BlogPost[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const prefersReducedMotion = ref(false);

// Fetch recent blog posts
const fetchPosts = async () => {
  console.log('Fetching blog posts...');
  
  try {
    loading.value = true;
    
    // Query the latest 3 posts from Supabase
    const { data, error: err } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(3);
    
    if (err) throw new Error(err.message);
    
    if (data) {
      posts.value = data as BlogPost[];
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
  }
};

// Format date - 12 май 2025
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('D MMM YYYY').toLowerCase();
};

// Check for reduced motion preference
onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  fetchPosts();
  
  // If there's no posts in the database, create fake ones for display
  setTimeout(() => {
    if (posts.value.length === 0) {
      posts.value = [
        {
          id: '1',
          slug: 'ai-sales-automation',
          title: 'Как AI-автоматизация увеличивает продажи в WhatsApp на 45%',
          excerpt: 'Разбор трёх кейсов клиентов Gneiro, которые внедрили автоматизацию продаж',
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
          cover_url: 'https://images.pexels.com/photos/4549408/pexels-photo-4549408.jpeg',
          category: 'Маркетинг',
          read_time: 5,
          published_at: '2025-04-03T09:15:00Z',
          views: 481
        }
      ];
      loading.value = false;
    }
  }, 1000);
});
</script>

<template>
  <section id="blog" class="blog-section">
    <div class="container">
      <h2 class="section-title">Свежие статьи блога Gneiro</h2>
      
      <!-- Loading skeleton -->
      <div v-if="loading" class="blog-grid">
        <div v-for="i in 3" :key="`skeleton-${i}`" class="blog-card skeleton">
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
        <button @click="fetchPosts" class="btn btn-outline">Попробовать снова</button>
      </div>
      
      <!-- Blog posts grid -->
      <div v-else class="blog-grid">
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
                <h3 class="post-title" itemprop="headline">{{ post.title }}</h3>
                
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
      
      <!-- CTA Link -->
      <div class="blog-cta">
        <RouterLink to="/blog" class="cta-link">
          <span>Читать все статьи</span>
          <i class="pi pi-arrow-right"></i>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.blog-section {
  padding: var(--space-16) 0;
  background-color: var(--color-bg);
}

.section-title {
  margin-bottom: var(--space-12);
  font-size: var(--fz-h2);
  color: var(--color-text);
}

/* Blog Grid Layout */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-5);
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

/* CTA Link */
.blog-cta {
  text-align: center;
  margin-top: var(--space-8);
}

.cta-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-accent);
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.cta-link:hover {
  text-decoration: underline;
}

.cta-link:hover i {
  transform: translateX(2px);
}

.cta-link:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
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
}

.skeleton-badge {
  height: 24px;
  width: 80px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 100px;
  margin-bottom: var(--space-3);
}

.skeleton-title {
  height: 28px;
  width: 90%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
}

.skeleton-meta {
  height: 16px;
  width: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
}

.skeleton-excerpt {
  height: 40px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
}

.skeleton-link {
  height: 20px;
  width: 60px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  margin-top: auto;
}

/* Error Message */
.error-message {
  text-align: center;
  padding: var(--space-8);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-8);
}

/* Animations */
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
  .blog-grid {
    gap: var(--sp-5);
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-4);
  }
}

@media (max-width: 767px) {
  .blog-grid {
    grid-template-columns: 1fr;
    gap: var(--sp-4);
  }
  
  .section-title {
    font-size: calc(var(--fz-h2) * 0.8);
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
  
  .blog-card:hover .read-more i, 
  .cta-link:hover i {
    transform: none;
  }
  
  .skeleton {
    animation: none;
  }
}

/* CSS Variables for dark mode support */
:root {
  --accent-rgb: 10, 132, 255;
}
</style>