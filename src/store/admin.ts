import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { 
  Post, 
  Case, 
  UserProfile, 
  ApiKey, 
  Notification, 
  MediaFile, 
  DashboardStats 
} from '@/types';

export const useAdminStore = defineStore('admin', () => {
  // User state
  const currentUser = ref<UserProfile | null>(null);
  const isAuthenticated = computed(() => !!currentUser.value);
  
  // Content data
  const posts = ref<Post[]>([]);
  const cases = ref<Case[]>([]);
  const apiKeys = ref<ApiKey[]>([]);
  const mediaFiles = ref<MediaFile[]>([]);
  
  // UI state
  const notifications = ref<Notification[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  
  // Dashboard data
  const dashboardStats = ref<DashboardStats>({
    totalPosts: 0,
    totalCases: 0,
    totalViews: 0,
    popularPosts: [],
    popularCases: []
  });
  
  // Authentication actions
  const login = async (email: string, password: string) => {
    isLoading.value = true;
    try {
      console.log("Attempting login with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful:", data);
      
      // Load the user profile
      await fetchCurrentUser();
      
      addNotification({
        type: 'success',
        message: 'Вход выполнен успешно'
      });
      
      return data;
    } catch (error) {
      console.error("Login catch error:", error);
      addNotification({
        type: 'error',
        message: 'Ошибка входа',
        detail: error.message
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    isLoading.value = true;
    try {
      console.log("Attempting registration with:", email);
      // Set editor role in the metadata - this is crucial for the admin access
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
            role: 'editor'  // Explicitly set the role to 'editor'
          }
        }
      });
      
      if (error) {
        console.error("Registration error:", error);
        throw error;
      }
      
      console.log("Registration successful:", data);
      
      // Set the current user after successful registration
      if (data.user) {
        currentUser.value = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: fullName || email.split('@')[0],
          role: 'editor'
        };
      }
      
      addNotification({
        type: 'success',
        message: 'Регистрация выполнена успешно',
        detail: 'Вы можете войти с вашими учетными данными'
      });
      
      return data;
    } catch (error) {
      console.error("Registration catch error:", error);
      addNotification({
        type: 'error',
        message: 'Ошибка регистрации',
        detail: error.message
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  const logout = async () => {
    isLoading.value = true;
    try {
      console.log("Attempting logout");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      currentUser.value = null;
      console.log("Logout successful, currentUser cleared");
      
      addNotification({
        type: 'success',
        message: 'Вы успешно вышли из системы'
      });
    } catch (error) {
      console.error("Logout catch error:", error);
      addNotification({
        type: 'error',
        message: 'Ошибка выхода',
        detail: error.message
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  const fetchCurrentUser = async () => {
    isLoading.value = true;
    try {
      console.log("Fetching current user session");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session fetch error:", error);
        throw error;
      }
      
      if (!session) {
        console.log("No active session found");
        currentUser.value = null;
        return null;
      }
      
      // Get user data
      const user = session.user;
      console.log("User data from session:", user);
      console.log("User metadata:", user.user_metadata);
      console.log("App metadata:", user.app_metadata);
      
      // Make sure app_metadata and user_metadata are properly initialized
      const userMeta = user.user_metadata || {};
      const appMeta = user.app_metadata || {};
      const userRole = appMeta.role || userMeta.role || 'editor';
      
      console.log("Determined user role:", userRole);
      
      currentUser.value = {
        id: user.id,
        email: user.email || '',
        full_name: userMeta.full_name || '',
        avatar_url: userMeta.avatar_url || '',
        role: userRole
      };
      
      console.log("Current user set to:", currentUser.value);
      
      return currentUser.value;
    } catch (error) {
      console.error("Error fetching current user:", error);
      addNotification({
        type: 'error',
        message: 'Ошибка получения данных пользователя',
        detail: error.message
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Posts CRUD
  const fetchPosts = async () => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      posts.value = data as Post[];
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка загрузки статей',
        detail: error.message
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  const fetchPostBySlug = async (slug: string): Promise<Post | null> => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as Post;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка загрузки статьи',
        detail: error.message
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  const createPost = async (post: Partial<Post>): Promise<Post | null> => {
    isSaving.value = true;
    try {
      if (!currentUser.value) {
        throw new Error('Необходимо авторизоваться');
      }
      
      const newPost = {
        ...post,
        created_by: currentUser.value.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('posts')
        .insert(newPost)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Add to local state
      posts.value.unshift(data as Post);
      
      addNotification({
        type: 'success',
        message: 'Статья создана успешно'
      });
      
      return data as Post;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка создания статьи',
        detail: error.message
      });
      return null;
    } finally {
      isSaving.value = false;
    }
  };
  
  const updatePost = async (id: string, updates: Partial<Post>): Promise<Post | null> => {
    isSaving.value = true;
    try {
      updates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update in local state
      const index = posts.value.findIndex(p => p.id === id);
      if (index !== -1) {
        posts.value[index] = { ...posts.value[index], ...data } as Post;
      }
      
      addNotification({
        type: 'success',
        message: 'Статья обновлена успешно'
      });
      
      return data as Post;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка обновления статьи',
        detail: error.message
      });
      return null;
    } finally {
      isSaving.value = false;
    }
  };
  
  const deletePost = async (id: string): Promise<boolean> => {
    isSaving.value = true;
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Remove from local state
      posts.value = posts.value.filter(p => p.id !== id);
      
      addNotification({
        type: 'success',
        message: 'Статья удалена успешно'
      });
      
      return true;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка удаления статьи',
        detail: error.message
      });
      return false;
    } finally {
      isSaving.value = false;
    }
  };
  
  // Cases CRUD
  const fetchCases = async () => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      cases.value = data.map(caseItem => ({
        ...caseItem,
        metrics: caseItem.metrics || []
      })) as Case[];
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка загрузки кейсов',
        detail: error.message
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  const fetchCaseBySlug = async (slug: string): Promise<Case | null> => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        ...data,
        metrics: data.metrics || []
      } as Case;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка загрузки кейса',
        detail: error.message
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  const createCase = async (caseItem: Partial<Case>): Promise<Case | null> => {
    isSaving.value = true;
    try {
      if (!currentUser.value) {
        throw new Error('Необходимо авторизоваться');
      }
      
      const newCase = {
        ...caseItem,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('cases')
        .insert(newCase)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Add to local state
      cases.value.unshift({
        ...data,
        metrics: data.metrics || []
      } as Case);
      
      addNotification({
        type: 'success',
        message: 'Кейс создан успешно'
      });
      
      return {
        ...data,
        metrics: data.metrics || []
      } as Case;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка создания кейса',
        detail: error.message
      });
      return null;
    } finally {
      isSaving.value = false;
    }
  };
  
  const updateCase = async (id: string, updates: Partial<Case>): Promise<Case | null> => {
    isSaving.value = true;
    try {
      const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update in local state
      const index = cases.value.findIndex(c => c.id === id);
      if (index !== -1) {
        cases.value[index] = {
          ...cases.value[index],
          ...data,
          metrics: data.metrics || []
        } as Case;
      }
      
      addNotification({
        type: 'success',
        message: 'Кейс обновлен успешно'
      });
      
      return {
        ...data,
        metrics: data.metrics || []
      } as Case;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка обновления кейса',
        detail: error.message
      });
      return null;
    } finally {
      isSaving.value = false;
    }
  };
  
  const deleteCase = async (id: string): Promise<boolean> => {
    isSaving.value = true;
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Remove from local state
      cases.value = cases.value.filter(c => c.id !== id);
      
      addNotification({
        type: 'success',
        message: 'Кейс удален успешно'
      });
      
      return true;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка удаления кейса',
        detail: error.message
      });
      return false;
    } finally {
      isSaving.value = false;
    }
  };
  
  // API Keys
  const fetchApiKeys = async () => {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      apiKeys.value = data as ApiKey[];
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка загрузки API ключей',
        detail: error.message
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  const createApiKey = async (label: string): Promise<{ key: ApiKey; token: string } | null> => {
    isSaving.value = true;
    try {
      // Generate a random token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const newKey = {
        label,
        token,
        created_at: new Date().toISOString(),
        active: true
      };
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert(newKey)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Add to local state (without the token for security)
      const keyForState: ApiKey = {
        id: data.id,
        label: data.label,
        created_at: data.created_at,
        active: data.active
      };
      
      apiKeys.value.unshift(keyForState);
      
      addNotification({
        type: 'success',
        message: 'API ключ создан успешно'
      });
      
      // Return both the API key record and the plain text token
      // The token will only be shown once to the user
      return {
        key: keyForState,
        token
      };
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка создания API ключа',
        detail: error.message
      });
      return null;
    } finally {
      isSaving.value = false;
    }
  };
  
  const toggleApiKey = async (id: string, active: boolean): Promise<boolean> => {
    isSaving.value = true;
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ active })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update in local state
      const index = apiKeys.value.findIndex(k => k.id === id);
      if (index !== -1) {
        apiKeys.value[index].active = active;
      }
      
      addNotification({
        type: 'success',
        message: `API ключ ${active ? 'активирован' : 'деактивирован'} успешно`
      });
      
      return true;
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Ошибка ${active ? 'активации' : 'деактивации'} API ключа`,
        detail: error.message
      });
      return false;
    } finally {
      isSaving.value = false;
    }
  };
  
  const deleteApiKey = async (id: string): Promise<boolean> => {
    isSaving.value = true;
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Remove from local state
      apiKeys.value = apiKeys.value.filter(k => k.id !== id);
      
      addNotification({
        type: 'success',
        message: 'API ключ удален успешно'
      });
      
      return true;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка удаления API ключа',
        detail: error.message
      });
      return false;
    } finally {
      isSaving.value = false;
    }
  };
  
  // Media files
  const fetchMediaFiles = async (folder: string = '') => {
    isLoading.value = true;
    try {
      let path = '';
      if (folder) {
        path = folder.endsWith('/') ? folder : `${folder}/`;
      }
      
      // List all files in the bucket/folder
      const { data, error } = await supabase.storage
        .from('media')
        .list(path);
      
      if (error) {
        throw error;
      }
      
      // Get public URLs for each file
      const files = await Promise.all(
        data.filter(item => !item.id.endsWith('/')) // Filter out folders
          .map(async (item) => {
            const filePath = path + item.name;
            const { data: { publicUrl } } = supabase.storage
              .from('media')
              .getPublicUrl(filePath);
              
            return {
              id: item.id,
              name: item.name,
              path: filePath,
              type: item.metadata?.mimetype || 'unknown',
              size: item.metadata?.size || 0,
              url: publicUrl,
              created_at: item.created_at
            } as MediaFile;
          })
      );
      
      mediaFiles.value = files;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка загрузки медиа-файлов',
        detail: error.message
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  const uploadMediaFile = async (file: File, path: string = ''): Promise<MediaFile | null> => {
    isSaving.value = true;
    try {
      // Create file path
      const filePath = path 
        ? (path.endsWith('/') ? path : `${path}/`) + file.name
        : file.name;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);
      
      // Create media file object
      const mediaFile: MediaFile = {
        id: data.id || Math.random().toString(36).substring(2, 11),
        name: file.name,
        path: data.path,
        type: file.type,
        size: file.size,
        url: publicUrl,
        created_at: new Date().toISOString()
      };
      
      // Add to local state
      mediaFiles.value.unshift(mediaFile);
      
      addNotification({
        type: 'success',
        message: 'Файл успешно загружен'
      });
      
      return mediaFile;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка загрузки файла',
        detail: error.message
      });
      return null;
    } finally {
      isSaving.value = false;
    }
  };
  
  const deleteMediaFile = async (path: string): Promise<boolean> => {
    isSaving.value = true;
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([path]);
      
      if (error) {
        throw error;
      }
      
      // Remove from local state
      mediaFiles.value = mediaFiles.value.filter(f => f.path !== path);
      
      addNotification({
        type: 'success',
        message: 'Файл успешно удален'
      });
      
      return true;
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка удаления файла',
        detail: error.message
      });
      return false;
    } finally {
      isSaving.value = false;
    }
  };
  
  // Dashboard stats
  const fetchDashboardStats = async () => {
    isLoading.value = true;
    try {
      // Get counts
      const [postsData, casesData] = await Promise.all([
        supabase.from('posts').select('id, title, slug, views, published_at', { count: 'exact' }),
        supabase.from('cases').select('id, title, slug, views, published_at', { count: 'exact' })
      ]);
      
      if (postsData.error) {
        throw postsData.error;
      }
      
      if (casesData.error) {
        throw casesData.error;
      }
      
      // Get popular posts
      const { data: popularPosts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('views', { ascending: false })
        .limit(5);
      
      if (postsError) {
        throw postsError;
      }
      
      // Get popular cases
      const { data: popularCases, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .order('views', { ascending: false })
        .limit(5);
      
      if (casesError) {
        throw casesError;
      }
      
      // Calculate total views
      const postViews = (postsData.data || []).reduce((total, post) => total + (post.views || 0), 0);
      const caseViews = (casesData.data || []).reduce((total, caseItem) => total + (caseItem.views || 0), 0);
      
      // Update dashboard stats
      dashboardStats.value = {
        totalPosts: postsData.count || 0,
        totalCases: casesData.count || 0,
        totalViews: postViews + caseViews,
        popularPosts: popularPosts as Post[],
        popularCases: popularCases.map(c => ({
          ...c,
          metrics: c.metrics || []
        })) as Case[]
      };
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка загрузки статистики',
        detail: error.message
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  // Notifications
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newNotification: Notification = {
      id,
      ...notification
    };
    
    notifications.value.push(newNotification);
    
    // Auto-remove after timeout (default 5 seconds)
    setTimeout(() => {
      removeNotification(id);
    }, notification.timeout || 5000);
  };
  
  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  };
  
  return {
    // State
    currentUser,
    isAuthenticated,
    posts,
    cases,
    apiKeys,
    mediaFiles,
    notifications,
    isLoading,
    isSaving,
    dashboardStats,
    
    // Auth actions
    login,
    register,
    logout,
    fetchCurrentUser,
    
    // Posts CRUD
    fetchPosts,
    fetchPostBySlug,
    createPost,
    updatePost,
    deletePost,
    
    // Cases CRUD
    fetchCases,
    fetchCaseBySlug,
    createCase,
    updateCase,
    deleteCase,
    
    // API Keys
    fetchApiKeys,
    createApiKey,
    toggleApiKey,
    deleteApiKey,
    
    // Media files
    fetchMediaFiles,
    uploadMediaFile,
    deleteMediaFile,
    
    // Dashboard
    fetchDashboardStats,
    
    // Notifications
    addNotification,
    removeNotification
  };
});