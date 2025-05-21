// @ts-nocheck
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "npm:@supabase/supabase-js@2.38.4";

interface PublishRequest {
  type: 'post' | 'case';
  payload: any; // Post or case data structure
  apiKey: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Validate required fields for posts
function validatePostPayload(payload: any): string | null {
  const requiredFields = ["title", "slug", "excerpt", "content", "category", "read_time"];
  
  for (const field of requiredFields) {
    if (!payload[field]) {
      return `Missing required field: ${field}`;
    }
  }
  
  return null;
}

// Validate required fields for cases
function validateCasePayload(payload: any): string | null {
  const requiredFields = ["title", "slug", "excerpt", "owner_name", "content_md"];
  
  for (const field of requiredFields) {
    if (!payload[field]) {
      return `Missing required field: ${field}`;
    }
  }
  
  return null;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    // Get the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const requestData = await req.json() as PublishRequest;
    
    // Get API key from request
    const apiKey = req.headers.get('x-api-key') || requestData.apiKey;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing API key. Provide it in x-api-key header or apiKey in request body" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Verify API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('token', apiKey)
      .eq('active', true)
      .single();
    
    if (apiKeyError || !apiKeyData) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive API key" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const { type, payload } = requestData;
    
    // Validate input
    if (!type || !payload) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'type' and 'payload' are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (type !== 'post' && type !== 'case') {
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be 'post' or 'case'" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Validate payload
    let validationError;
    if (type === 'post') {
      validationError = validatePostPayload(payload);
    } else {
      validationError = validateCasePayload(payload);
    }
    
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Process any base64 images before inserting
    if (payload.cover_image_base64) {
      // Upload cover image to storage
      const base64Data = payload.cover_image_base64;
      const contentType = base64Data.match(/^data:(.*);base64,/)?.[1] || 'image/jpeg';
      const base64 = base64Data.replace(/^data:(.*);base64,/, '');
      
      const fileName = `${type}s/${payload.slug}-cover-${Date.now()}.${contentType.split('/')[1]}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, decode(base64), {
          contentType,
          upsert: true
        });
      
      if (uploadError) {
        throw new Error(`Error uploading cover image: ${uploadError.message}`);
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      
      // Update payload
      if (type === 'post') {
        payload.cover_url = publicUrl;
        delete payload.cover_image_base64;
      } else {
        payload.hero_image = publicUrl;
        delete payload.cover_image_base64;
      }
    }
    
    // Insert record into appropriate table
    let result;
    if (type === 'post') {
      result = await supabase.from('posts').insert(payload);
    } else {
      result = await supabase.from('cases').insert(payload);
    }
    
    if (result.error) {
      throw new Error(`Error inserting ${type}: ${result.error.message}`);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully published ${type}`, 
        slug: payload.slug 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Error processing request:", error.message);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Helper function to decode base64 to Uint8Array
function decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}