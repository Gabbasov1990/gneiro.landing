import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  // User state
  const currentUser = ref<UserProfile | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!currentUser.value);

  // Initialize auth
  const initialize = async () => {
    isLoading.value = true;
    try {
      // Check session
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (data?.session) {
        await fetchUserProfile();
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      error.value = 'Failed to initialize authentication';
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    isLoading.value = true;
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        currentUser.value = null;
        return null;
      }

      // Get user data
      const user = session.user;

      // Check for role in both metadata objects
      const appMetaRole = user.app_metadata?.role;
      const userMetaRole = user.user_metadata?.role;
      const role = appMetaRole || userMetaRole || 'user';

      currentUser.value = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        role: role as 'editor' | 'admin'
      };

      return currentUser.value;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      error.value = 'Failed to fetch user profile';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Sign up with email
  const signUp = async (email: string, password: string, fullName?: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email,
            role: 'editor' // Set default role
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // Auto-login after signup
        await signIn(email, password);
        return data;
      }

      return data;
    } catch (err) {
      console.error('Sign up error:', err);
      error.value = err.message || 'Failed to sign up';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Sign in with email
  const signIn = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        await fetchUserProfile();
      }

      return data;
    } catch (err) {
      console.error('Sign in error:', err);
      error.value = err.message || 'Failed to sign in';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Sign out
  const signOut = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      currentUser.value = null;
    } catch (err) {
      console.error('Sign out error:', err);
      error.value = err.message || 'Failed to sign out';
    } finally {
      isLoading.value = false;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) {
        throw resetError;
      }
    } catch (err) {
      console.error('Reset password error:', err);
      error.value = err.message || 'Failed to reset password';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: updates
      });

      if (updateError) {
        throw updateError;
      }

      // Refresh the user profile
      await fetchUserProfile();
    } catch (err) {
      console.error('Update profile error:', err);
      error.value = err.message || 'Failed to update profile';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Set up auth state change listener

  return {
    // State
    currentUser,
    isLoading,
    error,
    isAuthenticated,

    // Actions
    initialize,
    fetchUserProfile,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };
});