import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { supabase } from '@/lib/supabase';
import Home from '@/pages/Home.vue';
import BlogList from '@/pages/BlogList.vue';
import BlogPost from '@/pages/BlogPost.vue';
import CaseList from '@/pages/CaseList.vue';
import CaseDetail from '@/pages/CaseDetail.vue';
import WizardLayout from '@/layouts/WizardLayout.vue';
import WelcomeStep from '@/pages/wizard/WelcomeStep.vue';
import BasicsStep from '@/pages/wizard/BasicsStep.vue';
import PersonalityStep from '@/pages/wizard/PersonalityStep.vue';
import DialogStep from '@/pages/wizard/DialogStep.vue';
import IntegrationsStep from '@/pages/wizard/IntegrationsStep.vue';
import DeploymentStep from '@/pages/wizard/DeploymentStep.vue';
import TrainingStep from '@/pages/wizard/TrainingStep.vue';
import SetupProgress from '@/pages/wizard/SetupProgress.vue';
import Dashboard from '@/pages/admin/Dashboard.vue';
import Posts from '@/pages/admin/Posts.vue';
import Cases from '@/pages/admin/Cases.vue';
import Media from '@/pages/admin/Media.vue';
import ApiKeys from '@/pages/admin/ApiKeys.vue';
import Login from '@/pages/admin/Login.vue';
import AuthCallback from '@/pages/AuthCallback.vue';
import NotFound from '@/pages/NotFound.vue';

// Define routes with lazy loading for better performance
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
    meta: { title: 'Gneiro — AI-продавец для WhatsApp' }
  },
  {
    path: '/blog',
    component: BlogList,
    meta: { title: 'Блог | Gneiro' }
  },
  {
    path: '/blog/:slug',
    component: BlogPost,
    meta: { title: 'Блог | Gneiro' }
  },
  {
    path: '/cases',
    component: CaseList,
    meta: { title: 'Кейсы | Gneiro' }
  },
  {
    path: '/cases/:slug',
    component: CaseDetail,
    meta: { title: 'Кейс | Gneiro' }
  },
  {
    path: '/create',
    component: WizardLayout,
    meta: { title: 'Создание AI-ассистента | Gneiro' },
    children: [
      {
        path: '',
        component: WelcomeStep
      },
      {
        path: 'basics',
        component: BasicsStep
      },
      {
        path: 'personality',
        component: PersonalityStep
      },
      {
        path: 'dialog',
        component: DialogStep
      },
      {
        path: 'integrations',
        component: IntegrationsStep
      },
      {
        path: 'deployment',
        component: DeploymentStep
      },
      {
        path: 'training',
        component: TrainingStep
      },
      {
        path: 'setup',
        component: SetupProgress
      }
    ]
  },
  {
    path: '/dashboard',
    redirect: '/admin',
    meta: { title: 'Панель управления | Gneiro', requiresAuth: true }
  },
  {
    path: '/admin',
    component: Dashboard,
    meta: { title: 'Админ-панель | Gneiro', requiresAuth: true },
    redirect: '/admin/posts',
    children: [
      {
        path: 'posts',
        component: Posts,
        meta: { title: 'Статьи | Админ-панель Gneiro', requiresAuth: true }
      },
      {
        path: 'cases',
        component: Cases,
        meta: { title: 'Кейсы | Админ-панель Gneiro', requiresAuth: true }
      },
      {
        path: 'media',
        component: Media,
        meta: { title: 'Медиа | Админ-панель Gneiro', requiresAuth: true }
      },
      {
        path: 'api-keys',
        component: ApiKeys,
        meta: { title: 'API ключи | Админ-панель Gneiro', requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin/login',
    component: Login,
    meta: { title: 'Вход | Админ-панель Gneiro' }
  },
  {
    path: '/admin/register',
    component: Login,
    meta: { title: 'Регистрация | Админ-панель Gneiro' }
  },
  {
    path: '/auth/callback',
    component: AuthCallback,
    meta: { title: 'Аутентификация | Gneiro' }
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound,
    meta: { title: '404 - Страница не найдена | Gneiro' }
  }
];

// Create the router instance
export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80, // Offset for fixed header
      };
    }

    return { top: 0 };
  }
});

// Navigation guards for authentication
router.beforeEach(async (to, from, next) => {
  // Update the page title based on the route metadata
  document.title = to.meta.title as string || 'Gneiro — AI-продавец для WhatsApp';

  console.log("Router guard: navigating to", to.path);

  // Never block auth callback routes
  if (to.path.includes('/auth/callback')) {
    const { data } = await supabase.auth.getSession();
    console.log("Auth callback detected, proceeding without checks");

    console.log(data);
    if (!data.session) {
      return next({ path: '/admin/login' });

    }

    return next();
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    const session = await supabase.auth.getSession();

    if (!session.data.session) {
      return next({ path: '/admin/login' });
    }
    return next();
  } else if (to.path === '/admin/login' || to.path === '/admin/register') {
    // If route is login or register, check if user is already logged in
    try {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const user = data.session.user;
        const userRole = user.app_metadata?.role || user.user_metadata?.role;

        // If user is already logged in and has a proper role, redirect to admin
        if (userRole === 'editor' || userRole === 'admin' || userRole === 'service') {
          console.log("Already logged in with role, redirecting to admin dashboard");
          return next({ path: '/admin' });
        }
      }
    } catch (error) {
      console.error("Session check error:", error);
    }
  }

  next();
});

export default router;