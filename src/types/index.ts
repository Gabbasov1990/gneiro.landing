// Common interfaces for the application

// Blog post
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  category: string;
  read_time: number;
  views: number;
  published_at: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
}

// Case study
export interface Case {
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
  created_at: string;
}

// Case study metric
export interface CaseMetric {
  label: string;
  desc: string;
}

// User profile
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'editor' | 'admin';
}

// API key
export interface ApiKey {
  id: string;
  label: string;
  token?: string; // Only present when initially created
  created_at: string;
  active: boolean;
}

// Media file
export interface MediaFile {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  url: string;
  created_at: string;
}

// App notification
export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  detail?: string;
  timeout?: number;
}

// Dashboard stats
export interface DashboardStats {
  totalPosts: number;
  totalCases: number;
  totalViews: number;
  popularPosts: Post[];
  popularCases: Case[];
}

// Agent types
export interface Agent {
  id: string;
  user_id: string;
  company_name: string;
  bot_name: string;
  tone?: string;
  no_answer_phrase?: string;
  goal?: string;
  dialog_flow?: DialogStep[];
  ig_url?: string;
  website_url?: string;
  docs_paths?: string[];
  status: 'configuring' | 'training' | 'ready' | 'error' | 'connected';
  whatsapp_qr?: string;
  created_at: string;
  connected_at?: string;
  metadata?: {
    integrations?: {
      crm: string;
      payment: boolean;
      analytics: boolean;
      apiAccess: boolean;
    };
    deployment?: {
      schedule: string;
      notifications: boolean;
      handoff: string;
      customSchedule: {
        weekdays: number[];
        startHour: number;
        endHour: number;
      };
    };
    chat_demo_token?: string;
  };
}

export interface DialogStep {
  id: number;
  text: string;
}

export interface WizardState {
  step: number;
  maxStep: number;
  form: {
    companyName: string;
    botName: string;
    tone: string;
    noAnswer: string;
    goal: string;
    flow: DialogStep[];
    ig: string;
    site: string;
    files: File[];
    integrations: {
      crm: string;
      payment: boolean;
      analytics: boolean;
      apiAccess: boolean;
    };
    deployment: {
      schedule: string;
      notifications: boolean;
      handoff: string;
      customSchedule: {
        weekdays: number[];
        startHour: number;
        endHour: number;
      };
    };
  };
  status: 'draft' | 'configuring' | 'ready' | 'connected';
  createdAgentId: string | null;
  qrCode: string | null;
  chatDemoToken: string | null;
}

// WhatsApp OTP
export interface WhatsAppOtp {
  id: string;
  phone: string;
  code_hash: string;
  expires_at: string;
  created_at: string;
}