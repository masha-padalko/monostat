/* ==== module: storage.js (auto-generated split) ==== */
import { LOCAL_ONLY_KEYS, authUserId, supabaseClient } from './auth.js';

export async function storageGet(key){
  if(supabaseClient && !LOCAL_ONLY_KEYS.has(key) && authUserId){
    try{
      const { data, error } = await supabaseClient.from('kv_store').select('value').eq('key', key).eq('user_id', authUserId).maybeSingle();
      if(error) throw error;
      if(data) return typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
      return null;
    }catch(e){
      console.warn('Supabase storageGet failed, falling back:', key, e);
    }
  }
  try{
    const r = await window.storage.get(key, false);
    return r ? r.value : null;
  }catch(e){
    try{ return localStorage.getItem('monostat_'+key); }catch(e2){ return null; }
  }
}

export async function storageSet(key, value){
  if(supabaseClient && !LOCAL_ONLY_KEYS.has(key) && authUserId){
    try{
      let parsed;
      try{ parsed = JSON.parse(value); }catch(e){ parsed = value; }
      const { error } = await supabaseClient.from('kv_store').upsert({ key, value: parsed, user_id: authUserId, updated_at: new Date().toISOString() }, { onConflict: 'key,user_id' });
      if(error) throw error;
      return;
    }catch(e){
      console.warn('Supabase storageSet failed, falling back:', key, e);
    }
  }
  try{
    await window.storage.set(key, value, false);
    return;
  }catch(e){
    try{ localStorage.setItem('monostat_'+key, value); }catch(e2){}
  }
}
