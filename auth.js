/* ==== module: auth.js (auto-generated split) ==== */

export const SUPABASE_URL = 'https://nysfbpcmcnfzggksvtrj.supabase.co';

export const SUPABASE_KEY = 'sb_publishable_ItiF_W39A9R-D4-vGlOH7Q_3spxqJsH';

// "Запам'ятати мене" toggle: when off, the session lives only in sessionStorage
// (gone once the tab/browser closes) instead of localStorage (survives forever).
// Supabase's client needs to know which one to use AT CREATION time, so we hand it
// a tiny adapter that checks this flag on every read/write instead of hardcoding one.

export let rememberLogin = (localStorage.getItem('monostat_remember_pref') !== 'false');

export const authStorageAdapter = {
  getItem: (key) => localStorage.getItem(key) ?? sessionStorage.getItem(key),
  setItem: (key, value) => { (rememberLogin ? localStorage : sessionStorage).setItem(key, value); },
  removeItem: (key) => { localStorage.removeItem(key); sessionStorage.removeItem(key); }
};

export const supabaseClient = (window.supabase && SUPABASE_URL && SUPABASE_KEY)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { storage: authStorageAdapter, persistSession: true, autoRefreshToken: true } })
  : null;

// ms_token NEVER goes to Supabase, even though everything else does — the site is
// publicly reachable (GitHub Pages), and a token shared across every device via one
// database would mean anyone with the link could load her real bank statement just by
// opening the page. It stays purely local (window.storage/localStorage), same as before.

export const LOCAL_ONLY_KEYS = new Set(['ms_token']);

export let authUserId = null; // set once she's logged in via Supabase Auth; every kv_store row is scoped to this

export async function initAuth(){
  if(!supabaseClient) return null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  authUserId = session?.user?.id || null;
  return authUserId;
}

export async function signIn(email, password, remember){
  rememberLogin = remember;
  localStorage.setItem('monostat_remember_pref', String(remember));
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if(error) return { error };
  authUserId = data.user.id;
  return { user: data.user };
}

export async function signUp(email, password, remember){
  rememberLogin = remember;
  localStorage.setItem('monostat_remember_pref', String(remember));
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if(error) return { error };
  authUserId = data.user?.id || null;
  return { user: data.user };
}

export async function signOutAuth(){
  await supabaseClient.auth.signOut();
  authUserId = null;
}

export async function requestPasswordReset(email){
  return await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
}
