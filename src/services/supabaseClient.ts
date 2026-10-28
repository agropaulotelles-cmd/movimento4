import { createClient } from '@supabase/supabase-js';

function getValidClientUrl(): string {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl;
  }
  return 'https://vndgeizmqworbwwgyihl.supabase.co';
}

function getValidClientKey(): string {
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (envKey.length > 20) {
    return envKey;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZGdlaXptcXdvcmJ3d2d5aWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDAyODUsImV4cCI6MjA2MjQ3NjI4NX0.GEwEfSLixlVm7cLutwL27ELjZyPdTcZkXiCYDNefWwE';
}

export const supabaseClient = createClient(getValidClientUrl(), getValidClientKey());
