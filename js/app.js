
(function(){
try{

let CATS = ['продукти','продукти спільні','таксі','транспорт','Подорожі: літак','Подорожі: кава в літаку','Подорожі: потяг',
  'Подорожі: автобус','Подорожі: громадський транспорт','авто','пальне','обіди','догляд','краса',
  'ліки','аналізи','йога','подарунки','розваги','розваги спільні','інтернет','одяг','готівка (зняття)','послуги (ФОП)',
  'перекази людям','комунальні послуги','інше'];
const CATEGORY_RENAMES = {
  'такси':'таксі',
  'Путешествия транспорт: самолёт':'Подорожі: літак',
  'Путешествия транспорт: кава в літаку':'Подорожі: кава в літаку',
  'Путешествия транспорт: поезд':'Подорожі: потяг',
  'Путешествия транспорт: автобус':'Подорожі: автобус',
  'Путешествия транспорт: інше':'Подорожі: громадський транспорт',
  'Путешествия транспорт: общественный транспорт':'Подорожі: громадський транспорт',
  'бензин':'пальне','обеды':'обіди','дц':'догляд','бьюти':'краса','лекарства':'ліки',
  'анализи':'аналізи','йожа':'йога','Internet':'інтернет','одежда':'одяг','квартплата':'комунальні послуги'
};

function sortedCats(){
  return [...CATS].sort((a,b)=>a.localeCompare(b,'uk'));
}

const COLORS = {
  'продукти':'#C9A24B','продукти спільні':'#C4A24B','таксі':'#4FA98C','транспорт':'#7FB7A3',
  'Подорожі: літак':'#B7734F','Подорожі: кава в літаку':'#D9A374','Подорожі: потяг':'#D4956E',
  'Подорожі: автобус':'#E3B084','Подорожі: громадський транспорт':'#8C6A4E',
  'авто':'#8C6A5C','пальне':'#C15B4A','обіди':'#E0C468','догляд':'#6E8FA8','краса':'#A87FA8',
  'ліки':'#7FA8A0','аналізи':'#5C8C8C','йога':'#8FA85C','подарунки':'#D48FAA',
  'розваги':'#B88AC4','розваги спільні':'#C4A0CE',
  'інтернет':'#5C7A8C','одяг':'#A8955C','готівка (зняття)':'#6B6459',
  'послуги (ФОП)':'#8C7A5C','перекази людям':'#5C6B8C',
  'комунальні послуги':'#6E7F5C','інше':'#4A443A'
};

const ICONS = {
  'продукти':'🧺','продукти спільні':'🧺🤝','таксі':'🚕','транспорт':'🚌',
  'Подорожі: літак':'✈️','Подорожі: кава в літаку':'☕','Подорожі: потяг':'🚆',
  'Подорожі: автобус':'🚌','Подорожі: громадський транспорт':'🚎',
  'авто':'🚗','пальне':'⛽','обіди':'🍽️','догляд':'🏬','краса':'💅',
  'ліки':'💊','аналізи':'💉','йога':'🧘','подарунки':'🎁',
  'розваги':'🎉','розваги спільні':'🎉🤝',
  'інтернет':'📶','одяг':'👗','готівка (зняття)':'💵',
  'послуги (ФОП)':'🧾','перекази людям':'🤝',
  'комунальні послуги':'🏠','інше':'❓'
};

function defaultRules(){
  return [
    {kw:['фора','сільпо','атб','novus','lidl','carrefour','велмарт','megaimage','gatedo','mini mart','kollmarket','ovochi','лоток','moldretail','коло','маркетопт','ашан','екомаркет','stambo'],cat:'продукти'},
    {kw:['bolt','uklon','uber'],cat:'таксі'},
    {kw:['wizz','ryanair','turkish air','lufthansa','kiwi.com','flyone','aelia'],cat:'Подорожі: літак'},
    {kw:['укрзалізниця','залізни','cfr','societatea nationala'],cat:'Подорожі: потяг'},
    {kw:['flixbus','bus station','автовокзал'],cat:'Подорожі: автобус'},
    {kw:['omio','busfor'],cat:'Подорожі: громадський транспорт'},
    {kw:['окко','wog','азс','avias','socar','glusco','azs'],cat:'пальне'},
    {kw:['kaviarnia','dnata catering','zhniva','santandreea','imbarcadero','vypichka','the coffee','кав\'ярня','кафе'],cat:'обіди'},
    {kw:['prostor','brocard','eva '],cat:'догляд'},
    {kw:['salon','medcity','салон крас'],cat:'краса'},
    {kw:['аптека','apteka','аптечка'],cat:'ліки'},
    {kw:['діла','synevo','сінево','медична лаборатор'],cat:'аналізи'},
    {kw:['йога','yoga','sport life','спортлайф'],cat:'йога'},
    {kw:['rozetka','tezenis','media galaxy','wayforpay','нова пошта','mo sviato'],cat:'подарунки'},
    {kw:['vodafone','kyivstar','київстар','lifecell','terms','google'],cat:'інтернет'},
    {kw:['humana'],cat:'одяг'},
    {kw:['atm '],cat:'готівка (зняття)'},
    {kw:['фоп '],cat:'послуги (ФОП)'}
  ];
}

function mccFallback(mcc){
  const m = {4111:'транспорт',4112:'Подорожі: потяг',4121:'таксі',4131:'Подорожі: громадський транспорт',
    4722:'Подорожі: літак',3000:'Подорожі: літак',5411:'продукти',5499:'продукти',
    5541:'пальне',5814:'обіди',5812:'обіди',5977:'краса',5912:'ліки',8071:'аналізи',8099:'аналізи',
    7997:'йога',5691:'одяг',6011:'готівка (зняття)',4900:'інтернет',4814:'інтернет',7299:'Подорожі: громадський транспорт'};
  return m[mcc] || null;
}

function isPersonTransfer(desc){
  return /^[А-ЯЇЄІҐ][а-яїєіґ']+\s[А-ЯЇЄІҐ]\.?$/.test(desc.trim()) || desc.startsWith('From:') || /^\d{6}\*{4,}\d+$/.test(desc.trim());
}

function categorize(desc, mcc, amount, overrides, rules){
  const d = desc.toLowerCase();
  // small Wizz Air / Ryanair charges (under 600) are onboard snacks/coffee/seat fees, not the ticket itself.
  // This must run BEFORE the merchant-wide override: "Ryan Air" is usually saved there as "літак"
  // (for the ticket), which used to swallow the small onboard charges too. Any other category she
  // chose for the merchant still wins, and a per-transaction override wins over everything.
  const airOverride = !overrides[desc] || overrides[desc]==='Подорожі: літак' || overrides[desc]==='Путешествия транспорт: самолёт';
  if(airOverride && (d.includes('wizz') || d.includes('ryan')) && amount < 0 && Math.abs(amount) < 600) return 'Подорожі: кава в літаку';
  if(overrides[desc]) return overrides[desc];
  for(const r of rules){
    for(const kw of r.kw){ if(d.includes(kw)) return r.cat; }
  }
  if(isPersonTransfer(desc) && amount < 0) return 'перекази людям';
  const fb = mccFallback(mcc);
  if(fb) return fb;
  return 'інше';
}
// Category for one specific transaction: a per-transaction override (set when she picks
// "тільки цю покупку") always wins over the merchant-wide rule, so recategorizing one
// odd purchase (e.g. a supermarket run that was actually entertainment) doesn't drag
// every other purchase from that same store along with it.
function categoryFor(t){
  const override = state.txCategoryOverride[txKey(t)];
  if(override) return override;
  return categorize(t.desc, t.mcc, t.amount, state.overrides, state.rules);
}

// Shared handler for the category <select> wherever it appears. Asks whether the change
// should apply only to this one purchase or to every purchase from that merchant — because
// by default a category change is merchant-wide, which surprised her when one supermarket
// trip she wanted as "розваги" quietly recategorized every other supermarket run too.
async function handleCategoryChange(t, newCat){
  if(t.manual && Number.isInteger(t.manualIndex) && state.manual[t.manualIndex]){
    state.manual[t.manualIndex].cat = newCat;
    render();
    await persistManual();
    return;
  }
  const onlyThis = confirm(`Застосувати «${newCat}» тільки до цієї покупки (${t.desc}, ${fmt(Math.abs(t.amount))} ${curSym()})?\n\nOK — тільки ця операція.\nСкасувати — до всіх покупок у «${t.desc}» (як завжди).`);
  if(onlyThis) setTxCategoryOverride(txKey(t), newCat);
  else setOverride(t.desc, newCat);
}



// ---------- state ----------
let state = {
  token: '',
  rememberToken: false,
  initialLoading: true,
  accounts: [],
  selectedAccount: null,
  from: '',
  to: '',
  loading: false,
  error: null,
  txs: [],          // {id,date,desc,mcc,amount,currency}
  overrides: {...window.MonoStatDefaults.DEFAULT_OVERRIDES},     // desc -> category (learned)
  manual: [...window.MonoStatDefaults.DEFAULT_MANUAL],         // manual entries {date,desc,amount,cat}
  rules: defaultRules(),
  debts: [],          // {id,person,amount,remaining,dateGiven,status,note}
  loanKeys: {},        // txKey -> debtId (marks an expense tx as "this was a loan, not spend")
  usedIncoming: {},     // txKey -> debtId (marks an incoming tx as "already used to close a debt")
  todayTxs: null,        // independent last-48h fetch, used when main range doesn't cover today/yesterday
  todayLoading: false,
  expandedCats: {},
  expandedBlocks: {transactions:false, incoming:false}, // accordion-style "show more" for the 3-col panels
  notes: {...window.MonoStatDefaults.DEFAULT_NOTES},         // txKey -> free-text note about that specific transaction
  mainTab: (function(){ try{ const h=(location.hash||'').slice(1); return ['overview','history','trips','ops','data'].includes(h)?h:'overview'; }catch(e){ return 'overview'; } })(),
  dayExcluded: {...window.MonoStatDefaults.DEFAULT_DAY_EXCLUDED},     // txKey -> true if unchecked in "Зараз" (excluded from today/yesterday total)
  notExpense: {...window.MonoStatDefaults.DEFAULT_NOT_EXPENSE},       // txKey -> true — flagged as "not a real expense" (refunded/recharged, fund contribution, etc.) for "Чисті трати"
  syncedByAcc: {},       // accountId -> [[fromUnix,toUnix],...] — periods already fetched/imported completely FOR THAT CARD, so gap detection doesn't re-request them
  sync: {running:false, msg:'', done:0, total:0},
  refresh: {status:'idle', msg:'', code:''}, // background refresh after an instant start: idle | loading | ok | error
  lastAccountId: null,   // card chosen last time (ms_selectedaccount) — opened by default on the next visit
  cardPickerOpen: false, // card list unfolded on the dashboard
  importMsg: '',
  lastApiCall: 0,
  autoSyncDone: false,
  share: {},             // txKey -> my share (0..1) of a shared payment; only this fraction counts as my spending
  amountOverride: {},    // txKey -> net amount after auto-detected partial refund (e.g. Bolt charge minus a same-merchant refund), used only in "Чисті трати"
  txCategoryOverride: {...window.MonoStatDefaults.DEFAULT_TX_CATEGORY_OVERRIDE}, // txKey -> category — overrides just THIS transaction, without affecting every other purchase from the same merchant
  txCache: [...window.MonoStatDefaults.DEFAULT_TX_CACHE],  // every raw transaction ever successfully fetched, deduped by id — lets old periods stay visible without re-querying the API
  jarPending: 0,       // running total of unsent daily savings, accumulates day over day instead of resetting
  jarLastDate: null,    // last date whose savings were already folded into jarPending
  jarPeriodStart: null, // which 10th-to-10th cycle jarPending belongs to (resets on a new cycle)
  jarEnabled: true,      // optional — on by default for now, since she needs it this period
  jarDailyBudget: null,  // FROZEN at enable time — deliberately does not shrink/grow as balance changes day to day
  jarDraftStartDate: null, // transient — whatever she's currently picked in the date field, before clicking (Re)start
  jarStartDateActual: null, // when THIS tracking run actually began — fixed, unlike jarLastDate which advances to today once caught up
  jarAutoCheckedThisLoad: false, // ensures the background jar catch-up only runs once per page load, never re-fires mid-interaction
  dailyBudgetEndDate: null, // selected date through which to spread the current card balance
  recurringHidden: [], // ids of recurring-payment rows the user hid (ms_recurring_hidden)
  historySearch: {q:'', from:'', to:'', min:'', max:'', cat:'', kind:'all', limit:100}, // filters of the whole-history search panel
  editingTripDates: null, // tripId whose inline date-picker form is currently open, or null
  authChecking: true, // true only during the very first initAuth() check — avoids flashing the login form before we know a session already exists
  useCache: true, // whether to merge cached historical periods in alongside the freshly fetched range
  viewRange: null, // {start:Date,end:Date(inclusive)} when a monthly-chart cycle was clicked (viewTab==='previous')
  viewTab: 'current', // 'current' | 'previous' — which period tab is showing in the results view
  trips: [],          // [{id, name}] — named trips she can tag transactions with
  tripOf: {},          // txKey -> tripId
  expandedTrips: {},    // tripId -> bool, which trip cards are open
  expandedTripCategories: {}, // `${tripId}|${category}` -> bool
  customCats: [],     // user-added categories: [{name, icon}] — window.MonoStatDefaults.DEFAULT_CUSTOM_CATS applied below
  step: 'connect',   // connect -> accounts -> results
  manualJsonMode: false,
  manualJsonText: ''
};

// ---------- Supabase (реальна база даних, спільна для всіх пристроїв) ----------
const SUPABASE_URL = 'https://nysfbpcmcnfzggksvtrj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ItiF_W39A9R-D4-vGlOH7Q_3spxqJsH';

// "Запам'ятати мене" toggle: when off, the session lives only in sessionStorage
// (gone once the tab/browser closes) instead of localStorage (survives forever).
// Supabase's client needs to know which one to use AT CREATION time, so we hand it
// a tiny adapter that checks this flag on every read/write instead of hardcoding one.
let rememberLogin = (localStorage.getItem('monostat_remember_pref') !== 'false');
const authStorageAdapter = {
  getItem: (key) => localStorage.getItem(key) ?? sessionStorage.getItem(key),
  setItem: (key, value) => { (rememberLogin ? localStorage : sessionStorage).setItem(key, value); },
  removeItem: (key) => { localStorage.removeItem(key); sessionStorage.removeItem(key); }
};

const supabaseClient = (window.supabase && SUPABASE_URL && SUPABASE_KEY)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { storage: authStorageAdapter, persistSession: true, autoRefreshToken: true } })
  : null;

// ms_token NEVER goes to Supabase, even though everything else does — the site is
// publicly reachable (GitHub Pages), and a token shared across every device via one
// database would mean anyone with the link could load her real bank statement just by
// opening the page. It stays purely local (window.storage/localStorage), same as before.
const LOCAL_ONLY_KEYS = new Set(['ms_token']);

let authUserId = null; // set once she's logged in via Supabase Auth; every kv_store row is scoped to this
let authUserEmail = null;

async function initAuth(){
  if(!supabaseClient) return null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  authUserId = session?.user?.id || null;
  authUserEmail = session?.user?.email || null;
  return authUserId;
}
async function signIn(email, password, remember){
  rememberLogin = remember;
  localStorage.setItem('monostat_remember_pref', String(remember));
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if(error) return { error };
  authUserId = data.user.id;
  authUserEmail = data.user.email || null;
  return { user: data.user };
}
async function signUp(email, password, remember){
  rememberLogin = remember;
  localStorage.setItem('monostat_remember_pref', String(remember));
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if(error) return { error };
  authUserId = data.user?.id || null;
  authUserEmail = data.user?.email || null;
  return { user: data.user };
}
async function signOutAuth(){
  await supabaseClient.auth.signOut();
  authUserId = null;
  authUserEmail = null;
}
async function requestPasswordReset(email){
  return await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
}

// demo.html sets window.MS_DEMO — no auth, no Supabase, no Monobank API, nothing persisted anywhere
const IS_DEMO = !!window.MS_DEMO;

async function storageGet(key){
  if(IS_DEMO) return null;
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
async function storageSet(key, value){
  if(IS_DEMO) return;
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

async function loadPersisted(){
  const ov = await storageGet('ms_overrides'); if(ov) state.overrides = {...state.overrides, ...JSON.parse(ov)};
  // Migrate any leftover combined auto/fuel values; Green Card is insurance, while
  // the remaining merchants are fuel purchases.
  let migratedOverrides = false;
  Object.keys(state.overrides).forEach(k=>{
    if(state.overrides[k]==='авто/бензин'){
      state.overrides[k] = k.includes('Зелена картка') ? 'авто' : 'пальне';
      migratedOverrides = true;
    }
  });
  if(migratedOverrides) await persistOverrides();
  const man = await storageGet('ms_manual'); if(man) state.manual = JSON.parse(man);
  const tok = await storageGet('ms_token'); if(tok){ state.token = tok; state.rememberToken = true; }
  const d = await storageGet('ms_debts'); if(d) state.debts = JSON.parse(d);
  const lk = await storageGet('ms_loankeys'); if(lk) state.loanKeys = JSON.parse(lk);
  const uk = await storageGet('ms_usedincoming'); if(uk) state.usedIncoming = JSON.parse(uk);
  const nt = await storageGet('ms_notes'); if(nt) state.notes = {...state.notes, ...JSON.parse(nt)};
  const de = await storageGet('ms_dayexcluded'); if(de) state.dayExcluded = {...state.dayExcluded, ...JSON.parse(de)};
  const ne = await storageGet('ms_notexpense'); if(ne) state.notExpense = {...state.notExpense, ...JSON.parse(ne)};
  // (the older ms_syncedranges had no card in it — it is ignored, so each card's recent history gets re-checked once)
  const sr = await storageGet('ms_syncedranges_acc'); if(sr) state.syncedByAcc = JSON.parse(sr) || {};
  const sh = await storageGet('ms_share'); if(sh) state.share = JSON.parse(sh);
  const ao = await storageGet('ms_amountoverride'); if(ao) state.amountOverride = JSON.parse(ao);
  const tco = await storageGet('ms_txcatoverride'); if(tco) state.txCategoryOverride = {...state.txCategoryOverride, ...JSON.parse(tco)};
  const tc = await storageGet('ms_txcache'); if(tc){ const stored = JSON.parse(tc); const known=new Set(state.txCache.map(x=>x.id)); stored.forEach(it=>{ if(!known.has(it.id)){ state.txCache.push(it); known.add(it.id); } }); }
  // one-off cleanup: an early demo version merged scrambled demo_* operations into the real cache
  const realOnly = state.txCache.filter(it=>!String(it.id).startsWith('demo_'));
  if(realOnly.length !== state.txCache.length){ state.txCache = realOnly; await persistTxCache(); }
  const jp = await storageGet('ms_jarpending'); if(jp) state.jarPending = JSON.parse(jp);
  const jld = await storageGet('ms_jarlastdate'); if(jld) state.jarLastDate = jld;
  const jps = await storageGet('ms_jarperiodstart'); if(jps) state.jarPeriodStart = jps;
  const je = await storageGet('ms_jarenabled'); if(je!==null) state.jarEnabled = je==='true';
  const jdb = await storageGet('ms_jardailybudget'); if(jdb) state.jarDailyBudget = JSON.parse(jdb);
  const jsd = await storageGet('ms_jarstartdateactual'); if(jsd) state.jarStartDateActual = jsd;
  const dbed = await storageGet('ms_dailybudgetenddate'); if(dbed) state.dailyBudgetEndDate = dbed;
  const rh = await storageGet('ms_recurring_hidden'); if(rh){ try{ state.recurringHidden = JSON.parse(rh)||[]; }catch(e){} }
  const tr = await storageGet('ms_trips'); if(tr) state.trips = JSON.parse(tr);
  const to_ = await storageGet('ms_tripof'); if(to_) state.tripOf = JSON.parse(to_);
  const sa = await storageGet('ms_selectedaccount'); if(sa) state.lastAccountId = sa;
  const cc = await storageGet('ms_customcats');
  if(cc){
    const stored = JSON.parse(cc);
    stored.forEach(c=>{ if(!state.customCats.find(x=>x.name===c.name)) applyCustomCategory(c, true); });
  }

  let migratedCategoryOverrides = false;
  Object.keys(state.overrides).forEach(desc=>{
    if(CATEGORY_RENAMES[state.overrides[desc]]){
      state.overrides[desc] = CATEGORY_RENAMES[state.overrides[desc]];
      migratedCategoryOverrides = true;
    }
  });
  let migratedTransactionCategories = false;
  Object.keys(state.txCategoryOverride).forEach(key=>{
    if(CATEGORY_RENAMES[state.txCategoryOverride[key]]){
      state.txCategoryOverride[key] = CATEGORY_RENAMES[state.txCategoryOverride[key]];
      migratedTransactionCategories = true;
    }
  });
  let migratedManualCategories = false;
  state.manual.forEach(entry=>{
    if(CATEGORY_RENAMES[entry.cat]){
      entry.cat = CATEGORY_RENAMES[entry.cat];
      migratedManualCategories = true;
    }
  });
  if(migratedCategoryOverrides) await persistOverrides();
  if(migratedTransactionCategories) await persistTxCategoryOverride();
  if(migratedManualCategories) await persistManual();
}

async function persistOverrides(){ await storageSet('ms_overrides', JSON.stringify(state.overrides)); }
async function setOverride(desc, cat){
  state.overrides[desc] = cat;
  render(); // instant UI feedback
  await persistOverrides(); // then make sure it's actually saved before anything else can race it
}
async function persistTxCategoryOverride(){ await storageSet('ms_txcatoverride', JSON.stringify(state.txCategoryOverride)); }

// Every time a statement is fetched, the raw items get folded into a permanent local
// cache (deduped by id). That way past months stay visible/statisticable without ever
// hitting the API for them again — only genuinely new days need a fresh request.
async function persistTxCache(){
  // keep this bounded — cheap safety net against unbounded growth over a year of use
  if(state.txCache.length > 20000) state.txCache = state.txCache.slice(-20000);
  await storageSet('ms_txcache', JSON.stringify(state.txCache));
}
// The cache holds operations of every card she has ever loaded. `acc` on an item says which
// card it belongs to — set whenever the bank returns that operation for that card. Items cached
// before this existed have no `acc`: they stay visible until a statement proves otherwise
// (`notAcc` lists the cards whose complete statement for that time did NOT contain the item).
function accCache(){
  const id = state.selectedAccount;
  if(IS_DEMO || !id) return state.txCache;
  return state.txCache.filter(it=>it.acc ? it.acc===id : !(it.notAcc && it.notAcc.includes(id)));
}
// `items` is the COMPLETE statement of card `acc` for [a,b]: any unlabelled cached operation
// in that time that the bank didn't return is not this card's (another card, or a CSV twin).
function reconcileRange(acc, a, b, items){
  if(!acc) return;
  const ids = new Set(items.map(i=>i.id));
  let changed = false;
  state.txCache.forEach(it=>{
    if(it.acc || it.time<a || it.time>b || ids.has(it.id)) return;
    if(it.notAcc && it.notAcc.includes(acc)) return;
    it.notAcc = (it.notAcc||[]).concat([acc]);
    changed = true;
  });
  if(changed) persistTxCache();
}
function mergeIntoCache(items, acc){
  const known = new Map(state.txCache.map(x=>[x.id,x]));
  let added = 0, updated = 0;
  items.forEach(it=>{
    const cached = known.get(it.id);
    if(!cached){ if(acc) it.acc = acc; state.txCache.push(it); known.set(it.id,it); added++; return; }
    if(acc && cached.acc !== acc){ cached.acc = acc; delete cached.notAcc; updated++; }
    // the comment can be added in the Monobank app after the operation was first cached
    if(it.comment && it.comment !== cached.comment){
      cached.comment = it.comment;
      updated++;
    }
  });
  if(added>0 || updated>0) persistTxCache();
  return added;
}
async function clearTxCache(){
  state.txCache = [];
  await storageSet('ms_txcache', '[]');
  render();
}
async function setTxCategoryOverride(key, cat){
  state.txCategoryOverride[key] = cat;
  render();
  await persistTxCategoryOverride();
}
async function persistManual(){ await storageSet('ms_manual', JSON.stringify(state.manual)); }
async function persistNotes(){ await storageSet('ms_notes', JSON.stringify(state.notes)); }
async function persistDayExcluded(){ await storageSet('ms_dayexcluded', JSON.stringify(state.dayExcluded)); }

async function persistTrips(){
  await storageSet('ms_trips', JSON.stringify(state.trips));
  await storageSet('ms_tripof', JSON.stringify(state.tripOf));
}
async function addTrip(name){
  name = name.trim();
  if(!name) return;
  state.trips.push({id:'trip_'+Date.now(), name});
  render();
  await persistTrips();
}
async function deleteTrip(tripId){
  state.trips = state.trips.filter(t=>t.id!==tripId);
  Object.keys(state.tripOf).forEach(k=>{ if(state.tripOf[k]===tripId) delete state.tripOf[k]; });
  render();
  await persistTrips();
}
async function renameTrip(tripId, newName){
  newName = (newName||'').trim();
  if(!newName) return;
  const trip = state.trips.find(t=>t.id===tripId);
  if(!trip) return;
  trip.name = newName;
  render();
  await persistTrips();
}
async function setTripDates(tripId, dateFrom, dateTo){
  const trip = state.trips.find(t=>t.id===tripId);
  if(!trip) return;
  const validFrom = /^\d{4}-\d{2}-\d{2}$/.test(dateFrom||'');
  const validTo = /^\d{4}-\d{2}-\d{2}$/.test(dateTo||'');
  if(!validFrom || !validTo){
    alert('Дата має бути у форматі РРРР-ММ-ДД, наприклад 2026-06-10.');
    return;
  }
  trip.dateFrom = dateFrom;
  trip.dateTo = dateTo;
  render();
  await persistTrips();
}
async function setTripCategoryNote(tripId, category){
  const trip = state.trips.find(t=>t.id===tripId);
  if(!trip) return;
  const current = trip.categoryNotes?.[category] || '';
  const value = prompt(`Коментар до категорії «${category}» у поїздці «${trip.name}»:`, current);
  if(value===null) return;
  trip.categoryNotes = trip.categoryNotes || {};
  if(value.trim()) trip.categoryNotes[category] = value.trim();
  else delete trip.categoryNotes[category];
  render();
  await persistTrips();
}
// Trip of a transaction: an explicit choice wins ('none' = manually removed from any trip);
// Cover photo for a trip's total card, picked by the trip's name; no match → no image.
const TRIP_COVERS = [
  {match:/стамбул|istanbul/i, alt:'Стамбул — мечеть Султанахмет',
   src:'https://www.vash-otdyh.by/images/Blog/Turkey/Istanbul/%D0%9C%D0%B5%D1%87%D0%B5%D1%82%D1%8C_%D0%A1%D1%83%D0%BB%D1%82%D0%B0%D0%BD%D0%B0%D1%85%D0%BC%D0%B5%D1%82_%D0%B2_%D0%A1%D1%82%D0%B0%D0%BC%D0%B1%D1%83%D0%BB%D0%B5.jpg'},
  {match:/іспан|испан|spain|españa/i, alt:'Іспанія',
   src:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIEhuou_XZvNE2nK1idh_OYIbVGM6uCBsXB9zz1ivTSQ&s=10'},
];
function tripCoverHtml(name){
  const c = TRIP_COVERS.find(x=>x.match.test(name||''));
  return c ? `<img class="ms-trip-cover-image" src="${c.src}" alt="${c.alt}">` : '';
}
// otherwise it falls into the trip whose dates cover its (local) day. Narrowest range wins on overlap.
function tripIdFor(t){
  const v = state.tripOf[txKey(t)];
  if(v === 'none') return '';
  if(v) return state.trips.some(x=>x.id===v) ? v : '';
  const day = todayStr(t.date);
  let best = null, bestLen = Infinity;
  state.trips.forEach(tr=>{
    if(tr.dateFrom && tr.dateTo && day>=tr.dateFrom && day<=tr.dateTo){
      const len = new Date(tr.dateTo)-new Date(tr.dateFrom);
      if(len<bestLen){ best=tr; bestLen=len; }
    }
  });
  return best ? best.id : '';
}
async function assignTrip(key, tripId){
  state.tripOf[key] = tripId || 'none';
  render();
  await persistTrips();
}
function toggleDayExcluded(key, checked){
  if(checked) delete state.dayExcluded[key];
  else state.dayExcluded[key] = true;
  render();
  persistDayExcluded();
}
async function persistNotExpense(){ await storageSet('ms_notexpense', JSON.stringify(state.notExpense)); }
async function persistShare(){ await storageSet('ms_share', JSON.stringify(state.share)); }
async function setShare(key, fraction){
  if(!fraction || fraction>=1) delete state.share[key];
  else state.share[key] = Math.round(fraction*10000)/10000;
  render();
  await persistShare();
}
async function persistAmountOverride(){ await storageSet('ms_amountoverride', JSON.stringify(state.amountOverride)); }

// Monobank's own statistics nets a refund against its original charge (e.g. a Bolt
// ride charged then partially refunded shows as one adjusted trip, not two lines).
// This mirrors that for "Чисті трати": same description, a later opposite-sign
// transaction within 14 days that's no bigger than the original, gets netted in.
// Only affects "Чисті трати" — the raw list and "Загальна картина" stay untouched.
function autoNetRefunds(rawTxs){
  const byDesc = {};
  rawTxs.forEach(t=>{ (byDesc[t.desc] = byDesc[t.desc]||[]).push(t); });
  let changed = false;
  const GAP_MS = 14*24*60*60*1000;
  Object.values(byDesc).forEach(group=>{
    group.sort((a,b)=>a.date-b.date);
    const usedRefunds = new Set();
    group.forEach(expense=>{
      if(expense.amount >= 0) return; // only look for refunds against actual charges
      const key = txKey(expense);
      if(state.amountOverride[key] !== undefined) return; // already netted earlier
      const refund = group.find(r=>
        !usedRefunds.has(r) && r.amount > 0 &&
        r.date > expense.date && (r.date - expense.date) <= GAP_MS &&
        r.amount <= Math.abs(expense.amount) + 0.5
      );
      if(refund){
        usedRefunds.add(refund);
        state.amountOverride[key] = expense.amount + refund.amount; // still negative, just smaller
        changed = true;
      }
    });
  });
  if(changed) persistAmountOverride();
}
function toggleNotExpense(key, flagged){
  if(flagged) state.notExpense[key] = true;
  else delete state.notExpense[key];
  render();
  persistNotExpense();
}

const CUSTOM_CAT_PALETTE = ['#8C6FA8','#5C8C6E','#B88A4E','#4E7FA8','#A85C6E','#7F8C4E','#6E5CA8'];
function applyCustomCategory(c, addToList){
  if(!CATS.includes(c.name)) CATS.push(c.name);
  ICONS[c.name] = c.icon || '🏷️';
  if(!COLORS[c.name]) COLORS[c.name] = CUSTOM_CAT_PALETTE[state.customCats.length % CUSTOM_CAT_PALETTE.length];
  if(addToList) state.customCats.push(c);
}
async function addCustomCategory(name, icon){
  name = name.trim();
  if(!name || CATS.includes(name)) return false;
  applyCustomCategory({name, icon: icon.trim()}, true);
  await storageSet('ms_customcats', JSON.stringify(state.customCats));
  render();
  return true;
}
async function setNote(key, text){
  if(text===null) return; // user cancelled the prompt
  if(text.trim()==='') delete state.notes[key];
  else state.notes[key] = text.trim();
  render();
  await persistNotes();
}

const SPLIT_CATS = ['продукти спільні','розваги спільні'];
function noteButtonHandler(t, key, existingNote){
  let prefill = existingNote || '';
  if(!existingNote && SPLIT_CATS.includes(t.cat)){
    const nStr = prompt('На скільки осіб ділиш цю трату? (включно з тобою)', '2');
    const n = parseInt(nStr, 10);
    if(nStr!==null && n>0){
      const share = Math.abs(t.amount)/n;
      prefill = `${fmt(Math.abs(t.amount))} ${curSym()} всього на ${n}, моя частка ${fmt(share)} ${curSym()}, решта в Splitwise`;
    }
  }
  const val = prompt('Нотатка до цієї операції:', prefill);
  setNote(key, val);
}
async function persistDebts(){
  await storageSet('ms_debts', JSON.stringify(state.debts));
  await storageSet('ms_loankeys', JSON.stringify(state.loanKeys));
  await storageSet('ms_usedincoming', JSON.stringify(state.usedIncoming));
}

function exportData(){
  const payload = {
    overrides: state.overrides, manual: state.manual, debts: state.debts,
    loanKeys: state.loanKeys, usedIncoming: state.usedIncoming, notes: state.notes,
    customCats: state.customCats, notExpense: state.notExpense, dayExcluded: state.dayExcluded,
    amountOverride: state.amountOverride, txCategoryOverride: state.txCategoryOverride, share: state.share,
    txCache: state.txCache, trips: state.trips, tripOf: state.tripOf,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'monostat-data-'+todayStr()+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function importDataFromFile(file){
  const text = await file.text();
  const payload = JSON.parse(text);
  if(payload.overrides) state.overrides = payload.overrides;
  if(payload.manual) state.manual = payload.manual;
  if(payload.debts) state.debts = payload.debts;
  if(payload.loanKeys) state.loanKeys = payload.loanKeys;
  if(payload.usedIncoming) state.usedIncoming = payload.usedIncoming;
  if(payload.notes) state.notes = payload.notes;
  if(payload.notExpense) state.notExpense = payload.notExpense;
  if(payload.dayExcluded) state.dayExcluded = payload.dayExcluded;
  if(payload.amountOverride) state.amountOverride = payload.amountOverride;
  if(payload.share) state.share = {...state.share, ...payload.share};
  if(payload.txCategoryOverride) state.txCategoryOverride = payload.txCategoryOverride;
  if(payload.txCache) mergeIntoCache(payload.txCache); // dedup-merge, doesn't wipe what's already cached here
  if(payload.trips){
    const known = new Set(state.trips.map(t=>t.id));
    payload.trips.forEach(t=>{ if(!known.has(t.id)){ state.trips.push(t); known.add(t.id); } });
  }
  if(payload.tripOf) state.tripOf = {...state.tripOf, ...payload.tripOf};
  if(payload.customCats){
    payload.customCats.forEach(c=>{ if(!state.customCats.find(x=>x.name===c.name)) applyCustomCategory(c, true); });
  }
  Object.keys(state.overrides).forEach(desc=>{
    if(CATEGORY_RENAMES[state.overrides[desc]]) state.overrides[desc] = CATEGORY_RENAMES[state.overrides[desc]];
  });
  Object.keys(state.txCategoryOverride).forEach(key=>{
    if(CATEGORY_RENAMES[state.txCategoryOverride[key]]) state.txCategoryOverride[key] = CATEGORY_RENAMES[state.txCategoryOverride[key]];
  });
  state.manual.forEach(entry=>{
    if(CATEGORY_RENAMES[entry.cat]) entry.cat = CATEGORY_RENAMES[entry.cat];
  });
  await persistOverrides(); await persistManual(); await persistDebts(); await persistNotes();
  await persistNotExpense(); await persistDayExcluded(); await persistAmountOverride(); await persistTxCategoryOverride();
  await persistTrips();
  await storageSet('ms_customcats', JSON.stringify(state.customCats));
  render();
}

function txKey(t){
  const d = t.date instanceof Date ? t.date.toISOString().slice(0,16) : String(t.date);
  const a = t.fullAmount !== undefined ? t.fullAmount : t.amount; // key must not change when only my share is counted
  return `${d}|${t.desc}|${a}`;
}

const INCOMING_SELF_KEYWORDS = ['From UAH account','Cancellation','Скасування','Cashback withdrawal','Partial cash out','Top up','Bolt','Uber','Uklon'];
// Shared between Загальна картина and Подорожі netting — any positive amount matching
// these is a refund for something already counted as an expense, never real income.
const CANCELLATION_KEYWORDS_GLOBAL = ['Скасування','Cancellation'];
const REFUND_PRONE_MERCHANTS_GLOBAL = ['bolt','uber','uklon'];

function guessPersonName(desc){
  let d = desc.trim();
  if(d.startsWith('From:')) d = d.slice(5).trim();
  return d;
}

function markAsLoan(t){
  const person = prompt('Кому позика? (ім\'я для трекера боргів)', guessPersonName(t.desc));
  if(person===null) return;
  const debt = {
    id: 'd_'+Date.now(),
    person: person.trim() || guessPersonName(t.desc),
    amount: Math.abs(t.amount),
    remaining: Math.abs(t.amount),
    dateGiven: t.date instanceof Date ? todayStr(t.date) : t.date,
    status: 'open'
  };
  state.debts.push(debt);
  state.loanKeys[txKey(t)] = debt.id;
  persistDebts();
  render();
}

function closeDebtWithIncoming(debtId, incomingTx){
  const debt = state.debts.find(d=>d.id===debtId);
  if(!debt) return;
  const applyAmt = Math.min(debt.remaining, incomingTx.amount);
  debt.remaining = Math.round((debt.remaining - applyAmt)*100)/100;
  if(debt.remaining <= 0.5) debt.status = 'closed';
  state.usedIncoming[txKey(incomingTx)] = debtId;
  persistDebts();
  render();
}

function closeDebtManually(debtId){
  const debt = state.debts.find(d=>d.id===debtId);
  if(!debt) return;
  debt.remaining = 0;
  debt.status = 'closed';
  persistDebts();
  render();
}

function addManualDebt(person, amount, date){
  const debt = {id:'d_'+Date.now(), person, amount:Math.abs(amount), remaining:Math.abs(amount), dateGiven:date, status:'open', manual:true};
  state.debts.push(debt);
  persistDebts();
  render();
}

// Date + time for an actual transaction (not for date-range boundaries like trip
// start/end or the period selector, which only ever have a date, no real time).
function dtStr(d){
  const datePart = d.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'});
  const timePart = d.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'});
  return `<b>${datePart}</b> ${timePart}`;
}
function fmt(n){
  return new Intl.NumberFormat('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(n));
}
const CURRENCY_SYMBOLS = {980:'₴', 978:'€', 840:'$', 985:'zł', 946:'lei', 975:'лв', 826:'£', 203:'Kč', 348:'Ft', 949:'₺', 498:'MDL', 756:'CHF', 578:'kr', 752:'kr', 208:'kr'};
// Approximate rates to EUR, as of July 2026 (NBU-ish) — for a rough "how much is this in
// euros" reference only, not for anything financial/official. Update manually if it drifts a lot.
const TO_EUR_RATE = {980:1/51, 978:1, 840:1/1.16, 985:1/4.35, 946:1/5.22, 975:1/1.956, 826:1.17, 203:1/25.1, 348:1/408, 949:1/40.6, 498:1/20.1, 756:1.07, 578:1/11.9, 752:1/11.2, 208:1/7.46, 981:1/2.9};
function toEur(amount, currencyCode){
  const rate = TO_EUR_RATE[currencyCode];
  if(!rate) return null;
  return Math.abs(amount) * rate;
}
function fmtEur(amount, currencyCode){
  const eur = toEur(amount, currencyCode);
  return eur===null ? '' : ` (~${eur.toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2})} €)`;
}
function curSym(){
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  return CURRENCY_SYMBOLS[acc ? acc.currency : 980] || '₴';
}
function curCode(){
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  return acc ? acc.currency : 980;
}
const MONO_RATES_CACHE_KEY = 'monostat_public_currency_rates';
const MONO_RATES_CACHE_MS = 60*1000;
let monoCurrencyRates = null;
let monoCurrencyRatesFetchedAt = 0;
let monoCurrencyRatesRequest = null;

async function loadMonobankCurrencyRates(){
  if(monoCurrencyRates && Date.now()-monoCurrencyRatesFetchedAt < MONO_RATES_CACHE_MS) return monoCurrencyRates;
  if(monoCurrencyRatesRequest) return monoCurrencyRatesRequest;

  monoCurrencyRatesRequest = (async()=>{
    let cached = null;
    try{
      cached = JSON.parse(localStorage.getItem(MONO_RATES_CACHE_KEY)||'null');
      if(cached && Array.isArray(cached.items)){
        monoCurrencyRates = cached.items;
        monoCurrencyRatesFetchedAt = cached.fetchedAt||0;
        if(Date.now()-monoCurrencyRatesFetchedAt < MONO_RATES_CACHE_MS) return monoCurrencyRates;
      }
    }catch(e){ /* ignore unavailable or invalid local cache */ }

    try{
      const response = await fetch('https://api.monobank.ua/bank/currency', {cache:'no-store'});
      if(!response.ok) throw new Error(`Monobank returned HTTP ${response.status}`);
      const items = await response.json();
      if(!Array.isArray(items) || !items.length) throw new Error('Empty Monobank currency rates');
      monoCurrencyRates = items;
      monoCurrencyRatesFetchedAt = Date.now();
      try{ localStorage.setItem(MONO_RATES_CACHE_KEY, JSON.stringify({items, fetchedAt:monoCurrencyRatesFetchedAt})); }catch(e){ /* memory cache still works */ }
      return items;
    }catch(error){
      console.warn('Could not load Monobank currency rates:', error);
      return cached && Array.isArray(cached.items) ? cached.items : monoCurrencyRates;
    }
  })();

  try{return await monoCurrencyRatesRequest;}
  finally{monoCurrencyRatesRequest = null;}
}

function currencyRateBetween(items, fromCode, toCode){
  const from = Number(fromCode), to = Number(toCode);
  if(from===to) return 1;
  const graph = new Map();
  (items||[]).forEach(item=>{
    const a = Number(item.currencyCodeA), b = Number(item.currencyCodeB);
    const buy = Number(item.rateBuy), sell = Number(item.rateSell), cross = Number(item.rateCross);
    const rate = Number.isFinite(buy)&&buy>0&&Number.isFinite(sell)&&sell>0 ? (buy+sell)/2
      : (Number.isFinite(cross)&&cross>0 ? cross : null);
    if(!rate) return;
    if(!graph.has(a)) graph.set(a, []);
    if(!graph.has(b)) graph.set(b, []);
    graph.get(a).push([b,rate]);
    graph.get(b).push([a,1/rate]);
  });
  const queue = [[from,1]], visited = new Set([from]);
  while(queue.length){
    const [code,rate] = queue.shift();
    if(code===to) return rate;
    (graph.get(code)||[]).forEach(([next,nextRate])=>{
      if(!visited.has(next)){ visited.add(next); queue.push([next,rate*nextRate]); }
    });
  }
  return null;
}

async function monobankEurRate(currencyCode){
  const rates = await loadMonobankCurrencyRates();
  return currencyRateBetween(rates, currencyCode||980, 978);
}
function todayStr(d){
  const dt = d || new Date();
  // local date components, not toISOString() (which converts to UTC and quietly
  // shifts the date back a day for anyone east of UTC, like Kyiv/Bucharest)
  const y = dt.getFullYear();
  const m = String(dt.getMonth()+1).padStart(2,'0');
  const day = String(dt.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function daysAgoStr(n){
  const dt = new Date(); dt.setDate(dt.getDate()-n);
  return todayStr(dt);
}

// Her budgeting month runs 10th-to-10th (payday). If today is already past the 10th,
// the current period started this month; otherwise it started the 10th of last month.
function defaultPeriodStart(){
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getDate() >= 10 ? now.getMonth() : now.getMonth()-1;
  const dt = new Date(year, month, 10);
  return todayStr(dt);
}

// The next 10th (payday) — her period always ends the day before this.
function nextPeriodBoundary(fromDateStr){
  const now = fromDateStr ? new Date(fromDateStr+'T00:00:00') : new Date();
  const year = now.getFullYear();
  const month = now.getDate() >= 10 ? now.getMonth()+1 : now.getMonth();
  return new Date(year, month, 10);
}
function daysUntilPeriodEnd(fromDateStr){
  const now = fromDateStr ? new Date(fromDateStr+'T00:00:00') : new Date();
  now.setHours(0,0,0,0);
  const boundary = nextPeriodBoundary(fromDateStr); boundary.setHours(0,0,0,0);
  // +1 because both endpoints count as full days (today AND the 10th itself),
  // not just the number of nights between them
  return Math.max(1, Math.round((boundary.getTime()-now.getTime())/(24*60*60*1000)) + 1);
}

function daysUntilDateInclusive(endDateStr){
  const start = todayStr().split('-').map(Number);
  const end = (endDateStr||todayStr()).split('-').map(Number);
  const startUtc = Date.UTC(start[0], start[1]-1, start[2]);
  const endUtc = Date.UTC(end[0], end[1]-1, end[2]);
  return Math.max(1, Math.floor((endUtc-startUtc)/86400000)+1);
}

// Monobank gives a `balance` field on every transaction — the balance AFTER that
// operation. That means the balance at the START of any past day can be reconstructed
// from the cache, instead of only ever knowing "right now". Best-effort: find the
// earliest cached transaction on/after that date and back out its own amount.
function reconstructBalanceAtStartOfDay(dateStr){
  const sorted = [...accCache()].sort((a,b)=>a.time-b.time);
  const dayStartUnix = Math.floor(new Date(dateStr+'T00:00:00').getTime()/1000);
  const firstOnOrAfter = sorted.find(it=>it.time >= dayStartUnix && it.balance!==undefined);
  if(firstOnOrAfter) return (firstOnOrAfter.balance - firstOnOrAfter.amount)/100;
  const lastBefore = [...sorted].reverse().find(it=>it.time < dayStartUnix && it.balance!==undefined);
  if(lastBefore) return lastBefore.balance/100;
  return null; // no data that far back — caller should fall back to live balance
}

// ---------- API ----------
async function fetchClientInfo(token){
  // no state.lastApiCall here: Monobank limits each endpoint separately, and that timer
  // only paces statement requests (runSync) — a 429 there is retried anyway
  const res = await fetch('https://api.monobank.ua/personal/client-info', {headers:{'X-Token':token}});
  if(!res.ok) throw new Error('HTTP '+res.status);
  return res.json();
}
async function fetchStatement(token, account, fromUnix, toUnix){
  state.lastApiCall = Date.now();
  const url = `https://api.monobank.ua/personal/statement/${account}/${fromUnix}/${toUnix}`;
  const res = await fetch(url, {headers:{'X-Token':token}});
  if(!res.ok) throw new Error('HTTP '+res.status);
  return res.json();
}

function mapAccounts(info){
  return (info.accounts||[]).map(a=>({
    id:a.id, pan: (a.maskedPan&&a.maskedPan[0])||(a.iban||'').slice(-6), type:a.type,
    currency:a.currencyCode, balance:a.balance
  }));
}

// ---------- instant start ----------
// With a remembered token there is nothing to ask on a return visit: the dashboard opens
// straight from the cached history, and fresh data is fetched in the background. For that
// the last card list + chosen card are remembered next to the token — in this browser
// only, never in Supabase — and tied to the signed-in user.
const ACCOUNTS_SNAPSHOT_KEY = 'monostat_ms_accounts';
function saveAccountsSnapshot(){
  if(IS_DEMO || !authUserId || !state.rememberToken || !state.selectedAccount) return;
  try{
    localStorage.setItem(ACCOUNTS_SNAPSHOT_KEY, JSON.stringify({userId:authUserId, accounts:state.accounts, selectedAccount:state.selectedAccount}));
  }catch(e){ /* storage unavailable — next visit just goes through the steps again */ }
}
function loadAccountsSnapshot(){
  try{
    const snap = JSON.parse(localStorage.getItem(ACCOUNTS_SNAPSHOT_KEY)||'null');
    if(!snap || snap.userId!==authUserId || !Array.isArray(snap.accounts)) return null;
    if(!snap.accounts.some(a=>a.id===snap.selectedAccount)) return null;
    return snap;
  }catch(e){ return null; }
}
function clearAccountsSnapshot(){
  try{ localStorage.removeItem(ACCOUNTS_SNAPSHOT_KEY); }catch(e){}
}

// Called once saved data is loaded (page open or sign-in).
function autoStart(){
  if(!state.token.trim() || !state.rememberToken){ render(); return; }
  const snap = loadAccountsSnapshot();
  if(!snap){ handleConnect(); return; } // new browser: one request for the card list, then straight to the dashboard
  state.accounts = snap.accounts;
  state.selectedAccount = snap.selectedAccount;
  openDashboard();
}
// Dashboard for the selected card: current period from the cache at once, fresh data in the background.
function openDashboard(info){
  state.viewTab = 'current';
  state.step = 'results';
  state.cardPickerOpen = false;
  refreshCurrentView(); // no request, no waiting
  render();
  refreshInBackground({info});
}
// The last chosen card is remembered in the account (so it follows her to another device)
// and in this browser's snapshot (so the next visit needs no request before showing anything).
function rememberSelectedAccount(){
  if(!state.selectedAccount) return;
  saveAccountsSnapshot();
  if(state.lastAccountId !== state.selectedAccount){
    state.lastAccountId = state.selectedAccount;
    storageSet('ms_selectedaccount', state.selectedAccount);
  }
}
// Card switch right on the dashboard: shows this card's cached operations, then refreshes.
function switchAccount(id){
  state.cardPickerOpen = false;
  if(id===state.selectedAccount || !state.accounts.some(a=>a.id===id)){ render(); return; }
  state.selectedAccount = id;
  rememberSelectedAccount();
  state.viewTab = 'current'; state.viewRange = null;
  state.autoSyncDone = false; // this card's recent history gets its own check
  refreshCurrentView();       // what is already known to be this card's — at once
  render();
  refreshInBackground({skipInfo:true});
}

// Fresh balance + current-period statement, without blocking what is already on screen.
let refreshRun = 0;
async function refreshInBackground(opts){
  const info = opts && opts.info;       // card list already fetched a moment ago — don't ask twice
  const skipInfo = !!(opts && opts.skipInfo); // card switch: the list is on screen, and client-info has its own once-a-minute limit
  const retried = !!(opts && opts.retried);
  const run = ++refreshRun;             // a newer run (card switched meanwhile) makes this one stale
  const token = state.token.trim();
  const account = state.selectedAccount;
  const from = state.from, to = state.to;
  state.refresh = {status:'loading', msg:'', code:''};
  updateRefreshNote();
  const fromUnix = Math.floor(new Date(from+'T00:00:00').getTime()/1000);
  const toUnix = Math.floor(new Date(to+'T23:59:59').getTime()/1000);
  const [infoRes, stRes] = await Promise.allSettled([
    info || skipInfo ? Promise.resolve(info||null) : fetchClientInfo(token),
    fetchStatement(token, account, fromUnix, toUnix)
  ]);
  if(run !== refreshRun) return;
  // she may have changed the card/period (or signed out) while the requests were running
  const stillSame = state.step==='results' && state.selectedAccount===account && state.from===from && state.to===to && !!authUserId;
  if(infoRes.status==='fulfilled' && infoRes.value){
    const accounts = mapAccounts(infoRes.value);
    if(stillSame && accounts.some(a=>a.id===account)){ state.accounts = accounts; saveAccountsSnapshot(); }
  }
  if(stRes.status==='fulfilled'){
    const items = stRes.value;
    mergeIntoCache(items, account);
    if(items.length < 500){
      reconcileRange(account, fromUnix, toUnix, items);
      addSyncedRange(fromUnix, Math.min(toUnix, Math.floor(Date.now()/1000)), account);
    }
    if(stillSame){
      if(items.length < 500) ingestTransactions(items);
      else refreshCurrentView(); // response capped at 500 — show the cache, autoSync fetches the rest
      await updateJarAccumulation();
    }
  }
  const failed = [infoRes, stRes].find(r=>r.status==='rejected');
  if(!failed){
    state.refresh = {status:'ok', msg:'Оновлено о '+new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'}), code:''};
  }else{
    const m = String(failed.reason && failed.reason.message || failed.reason);
    const code = m.includes('403') ? 'token' : m.includes('429') ? 'limit' : 'network';
    const msg = code==='token' ? 'Monobank не прийняв токен — показую збережені дані.'
      : code==='limit' ? (retried ? 'Monobank дозволяє оновлення раз на хвилину — спробуй трохи пізніше.' : 'Monobank дозволяє оновлення раз на хвилину — оновлю сама за хвилину.')
      : 'Не вдалося оновити (немає зв\'язку?) — показую збережені дані.';
    state.refresh = {status:'error', msg, code};
  }
  if(!stillSame) return;
  render();
  if(state.refresh.code==='limit'){
    // asked too soon (page reopened or card switched within a minute) — one automatic retry
    if(!retried) setTimeout(()=>{ if(run===refreshRun && state.step==='results') refreshInBackground({retried:true}); }, 61000);
  }else if(state.refresh.code!=='token'){
    setTimeout(autoSync, 0); // fills the tail / recent holes, waiting out the rate limit itself
  }
}
function refreshNoteHtml(){
  const r = state.refresh;
  if(r.status==='loading') return '<span class="ms-spin"></span>Оновлюю дані з Monobank…';
  if(r.status==='ok') return escapeHtml(r.msg);
  if(r.status==='error') return `<span style="color:var(--rust)">${escapeHtml(r.msg)}</span> <button class="ms-icon-btn" id="refreshRetryBtn" style="text-decoration:underline">Повторити</button>${r.code==='token' ? ' <button class="ms-icon-btn" id="refreshTokenBtn" style="text-decoration:underline">Змінити токен</button>' : ''}`;
  return '';
}
function bindRefreshNote(el){
  el.querySelector('#refreshRetryBtn')?.addEventListener('click', ()=>refreshInBackground());
  el.querySelector('#refreshTokenBtn')?.addEventListener('click', ()=>{ state.step='connect'; render(); });
}
// targeted update — a full render() here would reset whatever she is doing on the page
function updateRefreshNote(){
  const el = document.getElementById('refreshNote');
  if(!el) return;
  el.innerHTML = refreshNoteHtml();
  bindRefreshNote(el);
}

async function handleConnect(){
  state.error = null;
  state.loading = true; render();
  try{
    const info = await fetchClientInfo(state.token.trim());
    state.accounts = mapAccounts(info);
    // default to her main card by mask; falls back to the first account if it's not found
    const DEFAULT_PAN = '444111******0137';
    const preferred = state.accounts.find(a=>a.pan===DEFAULT_PAN);
    state.selectedAccount = (preferred || state.accounts[0])?.id || null;
    state.step = 'accounts';
    if(state.rememberToken) await storageSet('ms_token', state.token.trim());
    // The card she used last time (or the only one there is) opens right away — the card
    // list is on the dashboard itself. Only a first-ever choice between several cards is asked.
    const last = state.accounts.find(a=>a.id===state.lastAccountId);
    const known = last || (state.accounts.length===1 ? state.accounts[0] : null);
    if(known){
      state.selectedAccount = known.id;
      if(!state.from) state.from = defaultPeriodStart();
      if(!state.to) state.to = todayStr();
      rememberSelectedAccount();
      state.loading = false;
      openDashboard(info);
      return;
    }
  }catch(e){
    state.error = 'connect';
  }
  state.loading = false; render();
}

// Demo (demo.html only): loads window.DEMO_TXS/DEMO_META into memory. All dates are shifted
// by whole days so the demo period always ends today and "Сьогодні/Вчора" have data.
function startDemo(){
  const m = window.DEMO_META || {};
  const raw = window.DEMO_TXS || [];
  const dayShift = Math.round((new Date(todayStr()+'T12:00:00') - new Date((m.periodTo||todayStr())+'T12:00:00'))/864e5);
  const sec = dayShift*86400;
  const shiftDay = s => { if(!s) return s; const d = new Date(s+'T12:00:00'); d.setDate(d.getDate()+dayShift); return todayStr(d); };
  const shiftKeys = obj => {
    const r = {};
    Object.entries(obj||{}).forEach(([k,v])=>{
      const i = k.indexOf('|');
      const d = new Date(k.slice(0,i)+':00Z');
      r[isNaN(d) ? k : new Date(d.getTime()+sec*1000).toISOString().slice(0,16)+k.slice(i)] = v;
    });
    return r;
  };
  state.txCache = raw.map(t=>({...t, time: t.time+sec}));
  state.overrides = {...state.overrides, ...(m.overrides||{})};
  (m.customCats||[]).forEach(c=>applyCustomCategory(c, true));
  state.txCategoryOverride = shiftKeys(m.txCategoryOverride);
  state.notExpense = shiftKeys(m.notExpense);
  state.dayExcluded = shiftKeys(m.dayExcluded);
  state.amountOverride = shiftKeys(m.amountOverride);
  state.share = shiftKeys(m.share);
  state.tripOf = shiftKeys(m.tripOf);
  state.trips = (m.trips||[]).map(t=>({...t, dateFrom: shiftDay(t.dateFrom), dateTo: shiftDay(t.dateTo)}));
  state.manual = (m.manual||[]).map(x=>({...x, date: shiftDay(x.date)}));
  state.notes = {}; state.debts = []; state.loanKeys = {}; state.usedIncoming = {};
  state.from = shiftDay(m.periodFrom) || defaultPeriodStart();
  state.to = todayStr();
  const lastBal = state.txCache.length ? state.txCache.reduce((a,b)=>a.time>b.time?a:b).balance : 0;
  state.accounts = [{id:'demo', pan:'5375 •••• •••• 0000', type:'black', currency:980, balance:lastBal}];
  state.selectedAccount = 'demo';
  const fromMs = new Date(state.from+'T00:00:00').getTime();
  state.txs = state.txCache.filter(t=>t.time*1000>=fromMs).map(mapRawItem);
  state.autoSyncDone = true; // never call the Monobank API from the demo
  // "Скільки можна витрачати на день": in the demo spread the balance until the coming 20th
  const t20 = new Date(); if(t20.getDate() >= 20) t20.setMonth(t20.getMonth()+1); t20.setDate(20);
  state.dailyBudgetEndDate = todayStr(t20);
  state.authChecking = false;
  state.initialLoading = false;
  state.step = 'results';
  render();
}

async function handleFetchStatement(){
  state.error = null;
  state.loading = true; render();
  try{
    const fromUnix = Math.floor(new Date(state.from+'T00:00:00').getTime()/1000);
    const toUnix = Math.floor(new Date(state.to+'T23:59:59').getTime()/1000);
    const account = state.selectedAccount;
    const items = await fetchStatement(state.token.trim(), account, fromUnix, toUnix);
    mergeIntoCache(items, account);
    if(items.length < 500){
      reconcileRange(account, fromUnix, toUnix, items);
      addSyncedRange(fromUnix, Math.min(toUnix, Math.floor(Date.now()/1000)), account);
    }
    ingestTransactions(items);
    state.viewTab = 'current';
    state.step = 'results';
    state.refresh = {status:'ok', msg:'Оновлено о '+new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'}), code:''};
    rememberSelectedAccount(); // next visit opens straight on the dashboard with this card
    await updateJarAccumulation(); // finish this BEFORE the first render of results, no stale flash
  }catch(e){
    state.error = 'statement';
  }
  state.loading = false; render();
  if(state.step==='results') setTimeout(autoSync, 0);
}

function mapRawItem(it){
  return {
    id: it.id, date: new Date(it.time*1000), desc: (it.description||'(без опису)').trim(),
    mcc: it.mcc, amount: it.amount/100, currency: it.currencyCode,
    // `amount` is always in the ACCOUNT's currency (UAH for her card) — `operationAmount`
    // is the true figure in whatever currency the operation actually happened in
    // (`currency` describes THIS, not `amount`). Needed for e.g. grouping a foreign
    // subscription by its stable original price instead of its UAH-equivalent, which
    // drifts slightly with the exchange rate from charge to charge.
    operationAmount: it.operationAmount!==undefined ? it.operationAmount/100 : it.amount/100,
    // text typed in the Monobank app for this operation (the API's `comment` field), if any
    bankComment: it.comment ? String(it.comment).trim() : '',
    // cashback the bank credited for this operation, in the account's currency (API `cashbackAmount`, minor units)
    cashback: it.cashbackAmount ? it.cashbackAmount/100 : 0
  };
}
// Only my part of a shared payment counts everywhere (totals, categories, trips, charts).
// The real card amount stays in fullAmount, and txKey keeps using it.
function applyShare(t){
  const f = state.share[txKey(t)];
  if(!f || f>=1 || t.amount>=0) return t;
  return {...t, fullAmount: t.amount, amount: t.amount*f, share: f};
}
function ingestTransactions(items){
  state.txs = items.map(mapRawItem);
}

// Full-history expenses (across every period ever cached, not just what's currently
// loaded/shown) — used for "Подорожі", since a trip's purchases can span months and
// she shouldn't have to keep the exact right period loaded just to tag them.
function getAllHistoricalExpenses(){
  const fromCache = accCache()
    .map(mapRawItem)
    .filter(t=>t.amount<0 && !state.loanKeys[txKey(t)])
    .map(t=>applyShare({...t, cat: categoryFor(t)}));
  const fromManual = state.manual
    .filter(m=>m.amount<0)
    .map(m=>({date:new Date(m.date), desc:m.desc, amount:m.amount, cat:m.cat, manual:true}));
  return fromCache.concat(fromManual);
}

// Previous-month tab reads straight from the local cache — no API call. If that month
// was never fetched before, the cache simply won't have it (shown as an empty state).
function getPrevMonthRange(){
  if(state.viewRange) return {start:new Date(state.viewRange.start), end:new Date(state.viewRange.end)};
  // aligned to her actual budgeting cycle — ends ON the 10th itself (state.from), starts
  // exactly one month earlier
  const base = state.from ? new Date(state.from+'T00:00:00') : new Date();
  const prevEnd = new Date(base);
  const prevStart = new Date(base.getFullYear(), base.getMonth()-1, base.getDate());
  return {start: prevStart, end: prevEnd};
}
function getActiveRawTxs(){
  if(state.viewTab !== 'previous') return state.txs;
  const {start, end} = getPrevMonthRange();
  end.setHours(23,59,59,999);
  return accCache()
    .filter(it=>{ const d = it.time*1000; return d >= start.getTime() && d <= end.getTime(); })
    .map(mapRawItem);
}

function parseManualJson(){
  try{
    const items = JSON.parse(state.manualJsonText);
    ingestTransactions(items);
    state.step = 'results';
    state.error = null;
  }catch(e){
    state.error = 'json';
  }
  render();
}

// ---------- rendering ----------
function render(){
  const app = document.getElementById('app');
  app.innerHTML = '';
  if(IS_DEMO){
    if(state.step!=='results') return;
    const banner = document.createElement('div');
    banner.className = 'ms-demo-banner';
    banner.innerHTML = '<span><b>Демо-версія.</b> Реальна структура витрат за місяць, суми змінені на ±15%, імена замінені. Нічого не зберігається.</span>';
    app.appendChild(banner);
    app.appendChild(resultsPanel());
    return;
  }
  if(state.authChecking){
    app.appendChild(authCheckingPanel());
  }else if(!authUserId){
    app.appendChild(authPanel());
  }else{
    if(state.step==='connect') app.appendChild(connectPanel());
    if(state.step==='accounts') app.appendChild(accountsPanel());
    if(state.step==='results'){
      app.appendChild(resultsPanel());
    }
  }
  updateSignOutSlot();
}

function authCheckingPanel(){
  const p = document.createElement('div');
  p.className = 'ms-panel';
  p.innerHTML = `<p class="ms-hint"><span class="ms-spin"></span> Перевіряю вхід…</p>`;
  return p;
}

function authPanel(){
  const p = document.createElement('div');
  p.className = 'ms-panel';
  p.innerHTML = `
    <h2>Вхід</h2>
    <p class="ms-hint">Дані тепер прив'язані до твого акаунту — без входу їх ніхто (навіть ти з іншого пристрою без входу) не побачить.</p>
    <div class="ms-row">
      <div class="ms-field"><label>Email</label><input type="email" id="authEmail" placeholder="you@example.com"></div>
      <div class="ms-field"><label>Пароль</label><input type="password" id="authPassword" placeholder="••••••••"></div>
    </div>
    <label class="ms-checkline" style="margin-top:8px">
      <input type="checkbox" id="rememberLoginChk" ${rememberLogin?'checked':''}>
      <span>Запам'ятати мене на цьому пристрої (інакше вийдеш автоматично, коли закриєш вкладку)</span>
    </label>
    <div class="ms-row" style="margin-top:10px">
      <button class="ms-btn" id="authSignInBtn">Увійти</button>
      <button class="ms-btn secondary" id="authSignUpBtn">Створити акаунт (перший раз)</button>
    </div>
    <button class="ms-icon-btn" id="forgotPasswordBtn" style="margin-top:8px;opacity:.8;text-decoration:underline">Забула пароль?</button>
    ${state.authError ? `<div class="ms-error">${escapeHtml(state.authError)}</div>` : ''}
    ${state.authNotice ? `<p class="ms-hint" style="color:var(--teal)">${escapeHtml(state.authNotice)}</p>` : ''}
    <p class="ms-hint" style="margin-top:14px"><a href="https://api.monobank.ua/" target="_blank" rel="noopener noreferrer" style="color:var(--gold);text-decoration:none">Отримати токен Monobank ↗</a></p>
  `;
  const doAuth = async (fn)=>{
    const email = p.querySelector('#authEmail').value.trim();
    const password = p.querySelector('#authPassword').value;
    const remember = p.querySelector('#rememberLoginChk').checked;
    if(!email || !password){ state.authError = 'Впиши email і пароль.'; render(); return; }
    state.authNotice = null;
    const { error } = await fn(email, password, remember);
    if(error){ state.authError = error.message; render(); return; }
    state.authError = null;
    await loadPersisted();
    if(!state.from) state.from = defaultPeriodStart(); // was missing — caused NaN/NaN in the statement URL
    if(!state.to) state.to = todayStr();
    state.initialLoading = false;
    autoStart();
  };
  p.querySelector('#authSignInBtn').addEventListener('click', ()=>doAuth(signIn));
  p.querySelector('#authSignUpBtn').addEventListener('click', ()=>doAuth(signUp));
  p.querySelector('#forgotPasswordBtn').addEventListener('click', async ()=>{
    const email = p.querySelector('#authEmail').value.trim();
    if(!email){ state.authError = 'Впиши email вище, потім тисни «Забула пароль?».'; render(); return; }
    const { error } = await requestPasswordReset(email);
    state.authError = error ? error.message : null;
    state.authNotice = error ? null : `Лист для скидання пароля надіслано на ${email} — перевір пошту (і теку «Спам»).`;
    render();
  });
  return p;
}

// Header text and footer note are static — they now live directly in index.html and
// are never rebuilt. Only the sign-out button is dynamic (depends on auth state), so
// it gets its own tiny targeted update instead of the whole header being torn down
// and rebuilt on every single render() call.
function updateSignOutSlot(){
  const slot = document.getElementById('ms-signout-slot');
  if(!slot) return;
  if(!authUserId){ slot.innerHTML = ''; return; }
  const initial = (authUserEmail||'?').trim()[0]?.toUpperCase() || '?';
  slot.innerHTML = `
    <span class="ms-header-email">${escapeHtml(authUserEmail||'')}</span>
    <div class="ms-avatar" title="Профіль (фото — пізніше)">${initial}</div>
    <button class="ms-btn secondary" id="signOutBtn">Вийти</button>
  `;
  const signOutBtn = slot.querySelector('#signOutBtn');
  if(signOutBtn) signOutBtn.addEventListener('click', async ()=>{ await signOutAuth(); render(); });
}

function connectPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  p.innerHTML = `
    <h2>Крок 1 · Підключення</h2>
    ${state.initialLoading ? `<p class="ms-hint"><span class="ms-spin"></span> Завантажую збережені дані…</p>` : ''}
    <p class="ms-hint">Отримай токен на <a href="https://api.monobank.ua/" target="_blank" rel="noopener noreferrer" style="color:var(--gold)">офіційному сайті Monobank ↗</a> (авторизація через QR у застосунку). Токен потрібен лише для читання даних і його можна відкликати в Monobank.</p>
    <p class="ms-hint">Токен надсилається напряму з браузера до Monobank і не зберігається в Supabase. Якщо ввімкнути «Запам'ятати», він залишиться лише в локальному сховищі цього браузера; вимкни опцію, щоб не зберігати його після завершення сесії. Використовуй токен лише на своєму пристрої.</p>
    <div class="ms-row">
      <div class="ms-field" style="flex:2">
        <label>Особистий токен</label>
        <input type="password" id="tokenInput" placeholder="u3AulkpZFI1lIu..." value="${escapeHtml(state.token)}" ${state.initialLoading?'disabled':''}>
      </div>
      <button class="ms-btn" id="connectBtn" ${state.loading||state.initialLoading?'disabled':''}>${state.loading?'<span class="ms-spin"></span>Підключення…':'Підключити'}</button>
    </div>
    <label class="ms-checkline">
      <input type="checkbox" id="rememberChk" ${state.rememberToken?'checked':''}>
      <span>Запам'ятати токен у локальному сховищі цього браузера, щоб не вводити щоразу.</span>
    </label>
    ${state.error==='connect' ? `<div class="ms-error">Не вдалося підключитися. Або токен невірний, або (найімовірніше) браузер заблокував запит через CORS — Monobank API не завжди дозволяє звертання напряму з чужих сторінок.<br><br>Запасний варіант: відкрий у новій вкладці <code>https://api.monobank.ua/personal/client-info</code> з заголовком <code>X-Token</code> (наприклад через розширення на кшталт "Requestly" чи через термінал: <code>curl -H "X-Token: ТВІЙ_ТОКЕН" https://api.monobank.ua/personal/statement/0/UNIX_FROM/UNIX_TO</code>), скопіюй відповідь і встав нижче.</div>
    <button class="ms-btn secondary" id="jsonModeBtn" style="margin-top:10px">Вставити дані вручну (JSON)</button>` : ''}
    ${state.manualJsonMode ? manualJsonBlock() : ''}
    <p class="ms-hint" style="margin-top:16px">Хочеш спершу подивитися, як це виглядає? <a href="demo.html" style="color:var(--gold)">Відкрити демо-версію →</a></p>
  `;
  p.querySelector('#tokenInput').addEventListener('input', e=>state.token=e.target.value);
  p.querySelector('#rememberChk').addEventListener('change', async e=>{
    state.rememberToken = e.target.checked;
    if(state.rememberToken && state.token.trim()){
      await storageSet('ms_token', state.token.trim());
    }else if(!state.rememberToken){
      await storageSet('ms_token', '');
      clearAccountsSnapshot();
    }
  });
  p.querySelector('#connectBtn').addEventListener('click', handleConnect);
  const jbtn = p.querySelector('#jsonModeBtn');
  if(jbtn) jbtn.addEventListener('click', ()=>{state.manualJsonMode=true; render();});
  const jarea = p.querySelector('#manualJsonArea');
  if(jarea) jarea.addEventListener('input', e=>state.manualJsonText=e.target.value);
  const jsub = p.querySelector('#manualJsonSubmit');
  if(jsub) jsub.addEventListener('click', parseManualJson);
  return p;
}

function manualJsonBlock(){
  return `
    <div style="margin-top:14px">
      <div class="ms-field">
        <label>Вставлений JSON виписки (масив об'єктів із полями description, mcc, amount, time)</label>
        <textarea id="manualJsonArea" rows="6" style="background:var(--bg);border:1px solid var(--line);color:var(--text);border-radius:8px;padding:10px;font-family:var(--font-mono);font-size:12px;">${escapeHtml(state.manualJsonText)}</textarea>
      </div>
      ${state.error==='json' ? '<div class="ms-error">Не вдалося розпізнати JSON — перевір, що це саме масив операцій, скопійований повністю.</div>':''}
      <button class="ms-btn" id="manualJsonSubmit" style="margin-top:10px">Показати статистику</button>
    </div>
  `;
}

function accountsPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  const currNames = {980:'UAH',978:'EUR',840:'USD',985:'PLN',946:'RON'};
  p.innerHTML = `
    <h2>Крок 2 · Обери картку та період</h2>
    <p class="ms-hint">Знайдено ${state.accounts.length} рахунків/карток.</p>
    <div class="ms-accounts" id="accList"></div>
    <div class="ms-row" style="margin-top:16px">
      <div class="ms-field"><label>З дати</label><input type="date" id="fromInput" value="${state.from||defaultPeriodStart()}"></div>
      <div class="ms-field"><label>По дату</label><input type="date" id="toInput" value="${state.to||todayStr()}"></div>
      <button class="ms-btn" id="loadBtn" ${state.loading?'disabled':''}>${state.loading?'<span class="ms-spin"></span>Завантаження…':'Завантажити виписку'}</button>
    </div>
    <p class="ms-hint" style="margin-top:8px">Максимум — 31 доба за раз (обмеження API).</p>
    <p class="ms-hint">У кеші зараз ${state.txCache.length} операцій з минулих завантажень — після завантаження нового періоду попередній місяць можна буде глянути окремою вкладкою «Попередній місяць», без нового запиту.</p>
    ${state.txCache.length ? `<button class="ms-btn secondary" id="clearCacheBtn" style="margin-top:10px">Очистити кеш (${state.txCache.length} оп.)</button>` : ''}
    <button class="ms-btn secondary" id="changeTokenBtn" style="margin-top:10px">Змінити токен</button>
    ${state.error==='statement' ? '<div class="ms-error">Не вдалося отримати виписку. Перевір період (не більше 31 дня) і що з моменту підключення пройшло хоч трохи часу — API дозволяє один запит на 60 секунд.</div>':''}
  `;
  const list = p.querySelector('#accList');
  state.accounts.forEach(a=>{
    const row = document.createElement('div');
    row.className = 'ms-account'+(a.id===state.selectedAccount?' selected':'');
    row.innerHTML = `<span>${a.type} · ${currNames[a.currency]||a.currency}</span><span class="pan">${a.pan}</span>`;
    row.addEventListener('click', ()=>{state.selectedAccount=a.id; render();});
    list.appendChild(row);
  });
  p.querySelector('#fromInput').addEventListener('input', e=>state.from=e.target.value);
  p.querySelector('#toInput').addEventListener('input', e=>state.to=e.target.value);
  p.querySelector('#loadBtn').addEventListener('click', handleFetchStatement);
  p.querySelector('#changeTokenBtn').addEventListener('click', ()=>{state.step='connect'; render();});
  const clearBtn = p.querySelector('#clearCacheBtn');
  if(clearBtn) clearBtn.addEventListener('click', ()=>{
    if(confirm('Очистити весь локальний кеш минулих періодів? Дію не можна скасувати (але сама виписка на сервері Monobank нікуди не дінеться — можна буде завантажити знову).')) clearTxCache();
  });
  return p;
}

function rangePanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  const {start, end} = getPrevMonthRange();
  const prevLabel = `${start.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'})} – ${end.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'})}`;
  const prevCount = accCache().filter(it=>{const d=it.time*1000; return d>=start.getTime() && d<=end.setHours(23,59,59,999);}).length;
  const currNames = {980:'UAH',978:'EUR',840:'USD',985:'PLN',946:'RON'};
  const accLabel = a => `${escapeHtml(a.type||'')} · ${currNames[a.currency]||escapeHtml(String(a.currency))}`;
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  const canSwitch = !IS_DEMO && state.accounts.length>1;
  const cardLine = !acc || IS_DEMO ? '' : `
    <div class="ms-row" style="align-items:center;flex-wrap:wrap;margin-bottom:8px">
      <div style="flex:1;font-size:13px;color:var(--muted)">Картка: <b style="color:var(--text)">${accLabel(acc)}</b> <span style="font-family:var(--font-mono)">${escapeHtml(acc.pan||'')}</span></div>
      ${canSwitch ? `<button class="ms-btn secondary" id="cardPickerBtn" aria-expanded="${state.cardPickerOpen}">Інша картка ${state.cardPickerOpen?'▴':'▾'}</button>` : ''}
    </div>
    ${canSwitch && state.cardPickerOpen ? '<div class="ms-accounts" id="cardPickerList" style="margin-bottom:12px"></div>' : ''}`;
  p.innerHTML = `${cardLine}
    <div class="ms-row" style="align-items:center;flex-wrap:wrap">
      <div style="flex:1;font-size:13px;color:var(--muted)">Період: <b style="color:var(--text)">${state.from} → ${state.to}</b></div>
      ${IS_DEMO ? '' : '<button class="ms-btn secondary" id="backBtn">Змінити період</button>'}
    </div>
    ${IS_DEMO ? '' : `<div class="ms-hint" id="refreshNote" style="margin:6px 0 0">${refreshNoteHtml()}</div>`}
    <div class="ms-row" style="margin-top:10px;gap:8px">
      <button class="ms-btn${state.viewTab==='current'?'':' secondary'}" id="tabCurrent" style="flex:1">Поточний період</button>
      <button class="ms-btn${state.viewTab==='previous'?'':' secondary'}" id="tabPrevious" style="flex:1">${state.viewRange?'Цикл':'Попередній місяць'} (${prevLabel})${prevCount?' · '+prevCount+' оп. в кеші':' · немає в кеші'}</button>
    </div>
  `;
  p.querySelector('#backBtn')?.addEventListener('click', ()=>{state.step='accounts'; render();});
  p.querySelector('#cardPickerBtn')?.addEventListener('click', ()=>{state.cardPickerOpen=!state.cardPickerOpen; render();});
  const pickerList = p.querySelector('#cardPickerList');
  if(pickerList) state.accounts.forEach(a=>{
    const row = document.createElement('div');
    row.className = 'ms-account'+(a.id===state.selectedAccount?' selected':'');
    row.tabIndex = 0;
    row.setAttribute('role','button');
    row.innerHTML = `<span>${accLabel(a)}</span><span class="pan">${escapeHtml(a.pan||'')}</span>`;
    row.addEventListener('click', ()=>switchAccount(a.id));
    row.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); switchAccount(a.id); } });
    pickerList.appendChild(row);
  });
  bindRefreshNote(p);
  p.querySelector('#tabCurrent').addEventListener('click', ()=>{state.viewTab='current'; state.viewRange=null; render();});
  p.querySelector('#tabPrevious').addEventListener('click', ()=>{state.viewTab='previous'; state.viewRange=null; render();});
  return p;
}

function buildTodayPanel(all){
  const p = document.createElement('div');
  p.className='ms-panel ms-card';

  const todayKey = todayStr();
  const yestKey = daysAgoStr(1);

  const inRange = (key)=> state.from && state.to && key>=state.from && key<=state.to;
  const dayOf = t => t.date instanceof Date ? todayStr(t.date) : String(t.date).slice(0,10);
  const isTodayOrYest = t => { const k = dayOf(t); return k===todayKey || k===yestKey; };
  const asExpense = list => list
    .filter(t=>t.amount<0 && !state.loanKeys[txKey(t)])
    .map(t=>applyShare({...t, cat: categoryFor(t)}));

  // Today/yesterday don't depend on the selected period: on the 10th the new cycle starts,
  // and yesterday (the 9th) belongs to the previous one — so also pull those two days from
  // the cache of everything already fetched, plus the separate last-48h fetch, deduped.
  const seen = new Set();
  const source = [];
  const add = t => { const k = txKey(t); if(!seen.has(k)){ seen.add(k); source.push(t); } };
  if(inRange(todayKey) || inRange(yestKey)) all.filter(isTodayOrYest).forEach(add);
  asExpense(accCache().map(mapRawItem).filter(isTodayOrYest)).forEach(add);
  asExpense((state.todayTxs || []).filter(isTodayOrYest)).forEach(add);
  const haveFresh = inRange(todayKey) || inRange(yestKey) || !!state.todayTxs || source.length>0;

  const forDay = (key)=> source.filter(t=>{
    const k = t.date instanceof Date ? todayStr(t.date) : String(t.date).slice(0,10);
    return k===key;
  }).sort((a,b)=>b.date-a.date);

  const todayList = forDay(todayKey);
  const yestList = forDay(yestKey);
  const todayAmt = todayList.filter(t=>!state.dayExcluded[txKey(t)]).reduce((s,t)=>s+Math.abs(t.amount),0);
  const yestAmt = yestList.filter(t=>!state.dayExcluded[txKey(t)]).reduce((s,t)=>s+Math.abs(t.amount),0);

  const cardHtml = (label, amt)=>{
    if(!haveFresh){
      return `<div class="ms-today-card"><div class="ms-today-lbl">${label}</div><div class="ms-today-empty">${state.todayLoading?'завантаження…':'дані не завантажені'}</div></div>`;
    }
    return `<div class="ms-today-card highlight"><div class="ms-today-lbl">${label}</div><div class="ms-today-amt">${fmt(amt)} ${curSym()}</div></div>`;
  };

  p.innerHTML = `<h2>Зараз</h2><p class="ms-hint">Оновлюється щоразу, як заходиш — без потреби гортати графік. Категорію тут теж можна поправити — зміна застосується і у загальній виписці, і надалі.</p>
    <div class="ms-today-row">
      ${cardHtml('Сьогодні', todayAmt)}
      ${cardHtml('Вчора', yestAmt)}
    </div>
    ${!haveFresh && !state.todayLoading ? '<button class="ms-btn secondary" id="loadTodayBtn" style="margin-top:12px;width:100%">Підвантажити сьогодні і вчора окремо</button>' : ''}
  `;
  const btn = p.querySelector('#loadTodayBtn');
  if(btn) btn.addEventListener('click', handleFetchTodayYesterday);

  if(haveFresh){
    if(todayList.length) p.appendChild(buildDayTxList('Сьогодні — операції', todayList));
    if(yestList.length) p.appendChild(buildDayTxList('Вчора — операції', yestList));
  }
  return p;
}

function buildDayTxList(label, list){
  const wrap = document.createElement('div');
  wrap.className = 'ms-today-breakdown';
  const lbl = document.createElement('div');
  lbl.className = 'ms-today-breakdown-lbl';
  lbl.textContent = label;
  wrap.appendChild(lbl);
  list.forEach(t=>{
    const key = txKey(t);
    const excluded = !!state.dayExcluded[key];
    const row = document.createElement('div');
    row.className = 'ms-today-cat-row';
    if(excluded) row.style.opacity = '.45';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = !excluded;
    chk.title = 'Прибрати з підрахунку суми за день (наприклад, переказ, який не є тратою)';
    chk.addEventListener('change', e=>toggleDayExcluded(key, e.target.checked));
    const icon = document.createElement('span');
    icon.className = 'ms-legend-icon';
    icon.textContent = ICONS[t.cat] || '❓';
    const time = document.createElement('span');
    time.style.color = 'var(--muted)';
    time.style.fontFamily = 'var(--font-mono)';
    time.style.fontSize = '11px';
    time.style.minWidth = '38px';
    time.textContent = t.date.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'});
    const name = document.createElement('span');
    name.className = 'ms-today-cat-name';
    name.textContent = t.desc;
    const amt = document.createElement('span');
    amt.className = 'ms-today-cat-amt';
    const foreignCur = t.currency && t.currency !== curCode();
    amt.textContent = fmt(Math.abs(t.amount)) + ' ' + curSym();
    if(foreignCur && t.operationAmount){
      const sub = document.createElement('span');
      sub.className = 'ms-today-cat-amt-foreign';
      sub.textContent = fmt(Math.abs(t.operationAmount)) + ' ' + (CURRENCY_SYMBOLS[t.currency]||t.currency);
      amt.appendChild(sub);
    }
    const sel = document.createElement('select');
    sel.className = 'ms-cat-select';
    sortedCats().forEach(c=>{
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      if(c===t.cat) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', e=>{ handleCategoryChange(t, e.target.value); });
    row.appendChild(chk);
    row.appendChild(icon);
    row.appendChild(time);
    row.appendChild(name);
    row.appendChild(amt);
    row.appendChild(sel);
    wrap.appendChild(row);
  });
  return wrap;
}

async function handleFetchTodayYesterday(){
  state.todayLoading = true; render();
  try{
    const from = new Date(); from.setDate(from.getDate()-1); from.setHours(0,0,0,0);
    const to = new Date();
    const items = await fetchStatement(state.token.trim(), state.selectedAccount,
      Math.floor(from.getTime()/1000), Math.floor(to.getTime()/1000));
    state.todayTxs = items.map(it=>({date:new Date(it.time*1000), amount:it.amount/100, desc: (it.description||'(без опису)').trim(), mcc: it.mcc, currency: it.currencyCode, operationAmount: it.operationAmount!==undefined ? it.operationAmount/100 : it.amount/100}));
  }catch(e){
    state.todayTxs = null;
  }
  state.todayLoading = false; render();
}

const MAIN_TABS = [
  {id:'overview', icon:'📊', label:'Огляд'},
  {id:'history',  icon:'🔎', label:'Пошук по історії'},
  {id:'trips',    icon:'✈️', label:'Подорожі та події'},
  {id:'ops',      icon:'🧾', label:'Операції за місяць'},
  {id:'data',     icon:'💾', label:'Дані та імпорт'},
];
function resultsPanel(){
  const p = document.createElement('div');

  const activeTxs = getActiveRawTxs();
  const isPrevTab = state.viewTab === 'previous';

  const expenses = activeTxs.filter(t=>t.amount<0 && !state.loanKeys[txKey(t)]).map(t=>applyShare({
    ...t, cat: categoryFor(t)
  }));
  const manualExpenses = state.manual.filter(m=>{
    if(m.amount>=0) return false;
    const d = new Date(m.date).getTime();
    if(isPrevTab){
      const {start,end} = getPrevMonthRange();
      end.setHours(23,59,59,999);
      return d>=start.getTime() && d<=end.getTime();
    }
    // current tab — only manual entries dated within the actually-selected period
    const periodStart = new Date(state.from+'T00:00:00').getTime();
    const periodEnd = new Date(state.to+'T23:59:59').getTime();
    return d>=periodStart && d<=periodEnd;
  });
  const all = expenses.concat(manualExpenses.map(m=>({date:new Date(m.date),desc:m.desc,amount:m.amount,cat:m.cat,manual:true,manualIndex:state.manual.indexOf(m)})));

  const byCat = {};
  all.forEach(t=>{ byCat[t.cat] = (byCat[t.cat]||0) + t.amount; });

  // A "Скасування"/"Cancellation" refund is money coming back for something that was
  // already counted as an expense in its category (e.g. a cancelled Bolt ride) — net
  // it against that category's total instead of leaving the category looking like
  // the ride still cost full price. Deliberately doesn't touch `all` itself (every
  // other panel — the table, today, monthly chart — keeps working exactly as before).
  const periodRefunds = activeTxs.filter(t=>t.amount>0 && (
    CANCELLATION_KEYWORDS_GLOBAL.some(k=>t.desc.includes(k)) ||
    REFUND_PRONE_MERCHANTS_GLOBAL.some(m=>t.desc.toLowerCase().includes(m))
  ));
  periodRefunds.forEach(r=>{
    const cat = categoryFor(r);
    byCat[cat] = (byCat[cat]||0) + r.amount; // amount is positive, reduces the (negative) category total toward zero
  });

  const total = Object.values(byCat).reduce((s,v)=>s+v,0);
  // biggest spend first, but transfers to people are not real spending categories — always last
  const catList = Object.entries(byCat).sort((a,b)=>{
    const ta = a[0]==='перекази людям', tb = b[0]==='перекази людям';
    if(ta!==tb) return ta ? 1 : -1;
    return a[1]-b[1];
  });

  const panelToday = buildTodayPanel(all);

  // days in the active period, for "середня трата в день"
  let periodDays;
  if(isPrevTab){
    const {start,end} = getPrevMonthRange();
    periodDays = Math.round((end.getTime()-start.getTime())/(24*60*60*1000))+1;
  }else{
    const f = new Date(state.from+'T00:00:00'), t = new Date(state.to+'T00:00:00');
    periodDays = Math.max(1, Math.round((t.getTime()-f.getTime())/(24*60*60*1000))+1);
  }
  // transfers to people aren't real spending — the donut, its percentages and the daily average ignore them
  const TRANSFERS_CAT = 'перекази людям';
  const cleanTotal = total - (byCat[TRANSFERS_CAT]||0);
  const avgPerDay = Math.abs(cleanTotal)/periodDays;

  const panel1 = document.createElement('div');
  panel1.className='ms-panel';
  const donutGradient = buildConicGradient(catList.filter(([c])=>c!==TRANSFERS_CAT), cleanTotal);

  // trip spend for THIS period only (not all-time) — she can already see full-trip
  // totals in "Подорожі", this is specifically "how much of THIS period was travel"
  const CURRENCY_FLAGS = {
    980:'🇺🇦', 978:'🇪🇺', 840:'🇺🇸', 985:'🇵🇱', 946:'🇷🇴', 981:'🇬🇪', 498:'🇲🇩',
    949:'🇹🇷', 826:'🇬🇧', 203:'🇨🇿', 348:'🇭🇺', 752:'🇸🇪', 578:'🇳🇴', 208:'🇩🇰', 756:'🇨🇭'
  };
  const tripSpendByTrip = {};
  const tripCurrencySpend = {};
  all.forEach(t=>{
    const tid = tripIdFor(t);
    if(!tid) return;
    tripSpendByTrip[tid] = (tripSpendByTrip[tid]||0) + Math.abs(t.amount);
    if(t.currency && t.currency!==980){
      tripCurrencySpend[tid] = tripCurrencySpend[tid] || {};
      tripCurrencySpend[tid][t.currency] = (tripCurrencySpend[tid][t.currency]||0) + Math.abs(t.amount);
    }
  });
  const tripEntries = Object.entries(tripSpendByTrip)
    .map(([tid,sum])=>{
      const currencySpend = tripCurrencySpend[tid];
      // every distinct foreign currency actually spent in, not just the biggest one —
      // a trip through several countries should show all their flags, not one "winner"
      const flags = currencySpend
        ? Object.entries(currencySpend).sort((a,b)=>b[1]-a[1]).map(([cur])=>CURRENCY_FLAGS[cur]).filter(Boolean)
        : ['🧳'];
      return {
        name: state.trips.find(t=>t.id===tid)?.name || '?',
        sum,
        flags: [...new Set(flags)].join(' ')
      };
    })
    .sort((a,b)=>b.sum-a.sum);
  const tripPeriodTotal = tripEntries.reduce((s,e)=>s+e.sum,0);

  panel1.innerHTML = `
    <h2>Загальна картина</h2>
    ${tripPeriodTotal>0 ? `
    <div class="ms-trip-period-summary">
      <div class="ms-hint" style="margin-bottom:6px">🧳 Поїздки за цей період</div>
      ${tripEntries.map(e=>`
        <div class="ms-trip-period-row">
          <span class="ms-trip-period-name">${e.flags} ${escapeHtml(e.name)}</span>
          <span class="ms-trip-period-amt">${fmt(e.sum)} ${curSym()}<span class="ms-trip-period-eur">${fmtEur(e.sum, curCode())}</span></span>
        </div>
      `).join('')}
    </div>` : ''}
    <div class="ms-hero">
      <div class="ms-donut-wrap">
        <div class="ms-donut" style="background:conic-gradient(${donutGradient})"></div>
        <div class="ms-donut-center">
          <div class="amt">${fmt(cleanTotal)}</div>
          <div class="lbl">${curSym()} витрачено</div>
          <div class="lbl" style="margin-top:2px;opacity:.75">${fmtEur(cleanTotal, curCode()).trim()}</div>
          <div class="lbl" style="margin-top:2px;opacity:.6;font-size:10px">без переказів людям</div>
        </div>
      </div>
      <div class="ms-legend" id="legendWrap"></div>
    </div>
    <div class="ms-hint" style="margin-top:6px;text-align:center">Середня трата в день: <b style="color:var(--text)">${fmt(avgPerDay)} ${curSym()}</b> ${fmtEur(avgPerDay, curCode())} · за ${periodDays} дн.</div>
  `;
  const legend = panel1.querySelector('#legendWrap');
  const byCatTx = {};
  all.forEach(t=>{ (byCatTx[t.cat] = byCatTx[t.cat]||[]).push(t); });
  const refundsByCat = {};
  periodRefunds.forEach(r=>{ const c = categoryFor(r); (refundsByCat[c] = refundsByCat[c]||[]).push(r); });

  catList.forEach(([cat,sum])=>{
    const row = document.createElement('div');
    row.className='ms-legend-row ms-legend-row-clickable';
    const isTransfers = cat===TRANSFERS_CAT;
    const pct = isTransfers ? '' : (cleanTotal ? ((Math.abs(sum)/Math.abs(cleanTotal))*100).toFixed(1)+'%' : '0.0%');
    const expanded = !!state.expandedCats[cat];
    row.innerHTML = `<span class="ms-legend-chevron">${expanded?'▾':'▸'}</span>
      <span class="ms-dot" style="background:${COLORS[cat]||'#666'}"></span>
      <span class="ms-legend-icon">${ICONS[cat]||'❓'}</span>
      <span class="ms-legend-cat">${cat}</span>
      <span class="ms-legend-amt">${fmt(sum)} ${curSym()}</span>
      <span class="ms-legend-pct" title="${isTransfers?'Не входить у суму на діаграмі':''}">${isTransfers?'поза сумою':pct}</span>`;
    row.addEventListener('click', ()=>{
      state.expandedCats[cat] = !state.expandedCats[cat];
      render();
    });
    legend.appendChild(row);

    if(expanded){
      const detail = document.createElement('div');
      detail.className = 'ms-legend-detail';
      (byCatTx[cat]||[]).sort((a,b)=>b.date-a.date).forEach(t=>{
        const key = txKey(t);
        const note = state.notes[key];
        const dRow = document.createElement('div');
        dRow.className = 'ms-legend-detail-row';
        const dateStr = dtStr(t.date);
        dRow.innerHTML = `<span style="min-width:40px;color:var(--muted)">${dateStr}</span><span style="flex:1">${escapeHtml(t.desc)}</span><span class="ms-amt-neg">−${fmt(t.amount)} ${curSym()}</span>`;
        const noteBtn = document.createElement('button');
        noteBtn.className = 'ms-note-btn'+(note?' has-note':'');
        noteBtn.textContent = '📝';
        noteBtn.title = note ? 'Редагувати нотатку' : 'Додати нотатку (наприклад, доля у спільній тратi)';
        noteBtn.addEventListener('click', ()=>noteButtonHandler(t, key, note));
        dRow.appendChild(noteBtn);
        detail.appendChild(dRow);
        if(note){
          const noteP = document.createElement('div');
          noteP.className = 'ms-note-preview';
          noteP.style.marginLeft = '48px';
          noteP.textContent = '📝 '+note;
          detail.appendChild(noteP);
        }
      });
      // show the refunds netted into this category's total, so the math is visible
      // instead of just trusting the smaller final number
      (refundsByCat[cat]||[]).sort((a,b)=>b.date-a.date).forEach(r=>{
        const rRow = document.createElement('div');
        rRow.className = 'ms-legend-detail-row';
        rRow.innerHTML = `<span style="min-width:40px;color:var(--muted)">${dtStr(r.date)}</span><span style="flex:1;color:var(--teal)">↩ ${escapeHtml(r.desc)} (повернення)</span><span style="color:var(--teal)">+${fmt(r.amount)} ${curSym()}</span>`;
        detail.appendChild(rRow);
      });
      legend.appendChild(detail);
    }
  });



  const panel2 = document.createElement('div');
  panel2.className='ms-panel';
  panel2.innerHTML = `<h2>Всі операції</h2><p class="ms-hint">Натисни на операцію, щоб змінити категорію (запам'ятається для цього мерчанта), прив'язати її до поїздки, позначити як «не витрата», вказати свою частку або додати нотатку.</p>
    <div class="ms-field" style="margin-bottom:10px">
      <input type="text" id="txSearchInput" placeholder="Пошук за описом або власною нотаткою…" value="${escapeHtml(state.txSearchQuery||'')}">
    </div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px" id="txSearchSummary">Разом витрачено: <b style="color:var(--gold);font-family:var(--font-mono)">${fmt(total)} ${curSym()}</b>${fmtEur(total, curCode())} · ${all.length} операцій</div>
    <div class="ms-txlist" id="txBody"></div>`;
  const tbody = panel2.querySelector('#txBody');
  const todayK = todayStr(), yestK = daysAgoStr(1);
  const dayTotals = {};
  all.forEach(t=>{ const k = todayStr(t.date); if(!state.notExpense[txKey(t)]) dayTotals[k] = (dayTotals[k]||0) + Math.abs(t.amount); });
  let prevDayKey = null;
  all.sort((a,b)=>b.date-a.date).forEach(t=>{
    const key = txKey(t);
    const existingNote = state.notes[key];
    const isNotExpense = !!state.notExpense[key];
    const dayKey = todayStr(t.date);

    // day header: "Сьогодні ... −542 ₴"
    if(dayKey!==prevDayKey){
      const h = document.createElement('div');
      h.className = 'ms-txday';
      h.dataset.day = dayKey;
      const label = dayKey===todayK ? 'Сьогодні' : dayKey===yestK ? 'Вчора'
        : t.date.toLocaleDateString('uk-UA',{weekday:'long', day:'numeric', month:'long'});
      h.innerHTML = `<span>${label}</span><span class="ms-txday-sum">−${fmt(dayTotals[dayKey]||0)} ${curSym()}</span>`;
      tbody.appendChild(h);
      prevDayKey = dayKey;
    }

    const item = document.createElement('div');
    item.className = 'ms-txitem' + (isNotExpense ? ' is-muted' : '') + (state.expandedTx && state.expandedTx[key] ? ' is-open' : '');
    item.dataset.search = (t.desc+' '+(t.bankComment||'')+' '+(existingNote||'')).toLowerCase();
    item.dataset.day = dayKey;

    const row = document.createElement('div');
    row.className = 'ms-txrow';
    row.tabIndex = 0;
    const color = COLORS[t.cat] || '#8C7A5C';
    const tripId = tripIdFor(t);
    const tripName = tripId ? (state.trips.find(x=>x.id===tripId)||{}).name : '';
    const time = t.manual ? 'ручне' : t.date.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'});
    const foreign = !t.manual && t.currency && t.currency!==curCode() && t.operationAmount;
    row.innerHTML = `
      <span class="ms-txicon" style="background:${color}22;color:${color}">${ICONS[t.cat]||'•'}</span>
      <span class="ms-txmain">
        <span class="ms-txdesc"></span>
        <span class="ms-txsub">${time} · ${escapeHtml(t.cat)}${tripName?` · ✈️ ${escapeHtml(tripName)}`:''}${isNotExpense?' · не витрата':''}</span>
      </span>
      <span class="ms-txamt">
        <span class="ms-amt-neg">−${fmt(t.amount)}</span>
        ${t.share ? `<small>з −${fmt(t.fullAmount)} · ${Math.round(t.share*100)}%</small>` : ''}
        ${foreign ? `<small>${fmt(Math.abs(t.operationAmount))} ${CURRENCY_SYMBOLS[t.currency]||''}</small>` : ''}
      </span>`;
    row.querySelector('.ms-txdesc').textContent = t.desc + (existingNote ? ' 📝' : '');
    if(t.bankComment || existingNote){
      const notes = document.createElement('span');
      notes.className = 'ms-txnote';
      notes.textContent = [t.bankComment ? '🏦 '+t.bankComment : '', existingNote||''].filter(Boolean).join(' · ');
      row.querySelector('.ms-txmain').appendChild(notes);
    }
    const toggle = ()=>{
      state.expandedTx = state.expandedTx || {};
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      if(open) state.expandedTx[key] = true; else delete state.expandedTx[key];
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); } });
    item.appendChild(row);

    // edit area, shown when the row is open
    const edit = document.createElement('div');
    edit.className = 'ms-txedit';
    const field = (label, el)=>{ const f = document.createElement('label'); f.className='ms-txfield'; f.innerHTML = `<span>${label}</span>`; f.appendChild(el); edit.appendChild(f); };

    const sel = document.createElement('select');
    sel.className='ms-cat-select';
    sortedCats().forEach(c=>{
      const opt = document.createElement('option');
      opt.value=c; opt.textContent=c;
      if(c===t.cat) opt.selected=true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', e=>{ handleCategoryChange(t, e.target.value); });
    field('Категорія', sel);

    if(state.trips.length){
      const tripSel = document.createElement('select');
      tripSel.className = 'ms-cat-select';
      const noneOpt = document.createElement('option');
      noneOpt.value = ''; noneOpt.textContent = '—';
      tripSel.appendChild(noneOpt);
      state.trips.forEach(tr2=>{
        const opt = document.createElement('option');
        opt.value = tr2.id; opt.textContent = tr2.name;
        if(tripId===tr2.id) opt.selected = true;
        tripSel.appendChild(opt);
      });
      tripSel.addEventListener('change', e=>{ assignTrip(key, e.target.value); });
      field('Поїздка', tripSel);
    }

    if(!t.manual){
      const shareSel = document.createElement('select');
      shareSel.className = 'ms-cat-select';
      const cur = t.share ? Math.round(t.share*100) : 100;
      [['100','Вся моя'],['50','50%'],['33','33%'],['25','25%'],['custom','Своя сума…']].forEach(([v,label])=>{
        const o = document.createElement('option');
        o.value = v; o.textContent = label;
        if(v===String(cur)) o.selected = true;
        shareSel.appendChild(o);
      });
      if(t.share && ![50,33,25].includes(cur)){
        const o = document.createElement('option'); o.value='cur'; o.textContent = cur+'%'; o.selected = true; shareSel.appendChild(o);
      }
      shareSel.addEventListener('change', e=>{
        const v = e.target.value;
        const full = Math.abs(t.fullAmount !== undefined ? t.fullAmount : t.amount);
        if(v==='custom'){
          const my = parseFloat((prompt(`Скільки з ${fmt(full)} ${curSym()} — твоя частина?`)||'').replace(',','.'));
          if(!my || my<=0 || my>=full){ render(); return; }
          setShare(key, my/full);
        }else if(v==='cur'){ /* keep as is */ }
        else setShare(key, parseInt(v,10)/100);
      });
      field('Моя частка', shareSel);
    }

    const cleanWrap = document.createElement('label');
    cleanWrap.className = 'ms-txcheck';
    cleanWrap.title = 'Повернули гроші, поповнення фонду тощо — не рахується в «Чисті трати»';
    const cleanChk = document.createElement('input');
    cleanChk.type = 'checkbox';
    cleanChk.checked = isNotExpense;
    cleanChk.addEventListener('change', e=>toggleNotExpense(key, e.target.checked));
    cleanWrap.appendChild(cleanChk);
    cleanWrap.appendChild(document.createTextNode(' Не витрата'));
    edit.appendChild(cleanWrap);

    const noteBtn = document.createElement('button');
    noteBtn.type = 'button';
    noteBtn.className = 'ms-btn secondary ms-txnote-btn';
    noteBtn.textContent = existingNote ? '📝 Змінити нотатку' : '📝 Нотатка';
    noteBtn.addEventListener('click', ()=>noteButtonHandler(t, key, existingNote));
    edit.appendChild(noteBtn);

    item.appendChild(edit);
    tbody.appendChild(item);
  });

  const TX_PREVIEW_COUNT = 8;
  const txRows = [...tbody.querySelectorAll('.ms-txitem')];
  // a day header is visible only if at least one of its operations is
  const syncDayHeaders = ()=>{
    tbody.querySelectorAll('.ms-txday').forEach(h=>{
      h.style.display = txRows.some(r=>r.dataset.day===h.dataset.day && r.style.display!=='none') ? '' : 'none';
    });
  };
  let txToggleBtn = null;
  if(txRows.length > TX_PREVIEW_COUNT && !state.expandedBlocks.transactions){
    txRows.slice(TX_PREVIEW_COUNT).forEach(r=>r.style.display='none');
    syncDayHeaders();
    const moreBtn = document.createElement('button');
    moreBtn.className = 'ms-btn secondary';
    moreBtn.style.width = '100%';
    moreBtn.style.marginTop = '10px';
    moreBtn.textContent = `Показати ще ${txRows.length - TX_PREVIEW_COUNT} ▾`;
    moreBtn.addEventListener('click', ()=>{ state.expandedBlocks.transactions = true; render(); });
    panel2.appendChild(moreBtn);
    txToggleBtn = moreBtn;
  }else if(txRows.length > TX_PREVIEW_COUNT){
    const lessBtn = document.createElement('button');
    lessBtn.className = 'ms-btn secondary';
    lessBtn.style.width = '100%';
    lessBtn.style.marginTop = '10px';
    lessBtn.textContent = 'Згорнути ▴';
    lessBtn.addEventListener('click', ()=>{ state.expandedBlocks.transactions = false; render(); });
    panel2.appendChild(lessBtn);
    txToggleBtn = lessBtn;
  }

  // Search filters rows directly in the DOM (no render()) so the input never loses
  // focus mid-typing — it also searches her own notes, not just the merchant text.
  const txSearchInput = panel2.querySelector('#txSearchInput');
  const txSearchSummary = panel2.querySelector('#txSearchSummary');
  txSearchInput.addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    state.txSearchQuery = e.target.value; // remembered for display only, doesn't trigger render
    if(!q){
      txRows.forEach((r,i)=>{ r.style.display = (i<TX_PREVIEW_COUNT || state.expandedBlocks.transactions) ? '' : 'none'; });
      syncDayHeaders();
      if(txToggleBtn) txToggleBtn.style.display = '';
      txSearchSummary.innerHTML = `Разом витрачено: <b style="color:var(--gold);font-family:var(--font-mono)">${fmt(total)} ${curSym()}</b>${fmtEur(total, curCode())} · ${all.length} операцій`;
      return;
    }
    let matchCount = 0;
    txRows.forEach(r=>{
      const match = r.dataset.search.includes(q);
      r.style.display = match ? '' : 'none';
      if(match) matchCount++;
    });
    syncDayHeaders();
    if(txToggleBtn) txToggleBtn.style.display = 'none';
    txSearchSummary.innerHTML = `Знайдено: <b style="color:var(--gold);font-family:var(--font-mono)">${matchCount}</b> з ${all.length} операцій`;
  });

  const panel3 = document.createElement('div');
  panel3.className='ms-panel';
  const MANUAL_CURRENCIES = [{code:980,label:'₴ UAH'},{code:978,label:'€ EUR'},{code:840,label:'$ USD'},{code:985,label:'zł PLN'},{code:946,label:'lei RON'},{code:981,label:'₾ GEL'}];
  panel3.innerHTML = `
    <h2>Додати готівкову витрату вручну</h2>
    <div class="ms-manual-form">
      <div class="ms-field" style="max-width:140px"><label>Дата</label><input type="date" id="mDate" value="${todayStr()}"></div>
      <div class="ms-field" style="flex:2"><label>Опис</label><input type="text" id="mDesc" placeholder="Наприклад: канцтовари"></div>
      <div class="ms-field" style="max-width:110px"><label>Сума</label><input type="text" id="mAmount" placeholder="250"></div>
      <div class="ms-field" style="max-width:100px"><label>Валюта</label>
        <select id="mCurrency">${MANUAL_CURRENCIES.map(c=>`<option value="${c.code}">${c.label}</option>`).join('')}</select>
      </div>
      <div class="ms-field" style="max-width:180px"><label>Категорія</label>
        <select id="mCat">${CATS.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
      </div>
      <button class="ms-btn" id="mAdd" style="align-self:flex-end">Додати</button>
    </div>
    <p class="ms-hint" style="margin-top:6px">Якщо валюта не ₴ — сума одразу перераховується в гривні за приблизним курсом (тим самим, що й всюди в застосунку), щоб не ламати підрахунки в інших блоках.</p>
  `;
  panel3.querySelector('#mAdd').addEventListener('click', ()=>{
    const d = panel3.querySelector('#mDate').value;
    const desc = panel3.querySelector('#mDesc').value.trim();
    const amtRaw = panel3.querySelector('#mAmount').value;
    const amt = parseFloat(amtRaw.replace(',','.'));
    const cat = panel3.querySelector('#mCat').value;
    const curCodeChosen = parseInt(panel3.querySelector('#mCurrency').value, 10);
    if(!desc || isNaN(amt)){
      alert(!desc ? 'Впиши опис витрати — без нього не зберігається.' : `Не розпізнала суму «${amtRaw}» — впиши число, наприклад 250 або 250.50.`);
      return;
    }
    // convert to UAH once, at entry time, so every other panel that sums manual
    // entries doesn't need to know about currencies at all
    const amtUah = curCodeChosen===980 ? amt : (amt*TO_EUR_RATE[curCodeChosen])/TO_EUR_RATE[980];
    const descWithCur = curCodeChosen===980 ? desc : `${desc} (${fmt(amt)} ${MANUAL_CURRENCIES.find(c=>c.code===curCodeChosen).label.split(' ')[1]})`;
    state.manual.push({date:d, desc:descWithCur, amount:-Math.abs(amtUah), cat});
    persistManual();
    panel3.querySelector('#mDesc').value = '';
    panel3.querySelector('#mAmount').value = '';
    render();
  });

  const tabs = MAIN_TABS;
  const isTabDisabled = id => IS_DEMO && id==='data'; // nothing to save or import in the demo
  const tab = tabs.some(t=>t.id===state.mainTab && !isTabDisabled(t.id)) ? state.mainTab : 'overview';

  // panels that only live on one tab are built only when that tab is open — the long
  // single page used to build (and fill with data) every panel on every render
  const panelBalance = buildBalancePanel();
  const panelRange = rangePanel();
  if(state.jarEnabled && !state.jarAutoCheckedThisLoad && (state.jarPeriodStart !== defaultPeriodStart() || !state.jarLastDate || state.jarLastDate < todayStr())){
    state.jarAutoCheckedThisLoad = true;
    updateJarAccumulation().then(()=>render());
  }
  const panelDailyBudget = buildDailyBudgetPanel(all);

  const wrap = document.createElement('div');
  wrap.className = 'ms-results';
  const gap = el => { el.style.marginBottom = '14px'; return el; };

  // tab bar
  const bar = document.createElement('div');
  bar.className = 'ms-tabbar';
  bar.setAttribute('role','tablist');
  tabs.forEach(t=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ms-tab' + (t.id===tab ? ' active' : '');
    b.setAttribute('role','tab');
    b.setAttribute('aria-selected', t.id===tab ? 'true' : 'false');
    b.innerHTML = `<span class="ms-tab-ic" aria-hidden="true">${t.icon}</span><span class="ms-tab-label">${t.label}</span>`;
    if(isTabDisabled(t.id)){
      b.disabled = true;
      b.title = 'Недоступно в демо-версії';
      bar.appendChild(b);
      return;
    }
    b.addEventListener('click', ()=>{
      if(state.mainTab===t.id) return;
      state.mainTab = t.id;
      try{ history.replaceState(null,'','#'+t.id); }catch(e){}
      render();
      window.scrollTo({top:0});
    });
    bar.appendChild(b);
  });
  wrap.appendChild(bar);

  if(tab==='overview'){
    gap(panelRange); wrap.appendChild(panelRange);

    // one row: black card · how much can be spent per day · "Зараз"
    const nowRow = document.createElement('div');
    nowRow.className = 'ms-grid3 ms-row-now';
    nowRow.appendChild(panelBalance);
    nowRow.appendChild(panelDailyBudget);
    nowRow.appendChild(panelToday);
    gap(nowRow); wrap.appendChild(nowRow);

    const panelRecurring = buildRecurringPaymentsPanel();
    const topRow = document.createElement('div');
    topRow.className = 'ms-grid';
    topRow.appendChild(panel1);
    if(!panelRecurring.hidden){
      const stack = document.createElement('div');
      stack.className = 'ms-dashboard-stack';
      stack.appendChild(panelRecurring);
      topRow.appendChild(stack);
    }
    gap(topRow); wrap.appendChild(topRow);

    wrap.appendChild(gap(buildMonthlyBarChart()));
  }else if(tab==='history'){
    wrap.appendChild(gap(buildHistorySearchPanel()));
  }else if(tab==='trips'){
    wrap.appendChild(buildTripsPanel(getAllHistoricalExpenses()));
  }else if(tab==='ops'){
    gap(panelRange); wrap.appendChild(panelRange);
    const threeCol = document.createElement('div');
    threeCol.className = 'ms-grid ms-grid-2-1';
    threeCol.appendChild(panel2);
    threeCol.appendChild(buildIncomingPanel());
    gap(threeCol); wrap.appendChild(threeCol);
    wrap.appendChild(gap(panel3));
  }else if(tab==='data'){
    const bottomRow = document.createElement('div');
    bottomRow.className = 'ms-grid';
    bottomRow.appendChild(buildCustomCategoryPanel());
    bottomRow.appendChild(buildDataTransferPanel());
    wrap.appendChild(bottomRow);
  }

  p.appendChild(wrap);
  collapseHints(wrap);
  return p;
}

// Minimal look: the explanatory paragraph right under a block's title becomes a small ⓘ
// next to the title — hover shows the text, a click unfolds it. Hints with links or
// controls (and data lines that aren't right under the title) stay as they are.
function collapseHints(root){
  root.querySelectorAll('.ms-panel h2 + p.ms-hint').forEach(hint=>{
    if(hint.querySelector('a,input,button,select,label')) return;
    const h2 = hint.previousElementSibling;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ms-info';
    btn.textContent = 'i';
    btn.title = hint.textContent.trim();
    btn.setAttribute('aria-label','Пояснення');
    hint.classList.add('ms-hint-collapsed');
    btn.addEventListener('click', e=>{ e.stopPropagation(); hint.classList.toggle('ms-hint-collapsed'); });
    h2.appendChild(btn);
  });
}

// Groups every cached expense by calendar month and renders a simple CSS bar chart —
// last 6 months, most recent on the right, so she can see at a glance whether this
// month is running higher or lower than her usual pace. No charting library needed,
// consistent with the rest of the app's plain-CSS visuals.

// Known recurring subscriptions/bills, detected from the cache by keyword. Since a
// real background push notification needs a server (this app has none — it's a
// static page), this is an always-visible panel instead: it shows the next expected
// due date (last payment + ~1 month) and highlights it once it's within 2 days.
// She sees the warning whenever she opens the app around that time, which is the
// honest, actually-deliverable version of "remind me".
// Brand logos for "Регулярні платежі" (paths from simple-icons, CC0): white glyph on a round badge in the brand colour.
const BRAND_ICONS = {"orange":{"hex":"FF7900","path":"M0 0h24v24H0V0Zm3.43 20.572h17.143v-3.429H3.43v3.429Z"},"vodafone":{"hex":"E60000","path":"M12 0A12 12 0 0 0 0 12A12 12 0 0 0 12 24A12 12 0 0 0 24 12A12 12 0 0 0 12 0M16.25 1.12C16.57 1.12 16.9 1.15 17.11 1.22C14.94 1.67 13.21 3.69 13.22 6C13.22 6.05 13.22 6.11 13.23 6.17C16.87 7.06 18.5 9.25 18.5 12.28C18.54 15.31 16.14 18.64 12.09 18.65C8.82 18.66 5.41 15.86 5.39 11.37C5.38 8.4 7 5.54 9.04 3.85C11.04 2.19 13.77 1.13 16.25 1.12Z"},"claude":{"hex":"D97757","path":"m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"},"google":{"hex":"4285F4","path":"M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"},"youtube":{"hex":"FF0000","path":"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"},"icloud":{"hex":"3693F3","path":"M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"},"apple":{"hex":"000000","path":"M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"}};
function brandIcon(key){
  const ic = BRAND_ICONS[key];
  if(!ic) return key || '';
  return `<span class="ms-brand-ic" style="background:#${ic.hex}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${ic.path}"/></svg></span>`;
}
const RECURRING_PAYMENTS = [
  {label:'Orange', icon:'orange', match:['orange']},
  // amounts vary month to month (155-310) depending on what she tops up, but a
  // short-term internet package (e.g. 75) isn't the monthly cycle payment at all —
  // a floor well above that filters those out without needing an exact amount match
  {label:'Vodafone', icon:'vodafone', match:['vodafone'], minAmount:100},
  {label:'Claude', icon:'claude', match:['claude']},
  {label:'Google', icon:'google', match:['google']},
];
function buildRecurringPaymentsPanel(){
  const p = document.createElement('div');
  p.className = 'ms-panel';

  const history = getAllHistoricalExpenses();
  const today = new Date(); today.setHours(0,0,0,0);

  const rows = RECURRING_PAYMENTS.map(rp=>{
    let matches = history.filter(t=>rp.match.some(m=>t.desc.toLowerCase().includes(m)));
    if(rp.amountNear!==undefined){
      matches = matches.filter(t=>Math.abs(Math.abs(t.amount)-rp.amountNear)<0.5);
    }
    if(rp.minAmount!==undefined){
      matches = matches.filter(t=>Math.abs(t.amount)>=rp.minAmount);
    }
    if(!matches.length) return null;
    const last = matches.reduce((a,b)=>a.date>b.date?a:b);
    const nextDue = new Date(last.date.getFullYear(), last.date.getMonth()+1, last.date.getDate());
    const daysLeft = Math.round((nextDue.getTime()-today.getTime())/(24*60*60*1000));
    return { label:rp.label, icon:rp.icon, lastAmt:Math.abs(last.amount), lastDate:last.date, nextDue, daysLeft };
  }).filter(Boolean);

  // "Apple" bills several separate subscriptions (iCloud, apps...). Group every Apple
  // charge by its original currency+price (stable month to month, unlike the UAH
  // equivalent), then merge groups that are really ONE subscription whose price changed:
  // same currency, same day of the month (+-2 days), the new price starts after the old
  // one's last payment, within ~2 months, price change up to 40%. The newest price wins
  // and the old one is shown as a note instead of a second, forever-"overdue" row.
  const appleTxs = history.filter(t=>t.desc.toLowerCase().includes('apple'));
  const appleGroups = {};
  appleTxs.forEach(t=>{
    const k = `${t.currency}_${Math.abs(t.operationAmount).toFixed(2)}`;
    (appleGroups[k] = appleGroups[k]||[]).push(t);
  });
  const CUR_SYMBOLS = {980:'₴',978:'€',840:'$',985:'zł',946:'lei',981:'₾'};
  const dayDiff = (d1,d2)=>{ const x=Math.abs(d1-d2); return Math.min(x,31-x); };
  const subs = Object.values(appleGroups).filter(g=>g.length>=2).map(g=>{
    const sorted = g.slice().sort((a,b)=>a.date-b.date);
    return { cur:g[0].currency, price:Math.abs(g[0].operationAmount), txs:sorted,
      first:sorted[0].date, last:sorted[sorted.length-1].date, prevPrices:[] };
  }).sort((a,b)=>a.first-b.first);
  const merged = [];
  subs.forEach(sub=>{
    const prev = merged.find(m=>m.cur===sub.cur
      && sub.first>m.last
      && dayDiff(sub.first.getDate(), m.last.getDate())<=2
      && Math.abs(sub.price-m.price)/m.price<=0.4
      && (sub.first-m.last)/86400000<=62);
    if(prev){
      sub.prevPrices = prev.prevPrices.concat([prev.price]);
      sub.txs = prev.txs.concat(sub.txs); sub.first = prev.first;
      merged.splice(merged.indexOf(prev),1);
    }
    merged.push(sub);
  });
  merged.forEach(sub=>{
    const last = sub.txs[sub.txs.length-1];
    const nextDue = new Date(last.date.getFullYear(), last.date.getMonth()+1, last.date.getDate());
    const daysLeft = Math.round((nextDue.getTime()-today.getTime())/(24*60*60*1000));
    const opSym = CUR_SYMBOLS[last.currency] || '';
    const origNote = last.currency!==980 ? ` · ${fmt(Math.abs(last.operationAmount))} ${opSym}` : '';
    const priceNote = sub.prevPrices.length ? `ціна виросла: ${fmt(sub.prevPrices[sub.prevPrices.length-1])} → ${fmt(sub.price)} ${opSym}` : '';
    rows.push({ id:`apple_${last.currency}_${sub.first.getTime()}`,
      // her ~$7–9 Apple subscription is YouTube Premium; the small one (~$1) is iCloud storage
      ...(sub.price>=5
        ? {label:`YouTube Premium · Apple (${fmt(Math.abs(last.amount))} ₴${origNote})`, icon:'youtube'}
        : {label:`iCloud · Apple (${fmt(Math.abs(last.amount))} ₴${origNote})`, icon:'icloud'}),
      lastAmt:Math.abs(last.amount), lastDate:last.date, nextDue, daysLeft, note:priceNote });
  });
  const shownRows = rows.filter(r=>!r.id || !state.recurringHidden.includes(r.id));
  rows.length = 0; shownRows.forEach(r=>rows.push(r));

  if(!rows.length){ p.hidden = true; return p; }

  p.innerHTML = `<h2>Регулярні платежі</h2><p class="ms-hint">Орієнтовна дата наступного платежу — останній платіж + місяць. Це не справжнє push-сповіщення (сайт без сервера не може надіслати його, поки застосунок закритий) — просто попередження тут, коли відкриваєш застосунок ближче до дати.</p><div id="recurringRows"></div>`;
  const wrap = p.querySelector('#recurringRows');
  rows.forEach(r=>{
    const soon = r.daysLeft<=2;
    const row = document.createElement('div');
    row.className = 'ms-today-cat-row';
    if(soon) row.style.background = 'rgba(184,92,74,0.08)';
    row.innerHTML = `
      <span class="ms-today-cat-name ms-rec-name">${brandIcon(r.icon)}<span>${r.label}${r.note?`<br><small style="color:var(--muted);font-weight:400">${r.note}</small>`:''}</span></span>
      <span class="ms-rec-meta">останній ${r.lastDate.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'})} · ${fmt(r.lastAmt)} ₴</span>
      <span class="ms-rec-meta" style="${soon?'color:var(--rust);font-weight:700':''}">
        ${r.daysLeft<0 ? `⚠ просрочено на ${-r.daysLeft} дн.` : (soon ? `⚠ через ${r.daysLeft} дн.` : `через ${r.daysLeft} дн.`)}
      </span>
    `;
    if(r.id){
      const hb = document.createElement('button');
      hb.textContent='✕'; hb.title='Приховати (це не підписка або вона скасована)';
      hb.style.cssText='margin-left:8px;padding:2px 8px;cursor:pointer;background:none;border:1px solid var(--line,#444);border-radius:6px;color:var(--muted)';
      hb.addEventListener('click', async()=>{
        state.recurringHidden = state.recurringHidden.concat([r.id]);
        render();
        await storageSet('ms_recurring_hidden', JSON.stringify(state.recurringHidden));
      });
      row.appendChild(hb);
    }
    wrap.appendChild(row);
  });
  return p;
}

function buildMonthlyBarChart(){
  const p = document.createElement('div');
  p.className = 'ms-panel';

  const history = getAllHistoricalExpenses();

  // build 7 cycle-boundary dates (10th of each month), then 6 cycles between them —
  // matches her actual pay cycle (10-to-10), not the calendar month. boundaries[6] is
  // the NEXT 10th (end of the current cycle), boundaries[0] is 6 cycles back.
  const currentCycleStart = new Date(defaultPeriodStart()+'T00:00:00');
  const boundaries = [];
  for(let k=0;k<=6;k++){
    const d = new Date(currentCycleStart.getFullYear(), currentCycleStart.getMonth()-5+k, 10);
    boundaries.push(d);
  }
  const cycles = [];
  for(let i=0;i<6;i++){
    const start = boundaries[i];
    const end = boundaries[i+1]; // exclusive
    const sum = history
      .filter(t=>t.date>=start && t.date<end)
      .reduce((s,t)=>s+Math.abs(t.amount),0);
    cycles.push({
      label: start.toLocaleDateString('uk-UA',{month:'short'}),
      sum,
      start, end,
      isCurrent: i===5
    });
  }
  const maxSum = Math.max(1, ...cycles.map(m=>m.sum));

  p.innerHTML = `
    <h2>Витрати за місяцями</h2>
    <p class="ms-hint">Останні 6 платіжних циклів (10-те до 10-го, як і всюди в застосунку) — щоб порівнювати темп саме між зарплатами, а не за календарем. Натисни на стовпчик — відкриється повна статистика за цей цикл.</p>
    <div class="ms-bars"></div>
  `;
  const barsWrap = p.querySelector('.ms-bars');
  cycles.forEach(m=>{
    const col = document.createElement('div');
    col.className = 'ms-bar-col';
    const heightPct = Math.max(4, (m.sum/maxSum)*100);
    col.innerHTML = `
      <div class="ms-bar-amt">${m.sum ? fmt(m.sum) : ''}</div>
      <div class="ms-bar-track"><div class="ms-bar-fill${m.isCurrent?' ms-bar-fill-current':''}" style="height:${heightPct}%"></div></div>
      <div class="ms-bar-label${m.isCurrent?' ms-bar-label-current':''}">${m.label}</div>
    `;
    // click → open full stats for this cycle (from local cache only, no API call)
    col.classList.add('ms-bar-clickable');
    col.tabIndex = 0;
    col.setAttribute('role','button');
    const rangeTxt = `${m.start.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'})} – ${new Date(m.end.getTime()-86400000).toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'})}`;
    col.setAttribute('aria-label', `Відкрити статистику за цикл ${rangeTxt}`);
    col.title = `Відкрити статистику: ${rangeTxt}`;
    const open = ()=>{
      if(m.isCurrent){ state.viewTab='current'; state.viewRange=null; }
      else{
        const endIncl = new Date(m.end.getFullYear(), m.end.getMonth(), m.end.getDate()-1);
        state.viewTab='previous';
        state.viewRange = {start:new Date(m.start), end:endIncl};
      }
      render();
      window.scrollTo({top:0, behavior:'smooth'});
    };
    col.addEventListener('click', open);
    col.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
    barsWrap.appendChild(col);
  });
  return p;
}
function buildCleanExpensesPanel(all, grossTotal, periodDays){
  const p = document.createElement('div');
  p.className = 'ms-panel';

  const excluded = all.filter(t=>state.notExpense[txKey(t)]);
  const excludedSum = excluded.reduce((s,t)=>s+Math.abs(t.amount),0);
  const netted = all.filter(t=>!state.notExpense[txKey(t)]);
  const cleanSum = Math.abs(netted.reduce((s,t)=>{
    const key = txKey(t);
    const amt = state.amountOverride[key] !== undefined ? state.amountOverride[key] : t.amount;
    return s + amt;
  },0));
  const nettedCount = all.filter(t=>state.amountOverride[txKey(t)]!==undefined).length;
  const grossSum = Math.abs(grossTotal);
  const avgCleanPerDay = cleanSum / Math.max(1, periodDays||1);

  p.innerHTML = `
    <h2>Чисті трати</h2>
    <div class="ms-row" style="gap:20px;flex-wrap:wrap">
      <div>
        <div class="ms-hint" style="margin:0">Чисті трати</div>
        <div class="ms-today-amt" style="font-size:20px;color:var(--teal)">${fmt(cleanSum)} ${curSym()}</div>
        <div class="ms-hint" style="margin:0;opacity:.8">${fmtEur(cleanSum, curCode()).trim()}</div>
      </div>
      <div>
        <div class="ms-hint" style="margin:0">Середня чиста трата в день</div>
        <div class="ms-today-amt" style="font-size:20px;color:var(--gold)">${fmt(avgCleanPerDay)} ${curSym()}</div>
        <div class="ms-hint" style="margin:0;opacity:.8">${fmtEur(avgCleanPerDay, curCode()).trim()} · за ${periodDays||1} дн.</div>
      </div>
      <div>
        <div class="ms-hint" style="margin:0">Виключено</div>
        <div class="ms-today-amt" style="font-size:20px;color:var(--muted)">${excluded.length} оп. · ${fmt(excludedSum)} ${curSym()}</div>
      </div>
    </div>
  `;
  return p;
}

// Cashback paid out to the card is taxed in Ukraine: 18% personal income tax + 5% military levy.
const CASHBACK_TAX_RATE = 0.23;

function buildBalancePanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  p.style.background = 'transparent';
  p.style.border = 'none';
  p.style.padding = '0';
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  const currNames = {980:'UAH',978:'EUR',840:'USD',985:'PLN',946:'RON'};
  if(!acc){ p.innerHTML = ''; return p; }
  // Cashback accumulated since the last "Виведення кешбеку" (cashback withdrawal) — what's
  // actually sitting in Monobank now, independent of the selected period (on the 10th a new
  // period starts and a period-only sum would drop to almost zero). The API has no
  // "accumulated cashback balance", only a per-operation `cashbackAmount`, so it's summed
  // over every cached operation after the last withdrawal. Miles cards report miles, not money.
  let cashbackPill = '';
  if(acc.cashbackType !== 'Miles'){
    const isWithdrawal = it => /виведення кешбеку|cashback withdrawal/i.test(it.description||'');
    const cardCache = accCache();
    const lastW = cardCache.filter(isWithdrawal).reduce((m,it)=>it.time>m?it.time:m, 0);
    const accCb = cardCache.filter(it=>it.time>lastW).reduce((sum,it)=>sum+(it.cashbackAmount||0)/100,0);
    const periodCb = state.txs.reduce((sum,t)=>sum+(t.cashback||0),0);
    if(accCb > 0.004){
      const netCb = accCb * (1 - CASHBACK_TAX_RATE);
      const taxPct = Math.round(CASHBACK_TAX_RATE*100);
      const sinceLabel = lastW ? new Date(lastW*1000).toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'}) : '';
      const tip = `Кешбек, накопичений ${lastW ? 'з останнього виведення ('+sinceLabel+')' : 'за всі завантажені операції'}: ${fmt(accCb)} ${curSym()}. Після податку ${taxPct}%: ${fmt(netCb)} ${curSym()}. За обраний період: ${fmt(periodCb)} ${curSym()}.`;
      cashbackPill = `<div class="ms-bc-cashback" title="${tip}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/><path d="M9.5 9.5h3.2a1.6 1.6 0 0 1 0 3.2h-1.4a1.6 1.6 0 0 0 0 3.2h3.2M12 8v1.5M12 15.9v1.6"/></svg>
          <span>+${fmt(accCb)} ${curSym()}</span>
          <small>кешбек${lastW ? ' з '+sinceLabel : ''}</small>
          <span class="ms-bc-cb-net">−${taxPct}% → ${fmt(netCb)} ${curSym()}</span>
          <small>на карту</small>
        </div>`;
    }
  }
  p.innerHTML = `
    <div class="ms-balance-card">
      <div class="ms-bc-top">
        <p class="ms-bc-title">Баланс картки</p>
        <span class="ms-bc-cur">${currNames[acc.currency]||acc.currency}</span>
      </div>
      <div class="ms-bc-mid">
        <div class="ms-bc-chip"></div>
        <svg class="ms-bc-nfc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M7 6.5a8 8 0 0 1 0 11"/><path d="M11 4a12 12 0 0 1 0 16"/><path d="M15 1.5a16 16 0 0 1 0 21"/></svg>
      </div>
      <div class="ms-bc-bottom">
        <div class="ms-bc-bottom-main">
          <div class="ms-bc-amount">${fmt(acc.balance/100)} ${curSym()}</div>
          ${acc.currency!==978 ? `<p class="ms-bc-eur">${fmtEur(acc.balance/100, acc.currency).trim()}</p>` : ''}
          <p class="ms-bc-sub">${acc.type} · ${acc.pan}</p>
        </div>
        ${cashbackPill}
      </div>
    </div>
  `;
  return p;
}

// How much she can spend per day for the rest of this budgeting period (balance split
// evenly across the days left until the 10th), plus a day-by-day look back at whether
// she stayed under that line — days she did are highlighted, so she knows what's left
// to send to the savings jar.
function effectiveAmountGlobal(t){
  const key = txKey(t);
  if(state.notExpense[key]) return 0;
  return Math.abs(state.amountOverride[key] !== undefined ? state.amountOverride[key] : t.amount);
}

async function setJarEnabled(enabled, startDate){
  state.jarEnabled = enabled;
  state.jarDraftStartDate = null; // committed now — stop overriding the input with a stale draft
  await storageSet('ms_jarenabled', String(enabled));
  if(enabled){
    const chosenStart = startDate || todayStr();
    const acc = state.accounts.find(a=>a.id===state.selectedAccount);
    // if she picked a past date, reconstruct that day's opening balance from the cache
    // (Monobank gives a `balance` field per transaction); fall back to live balance
    // if that's today, or if we simply don't have cache reaching back that far
    let baseBalance;
    if(chosenStart === todayStr()){
      baseBalance = acc ? acc.balance/100 : 0;
    }else{
      baseBalance = reconstructBalanceAtStartOfDay(chosenStart);
      if(baseBalance===null) baseBalance = acc ? acc.balance/100 : 0; // best available fallback
    }
    state.jarDailyBudget = baseBalance / daysUntilPeriodEnd(chosenStart);
    state.jarPending = 0;
    state.jarLastDate = chosenStart;
    state.jarStartDateActual = chosenStart;
    state.jarPeriodStart = defaultPeriodStart();
    await storageSet('ms_jardailybudget', JSON.stringify(state.jarDailyBudget));
    await storageSet('ms_jarstartdateactual', state.jarStartDateActual);
    await storageSet('ms_jarpending', JSON.stringify(state.jarPending));
    await storageSet('ms_jarlastdate', state.jarLastDate);
    await storageSet('ms_jarperiodstart', state.jarPeriodStart);
    await updateJarAccumulation(); // immediately backfill from chosenStart to today using real cached spend
  }
  render();
}

// Folds each fully-completed day's under/over-spend into a persisted running total,
// exactly once per day, always measured against the SAME frozen daily budget (set once
// when tracking was turned on) — not a number that's recalculated from today's balance.
// Resets only when a new 10th-to-10th cycle starts.
async function updateJarAccumulation(){
  if(!state.jarEnabled) return;
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  if(!acc) return;
  const cycleStart = defaultPeriodStart();
  const today = todayStr();
  if(state.jarPeriodStart !== cycleStart || !state.jarLastDate || state.jarDailyBudget===null){
    // new cycle (or first time tracking starts) — freeze a fresh daily budget, begin
    // clean from today, no backfilling past days she wasn't tracking for
    state.jarDailyBudget = (acc.balance/100) / daysUntilPeriodEnd();
    state.jarPending = 0;
    state.jarLastDate = today;
    state.jarStartDateActual = today;
    state.jarPeriodStart = cycleStart;
    await storageSet('ms_jardailybudget', JSON.stringify(state.jarDailyBudget));
    await storageSet('ms_jarstartdateactual', state.jarStartDateActual);
    await storageSet('ms_jarpending', JSON.stringify(state.jarPending));
    await storageSet('ms_jarlastdate', state.jarLastDate);
    await storageSet('ms_jarperiodstart', state.jarPeriodStart);
    return;
  }
  if(state.jarLastDate >= today) return; // already caught up, nothing to close out yet

  const frozenBudget = state.jarDailyBudget;
  const history = getAllHistoricalExpenses();
  let cursor = state.jarLastDate;
  while(cursor < today){
    const spentThatDay = history
      .filter(t=>todayStr(t.date)===cursor)
      .reduce((s,t)=>s+effectiveAmountGlobal(t),0);
    state.jarPending += (frozenBudget - spentThatDay);
    const d = new Date(cursor+'T00:00:00'); d.setDate(d.getDate()+1);
    cursor = todayStr(d);
  }
  state.jarLastDate = today;
  await storageSet('ms_jarpending', JSON.stringify(state.jarPending));
  await storageSet('ms_jarlastdate', state.jarLastDate);
}

// The frozen daily budget applies every day of the period, unchanged. Today's live
// remaining (budget minus what's spent so far today) is shown flowing into the jar
// total in real time, and gets permanently locked in once the day rolls over.
function buildDailyBudgetPanel(all){
  const p = document.createElement('div');
  p.className = 'ms-panel ms-card';
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  if(!acc){ p.innerHTML = ''; return p; }

  const today = todayStr();
  const defaultEndDate = todayStr(nextPeriodBoundary());
  const endDate = state.dailyBudgetEndDate && state.dailyBudgetEndDate >= today
    ? state.dailyBudgetEndDate
    : defaultEndDate;
  const days = daysUntilDateInclusive(endDate);
  const dailyBudget = (acc.balance/100) / days;
  const endDateLabel = new Date(endDate+'T00:00:00').toLocaleDateString('uk-UA',{day:'numeric',month:'long',year:'numeric'});

  p.innerHTML = `
    <h2>Скільки можна витрачати на день</h2>
    <label class="ms-checkline">
      <input type="checkbox" id="jarEnabledChk" ${state.jarEnabled?'checked':''}>
      <span>Показувати цей блок</span>
    </label>
    ${state.jarEnabled ? `
    <div style="margin-top:14px">
      <div class="ms-field" style="max-width:260px;margin-bottom:12px">
        <label for="dailyBudgetEndDate" title="Баланс ${fmt(acc.balance/100)} ${curSym()} ÷ ${days} дн. (до ${endDateLabel}, включно)">Розрахувати до дати · ${days} дн.</label>
        <input type="date" id="dailyBudgetEndDate" min="${today}" value="${endDate}">
      </div>
      <div class="ms-today-amt" style="font-size:24px;color:var(--gold)">${fmt(dailyBudget)} ${curSym()}</div>
      <div class="ms-hint" style="margin:0;opacity:.8">${fmtEur(dailyBudget, curCode()).trim()}</div>
    </div>
    ` : ''}
  `;
  p.querySelector('#jarEnabledChk').addEventListener('change', async e=>{
    state.jarEnabled = e.target.checked;
    await storageSet('ms_jarenabled', String(state.jarEnabled));
    render();
  });
  const endDateInput = p.querySelector('#dailyBudgetEndDate');
  if(endDateInput) endDateInput.addEventListener('change', async e=>{
    const selectedDate = e.target.value;
    if(!selectedDate || selectedDate < todayStr()) return;
    state.dailyBudgetEndDate = selectedDate;
    await storageSet('ms_dailybudgetenddate', selectedDate);
    render();
  });
  return p;
}

function buildIncomingPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';

  const incoming = getActiveRawTxs().filter(t=>t.amount>0);
  const external = incoming.filter(t=>!INCOMING_SELF_KEYWORDS.some(k=>t.desc.includes(k)));
  const internal = incoming.filter(t=>INCOMING_SELF_KEYWORDS.some(k=>t.desc.includes(k)));
  const totalExternal = external.reduce((s,t)=>s+t.amount,0);

  p.innerHTML = `<h2>Надходження</h2><p class="ms-hint">Гроші, які прийшли на картку за обраний період.</p>
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px">Разом надійшло: <b style="color:var(--teal);font-family:var(--font-mono)">${fmt(totalExternal)} ${curSym()}</b> · ${external.length} надходжень</div>
    <div id="incExtList"></div>
    ${internal.length ? `<div class="ms-today-breakdown-lbl" style="margin-top:14px">Внутрішні перекази (не рахуються надходженням)</div><div id="incIntList"></div>` : ''}
  `;
  const extList = p.querySelector('#incExtList');
  if(external.length===0) extList.innerHTML = '<p class="ms-hint" style="margin:0">За цей період надходжень не було.</p>';
  const sortedExternal = external.sort((a,b)=>b.date-a.date);
  const INC_PREVIEW_COUNT = 6;
  const visibleExternal = state.expandedBlocks.incoming ? sortedExternal : sortedExternal.slice(0, INC_PREVIEW_COUNT);
  visibleExternal.forEach(t=>{
    const row = document.createElement('div');
    row.className='ms-inc-row';
    const dateStr = dtStr(t.date);
    row.innerHTML = `<span style="min-width:44px">${dateStr}</span><span style="flex:1">${escapeHtml(t.desc)}</span><span class="ms-amt-pos">+${fmt(t.amount)} ${curSym()}</span>`;
    extList.appendChild(row);
  });
  if(sortedExternal.length > INC_PREVIEW_COUNT){
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'ms-btn secondary';
    toggleBtn.style.width = '100%';
    toggleBtn.style.marginTop = '10px';
    toggleBtn.textContent = state.expandedBlocks.incoming ? 'Згорнути ▴' : `Показати ще ${sortedExternal.length - INC_PREVIEW_COUNT} ▾`;
    toggleBtn.addEventListener('click', ()=>{ state.expandedBlocks.incoming = !state.expandedBlocks.incoming; render(); });
    extList.insertAdjacentElement('afterend', toggleBtn);
  }
  const intList = p.querySelector('#incIntList');
  if(intList){
    internal.sort((a,b)=>b.date-a.date).forEach(t=>{
      const row = document.createElement('div');
      row.className='ms-inc-row';
      row.style.opacity='.6';
      const dateStr = dtStr(t.date);
      row.innerHTML = `<span style="min-width:44px">${dateStr}</span><span style="flex:1">${escapeHtml(t.desc)}</span><span class="ms-amt-pos">+${fmt(t.amount)} ${curSym()}</span>`;
      intList.appendChild(row);
    });
  }
  return p;
}

// ---------- History completeness: gap detection, auto-sync and CSV import ----------
// Why this exists: a statement is only fetched for the exact dates she picks, so days between
// two separate loads were silently missing (e.g. 02–09 Oct). Now the app (a) remembers which
// periods are fully covered, (b) finds the holes, (c) fills them itself in ≤31-day chunks
// under Monobank's limit of 1 request per 60 s, and (d) can import the official CSV report
// from the Monobank app for any older period — no limits, no waiting.
const DAY_S = 86400;
const sleepMs = ms => new Promise(r=>setTimeout(r, ms));

function mergeRanges(list){
  const a = list.map(r=>[r[0],r[1]]).sort((x,y)=>x[0]-y[0]);
  const out = [];
  a.forEach(r=>{
    const last = out[out.length-1];
    if(last && r[0] <= last[1]+1) last[1] = Math.max(last[1], r[1]);
    else out.push(r);
  });
  return out;
}
function addSyncedRange(a, b, acc){
  acc = acc || state.selectedAccount;
  if(!acc) return;
  state.syncedByAcc[acc] = mergeRanges((state.syncedByAcc[acc]||[]).concat([[a,b]]));
  storageSet('ms_syncedranges_acc', JSON.stringify(state.syncedByAcc));
}
function subtractRanges(intervals, covers){
  let res = intervals;
  covers.forEach(([ca,cb])=>{
    const next = [];
    res.forEach(([a,b])=>{
      if(cb<a || ca>b){ next.push([a,b]); return; }
      if(ca>a) next.push([a, ca-1]);
      if(cb<b) next.push([cb+1, b]);
    });
    res = next;
  });
  return res;
}
// Holes in the cached history: gaps >4 days between neighbouring operations (last ~12 months)
// plus the "tail" from the last operation until now — minus whatever is already known to be
// covered (a period with genuinely no payments won't be re-requested forever).
function findGaps(){
  const now = Math.floor(Date.now()/1000);
  const horizon = now - 370*DAY_S;
  // only operations the bank has confirmed for THIS card count as "have it"; old unlabelled
  // ones don't, so the periods they sit in get re-requested and sorted out by card
  const acc = state.selectedAccount;
  const mine = accCache();
  const ts = [...new Set(mine.filter(x=>IS_DEMO || x.acc===acc).map(x=>x.time))].sort((a,b)=>a-b);
  let cand = [];
  const unlabelled = mine.filter(x=>!x.acc && x.time>horizon).map(x=>x.time);
  if(unlabelled.length && !IS_DEMO){
    const firstMine = ts.length ? ts[0] : now-30*DAY_S;
    const oldest = Math.min(...unlabelled);
    if(oldest < firstMine) cand.push({r:[oldest, firstMine-1], tail:false, relabel:true});
  }
  for(let i=0;i<ts.length-1;i++){
    if(ts[i+1]-ts[i] > 4*DAY_S && ts[i+1] > horizon){
      cand.push({r:[Math.max(ts[i]+1, horizon), ts[i+1]-1], tail:false});
    }
  }
  const last = ts.length ? ts[ts.length-1] : now-30*DAY_S;
  cand.push({r:[last+1, now], tail:true});
  const out = [];
  cand.forEach(c=>{
    subtractRanges([c.r], state.syncedByAcc[acc]||[]).forEach(([a,b])=>{
      if(c.tail ? (b-a > 2*3600) : (b-a > 3*DAY_S)) out.push({from:a, to:b, tail:c.tail, relabel:!!c.relabel});
    });
  });
  return out;
}
function chunkRange(a, b){
  const out = [];
  for(let s0=a; s0<=b; s0 += 30*DAY_S) out.push([s0, Math.min(b, s0+30*DAY_S-1)]);
  return out;
}
function fmtUnixDay(t){ return new Date(t*1000).toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit',year:'2-digit'}); }
function setSyncText(msg){
  state.sync.msg = msg;
  const el = document.getElementById('syncStatus');
  if(el) el.textContent = msg; // no full render() here — it would reset scroll/inputs every second
}
// After new data lands in the cache, refresh what the "current period" view shows.
function refreshCurrentView(){
  if(state.step==='results' && state.viewTab==='current' && state.from){
    if(state.to < todayStr()) state.to = todayStr();
    const a = Math.floor(new Date(state.from+'T00:00:00').getTime()/1000);
    const b = Math.floor(new Date(state.to+'T23:59:59').getTime()/1000);
    ingestTransactions(accCache().filter(it=>it.time>=a && it.time<=b));
  }
}
async function runSync(gaps){
  if(state.sync.running) return;
  if(!state.token || !state.selectedAccount){ setSyncText('Спочатку підключись токеном і обери картку.'); return; }
  const queue = [];
  gaps.forEach(g=>chunkRange(g.from, g.to).forEach(c=>queue.push(c)));
  if(!queue.length){ setSyncText('Пропусків немає ✓'); return; }
  queue.sort((x,y)=>y[0]-x[0]); // newest first — recent history is what she looks at
  const account = state.selectedAccount; // the whole run belongs to this card; switching cards stops it
  const switched = ()=>state.selectedAccount!==account;
  state.sync = {running:true, msg:'', done:0, total:queue.length};
  try{
    while(queue.length && !switched()){
      const [a,b] = queue.shift();
      let wait = 61000 - (Date.now()-state.lastApiCall); // Monobank: 1 request / 60 s per token
      while(wait>0 && !switched()){
        setSyncText(`Чекаю ліміт Monobank: ${Math.ceil(wait/1000)} с · далі ${fmtUnixDay(a)}–${fmtUnixDay(b)} (${state.sync.done+1} з ${state.sync.total})`);
        await sleepMs(Math.min(wait, 1000));
        wait = 61000 - (Date.now()-state.lastApiCall);
      }
      if(switched()) break;
      setSyncText(`Завантажую ${fmtUnixDay(a)}–${fmtUnixDay(b)} (${state.sync.done+1} з ${state.sync.total})…`);
      let items;
      try{
        items = await fetchStatement(state.token.trim(), account, a, b);
      }catch(e){
        if(String(e.message).includes('429')){ queue.unshift([a,b]); continue; } // too early — wait the full minute again
        throw e;
      }
      mergeIntoCache(items, account);
      if(items.length >= 500){
        // the API caps one response at 500 operations — continue from the oldest one received
        const oldest = Math.min(...items.map(i=>i.time));
        queue.unshift([a, oldest]); state.sync.total++;
      }else{
        reconcileRange(account, a, b, items);
        addSyncedRange(a, Math.min(b, Math.floor(Date.now()/1000)), account);
      }
      state.sync.done++;
    }
    setSyncText(switched() ? '' : 'Готово ✓ Історію догружено.');
  }catch(e){
    setSyncText('Помилка синхронізації: '+(e.message||e)+'. Спробуй ще раз пізніше.');
  }
  state.sync.running = false;
  if(switched()){ state.autoSyncDone = false; setTimeout(autoSync, 0); return; } // the new card gets its own run
  refreshCurrentView();
  render();
}
// Runs once per visit right after the statement is shown: fills the tail and recent holes
// (older holes are offered with a button — they can take many minutes).
function autoSync(){
  if(state.autoSyncDone || state.sync.running) return;
  state.autoSyncDone = true;
  const recent = Math.floor(Date.now()/1000) - 62*DAY_S;
  // old operations not yet sorted by card are re-checked in full (once per card, newest first,
  // one request a minute in the background); other old holes wait for the button
  const gaps = findGaps().filter(g=>g.tail || g.relabel || g.to >= recent)
    .map(g=>g.relabel ? g : {...g, from: Math.max(g.from, recent)});
  if(gaps.length) runSync(gaps);
}

// --- CSV from the Monobank app ("Виписка" → CSV) ---
function tzOffsetMs(ts, tz){
  const p = {};
  new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'})
    .formatToParts(new Date(ts)).forEach(x=>{ if(x.type!=='literal') p[x.type]=+x.value; });
  return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second) - Math.floor(ts/1000)*1000;
}
function kyivToUnix(y,mo,d,h,mi,s){
  const wall = Date.UTC(y,mo-1,d,h,mi,s);
  let utc = wall;
  for(let i=0;i<2;i++) utc = wall - tzOffsetMs(utc,'Europe/Kyiv');
  return Math.floor(utc/1000);
}
function parseCsv(text){
  const rows = []; let row = [], cur = '', q = false;
  text = text.replace(/^﻿/,'');
  for(let i=0;i<text.length;i++){
    const c = text[i];
    if(q){
      if(c==='"'){ if(text[i+1]==='"'){ cur+='"'; i++; } else q=false; }
      else cur += c;
    }else if(c==='"') q = true;
    else if(c===','){ row.push(cur); cur=''; }
    else if(c==='\n'){ row.push(cur); rows.push(row); row=[]; cur=''; }
    else if(c!=='\r') cur += c;
  }
  if(cur!=='' || row.length){ row.push(cur); rows.push(row); }
  return rows;
}
const CSV_CURRENCY = {UAH:980,EUR:978,USD:840,RON:946,TRY:949,PLN:985,GEL:981,BGN:975,MDL:498,CZK:203,HUF:348,GBP:826,CHF:756,SEK:752,NOK:578,DKK:208};
function hashStr(s){ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))|0; return (h>>>0).toString(36); }
function csvToItems(text){
  const rows = parseCsv(text);
  if(!rows.length || !/Дата/i.test(rows[0][0]||'') || !/Деталі/i.test(rows[0][1]||'')) throw new Error('Це не схоже на CSV-виписку з застосунку Monobank.');
  const num = v=>{ const n = parseFloat(String(v).replace(/\s/g,'').replace(',','.')); return isFinite(n) ? n : 0; };
  const items = [];
  rows.slice(1).forEach(r=>{
    if(r.length < 10) return;
    const m = /^(\d\d)\.(\d\d)\.(\d{4}) (\d\d):(\d\d):(\d\d)$/.exec((r[0]||'').trim());
    if(!m) return;
    const time = kyivToUnix(+m[3],+m[2],+m[1],+m[4],+m[5],+m[6]); // report times are Kyiv time
    const amount = Math.round(num(r[3])*100);
    items.push({
      id: `csv_${time}_${amount}_${hashStr(r[1]||'')}`, time, description: r[1]||'', mcc: parseInt(r[2],10)||0,
      amount, operationAmount: Math.round(num(r[4])*100), currencyCode: CSV_CURRENCY[r[5]]||980,
      balance: Math.round(num(r[9])*100), cashbackAmount: Math.round(num(r[8])*100),
      commissionRate: Math.round(num(r[7])*100), hold: false
    });
  });
  return items;
}
function readFileText(f){
  return new Promise((res,rej)=>{
    const fr = new FileReader();
    fr.onload = ()=>res(String(fr.result)); fr.onerror = ()=>rej(fr.error);
    fr.readAsText(f, 'utf-8');
  });
}
async function importCsvFiles(files){
  let added = 0, skipped = 0, bad = 0;
  try{
    for(const f of files){
      const items = csvToItems(await readFileText(f));
      if(!items.length){ bad++; continue; }
      // already have it (loaded earlier via API)? match by minute + amount, counting repeats
      const have = new Map();
      accCache().forEach(it=>{ const k = Math.floor(it.time/60)+'|'+it.amount; have.set(k,(have.get(k)||0)+1); });
      const fresh = [];
      items.forEach(it=>{
        const k = Math.floor(it.time/60)+'|'+it.amount;
        if(have.get(k)>0){ have.set(k, have.get(k)-1); skipped++; } else fresh.push(it);
      });
      added += mergeIntoCache(fresh, state.selectedAccount); // a CSV report is always one card's — the one open now
      const times = items.map(i=>i.time);
      addSyncedRange(Math.min(...times), Math.max(...times), state.selectedAccount); // the report covers that whole span
    }
    state.importMsg = `Імпорт CSV: додано ${added}, вже були ${skipped}${bad?`, порожніх файлів: ${bad}`:''}.`;
  }catch(e){
    state.importMsg = 'Помилка імпорту: '+(e.message||e);
  }
  refreshCurrentView();
  render();
}

// ---------- search across the whole cached history ----------
// The "Всі операції" search only sees the period currently shown. This panel searches
// every operation in the cache (all years ever loaded or imported from CSV), with filters
// for dates, amount, category and direction, and totals for whatever was found — e.g.
// "when did I buy sneakers" or "how much did I send to that card in total".
function historySearchRows(){
  const hs = state.historySearch;
  const words = hs.q.toLowerCase().split(/\s+/).filter(Boolean);
  const num = v=>{ const n = parseFloat(String(v).replace(',','.')); return isNaN(n) ? null : n; };
  const minA = num(hs.min), maxA = num(hs.max);
  const fromT = hs.from ? new Date(hs.from+'T00:00:00').getTime() : null;
  const toT = hs.to ? new Date(hs.to+'T23:59:59').getTime() : null;
  const out = [];
  accCache().forEach(raw=>{
    const t = mapRawItem(raw);
    const ts = t.date.getTime();
    if(fromT!==null && ts<fromT) return;
    if(toT!==null && ts>toT) return;
    const abs = Math.abs(t.amount);
    if(minA!==null && abs<minA) return;
    if(maxA!==null && abs>maxA) return;
    if(hs.kind==='out' && !(t.amount<0)) return;
    if(hs.kind==='in' && !(t.amount>0)) return;
    const cat = categoryFor(t);
    if(hs.cat && cat!==hs.cat) return;
    const note = state.notes[txKey(t)] || '';
    if(words.length){
      const hay = (t.desc+' '+t.bankComment+' '+note+' '+cat).toLowerCase();
      if(!words.every(w=>hay.includes(w))) return;
    }
    out.push({...t, cat, note});
  });
  out.sort((a,b)=>b.date-a.date);
  return out;
}
function histDate(d){
  const pad = n=>String(n).padStart(2,'0');
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()}`;
}
function renderHistoryResults(panel){
  const hs = state.historySearch;
  const rows = historySearchRows();
  const spent = rows.reduce((s,t)=>t.amount<0 ? s-t.amount : s, 0);
  const income = rows.reduce((s,t)=>t.amount>0 ? s+t.amount : s, 0);
  const sum = panel.querySelector('#hsSummary');
  const body = panel.querySelector('#hsBody');
  const more = panel.querySelector('#hsMore');
  const total = accCache().length;
  if(!rows.length){
    sum.innerHTML = `Нічого не знайдено серед ${total} операцій в кеші.`;
  }else{
    const first = rows[rows.length-1].date, last = rows[0].date;
    sum.innerHTML = `Знайдено: <b>${rows.length}</b> з ${total} · витрачено <b class="ms-amt-neg">−${fmt(spent)} ${curSym()}</b> · надійшло <b class="ms-amt-pos">+${fmt(income)} ${curSym()}</b> · ${histDate(first)} — ${histDate(last)}`;
  }
  body.innerHTML = '';
  rows.slice(0, hs.limit).forEach(t=>{
    const tr = document.createElement('tr');
    const tripId = tripIdFor(t);
    const trip = tripId ? state.trips.find(x=>x.id===tripId) : null;
    tr.innerHTML = `<td style="white-space:nowrap">${histDate(t.date)}<div class="ms-note-preview">${String(t.date.getHours()).padStart(2,"0")}:${String(t.date.getMinutes()).padStart(2,"0")}</div></td>
      <td>${escapeHtml(t.desc)}${t.bankComment?`<div class="ms-note-preview">🏦 ${escapeHtml(t.bankComment)}</div>`:''}${t.note?`<div class="ms-note-preview">📝 ${escapeHtml(t.note)}</div>`:''}</td>
      <td>${escapeHtml(t.cat)}${trip?`<div class="ms-note-preview">🧳 ${escapeHtml(trip.name)}</div>`:''}</td>
      <td style="text-align:right" class="${t.amount<0?'ms-amt-neg':'ms-amt-pos'}">${t.amount<0?'−':'+'}${fmt(Math.abs(t.amount))}</td>`;
    body.appendChild(tr);
  });
  if(rows.length > hs.limit){
    more.style.display = '';
    more.textContent = `Показати ще 100 (залишилось ${rows.length-hs.limit})`;
  }else{
    more.style.display = 'none';
  }
}
function buildHistorySearchPanel(){
  const p = document.createElement('div');
  p.className = 'ms-panel';
  const hs = state.historySearch;
  const catOpts = sortedCats().map(c=>`<option value="${escapeHtml(c)}"${hs.cat===c?' selected':''}>${escapeHtml(c)}</option>`).join('');
  p.innerHTML = `<h2>Пошук по всій історії</h2>
    <p class="ms-hint">Шукає серед усіх ${accCache().length} операцій цієї картки в кеші (усі роки, що завантажені або імпортовані з CSV), незалежно від вибраного періоду. Кілька слів — шукає всі одразу: назва магазину, нотатка, коментар з банку, категорія або частина номера картки (наприклад, «5354»).</p>
    <div class="ms-field" style="margin-bottom:10px"><input type="text" id="hsQ" placeholder="Наприклад: nike, кросівки, 5354, подарунок…" value="${escapeHtml(hs.q)}"></div>
    <div class="ms-row">
      <div class="ms-field"><label>Від дати</label><input type="date" id="hsFrom" value="${escapeHtml(hs.from)}"></div>
      <div class="ms-field"><label>До дати</label><input type="date" id="hsTo" value="${escapeHtml(hs.to)}"></div>
      <div class="ms-field"><label>Сума від</label><input type="number" id="hsMin" min="0" step="any" value="${escapeHtml(String(hs.min))}"></div>
      <div class="ms-field"><label>Сума до</label><input type="number" id="hsMax" min="0" step="any" value="${escapeHtml(String(hs.max))}"></div>
      <div class="ms-field"><label>Категорія</label><select id="hsCat"><option value="">Усі</option>${catOpts}</select></div>
      <div class="ms-field"><label>Тип</label><select id="hsKind">
        <option value="all"${hs.kind==='all'?' selected':''}>Усі</option>
        <option value="out"${hs.kind==='out'?' selected':''}>Витрати</option>
        <option value="in"${hs.kind==='in'?' selected':''}>Надходження</option></select></div>
      <button class="ms-btn secondary" id="hsReset" title="Скинути фільтри">✕</button>
    </div>
    <div id="hsSummary" style="font-size:13px;color:var(--muted);margin:12px 0"></div>
    <div class="ms-table-wrap"><table class="ms-tx"><thead><tr><th>Дата</th><th>Опис</th><th>Категорія</th><th style="text-align:right">Сума</th></tr></thead><tbody id="hsBody"></tbody></table></div>
    <button class="ms-btn secondary" id="hsMore" style="margin-top:10px;display:none"></button>`;
  const bind = (id, key, resetLimit=true)=>{
    p.querySelector(id).addEventListener('input', e=>{
      state.historySearch[key] = e.target.value;
      if(resetLimit) state.historySearch.limit = 100;
      renderHistoryResults(p);
    });
  };
  bind('#hsQ','q'); bind('#hsFrom','from'); bind('#hsTo','to'); bind('#hsMin','min'); bind('#hsMax','max');
  p.querySelector('#hsCat').addEventListener('change', e=>{ state.historySearch.cat = e.target.value; state.historySearch.limit = 100; renderHistoryResults(p); });
  p.querySelector('#hsKind').addEventListener('change', e=>{ state.historySearch.kind = e.target.value; state.historySearch.limit = 100; renderHistoryResults(p); });
  p.querySelector('#hsMore').addEventListener('click', ()=>{ state.historySearch.limit += 100; renderHistoryResults(p); });
  p.querySelector('#hsReset').addEventListener('click', ()=>{
    state.historySearch = {q:'', from:'', to:'', min:'', max:'', cat:'', kind:'all', limit:100};
    render();
  });
  renderHistoryResults(p);
  return p;
}

function buildDataTransferPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  p.innerHTML = `
    <h2>Перенести дані на інший пристрій</h2>
    <p class="ms-hint">Виправлені категорії, ручні записи і борги зберігаються локально на цьому пристрої/браузері. Щоб перенести їх на телефон чи інший комп'ютер — вивантаж файл тут і заватаж його там.</p>
    <h2 style="margin-top:18px">Історія з Monobank</h2>
    <div id="syncBox"></div>
    <div class="ms-row" style="margin-top:8px">
      <label class="ms-btn secondary" style="cursor:pointer" for="csvInput">Імпорт CSV з Monobank</label>
      <input type="file" id="csvInput" accept=".csv,text/csv" multiple style="display:none">
    </div>
    <p class="ms-hint">CSV-виписку за будь-який період можна скачати в застосунку Monobank — вона вантажиться без обмежень API, дублі пропускаються. Імпортуй виписку тієї картки, яка зараз обрана — операції запишуться саме на неї.</p>
    ${state.importMsg ? `<p class="ms-hint" style="color:var(--teal)">${escapeHtml(state.importMsg)}</p>` : ''}
    <div class="ms-row" style="margin-top:14px">
      <button class="ms-btn secondary" id="exportBtn">Вивантажити дані (.json)</button>
      <label class="ms-btn secondary" style="cursor:pointer" for="importInput">Завантажити дані з файлу</label>
      <input type="file" id="importInput" accept="application/json" style="display:none">
    </div>
  `;
  p.querySelector('#exportBtn').addEventListener('click', exportData);
  p.querySelector('#csvInput').addEventListener('change', async (e)=>{
    if(e.target.files.length) await importCsvFiles([...e.target.files]);
  });
  const box = p.querySelector('#syncBox');
  const gaps = findGaps();
  const head = gaps.filter(g=>!g.tail && !g.relabel);
  const relabelLeft = gaps.some(g=>g.relabel);
  const queueSize = gaps.reduce((n,g)=>n+chunkRange(g.from,g.to).length, 0);
  box.innerHTML = `
    <div class="ms-hint" id="syncStatus" style="margin:0 0 6px">${escapeHtml(state.sync.msg||'')}</div>
    ${relabelLeft ? `<div class="ms-hint" style="margin:0 0 6px">Старі операції ще розкладаються по картках — це йде у фоні, поки сторінка відкрита (1 запит на хвилину).</div>` : ''}
    ${head.length ? `<div class="ms-hint" style="margin:0 0 6px">Немає даних за: ${head.slice(0,6).map(g=>fmtUnixDay(g.from)+'–'+fmtUnixDay(g.to)).join(', ')}${head.length>6?' …':''}</div>` : `<div class="ms-hint" style="margin:0 0 6px">Пропусків в історії (за останні 12 місяців) не знайдено ✓</div>`}
    ${queueSize ? `<button class="ms-btn secondary" id="syncBtn" ${state.sync.running?'disabled':''}>${state.sync.running?'Триває…':`Догрузити пропуски (${queueSize} запит., ≈ ${queueSize} хв)`}</button>` : ''}`;
  const syncBtn = box.querySelector('#syncBtn');
  if(syncBtn) syncBtn.addEventListener('click', ()=>runSync(findGaps()));
  p.querySelector('#importInput').addEventListener('change', async (e)=>{
    if(e.target.files[0]) await importDataFromFile(e.target.files[0]);
  });
  return p;
}

function buildTripsPanel(all){
  const p = document.createElement('div');
  p.className = 'ms-panel ms-trips-panel';
  p.innerHTML = `
    <h2>🧳 Подорожі — окремий облік витрат по поїздках</h2>
    <p class="ms-hint">Створи поїздку й задай її дати (✎ біля поїздки) — усі операції за ці дати потраплять сюди автоматично. Якщо якась покупка не стосується поїздки, обери «—» у колонці «Поїздка» в таблиці «Всі операції». Без дат зв'язок робиться вручну в тій самій колонці.</p>
    <div class="ms-manual-form">
      <div class="ms-field" style="flex:2"><label>Назва поїздки</label><input type="text" id="tripName" placeholder="Наприклад: Польща, липень"></div>
      <button class="ms-btn" id="tripAdd" style="align-self:flex-end">Створити поїздку</button>
    </div>
    <div id="tripsList" style="margin-top:16px"></div>
  `;
  const list = p.querySelector('#tripsList');
  if(state.trips.length===0){
    list.innerHTML = '<p class="ms-hint" style="margin:0">Поїздок ще немає — створи першу вище.</p>';
  }
  state.trips.forEach(trip=>{
    const txs = all.filter(t=>tripIdFor(t)===trip.id);
    const expanded = !!state.expandedTrips?.[trip.id];

    let dateRangeStr = '';
    let dayCount = 0;
    let tripMinD = null, tripMaxD = null; // exposed for refund-matching below
    const fmtD = d=>d.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'});
    if(trip.dateFrom && trip.dateTo){
      // manually set — takes priority over any automatic guess
      const minD = new Date(trip.dateFrom+'T00:00:00');
      const maxD = new Date(trip.dateTo+'T23:59:59');
      tripMinD = minD; tripMaxD = maxD;
      dateRangeStr = trip.dateFrom===trip.dateTo ? fmtD(minD) : `${fmtD(minD)} – ${fmtD(maxD)}`;
      dayCount = Math.round((maxD.getTime() - minD.getTime())/(24*60*60*1000)) + 1;
    }else{
      // tickets/hotels booked ahead of time are often charged in UAH from home,
      // which skews the date range if we just use every tagged transaction. Prefer
      // foreign-currency transactions (actual spend while abroad) for the real dates;
      // fall back to everything if the trip has no foreign-currency spend at all.
      const abroadTxs = txs.filter(t=>t.currency && t.currency!==980);
      const dateSourceTxs = abroadTxs.length ? abroadTxs : txs;
      if(dateSourceTxs.length){
        const dates = dateSourceTxs.map(t=>t.date.getTime());
        const minD = new Date(Math.min(...dates));
        const maxD = new Date(Math.max(...dates));
        tripMinD = new Date(minD.toDateString());
        tripMaxD = new Date(maxD.toDateString()+' 23:59:59');
        dateRangeStr = minD.toDateString()===maxD.toDateString() ? fmtD(minD) : `${fmtD(minD)} – ${fmtD(maxD)}`;
        dayCount = Math.round((new Date(maxD.toDateString()).getTime() - new Date(minD.toDateString()).getTime())/(24*60*60*1000)) + 1;
      }
    }

    // Refunds (Скасування/Bolt/Uber/Uklon) never get tagged to a trip directly (they're
    // positive amounts, not shown in "Всі операції" at all) — find any that fall within
    // this trip's date range and net them against the matching category, same logic as
    // the Загальна картина netting above.
    const allRaw = accCache().map(mapRawItem); // unfiltered — need the positive (refund) transactions too, unlike getAllHistoricalExpenses()
    const tripRefunds = (tripMinD && tripMaxD) ? allRaw.filter(t=>
      t.amount>0 && t.date>=tripMinD && t.date<=tripMaxD &&
      (CANCELLATION_KEYWORDS_GLOBAL.some(k=>t.desc.includes(k)) || REFUND_PRONE_MERCHANTS_GLOBAL.some(m=>t.desc.toLowerCase().includes(m)))
    ) : [];

    // exact-category breakdown (not just the 4 broad groups) with refunds netted in,
    // so e.g. "такси" genuinely reflects what the rides cost after cancellations
    const byExactCat = {};
    txs.forEach(t=>{ byExactCat[t.cat] = (byExactCat[t.cat]||0) + Math.abs(t.amount); });
    tripRefunds.forEach(r=>{
      const rCat = categoryFor(r);
      byExactCat[rCat] = (byExactCat[rCat]||0) - r.amount; // reduce toward zero
    });
    const sum = Object.values(byExactCat).reduce((s,v)=>s+v,0);

    const card = document.createElement('div');
    card.className = 'ms-trip-card';

    const head = document.createElement('div');
    head.className = 'ms-trip-head';
    head.innerHTML = `
      <span class="ms-trip-chevron">${expanded?'▾':'▸'}</span>
      <span class="ms-trip-name">${escapeHtml(trip.name)}</span>
      ${dateRangeStr ? `<span class="ms-trip-meta">${dateRangeStr}${dayCount>1?' · <b style="color:var(--text)">'+dayCount+' дн.</b>':''}</span>` : ''}
      <span class="ms-trip-meta">${txs.length} оп.</span>
      <span class="ms-trip-sum">${fmt(sum)} ${curSym()}</span>
    `;
    head.addEventListener('click', (e)=>{
      if(e.target.closest('.ms-btn')) return;
      state.expandedTrips = state.expandedTrips || {};
      state.expandedTrips[trip.id] = !expanded;
      render();
    });
    const renameBtn = document.createElement('button');
    renameBtn.className = 'ms-icon-btn';
    renameBtn.textContent = '✏️';
    renameBtn.title = 'Перейменувати поїздку';
    renameBtn.addEventListener('click', ()=>{
      const newName = prompt('Нова назва поїздки:', trip.name);
      renameTrip(trip.id, newName);
    });
    head.appendChild(renameBtn);
    const datesBtn = document.createElement('button');
    datesBtn.className = 'ms-icon-btn';
    datesBtn.textContent = '📅';
    datesBtn.title = 'Задати дати поїздки вручну';
    datesBtn.addEventListener('click', ()=>{
      state.editingTripDates = state.editingTripDates===trip.id ? null : trip.id;
      render();
    });
    head.appendChild(datesBtn);
    const delBtn = document.createElement('button');
    delBtn.className = 'ms-icon-btn';
    delBtn.textContent = '🗑️';
    delBtn.title = 'Видалити поїздку';
    delBtn.addEventListener('click', ()=>{
      if(confirm(`Видалити поїздку «${trip.name}»? Прив'язки трат до неї теж знімуться (самі трати нікуди не дінуться).`)) deleteTrip(trip.id);
    });
    head.appendChild(delBtn);
    card.appendChild(head);

    if(state.editingTripDates===trip.id){
      const dateForm = document.createElement('div');
      dateForm.className = 'ms-row';
      dateForm.style.cssText = 'margin:10px 0;align-items:flex-end;gap:10px;flex-wrap:wrap';
      dateForm.innerHTML = `
        <div class="ms-field" style="max-width:170px">
          <label>Початок поїздки</label>
          <input type="date" id="tripDateFromInput" value="${trip.dateFrom || todayStr()}">
        </div>
        <div class="ms-field" style="max-width:170px">
          <label>Кінець поїздки</label>
          <input type="date" id="tripDateToInput" value="${trip.dateTo || todayStr()}">
        </div>
        <button class="ms-btn" id="tripDateSaveBtn">Зберегти</button>
        <button class="ms-btn secondary" id="tripDateCancelBtn">Скасувати</button>
      `;
      dateForm.querySelector('#tripDateSaveBtn').addEventListener('click', ()=>{
        const from = dateForm.querySelector('#tripDateFromInput').value;
        const to = dateForm.querySelector('#tripDateToInput').value;
        state.editingTripDates = null;
        setTripDates(trip.id, from, to);
      });
      dateForm.querySelector('#tripDateCancelBtn').addEventListener('click', ()=>{
        state.editingTripDates = null;
        render();
      });
      card.appendChild(dateForm);
    }

    if(expanded){
      const detailWrap = document.createElement('div');
      detailWrap.className = 'ms-trip-pick';
      if(txs.length===0){
        detailWrap.innerHTML = '<p class="ms-hint" style="margin:10px 0">Ще нічого не прив\'язано — познач операції в «Всі операції» вище.</p>';
      }else{
        detailWrap.innerHTML = `<p class="ms-hint" style="margin:10px 0">Витрати по категоріях; суми враховують повернення.</p>`;

        const byCatTxs = {};
        txs.forEach(t=>{ (byCatTxs[t.cat] = byCatTxs[t.cat]||[]).push(t); });
        const refundsByExactCat = {};
        tripRefunds.forEach(r=>{
          const category = categoryFor(r);
          (refundsByExactCat[category] = refundsByExactCat[category]||[]).push(r);
        });
        const categoryEntries = Object.entries(byExactCat)
          .sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],'uk'));
        const categoryGrid = document.createElement('div');
        categoryGrid.className = 'ms-trip-visual-grid';
        categoryEntries.forEach(([cat,amount])=>{
          const categoryTxs = byCatTxs[cat]||[];
          const categoryRefunds = refundsByExactCat[cat]||[];
          const categoryKey = `${trip.id}|${cat}`;
          const categoryExpanded = !!state.expandedTripCategories[categoryKey];
          const categoryCard = document.createElement('div');
          categoryCard.className = 'ms-trip-category-card ms-trip-category-clickable'+(categoryExpanded?' is-expanded':'');
          categoryCard.tabIndex = 0;
          categoryCard.setAttribute('role','button');
          categoryCard.setAttribute('aria-expanded', String(categoryExpanded));
          categoryCard.style.setProperty('--trip-category-color', COLORS[cat]||'#B8863F');
          categoryCard.innerHTML = `
            <span class="ms-trip-category-icon">${escapeHtml(ICONS[cat]||'❓')}</span>
            <span class="ms-trip-category-name">${escapeHtml(cat)}</span>
            <strong class="ms-trip-category-amount">${amount<0?'−':''}${fmt(amount)} ${curSym()}</strong>
            <span class="ms-trip-category-track" aria-hidden="true"></span>
            <span class="ms-trip-category-hint">${categoryExpanded?'Згорнути':'Переглянути витрати'} ▾</span>
          `;
          const toggleCategory = ()=>{
            state.expandedTripCategories[categoryKey] = !categoryExpanded;
            render();
          };
          categoryCard.addEventListener('click', toggleCategory);
          categoryCard.addEventListener('keydown', e=>{
            if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleCategory(); }
          });
          const categoryNote = (trip.categoryNotes?.[cat] || '').trim();
          if(categoryNote){
            const note = document.createElement('span');
            note.className = 'ms-trip-category-note';
            note.textContent = `💬 ${categoryNote}`;
            note.addEventListener('click', e=>e.stopPropagation());
            categoryCard.appendChild(note);
          }
          const noteButton = document.createElement('button');
          noteButton.type = 'button';
          noteButton.className = 'ms-trip-category-note-button';
          noteButton.textContent = categoryNote ? 'Змінити коментар' : '+ Коментар';
          noteButton.setAttribute('aria-expanded', String(categoryExpanded));
          noteButton.addEventListener('click', e=>e.stopPropagation());
          noteButton.addEventListener('click', ()=>setTripCategoryNote(trip.id, cat));
          categoryCard.appendChild(noteButton);

          if(categoryExpanded){
            const transactionList = document.createElement('div');
            transactionList.className = 'ms-trip-category-transactions';
            transactionList.addEventListener('click', e=>e.stopPropagation());
            categoryTxs.slice().sort((a,b)=>b.date-a.date).forEach(t=>{
              const row = document.createElement('div');
              row.className = 'ms-trip-category-transaction';
              row.innerHTML = `<span>${dtStr(t.date)} · ${escapeHtml(t.desc)}</span><strong>−${fmt(Math.abs(t.amount))} ${curSym()}</strong>${state.notes[txKey(t)]?`<small>💬 ${escapeHtml(state.notes[txKey(t)])}</small>`:''}`;
              transactionList.appendChild(row);
            });
            categoryRefunds.slice().sort((a,b)=>b.date-a.date).forEach(r=>{
              const row = document.createElement('div');
              row.className = 'ms-trip-category-transaction is-refund';
              row.innerHTML = `<span>↩ ${dtStr(r.date)} · ${escapeHtml(r.desc)} (повернення)</span><strong>+${fmt(r.amount)} ${curSym()}</strong>`;
              transactionList.appendChild(row);
            });
            categoryCard.appendChild(transactionList);
          }
          categoryGrid.appendChild(categoryCard);
        });
        const totalCard = document.createElement('div');
        totalCard.className = 'ms-trip-total-card';
        totalCard.innerHTML = `
          ${tripCoverHtml(trip.name)}
          <span class="ms-trip-total-label">Разом за подорож</span>
          <strong class="ms-trip-total-amount">${fmt(sum)} ${curSym()}</strong>
        `;
        const totalEurEstimate = document.createElement('span');
        totalEurEstimate.className = 'ms-trip-total-eur';
        totalEurEstimate.textContent = 'Курс Monobank…';
        totalCard.appendChild(totalEurEstimate);
        const tripCurrency = curCode();
        monobankEurRate(tripCurrency).then(rate=>{
          const eurAmount = rate ? Math.abs(sum)*rate : toEur(sum, tripCurrency);
          if(eurAmount===null){
            totalEurEstimate.textContent = '';
            return;
          }
          const formattedEur = eurAmount.toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2});
          totalEurEstimate.textContent = rate ? `≈ € ${formattedEur} · курс Monobank` : `≈ € ${formattedEur} · орієнтовно`;
        });
        const summaryLayout = document.createElement('div');
        summaryLayout.className = 'ms-trip-summary-layout';
        summaryLayout.appendChild(categoryGrid);
        summaryLayout.appendChild(totalCard);
        detailWrap.appendChild(summaryLayout);

      }
      card.appendChild(detailWrap);
    }

    list.appendChild(card);
  });
  p.querySelector('#tripAdd').addEventListener('click', ()=>{
    const input = p.querySelector('#tripName');
    addTrip(input.value);
    input.value = '';
  });
  return p;
}

function buildCustomCategoryPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  p.innerHTML = `
    <h2>Додати свою категорію</h2>
    <p class="ms-hint">Впиши назву і будь-яку емодзі-іконку — категорія одразу зʼявиться у всіх списках вибору.</p>
    <div class="ms-manual-form">
      <div class="ms-field" style="max-width:70px"><label>Іконка</label><input type="text" id="ccIcon" placeholder="🏷️" maxlength="4"></div>
      <div class="ms-field" style="flex:2"><label>Назва категорії</label><input type="text" id="ccName" placeholder="Наприклад: хобі"></div>
      <button class="ms-btn" id="ccAdd" style="align-self:flex-end">Додати</button>
    </div>
    <div id="ccList" style="margin-top:12px"></div>
  `;
  const list = p.querySelector('#ccList');
  if(state.customCats.length){
    state.customCats.forEach(c=>{
      const row = document.createElement('div');
      row.className = 'ms-today-cat-row';
      row.innerHTML = `<span class="ms-legend-icon">${c.icon||'🏷️'}</span><span class="ms-today-cat-name">${escapeHtml(c.name)}</span>`;
      list.appendChild(row);
    });
  }
  p.querySelector('#ccAdd').addEventListener('click', async ()=>{
    const name = p.querySelector('#ccName').value;
    const icon = p.querySelector('#ccIcon').value || '🏷️';
    const ok = await addCustomCategory(name, icon);
    if(!ok) alert('Категорія з такою назвою вже є, або назва порожня.');
  });
  return p;
}

function buildDailyPanel(all, from, to){
  const p = document.createElement('div');
  p.className='ms-panel';

  const byDay = {};
  all.forEach(t=>{
    const key = t.date instanceof Date ? todayStr(t.date) : String(t.date).slice(0,10);
    byDay[key] = (byDay[key]||0) + Math.abs(t.amount);
  });

  const days = [];
  if(from && to){
    let cur = new Date(from+'T00:00:00');
    const end = new Date(to+'T00:00:00');
    while(cur <= end){
      const key = todayStr(cur);
      days.push({key, amount: byDay[key]||0, day: cur.getDate()});
      cur.setDate(cur.getDate()+1);
    }
  }
  const max = Math.max(1, ...days.map(d=>d.amount));
  const avg = days.length ? days.reduce((s,d)=>s+d.amount,0)/days.length : 0;
  const lastDay = days[days.length-1];

  p.innerHTML = `<h2>Витрати по днях</h2><p class="ms-hint">Торкнись або наведи курсор на стовпчик, щоб побачити суму за день.</p><div class="ms-daily-readout" id="dailyReadout"></div><div class="ms-daily-wrap"><div class="ms-daily-chart" id="dailyChart"></div></div><div class="ms-daily-avg">У середньому ${fmt(avg)} ₴/день</div>`;
  const readout = p.querySelector('#dailyReadout');
  const setReadout = (d)=>{
    const dt = new Date(d.key+'T00:00:00');
    const dstr = dt.toLocaleDateString('uk-UA',{day:'2-digit',month:'long'});
    readout.innerHTML = d.amount>0 ? `${dstr}: <b>${fmt(d.amount)} ₴</b>` : `${dstr}: витрат не було`;
  };
  const chart = p.querySelector('#dailyChart');
  let selectedCol = null;
  days.forEach(d=>{
    const col = document.createElement('div');
    col.className='ms-daily-col';
    const h = Math.round((d.amount/max)*100);
    col.innerHTML = `<div class="ms-daily-bar${d.amount===0?' empty':''}" style="height:${Math.max(h,2)}px"></div><div class="ms-daily-lbl">${String(d.day).padStart(2,'0')}</div>`;
    col.addEventListener('mouseenter', ()=>setReadout(d));
    col.addEventListener('click', ()=>{
      if(selectedCol) selectedCol.classList.remove('selected');
      col.classList.add('selected');
      selectedCol = col;
      setReadout(d);
    });
    chart.appendChild(col);
  });
  if(lastDay){ setReadout(lastDay); }
  return p;
}

function buildDebtsPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';

  const openDebts = state.debts.filter(d=>d.status==='open');
  const closedDebts = state.debts.filter(d=>d.status==='closed');
  const totalOwed = openDebts.reduce((s,d)=>s+d.remaining,0);

  const incoming = state.txs.filter(t=>t.amount>0
    && !INCOMING_SELF_KEYWORDS.some(k=>t.desc.includes(k))
    && !state.usedIncoming[txKey(t)]);

  p.innerHTML = `
    <h2>Борги — хто мені винен</h2>
    <p class="ms-hint">Це окремо від трат: позначені позики (кнопка «позика ⤴» в таблиці операцій) сюди перенеслись і не рахуються у витратах. Коли бачиш надходження, яким гасять борг — закрий ним потрібний борг нижче.</p>
    <div style="margin-bottom:14px;font-size:13px;color:var(--muted)">Разом винні тобі: <b style="color:var(--gold);font-family:var(--font-mono)">${fmt(totalOwed)} ₴</b></div>
    <div id="openDebtsList"></div>
    ${incoming.length ? `<h2 style="margin-top:18px;font-size:14px">Надходження за період, які можна закрити боргом</h2><div id="incomingList"></div>` : ''}
    ${closedDebts.length ? `<h2 style="margin-top:18px;font-size:14px">Повернуто</h2><div id="closedDebtsList"></div>` : ''}
    <h2 style="margin-top:18px;font-size:14px">Додати позику вручну (готівкою або заднім числом)</h2>
    <div class="ms-manual-form">
      <div class="ms-field" style="max-width:140px"><label>Дата</label><input type="date" id="dDate" value="${todayStr()}"></div>
      <div class="ms-field"><label>Кому</label><input type="text" id="dPerson" placeholder="Ім'я"></div>
      <div class="ms-field" style="max-width:120px"><label>Сума</label><input type="text" id="dAmount" placeholder="1000"></div>
      <button class="ms-btn" id="dAdd" style="align-self:flex-end">Додати борг</button>
    </div>
  `;

  const openList = p.querySelector('#openDebtsList');
  if(openDebts.length===0){
    openList.innerHTML = '<p class="ms-hint" style="margin:0">Відкритих боргів немає.</p>';
  }
  openDebts.forEach(d=>{
    const row = document.createElement('div');
    row.className='ms-debt-row';
    row.innerHTML = `<span class="ms-debt-person">${escapeHtml(d.person)}</span>
      <span class="ms-debt-meta">дав(ла) ${fmt(d.amount)} ₴ · ${d.dateGiven}</span>
      <span class="ms-debt-remain">${fmt(d.remaining)} ₴</span>`;
    const closeBtn = document.createElement('button');
    closeBtn.className='ms-btn secondary';
    closeBtn.textContent='Повернули повністю';
    closeBtn.addEventListener('click', ()=>closeDebtManually(d.id));
    row.appendChild(closeBtn);
    openList.appendChild(row);
  });

  const incList = p.querySelector('#incomingList');
  if(incList){
    incoming.forEach(t=>{
      const row = document.createElement('div');
      row.className='ms-inc-row';
      const dateStr = t.date instanceof Date ? dtStr(t.date) : t.date;
      row.innerHTML = `<span style="min-width:60px">${dateStr}</span><span style="flex:1">${escapeHtml(t.desc)}</span><span class="ms-amt-pos">+${fmt(t.amount)} ₴</span>`;
      if(openDebts.length){
        const sel = document.createElement('select');
        sel.className='ms-cat-select';
        openDebts.forEach(d=>{
          const opt = document.createElement('option');
          opt.value=d.id; opt.textContent=`${d.person} (${fmt(d.remaining)} ₴)`;
          sel.appendChild(opt);
        });
        const btn = document.createElement('button');
        btn.className='ms-loan-btn';
        btn.textContent='Закрити цим борг';
        btn.addEventListener('click', ()=>closeDebtWithIncoming(sel.value, t));
        row.appendChild(sel);
        row.appendChild(btn);
      }
      incList.appendChild(row);
    });
  }

  const closedList = p.querySelector('#closedDebtsList');
  if(closedList){
    closedDebts.forEach(d=>{
      const row = document.createElement('div');
      row.className='ms-debt-row ms-debt-closed';
      row.innerHTML = `<span class="ms-debt-person">${escapeHtml(d.person)}</span>
        <span class="ms-debt-meta">${fmt(d.amount)} ₴ · дано ${d.dateGiven}</span>
        <span class="ms-debt-remain">повернуто</span>`;
      closedList.appendChild(row);
    });
  }

  p.querySelector('#dAdd').addEventListener('click', ()=>{
    const date = p.querySelector('#dDate').value;
    const person = p.querySelector('#dPerson').value.trim();
    const amt = parseFloat(p.querySelector('#dAmount').value.replace(',','.'));
    if(!person || isNaN(amt)) return;
    addManualDebt(person, amt, date);
  });

  return p;
}

function buildConicGradient(catList, total){
  if(!total) return '#E4DCCB 0deg 360deg';
  let acc = 0;
  const stops = [];
  catList.forEach(([cat,sum])=>{
    const frac = Math.abs(sum)/Math.abs(total);
    const start = acc*360;
    acc += frac;
    const end = acc*360;
    stops.push(`${COLORS[cat]||'#666'} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
  });
  return stops.join(', ');
}

function escapeHtml(s){
  const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML;
}

// ---------- init ----------
window.MonoStatDefaults.DEFAULT_CUSTOM_CATS.forEach(c=>applyCustomCategory(c, true));
if(IS_DEMO){ startDemo(); } else initAuth().then(()=>{
  state.authChecking = false;
  if(!authUserId){ state.initialLoading = false; render(); return; }
  return loadPersisted().then(()=>{
    state.from = defaultPeriodStart(); // her budgeting month runs from the 10th (payday) to the 10th
    state.to = todayStr();
    state.initialLoading = false;
    autoStart();
  });
}).catch(err=>{
  document.getElementById('app').innerHTML = '<div style="color:#E3AA9C;font-family:monospace;padding:20px;white-space:pre-wrap">Помилка ініціалізації: '+(err&&err.message)+'</div>';
});
render();

}catch(err){
  const el = document.getElementById('app');
  if(el) el.innerHTML = '<div style="color:#E3AA9C;font-family:monospace;padding:20px;white-space:pre-wrap">Помилка: '+(err&&err.message)+'\n\n'+(err&&err.stack||'')+'</div>';
  else console.error(err);
}
})();
