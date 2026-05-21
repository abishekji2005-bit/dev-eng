import { supabase } from '../supabase.js';

export async function profileByClerk(clerkId) {
  const { data } = await supabase
    .from('profiles').select('id').eq('clerk_id', clerkId).single();
  return data?.id;
}
