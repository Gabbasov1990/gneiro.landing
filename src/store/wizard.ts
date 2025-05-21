import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { DialogStep, Agent } from '@/types';

export const useWizardStore = defineStore('wizard', () => {
  // Wizard state with defaults
  const step = ref(1);
  const maxStep = ref(7); // Updated from 5 to 7 for two extra steps
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const setupComplete = ref(false);
  const setupProgress = ref(0);
  const qrCode = ref<string | null>(null);
  const createdAgentId = ref<string | null>(null);
  
  // Form data
  const form = ref({
    companyName: '',
    botName: '',
    tone: 'professional', // Default values
    noAnswer: "I'll need to check with a human colleague about that. Can I help with something else?",
    goal: 'sell',
    flow: [{ id: 1, text: 'Ask what the customer is looking for' }] as DialogStep[],
    ig: '',
    site: '',
    files: [] as File[],
    // New fields for the added steps
    integrations: {
      crm: '', // e.g. 'amocrm', 'bitrix24', etc.
      payment: false, // Whether to enable payment processing
      analytics: false, // Whether to enable analytics
      apiAccess: false // Whether to allow API access
    },
    deployment: {
      schedule: 'always', // 'always', 'business_hours', 'custom'
      notifications: true, // Whether to send notifications on new chats
      handoff: 'auto', // 'auto', 'manual', 'never' - when to hand off to a human
      customSchedule: {
        weekdays: [1,2,3,4,5], // Monday to Friday
        startHour: 9,
        endHour: 18
      }
    }
  });
  
  // Computed properties
  const isFormValid = computed(() => {
    switch (step.value) {
      case 2: // Company and bot name
        return form.value.companyName.length >= 3 && form.value.botName.length >= 3;
      
      case 3: // Tone, no-answer phrase, and goal
        return !!form.value.tone && !!form.value.noAnswer && !!form.value.goal;
      
      case 4: // Dialog flow
        return form.value.flow.length >= 3 && form.value.flow.every(step => step.text.trim().length > 0);
      
      case 5: // Integrations (new step) - always valid
        return true;
      
      case 6: // Deployment (new step) - always valid
        return true;
      
      case 7: // Data sources (at least one)
        return !!(form.value.ig.trim() || form.value.site.trim() || form.value.files.length > 0);
      
      default:
        return true;
    }
  });
  
  // Navigation actions
  const nextStep = () => {
    if (step.value < maxStep.value && isFormValid.value) {
      step.value++;
    }
  };
  
  const prevStep = () => {
    if (step.value > 1) {
      step.value--;
    }
  };
  
  const goToStep = (newStep: number) => {
    if (newStep >= 1 && newStep <= maxStep.value) {
      step.value = newStep;
    }
  };
  
  // Reset the wizard
  const resetWizard = () => {
    step.value = 1;
    form.value = {
      companyName: '',
      botName: '',
      tone: 'professional',
      noAnswer: "I'll need to check with a human colleague about that. Can I help with something else?",
      goal: 'sell',
      flow: [{ id: 1, text: 'Ask what the customer is looking for' }] as DialogStep[],
      ig: '',
      site: '',
      files: [] as File[],
      integrations: {
        crm: '',
        payment: false,
        analytics: false,
        apiAccess: false
      },
      deployment: {
        schedule: 'always',
        notifications: true,
        handoff: 'auto',
        customSchedule: {
          weekdays: [1,2,3,4,5],
          startHour: 9,
          endHour: 18
        }
      }
    };
    error.value = null;
    setupComplete.value = false;
    setupProgress.value = 0;
    qrCode.value = null;
    createdAgentId.value = null;
  };
  
  // Dialog flow management
  const addDialogStep = () => {
    const newId = form.value.flow.length > 0 
      ? Math.max(...form.value.flow.map(step => step.id)) + 1 
      : 1;
    
    form.value.flow.push({
      id: newId,
      text: ''
    });
  };
  
  const removeDialogStep = (id: number) => {
    form.value.flow = form.value.flow.filter(step => step.id !== id);
  };
  
  const updateDialogStep = (id: number, text: string) => {
    const stepIndex = form.value.flow.findIndex(step => step.id === id);
    if (stepIndex !== -1) {
      form.value.flow[stepIndex].text = text;
    }
  };
  
  const reorderDialogSteps = (newOrder: DialogStep[]) => {
    form.value.flow = newOrder;
  };
  
  // Create agent in the database
  const createAgent = async () => {
    isLoading.value = true;
    error.value = null;
    setupProgress.value = 0;
    
    try {
      console.log('Creating agent with form data:', {
        companyName: form.value.companyName,
        botName: form.value.botName,
        ig: form.value.ig,
        site: form.value.site,
        filesCount: form.value.files.length
      });
      
      // Check for authentication
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.log('User not authenticated, proceeding as anonymous');
        // We'll continue without authentication for now
        // In a real app, you might want to show a login modal here
      }
      
      // Prepare the agent data
      const agentData = {
        user_id: data.session?.user.id, // This might be null for anonymous users
        company_name: form.value.companyName,
        bot_name: form.value.botName,
        tone: form.value.tone,
        no_answer_phrase: form.value.noAnswer,
        goal: form.value.goal,
        dialog_flow: form.value.flow,
        ig_url: form.value.ig.trim(),
        website_url: form.value.site.trim(),
        docs_paths: [],  // Will be populated after file upload
        status: 'configuring',
        // Store the integration and deployment preferences in a metadata field
        metadata: {
          integrations: form.value.integrations,
          deployment: form.value.deployment
        }
      };
      
      console.log('Inserting agent with data:', agentData);
      
      // Insert the agent
      const { data: agent, error: insertError } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting agent:', insertError);
        throw insertError;
      }
      
      if (!agent) {
        throw new Error('Failed to create agent - no data returned');
      }
      
      console.log('Agent created successfully:', agent);
      createdAgentId.value = agent.id;
      
      // Upload files if any
      if (form.value.files.length > 0) {
        console.log('Uploading files for agent:', agent.id);
        // Create a folder for the agent's documents
        const folderPath = `agents/${agent.id}/docs`;
        
        // Upload each file
        const filePaths = [];
        for (const file of form.value.files) {
          const filePath = `${folderPath}/${file.name}`;
          
          console.log('Uploading file:', filePath);
          const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            // Continue with other files even if one fails
          } else {
            filePaths.push(filePath);
          }
        }
        
        // Update the agent with the file paths
        if (filePaths.length > 0) {
          console.log('Updating agent with file paths:', filePaths);
          await supabase
            .from('agents')
            .update({
              docs_paths: filePaths
            })
            .eq('id', agent.id);
        }
      }
      
      // Start the setup process (in a real environment this would trigger our function)
      setupComplete.value = true;
      
      // Start a simulated progress for demo purposes
      simulateAgentSetupProgress(agent.id);
      
      return agent;
    } catch (err) {
      console.error('Error creating agent:', err);
      error.value = err.message || 'Failed to create AI assistant';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Simulate a configuration progress
  const simulateAgentSetupProgress = (agentId: string) => {
    // Increment progress every 500ms for demo purposes
    const interval = setInterval(() => {
      setupProgress.value += 5;
      
      if (setupProgress.value >= 100) {
        clearInterval(interval);
        // Fetch the agent to get the QR code
        fetchAgent(agentId);
      }
    }, 500);
  };
  
  // Fetch the agent to get updated status and QR code
  const fetchAgent = async (agentId: string) => {
    try {
      const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (agent) {
        if (agent.status === 'ready' && agent.whatsapp_qr) {
          qrCode.value = agent.whatsapp_qr;
        }
      }
    } catch (err) {
      console.error('Error fetching agent:', err);
    }
  };
  
  // Return all state and methods
  return {
    // State
    step,
    maxStep,
    isLoading,
    error,
    form,
    setupComplete,
    setupProgress,
    qrCode,
    createdAgentId,
    
    // Computed
    isFormValid,
    
    // Actions
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    addDialogStep,
    removeDialogStep,
    updateDialogStep,
    reorderDialogSteps,
    createAgent,
    fetchAgent
  };
});