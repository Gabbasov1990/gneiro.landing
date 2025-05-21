// @ts-nocheck
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "npm:@supabase/supabase-js@2.38.4";

interface IncrementViewsRequest {
  table: 'posts' | 'cases';
  slug: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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
    const { table, slug } = await req.json() as IncrementViewsRequest;
    
    // Validate input
    if (!table || !slug) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'table' and 'slug' are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (table !== 'posts' && table !== 'cases') {
      return new Response(
        JSON.stringify({ error: "Invalid table. Must be 'posts' or 'cases'" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Increment view count based on table
    let result;
    if (table === 'posts') {
      result = await supabase.rpc('increment_post_view', { post_slug: slug });
    } else {
      result = await supabase.rpc('increment_case_view', { case_slug: slug });
    }
    
    if (result.error) {
      throw new Error(`Error incrementing view count: ${result.error.message}`);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: `Incremented view for ${table} with slug: ${slug}` }),
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