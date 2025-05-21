import { createClient } from '@supabase/supabase-js';

// Use environment variables for the URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log configuration details (without exposing the full key)
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase key configured: ${supabaseAnonKey ? 'Yes' : 'No'}`);

// Validate the configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
}

// Create a single instance of the Supabase client to be used throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to increment view count for a post or case
export const incrementViews = async (type: 'posts' | 'cases', slug: string): Promise<void> => {
  try {
    // Call edge function to increment views
    const response = await fetch(`${supabaseUrl}/functions/v1/increment-views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        table: type,
        slug
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error incrementing views: ${errorData.error}`);
    }
  } catch (error) {
    console.error('Failed to increment view count:', error.message);
    // Fail silently - don't interrupt the user experience for view counts
  }
};

// Helper to get current user's editor role
export const isEditor = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Role check error:', error.message);
      return false;
    }
    if (!data.session) return false;
    
    const user = data.session.user;
    const appMetaRole = user.app_metadata?.role;
    const userMetaRole = user.user_metadata?.role;
    const role = appMetaRole || userMetaRole;
    
    return role === 'editor' || role === 'admin' || role === 'service';
  } catch (err) {
    console.error('Unexpected role check error:', err);
    return false;
  }
};

// Create a new user with email and password
export const createUser = async (email: string, password: string, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
          role: 'editor' // Ensure role is set in user metadata
        }
      }
    });
    
    return { data, error };
  } catch (err) {
    console.error('User creation error:', err);
    return { data: null, error: err };
  }
};

// Sign in an existing user with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  } catch (err) {
    console.error('Sign in error:', err);
    return { data: null, error: err };
  }
};

// Test connectivity to Supabase
export const testConnection = async () => {
  try {
    const start = performance.now();
    const { error } = await supabase.from('api_keys').select('count', { count: 'exact', head: true });
    const duration = performance.now() - start;
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        duration: null
      };
    }
    
    console.log(`Supabase connection successful (${duration.toFixed(2)}ms)`);
    return {
      success: true,
      message: 'Connection successful',
      duration: `${duration.toFixed(2)}ms`
    };
  } catch (err) {
    console.error('Unexpected connection test error:', err);
    return {
      success: false,
      message: `Unexpected error: ${err.message}`,
      duration: null
    };
  }
};