<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase, incrementViews } from '@/lib/supabase';
import { marked } from 'marked';
import { prefersReducedMotion } from '@/lib/utils';

interface CaseMetric {
  label: string;
  desc: string;
}

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  hero_image: string;
  owner_name: string;
  owner_photo: string;
  metrics: CaseMetric[];
  content_md: string;
  views: number;
  published_at: string;
}

const route = useRoute();
const router = useRouter();
const caseStudy = ref<CaseStudy | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const isReducedMotion = ref(prefersReducedMotion());

// Get the slug from the route
const slug = computed(() => route.params.slug as string);

onMounted(() => {
  fetchCaseStudy();
});

// Fetch the case study
const fetchCaseStudy = async () => {
  try {
    loading.value = true;

    const { data, error: err } = await supabase
      .from('cases')
      .select('*')
      .eq('slug', slug.value)
      .single();

    if (err) throw new Error(err.message);

    if (data) {
      caseStudy.value = {
        ...data,
        metrics: data.metrics as CaseMetric[]
      };

      // Set the page title and meta description
      document.title = `${caseStudy.value.title} — кейс Gneiro`;

      // Increment the view count
      incrementViewCount();
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Произошла ошибка при загрузке кейса';
    }
    console.error('Error fetching case study:', err);
  } finally {
    loading.value = false;
  }
};

// Increment the view count for this case study
const incrementViewCount = async () => {
  try {
    // Use incrementViews helper from supabase.ts
    await incrementViews('cases', slug.value);
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
  if (!caseStudy.value) return '';
  console.log(marked(caseStudy.value.content_md));

  return marked(caseStudy.value.content_md);
});

// Go back to the cases list
const goBack = () => {
  router.push('/cases');
};

// Scroll to the CTA section
const scrollToCta = () => {
  const ctaSection = document.getElementById('case-cta');
  if (ctaSection) {
    ctaSection.scrollIntoView({
      behavior: isReducedMotion.value ? 'auto' : 'smooth'
    });
  }
};

// Clean up on component unmount
onUnmounted(() => {
  document.title = 'Gneiro — AI-продавец для WhatsApp';
});
</script>

<template>
  <div class="case-detail-page" role="main">
    <!-- Back button -->
    <div class="back-button-container">
      <div class="container">
        <button class="back-button" @click="goBack" aria-label="Вернуться к кейсам">
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>Назад к кейсам</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="skeleton hero-skeleton"></div>
      <div class="container">
        <div class="skeleton-content">
          <div class="skeleton title-skeleton"></div>
          <div class="skeleton author-skeleton"></div>
          <div class="metrics-skeleton">
            <div class="skeleton metric-skeleton" v-for="i in 3" :key="`metric-${i}`"></div>
          </div>
          <div class="content-skeleton">
            <div class="skeleton paragraph-skeleton" v-for="i in 5" :key="`p-${i}`"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="container">
        <div class="error-message">
          <h1>Кейс не найден</h1>
          <p>{{ error }}</p>
          <button @click="goBack" class="btn btn-primary">Вернуться к списку кейсов</button>
        </div>
      </div>
    </div>

    <article v-else-if="caseStudy" class="case-article" itemscope itemtype="http://schema.org/Article">
      <!-- Schema.org metadata -->
      <meta itemprop="datePublished" :content="caseStudy.published_at" />
      <meta itemprop="author" :content="caseStudy.owner_name" />

      <!-- Hero section -->
      <div class="hero-section"
        :style="`background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url('${caseStudy.hero_image}')`">
        <div class="container">
          <h1 class="case-title" itemprop="headline">{{ caseStudy.title }}</h1>

          <div class="hero-metrics">
            <div v-if="caseStudy.metrics && caseStudy.metrics.length > 0" class="hero-metric">
              <div class="metric-value">{{ caseStudy.metrics[0].label }}</div>
              <div class="metric-label">{{ caseStudy.metrics[0].desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Author info -->
        <div class="author-section">
          <div class="author-info">
            <div class="author-avatar">
              <img :src="caseStudy.owner_photo" :alt="caseStudy.owner_name" class="avatar" width="48" loading="lazy"
                decoding="async" itemprop="image" />
            </div>
            <div class="author-details">
              <h2 class="author-name" itemprop="author">{{ caseStudy.owner_name }}</h2>
              <p class="case-date">
                <i class="pi pi-calendar" aria-hidden="true"></i>
                <time :datetime="caseStudy.published_at" itemprop="datePublished">
                  {{ formatDate(caseStudy.published_at) }}
                </time>
              </p>
            </div>
          </div>

          <div class="case-metrics">
            <div v-for="(metric, index) in caseStudy.metrics" :key="`metric-${index}`" class="metric-badge">
              <span class="metric-value">{{ metric.label }}</span>
              <span class="metric-label">{{ metric.desc }}</span>
            </div>
          </div>
        </div>

        <!-- Main content layout -->
        <div class="content-layout">
          <!-- Main content -->
          <div class="main-content">
            <div class="case-content" itemprop="articleBody" v-html="renderedContent"></div>
          </div>

          <!-- Sidebar -->
          <aside class="case-sidebar">
            <div class="sidebar-card">
              <h3 class="sidebar-title">Итоги кейса</h3>

              <div class="summary-metrics">
                <div v-for="(metric, index) in caseStudy.metrics" :key="`summary-${index}`" class="summary-metric">
                  <div class="summary-value">{{ metric.label }}</div>
                  <div class="summary-label">{{ metric.desc }}</div>
                </div>
              </div>

              <button @click="scrollToCta" class="btn btn-primary btn-full">
                Хочу так же
              </button>
            </div>

            <div class="sidebar-card views-card">
              <div class="views-count">
                <i class="pi pi-eye" aria-hidden="true"></i>
                <span>{{ caseStudy.views }} просмотров</span>
              </div>
            </div>
          </aside>
        </div>

        <!-- CTA section -->
        <div id="case-cta" class="case-cta">
          <h2 class="cta-title">Хотите таких же результатов?</h2>
          <p class="cta-description">
            Начните использовать Gneiro уже сегодня и получите результаты как в этом кейсе
          </p>
          <div class="cta-buttons">
            <RouterLink to="/#pricing" class="btn btn-primary">
              Попробовать бесплатно
            </RouterLink>
            <RouterLink to="/cases" class="btn btn-outline">
              Посмотреть другие кейсы
            </RouterLink>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>