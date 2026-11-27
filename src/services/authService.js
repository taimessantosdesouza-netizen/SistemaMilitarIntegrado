// services/authService.js

import { supabase } from '../lib/supabase';

export async function login(email, password) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}
