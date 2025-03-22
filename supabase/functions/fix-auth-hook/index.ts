import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // Apply the SQL migration to fix the custom_access_token_hook function
    const sql = `
    CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
     RETURNS jsonb
     LANGUAGE plpgsql
    AS $function$
    DECLARE
      claims jsonb;
      user_role text;
      user_id uuid;
      provider text;
    BEGIN
      -- Extract the user_id from the event with error handling
      BEGIN
        user_id := (event->>'user_id')::uuid;
      EXCEPTION WHEN OTHERS THEN
        -- If user_id is not a valid UUID or is null, return the event unchanged
        RETURN event;
      END;
      
      -- Skip processing if user_id is null
      IF user_id IS NULL THEN
        RETURN event;
      END IF;
      
      -- Get claims with null check
      claims := event->'claims';
      IF claims IS NULL THEN
        RETURN event;
      END IF;
      
      -- Get provider with null check
      provider := claims->>'provider';
      
      -- Get the user's role from the user_roles table
      SELECT role_name INTO user_role
      FROM public.user_roles
      WHERE user_id = user_id;
      
      -- Default to 'authenticated' if no role found
      IF user_role IS NULL THEN
        user_role := 'authenticated';
      END IF;
      
      -- Update the role in the claims
      claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
      
      -- Check if 'app_metadata' exists in claims
      IF jsonb_typeof(claims->'app_metadata') IS NULL OR claims->'app_metadata' IS NULL THEN
        -- If 'app_metadata' does not exist, create an empty object
        claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
      END IF;
      
      -- Handle Discord-specific metadata
      IF provider = 'discord' THEN
        claims := jsonb_set(
          claims,
          '{app_metadata}',
          coalesce(claims->'app_metadata', '{}'::jsonb) || jsonb_build_object(
            'provider', 'discord',
            'discord_user_id', coalesce(claims->'raw_user_meta_data'->>'sub', claims->'user_metadata'->>'sub')
          )
        );
      END IF;
      
      -- Set the role in app_metadata
      claims := jsonb_set(claims, '{app_metadata, role}', to_jsonb(user_role));
      
      -- If the role is admin, set the admin flag
      IF user_role = 'admin' THEN
        claims := jsonb_set(claims, '{app_metadata, is_admin}', 'true');
      END IF;
      
      -- Update the claims in the event
      event := jsonb_set(event, '{claims}', claims);
      
      RETURN event;
    EXCEPTION WHEN OTHERS THEN
      -- Catch any other errors and return the original event
      RAISE NOTICE 'Error in custom_access_token_hook: %', SQLERRM;
      RETURN event;
    END;
    $function$;
    `;

    // Execute the SQL to update the function
    const { error } = await supabaseClient.rpc("pgfunction", { query: sql });

    if (error) {
      throw new Error(`Failed to update function: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Custom access token hook function has been fixed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fixing auth hook:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An unexpected error occurred",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
