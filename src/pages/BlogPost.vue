<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase, incrementViews } from '@/lib/supabase';
import MarkdownIt from 'markdown-it';
import { prefersReducedMotion } from '@/lib/utils';

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

const route = useRoute();
const router = useRouter();
const post = ref<BlogPost | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
const isReducedMotion = ref(prefersReducedMotion());

// Get the slug from the route
const slug = computed(() => route.params.slug as string);

onMounted(() => {
  // Fetch the blog post when the component is mounted
  fetchPost();
});

// Fetch the blog post
const fetchPost = async () => {
  try {
    loading.value = true;

    const { data, error: err } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug.value)
      .single();

    if (err) throw new Error(err.message);

    if (data) {
      post.value = data as BlogPost;

      // Set the page title
      document.title = `${post.value.title} — Блог Gneiro`;

      // Increment the view count
      incrementViewCount();
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Произошла ошибка при загрузке статьи';
    }
    console.error('Error fetching blog post:', err);

    // If no data was found in the database, create a fake post for display
    createFakePost();
  } finally {
    loading.value = false;
  }
};

// Increment the view count for this post
const incrementViewCount = async () => {
  try {
    // Use incrementViews helper from supabase.ts
    await incrementViews('posts', slug.value);
  } catch (err) {
    console.error('Error incrementing view count:', err);
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Render markdown to HTML
const renderedContent = computed(() => {
  if (!post.value) return '';
  return md.render(post.value.content);
});

// Create a fake post if none was found in the database
const createFakePost = () => {
  if (slug.value === 'ai-sales-automation') {
    post.value = {
      id: '1',
      slug: 'ai-sales-automation',
      title: 'Как AI-автоматизация увеличивает продажи в WhatsApp на 45%',
      excerpt: 'Разбор трёх кейсов клиентов Gneiro, которые внедрили автоматизацию продаж',
      content: '## Автоматизация продаж через WhatsApp\n\nWhatsApp стал основным каналом для бизнес-коммуникаций в большинстве стран СНГ. При этом многие компании до сих пор отвечают клиентам вручную, теряя до 68% потенциальных продаж из-за задержек в ответах.\n\nВ этой статье мы расскажем о трёх реальных кейсах клиентов Gneiro, которые смогли существенно увеличить продажи благодаря AI-автоматизации WhatsApp.\n\n## Кейс 1: Интернет-магазин электроники\n\n**Проблема:** Долгое время ответа в WhatsApp (в среднем 1,5 часа), высокий процент брошенных корзин.\n\n**Решение Gneiro:**\n- Мгновенные ответы на типовые вопросы о товарах\n- Автоматическое уведомление о брошенных корзинах\n- Интеграция с системой оплаты через WhatsApp\n\n**Результат:** Конверсия в продажу выросла на 32%, средний чек увеличился на 15%.\n\n## Кейс 2: Сеть салонов красоты\n\n**Проблема:** Высокая нагрузка на администраторов, много пропущенных обращений в WhatsApp, частые отмены записей.\n\n**Решение Gneiro:**\n- Автоматическая запись на процедуры\n- Умные напоминания о записи за день и за час\n- Предложение перенести, а не отменить запись\n\n**Результат:** Количество записей выросло на 41%, доля отмен снизилась с 28% до 8%.\n\n## Кейс 3: Языковая школа\n\n**Проблема:** Низкая конверсия из заявки в покупку курса, длительный процесс прогрева потенциальных клиентов.\n\n**Решение Gneiro:**\n- Автоматический квалификационный опрос\n- Выдача бесплатных пробных материалов\n- Постепенный прогрев с ценными советами по изучению языка\n\n**Результат:** Конверсия из лида в покупателя выросла с 12% до 45%.\n\n## Как работает AI-продавец в WhatsApp\n\n1. **Мгновенно отвечает на сообщения** — клиенты получают ответ за 3 секунды вместо часов ожидания\n2. **Понимает контекст и ведет осмысленный диалог** — ваши клиенты не чувствуют, что общаются с роботом\n3. **Квалифицирует лиды** — задает важные вопросы и собирает информацию для продажи\n4. **Передает разговор живому оператору** при необходимости — бот знает свои ограничения\n\n## Почему именно сейчас стоит автоматизировать WhatsApp\n\n- 89% людей предпочитают писать, а не звонить\n- На сообщение открывается в среднем за 3 минуты после получения\n- Среднее время ответа бизнеса — 1,7 часа, что критически много\n- 62% потенциальных клиентов уходят, если не получают ответ в течение 15 минут\n\nGneiro позволяет запустить AI-продавца в WhatsApp всего за 5 минут, без программирования и сложных настроек. Попробуйте бесплатно сейчас — первые 7 дней работы бота бесплатны.',
      cover_url: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg',
      category: 'Автоматизация',
      read_time: 4,
      published_at: '2025-05-01T10:00:00Z',
      views: 542
    };

    // Set the page title
    document.title = `${post.value.title} — Блог Gneiro`;
    error.value = null;
  } else if (slug.value === 'chatbot-integration-guide') {
    post.value = {
      id: '2',
      slug: 'chatbot-integration-guide',
      title: 'Интеграция чат-бота с CRM: пошаговое руководство',
      excerpt: 'Подробная инструкция по подключению Gneiro к популярным CRM-системам',
      content: '## Зачем интегрировать чат-бота с CRM-системой\n\nОбъединение чат-бота Gneiro с вашей CRM-системой позволяет:\n\n1. **Автоматически создавать контакты и сделки** на основе диалогов в WhatsApp\n2. **Сохранять полную историю переписки** для дальнейшей работы менеджеров\n3. **Анализировать эффективность работы** бота и продаж в единой системе\n4. **Автоматически запускать сценарии** обработки лидов в CRM\n\nВ этой статье мы разберем, как подключить Gneiro к наиболее популярным CRM-системам в СНГ.\n\n## Интеграция с AmoCRM\n\n### Шаг 1: Подготовка доступов в AmoCRM\n\n1. Зайдите в настройки вашего аккаунта в AmoCRM\n2. Перейдите в раздел API-ключи и OAuth\n3. Создайте новую интеграцию с типом "Сервер"\n4. Укажите URL для Callback: `https://app.gneiro.com/oauth/amocrm`\n5. Скопируйте полученные client_id и client_secret\n\n### Шаг 2: Подключение в панели Gneiro\n\n1. В панели управления Gneiro перейдите в "Настройки" > "Интеграции" > "CRM"\n2. Выберите AmoCRM\n3. Вставьте скопированные client_id и client_secret\n4. Нажмите "Авторизовать" и авторизуйте приложение\n5. Настройте маппинг полей: какие данные из WhatsApp попадают в какие поля AmoCRM\n6. Сохраните настройки',
      cover_url: 'https://images.pexels.com/photos/7563687/pexels-photo-7563687.jpeg',
      category: 'Интеграции',
      read_time: 6,
      published_at: '2025-04-15T14:30:00Z',
      views: 327
    };

    // Set the page title
    document.title = `${post.value.title} — Блог Gneiro`;
    error.value = null;
  } else {
    error.value = 'Статья не найдена';
  }
};

// Go back to the blog list
const goBack = () => {
  router.push('/blog');
};

// Clean up on component unmount
onUnmounted(() => {
  document.title = 'Gneiro — AI-продавец для WhatsApp';
});
</script>

<template>
  <div class="blog-post-page">
    <!-- Back button -->
    <div class="back-button-container">
      <div class="container">
        <button class="back-button" @click="goBack" aria-label="Вернуться к блогу">
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>Назад к блогу</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="skeleton hero-skeleton"></div>
      <div class="container">
        <div class="skeleton-content">
          <div class="skeleton title-skeleton"></div>
          <div class="skeleton meta-skeleton"></div>
          <div class="content-skeleton">
            <div class="skeleton paragraph-skeleton" v-for="i in 10" :key="`p-${i}`"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="container">
        <div class="error-message">
          <h1>Статья не найдена</h1>
          <p>{{ error }}</p>
          <button @click="goBack" class="btn btn-primary">Вернуться к списку статей</button>
        </div>
      </div>
    </div>

    <article v-else-if="post" class="blog-post" itemscope itemtype="http://schema.org/BlogPosting">
      <!-- Schema.org metadata -->
      <meta itemprop="datePublished" :content="post.published_at" />
      <meta itemprop="author" content="Gneiro Team" />

      <!-- Hero section -->
      <div class="hero-section">
        <div class="hero-image-container">
          <img :src="post.cover_url" :alt="post.title" class="hero-image" loading="lazy" decoding="async"
            itemprop="image" />
        </div>
        <div class="container">
          <div class="hero-content">
            <span class="post-category" itemprop="articleSection">{{ post.category }}</span>
            <h1 class="post-title" itemprop="headline">{{ post.title }}</h1>
            <div class="post-meta">
              <div class="post-date">
                <i class="pi pi-calendar" aria-hidden="true"></i>
                <time :datetime="post.published_at">{{ formatDate(post.published_at) }}</time>
              </div>
              <div class="post-read-time">
                <i class="pi pi-clock" aria-hidden="true"></i>
                <span>{{ post.read_time }} мин чтения</span>
              </div>
              <div class="post-views">
                <i class="pi pi-eye" aria-hidden="true"></i>
                <span>{{ post.views }} просмотров</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content section -->
      <div class="container">
        <div class="post-container">
          <div class="post-content" itemprop="articleBody" v-html="renderedContent"></div>

          <aside class="post-sidebar">
            <div class="sidebar-card">
              <h3 class="sidebar-title">Попробуйте Gneiro</h3>
              <p class="sidebar-text">Создайте своего AI-продавца для WhatsApp всего за 5 минут и увеличите продажи на
                45%</p>
              <RouterLink to="/#start" class="btn btn-primary btn-block">Начать бесплатно</RouterLink>
            </div>

            <div class="sidebar-card">
              <h3 class="sidebar-title">Поделиться</h3>
              <div class="share-buttons">
                <button class="share-button" @click="navigator.clipboard.writeText(window.location.href)"
                  aria-label="Скопировать ссылку">
                  <i class="pi pi-link" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  </div>
</template>