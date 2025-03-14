import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;
const REQUEST_TIMEOUT = 15000;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getRetryDelay = (attempt: number) => {
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  return Math.min(delay, MAX_RETRY_DELAY);
};

const shouldRetry = (error: Error) => {
  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('timeout') ||
    message.includes('connection refused') ||
    message.includes('connection reset')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'leadgen-ai'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  fetch: async (url, options = {}) => {
    // Check if we actually have Supabase credentials
    if (!supabaseUrl || !supabaseAnonKey) {
      // Return mock response that can be handled gracefully
      return new Response(JSON.stringify({ data: [], error: { message: "Supabase credentials not configured" }}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          if (shouldRetry(error) && attempt < MAX_RETRIES - 1) {
            const delay = getRetryDelay(attempt);
            console.warn(`Request failed (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }
          throw error;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (shouldRetry(error) && attempt < MAX_RETRIES - 1) {
            const delay = getRetryDelay(attempt);
            console.warn(`Request failed (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }
          
          if (attempt === MAX_RETRIES - 1) {
            console.error('All retry attempts failed:', error);
            
            // Return a mock response that won't cause the app to crash
            return new Response(JSON.stringify({ 
              data: [], 
              error: { 
                message: "Failed to connect to Supabase",
                details: error.message,
                hint: "",
                code: ""
              }
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        throw error;
      }
    }

    // This should never execute due to the returns in the loop above
    // But TypeScript needs it for type safety
    return new Response(JSON.stringify({ 
      data: [], 
      error: { 
        message: "Failed to connect to Supabase after exhausting all retry attempts" 
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});